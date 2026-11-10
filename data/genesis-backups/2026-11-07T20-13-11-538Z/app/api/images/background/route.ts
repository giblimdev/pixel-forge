/*
path:            app/api/images/background/route.ts
tag:             ["pixel", "api", "background", "route"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de suppression de fond uni. Meme contrat
                 hybride B+C que /convert : 1 fichier -> Blob PNG, 2+
                 -> JSON { results, errors, durationMs }.
                 Options : target { r, g, b } + tolerance 0-1 +
                 feathering boolean. Toujours en sortie PNG (alpha
                 requis). Pipeline : validate -> removeBackground ->
                 Blob/JSON.

flow:            POST -> cleanup -> formData -> files -> batch check
                 -> options parse (backgroundOptionsSchema) -> pour
                 chaque fichier : basics + dimensions + removeBackground
                 -> Blob/JSON.

ecosystem:       ApiBackground = [
                   "@/app/api/images/background/route.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/types/image.ts"]
imports:         ["next/server", "zod",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "maxDuration", "backgroundOptionsSchema", "BackgroundOptions"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux supprimer un fond uni d'une image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import { removeBackground } from "@/app/pixel/lib/image-engine";
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
import type { ResultImage } from "@/app/pixel/types/image";

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const backgroundOptionsSchema = z
  .object({
    target: z.object({
      r: z.number().int().min(0).max(255),
      g: z.number().int().min(0).max(255),
      b: z.number().int().min(0).max(255),
    }),
    tolerance: z.number().min(0).max(1),
    feathering: z.boolean(),
  })
  .strict();

export type BackgroundOptions = z.infer<typeof backgroundOptionsSchema>;

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

  let options: BackgroundOptions;
  try {
    options = backgroundOptionsSchema.parse(JSON.parse(rawOptions));
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

    const removed = await removeBackground(buffer, {
      target: options.target,
      tolerance: options.tolerance,
      feathering: options.feathering,
    });

    if (!removed.ok) {
      errors.push({ filename: file.name, message: `${removed.error.code}: ${removed.error.message}` });
      continue;
    }

    const finalFilename = `${safeBasename(file.name)}-detoured.png`;
    const out = removed.data.buffer;

    results.push({
      id: crypto.randomUUID(),
      filename: finalFilename,
      format: "png",
      mime: "image/png",
      sizeBytes: out.length,
      dimensions: removed.data.metadata.dimensions,
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