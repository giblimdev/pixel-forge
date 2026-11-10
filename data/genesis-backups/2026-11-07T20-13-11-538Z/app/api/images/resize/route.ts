/*
path:            app/api/images/resize/route.ts
tag:             ["pixel", "api", "resize", "route"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de redimensionnement. Meme contrat hybride
                 B+C que /convert (1 fichier -> Blob, 2+ -> JSON).
                 Options : ResizeOptions (width, height, fit, format
                 de sortie, qualite). Pipeline : validate -> resize
                 (moteur) -> Blob ou JSON.

flow:            POST -> cleanup -> formData -> files -> batch check
                 -> options parse (resizeOptionsSchema) -> pour chaque
                 fichier : basics + dimensions + resize() -> Blob/JSON.

ecosystem:       ApiResize = [
                   "@/app/api/images/resize/route.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["next/server", "zod",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "maxDuration", "resizeOptionsSchema", "ResizeOptions"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux redimensionner un lot d'images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  extensionForFormat,
  mimeForFormat,
  resize,
} from "@/app/pixel/lib/image-engine";
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

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

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
    return errorResponse(batch.error.code, batch.error.message, batch.error.details);
  }

  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (const file of files) {
    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({ filename: file.name, message: `${basics.error.code}: ${basics.error.message}` });
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({ filename: file.name, message: `${dims.error.code}: ${dims.error.message}` });
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
      errors.push({ filename: file.name, message: `${resized.error.code}: ${resized.error.message}` });
      continue;
    }

    const finalExt = extensionForFormat(resized.data.format);
    const finalMime = mimeForFormat(resized.data.format);
    const finalFilename = `${safeBasename(file.name)}-${options.width}x${options.height}.${finalExt}`;
    const out = resized.data.buffer;

    results.push({
      id: crypto.randomUUID(),
      filename: finalFilename,
      format: resized.data.format,
      mime: finalMime,
      sizeBytes: out.length,
      dimensions: resized.data.metadata.dimensions,
      url: null,
      buffer: out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer,
      expiresAt: null,
    });
  }

  if (results.length === 0) {
    return errorResponse("PROCESSING_ERROR", errors[0].message, { errors });
  }

  const durationMs = Date.now() - startedAt;
  if (results.length === 1 && errors.length === 0) {
    const single = results[0]!;
    const raw = single.buffer!;
    // Normalise ArrayBuffer | Uint8Array en Uint8Array<ArrayBuffer> (compatible BodyInit).
    const body: Uint8Array<ArrayBuffer> =
      raw instanceof Uint8Array ? raw : new Uint8Array(raw);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": single.mime,
        "Content-Disposition": `attachment; filename="${single.filename}"`,
        "Content-Length": String(body.byteLength),
        "X-PixelForge-Duration-Ms": String(durationMs),
      },
    });
  }

  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}