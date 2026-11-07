/*
path:            app/api/images/convert/route.ts
tag:             ["pixel", "api", "convert", "route", "reference-endpoint"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de reference de toutes les routes /api/images/*.
                 Contrat HTTP fige pour PixelForge (Decision 2 hybride B+C) :
                 - 1 fichier   -> Blob response direct (binary + headers).
                 - 2+ fichiers -> JSON { results, errors, durationMs }.

                 Pipeline :
                 1. Verifie runtime + methode.
                 2. Cleanup opportuniste des blobs expires (best-effort).
                 3. Parse le FormData -> files[] + options JSON.
                 4. Valide les options via conversionOptionsSchema (Zod).
                 5. Pour chaque fichier :
                    - validateFileBasics (extension + taille)
                    - validateImageDimensions (dimensions + decodabilite)
                    - convert (moteur image-engine)
                 6. Repond selon le nombre de fichiers.

                 Aucune logique de transformation dans cette route : tout
                 passe par le moteur central. Runtime Node.js obligatoire
                 (sharp). maxDuration = 60 (limite Vercel).

flow:            POST -> cleanupExpiredFiles (fire-and-forget) ->
                 formData -> files -> size/dimension checks ->
                 Promise.all(convert) -> Blob ou JSON.

ecosystem:       ApiConvert = [
                   "@/app/api/images/convert/route.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/image-limits.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts"]
imports:         ["next/server", "zod",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/validators/image-limits",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "runtime", "maxDuration"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux convertir une image dans un autre format",
                  "*en tant que developpeur je veux un endpoint de reference a copier"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  convert,
  extensionForFormat,
  mimeForFormat,
  type Result,
} from "@/app/pixel/lib/image-engine";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { LIMITS } from "@/app/pixel/lib/validators/image-limits";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import {
  conversionOptionsSchema,
  type ConversionOptions,
} from "@/app/pixel/types/conversion";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import type { ResultImage } from "@/app/pixel/types/image";

// ---------------------------------------------------------------------------
// Configuration route
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(
  code: ProcessingErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  const error: ProcessingError =
    details === undefined ? { code, message } : { code, message, details };
  return NextResponse.json({ error }, { status });
}

const STATUS_BY_CODE: Readonly<Record<ProcessingErrorCode, number>> = {
  INVALID_INPUT: 400,
  UNSUPPORTED_FORMAT: 415,
  LIMIT_EXCEEDED: 413,
  PROCESSING_ERROR: 500,
  NOT_FOUND: 404,
  EXPIRED: 410,
};

function statusFor(processingError: ProcessingError): number {
  return STATUS_BY_CODE[processingError.code];
}

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "image";
}

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();

  // 1. Cleanup opportuniste (ne bloque jamais le traitement).
  void cleanupExpiredFiles();

  // 2. Parse multipart.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse(
      "INVALID_INPUT",
      "Corps multipart invalide.",
      400,
    );
  }

  // 3. Extraction des fichiers.
  const rawFiles = form.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.", 400);
  }

  // 4. Extraction + validation des options.
  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse(
      "INVALID_INPUT",
      "Champ 'options' manquant ou mal forme (JSON attendu).",
      400,
    );
  }

  let options: ConversionOptions;
  try {
    options = conversionOptionsSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options de conversion invalides.";
    return errorResponse("INVALID_INPUT", message, 400);
  }

  // 5. Validation du lot (nombre + tailles).
  const sizes = files.map((f) => f.size);
  const batch = validateBatch(sizes);
  if (!batch.ok) {
    return errorResponse(
      batch.error.code,
      batch.error.message,
      statusFor(batch.error),
      batch.error.details,
    );
  }

  // 6. Traitement sequentiel avec compteurs d'echecs par fichier.
  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (const file of files) {
    // 6a. Validation primaire (extension + taille).
    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({
        filename: file.name,
        message: `${basics.error.code} : ${basics.error.message}`,
      });
      continue;
    }

    // 6b. Lecture buffer.
    const buffer = Buffer.from(await file.arrayBuffer());

    // 6c. Validation secondaire (dimensions + decodabilite).
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code} : ${dims.error.message}`,
      });
      continue;
    }

    // 6d. Conversion via moteur.
    const converted: Result<{ buffer: Buffer; format: typeof options.format }> =
      await convert(buffer, options).then((r) =>
        r.ok
          ? {
              ok: true as const,
              data: {
                buffer: r.data.buffer,
                format: r.data.format,
              },
            }
          : r,
      );

    if (!converted.ok) {
      errors.push({
        filename: file.name,
        message: `${converted.error.code} : ${converted.error.message}`,
      });
      continue;
    }

    // 6e. Assemblage du ResultImage.
    const finalExt = extensionForFormat(converted.data.format);
    const finalMime = mimeForFormat(converted.data.format);
    const finalFilename = `${safeBasename(file.name)}-${finalExt}.${finalExt}`;
    const finalSize = converted.data.buffer.length;

    results.push({
      id: crypto.randomUUID(),
      filename: finalFilename,
      format: converted.data.format,
      mime: finalMime,
      sizeBytes: finalSize,
      dimensions: dims.data,
      url: null,
      buffer: converted.data.buffer.buffer.slice(
        converted.data.buffer.byteOffset,
        converted.data.buffer.byteOffset + converted.data.buffer.byteLength,
      ) as ArrayBuffer,
      expiresAt: null,
    });
  }

  // 7. Aucun succes : renvoyer la premiere erreur avec son statut HTTP.
  if (results.length === 0) {
    const first = errors[0];
    const code: ProcessingErrorCode = first.message.startsWith(
      "UNSUPPORTED_FORMAT",
    )
      ? "UNSUPPORTED_FORMAT"
      : first.message.startsWith("LIMIT_EXCEEDED")
        ? "LIMIT_EXCEEDED"
        : "PROCESSING_ERROR";
    return errorResponse(code, first.message, statusFor({ code, message: "" }), {
      errors,
    });
  }

  // 8. Reponse : Blob si 1 fichier unique, JSON si lot.
  const durationMs = Date.now() - startedAt;

  if (results.length === 1 && errors.length === 0) {
    const single = results[0]!;
    const buffer = Buffer.from(single.buffer!);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": single.mime,
        "Content-Disposition": `attachment; filename="${single.filename}"`,
        "Content-Length": String(buffer.length),
        "X-PixelForge-Duration-Ms": String(durationMs),
      },
    });
  }

  return NextResponse.json(
    { results, errors, durationMs },
    { status: 200 },
  );
}