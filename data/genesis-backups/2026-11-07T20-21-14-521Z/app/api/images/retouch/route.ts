/*
path:            app/api/images/retouch/route.ts
tag:             ["pixel", "api", "retouch", "route"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Retouche globale + watermark. Même contrat hybride B+C.
                 sourceId propagé. mime calculé via mimeForFormat
                 (fix bug `image/${format}` fragile pour "jpg").

flow:            POST -> cleanup -> formData -> files + sourceIds ->
                 validate -> retouch -> Blob/JSON.

ecosystem:       ApiRetouch = ["@/app/api/images/retouch/route.ts"]
relatedFiles:    ["app/pixel/lib/image-engine/index.ts",
                  "app/pixel/lib/api/source-ids.ts",
                  "app/pixel/lib/validators/file-validator.ts",
                  "app/pixel/lib/validators/image-validator.ts",
                  "app/pixel/lib/storage/temp-cleanup.ts",
                  "app/pixel/types/processing.ts",
                  "app/pixel/types/image.ts"]
imports:         ["next/server", "zod",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/api/source-ids",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "maxDuration", "retouchOptionsSchema", "RetouchOptions"]
useBy:           []
userStories:     ["*en tant qu'utilisateur je veux retoucher une image et ajouter un filigrane"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  extensionForFormat,
  mimeForFormat,
  retouch,
} from "@/app/pixel/lib/image-engine";
import { readSourceIds } from "@/app/pixel/lib/api/source-ids";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";

export const maxDuration = 60;

export const retouchOptionsSchema = z
  .object({
    adjustments: z.object({
      brightness: z.number().min(-100).max(100),
      contrast: z.number().min(-100).max(100),
      saturation: z.number().min(-100).max(100),
      hue: z.number().min(-180).max(180),
      blur: z.number().min(0).max(100),
      sharpen: z.number().min(0).max(100),
      grayscale: z.boolean(),
    }),
    watermark: z
      .object({
        kind: z.enum(["text", "logo"]),
        text: z.string().max(200),
        sizePercent: z.number().min(1).max(100),
        position: z.enum([
          "top-left",
          "top-center",
          "top-right",
          "middle-left",
          "middle-center",
          "middle-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ]),
        opacity: z.number().min(0).max(100),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .nullable(),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
  })
  .strict();

export type RetouchOptions = z.infer<typeof retouchOptionsSchema>;

const STATUS_BY_CODE: Readonly<Record<ProcessingErrorCode, number>> = {
  INVALID_INPUT: 400,
  UNSUPPORTED_FORMAT: 415,
  LIMIT_EXCEEDED: 413,
  PROCESSING_ERROR: 500,
  NOT_FOUND: 404,
  EXPIRED: 410,
};

function errorResponse(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): NextResponse {
  const error: ProcessingError =
    details === undefined ? { code, message } : { code, message, details };
  return NextResponse.json({ error }, { status: STATUS_BY_CODE[code] });
}

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "image";
}

function toNodeBuffer(
  value: ArrayBuffer | Uint8Array<ArrayBuffer> | null | undefined,
): Buffer | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  void cleanupExpiredFiles();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("INVALID_INPUT", "Corps multipart invalide.");
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.");
  }

  const sourceIds = readSourceIds(form, files.length);

  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: RetouchOptions;
  try {
    options = retouchOptionsSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options invalides.";
    return errorResponse("INVALID_INPUT", message);
  }

  const batch = validateBatch(files.map((f) => f.size));
  if (!batch.ok) {
    return errorResponse(batch.error.code, batch.error.message, batch.error.details);
  }

  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index];

    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({
        filename: file.name,
        message: `${basics.error.code}: ${basics.error.message}`,
      });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code}: ${dims.error.message}`,
      });
      continue;
    }

    const retouched = await retouch(buffer, {
      adjustments: options.adjustments,
      watermark: options.watermark,
      format: options.format as ImageFormat,
      quality: options.quality,
    });

    if (!retouched.ok) {
      errors.push({
        filename: file.name,
        message: `${retouched.error.code}: ${retouched.error.message}`,
      });
      continue;
    }

    // Fix : mimeForFormat au lieu de `image/${format}` (fragile pour "jpg").
    const finalExt = extensionForFormat(retouched.data.format);
    const finalMime = mimeForFormat(retouched.data.format);
    const finalFilename = `${safeBasename(file.name)}-retouched.${finalExt}`;
    const out = retouched.data.buffer;

    results.push({
      id: crypto.randomUUID(),
      sourceId,
      filename: finalFilename,
      format: retouched.data.format,
      mime: finalMime,
      sizeBytes: out.length,
      dimensions: retouched.data.metadata.dimensions,
      url: null,
      buffer: out.buffer.slice(
        out.byteOffset,
        out.byteOffset + out.byteLength,
      ) as ArrayBuffer,
      expiresAt: null,
    });
  }

  if (results.length === 0) {
    return errorResponse("PROCESSING_ERROR", errors[0]!.message, { errors });
  }

  const durationMs = Date.now() - startedAt;
  if (results.length === 1 && errors.length === 0) {
    const single = results[0]!;
    const buf = toNodeBuffer(single.buffer);
    if (buf === null) {
      return errorResponse("PROCESSING_ERROR", "Buffer de sortie introuvable.");
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": single.mime,
        "Content-Disposition": `attachment; filename="${single.filename}"`,
        "Content-Length": String(buf.length),
        "X-PixelForge-Duration-Ms": String(durationMs),
        "X-PixelForge-Source-Id": single.sourceId ?? "",
        "X-PixelForge-Result-Id": single.id,
      },
    });
  }

  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}