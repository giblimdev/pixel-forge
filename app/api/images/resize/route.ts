/*
path:            app/api/images/resize/route.ts
tag:             ["pixel", "api", "resize", "route"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Redimensionnement. Même contrat hybride B+C. sourceId
                 propagé : dans chaque ResultImage (lot JSON) et dans
                 les headers X-PixelForge-Source-Id /
                 X-PixelForge-Result-Id (réponse binaire à fichier
                 unique). Nommage corrigé : -{width}w (convention
                 by-size de la roadmap) au lieu de -{w}x{h}.

flow:            POST -> cleanup -> formData -> files + sourceIds ->
                 validate -> resize -> Blob/JSON.

ecosystem:       ApiResize = ["@/app/api/images/resize/route.ts"]
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
exports:         ["POST", "maxDuration", "resizeOptionsSchema", "ResizeOptions"]
useBy:           []
userStories:     ["*en tant qu'utilisateur je veux redimensionner un lot d'images"]
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
  resize,
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

export const resizeOptionsSchema = z
  .object({
    width: z.number().int().positive().max(8000),
    height: z.number().int().positive().max(8000),
    fit: z.enum(["cover", "contain", "inside"]),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
  })
  .strict();

export type ResizeOptions = z.infer<typeof resizeOptionsSchema>;

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

/**
 * Normalise le buffer d'un ResultImage en Uint8Array<ArrayBuffer>,
 * type accepté comme BodyInit par NextResponse. Un Buffer Node
 * (Buffer<ArrayBufferLike>) n'est plus accepté par les types récents.
 */
function toBodyBytes(
  value: ArrayBuffer | Uint8Array<ArrayBuffer> | null | undefined,
): Uint8Array<ArrayBuffer> | null {
  if (value === null || value === undefined) return null;
  return value instanceof Uint8Array ? value : new Uint8Array(value);
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

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.");
  }

  const sourceIds = readSourceIds(form, files.length);

  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: ResizeOptions;
  try {
    options = resizeOptionsSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options invalides.";
    return errorResponse("INVALID_INPUT", message);
  }

  const batch = validateBatch(files.map((f) => f.size));
  if (!batch.ok) {
    return errorResponse(
      batch.error.code,
      batch.error.message,
      batch.error.details,
    );
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

    const resized = await resize(buffer, {
      width: options.width,
      height: options.height,
      fit: options.fit,
      format: options.format as ImageFormat,
      quality: options.quality,
    });

    if (!resized.ok) {
      errors.push({
        filename: file.name,
        message: `${resized.error.code}: ${resized.error.message}`,
      });
      continue;
    }

    const finalExt = extensionForFormat(resized.data.format);
    const finalMime = mimeForFormat(resized.data.format);
    // Convention by-size : -640w (plus -640x480)
    const finalFilename = `${safeBasename(file.name)}-${options.width}w.${finalExt}`;
    const out = resized.data.buffer;

    results.push({
      id: crypto.randomUUID(),
      ...(sourceId !== undefined ? { sourceId } : {}),
      filename: finalFilename,
      format: resized.data.format,
      mime: finalMime,
      sizeBytes: out.length,
      dimensions: resized.data.metadata.dimensions,
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
    const body = toBodyBytes(single.buffer);
    if (body === null) {
      return errorResponse("PROCESSING_ERROR", "Buffer de sortie introuvable.");
    }

    const headers: Record<string, string> = {
      "Content-Type": single.mime,
      "Content-Disposition": `attachment; filename="${single.filename}"`,
      "Content-Length": String(body.byteLength),
      "X-PixelForge-Duration-Ms": String(durationMs),
      "X-PixelForge-Result-Id": single.id,
    };
    if (single.sourceId !== undefined) {
      headers["X-PixelForge-Source-Id"] = single.sourceId;
    }

    return new NextResponse(body, { status: 200, headers });
  }

  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}
