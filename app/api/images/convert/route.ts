/*
path :           app/api/images/convert/route.ts
tag :            ["pixel", "api", "convert", "route", "reference-endpoint"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de référence de toutes les routes /api/images/*.
                 Contrat HTTP figé pour PixelForge (Décision 2 hybride B+C) :
                 - 1 fichier   -> Blob response direct (binary + headers).
                 - 2+ fichiers -> JSON { results, errors, durationMs }.

                 ⚠️ sourceId propagé : chaque fichier envoyé par le hook
                 est accompagné d'un champ multipart "sourceIds".
                 readSourceIds() renvoie un tableau aligné sur les
                 fichiers ; chaque ResultImage porte donc son sourceId.

                 ⚠️ bufferBase64 en mode JSON : JSON.stringify ne
                 sérialise PAS les ArrayBuffer (le champ `buffer`
                 disparaît silencieusement). Pour que le client puisse
                 créer un Blob téléchargeable en mode multi, chaque
                 ResultImage de la réponse JSON porte un champ
                 `bufferBase64` (string) en plus de `buffer` (qui sera
                 supprimé par JSON). Le mode mono (Blob response
                 binaire) est INCHANGÉ : pas de base64, pas de surcoût.

flow:            POST -> cleanupExpiredFiles (fire-and-forget) ->
                 formData -> files + sourceIds -> size/dimension checks ->
                 convert par fichier -> Blob (1) ou JSON (2+).

ecosystem:       ApiConvert = [
                   "app/api/images/convert/route.ts",
                 ]
relatedFiles:    [
                   "app/pixel/lib/image-engine/index.ts",
                   "app/pixel/lib/api/source-ids.ts",
                   "app/pixel/lib/validators/file-validator.ts",
                   "app/pixel/lib/validators/image-validator.ts",
                   "app/pixel/lib/storage/temp-cleanup.ts",
                   "app/pixel/types/conversion.ts",
                   "app/pixel/types/processing.ts",
                   "app/pixel/types/image.ts",
                 ]
imports:         [
                   "next/server",
                   "zod",
                   "@/app/pixel/lib/image-engine",
                   "@/app/pixel/lib/api/source-ids",
                   "@/app/pixel/lib/validators/file-validator",
                   "@/app/pixel/lib/validators/image-validator",
                   "@/app/pixel/lib/storage/temp-cleanup",
                   "@/app/pixel/types/conversion",
                   "@/app/pixel/types/processing",
                   "@/app/pixel/types/image",
                 ]
exports:         ["POST", "maxDuration"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux convertir une image dans un autre format",
                  "*en tant que developpeur je veux un endpoint de reference a copier",
                  "*en tant que developpeur je veux relier chaque ResultImage a sa SourceImage",
                  "*en tant qu'utilisateur je veux telecharger mes images converties en lot"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  convert,
  extensionForFormat,
  mimeForFormat,
} from "@/app/pixel/lib/image-engine";
import { readSourceIds } from "@/app/pixel/lib/api/source-ids";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
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
// Configuration route (cacheComponents interdit runtime et dynamic)
// ---------------------------------------------------------------------------

export const maxDuration = 60;

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

function statusFor(code: ProcessingErrorCode): number {
  return STATUS_BY_CODE[code];
}

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "image";
}

/**
 * Normalise le buffer d'un ResultImage en Uint8Array<ArrayBuffer>,
 * type accepté comme BodyInit par NextResponse. Gère les deux formes
 * du contrat (ArrayBuffer | Uint8Array<ArrayBuffer>) via instanceof.
 */
function toBodyBytes(
  value: ArrayBuffer | Uint8Array<ArrayBuffer> | null | undefined,
): Uint8Array<ArrayBuffer> | null {
  if (value === null || value === undefined) return null;
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}

/**
 * Sérialise le buffer d'un ResultImage en base64 pour la réponse JSON.
 * JSON.stringify ne sérialise pas les ArrayBuffer — sans cette
 * conversion, le champ `buffer` disparaît côté client et le hook ne
 * peut pas créer d'URL de téléchargement en mode multi.
 *
 * Ne concerne QUE le mode JSON (2+ fichiers). Le mode mono renvoie le
 * buffer brut dans le corps binaire, sans surcoût base64.
 */
function resultToJson(r: ResultImage): Omit<ResultImage, "buffer"> & {
  readonly bufferBase64: string | null;
} {
  const { buffer, ...rest } = r;

  let bufferBase64: string | null = null;
  if (buffer instanceof ArrayBuffer) {
    bufferBase64 = Buffer.from(buffer).toString("base64");
  } else if (buffer instanceof Uint8Array) {
    bufferBase64 = Buffer.from(buffer).toString("base64");
  }

  return { ...rest, bufferBase64 };
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
    return errorResponse("INVALID_INPUT", "Corps multipart invalide.", 400);
  }

  // 3. Extraction des fichiers.
  const rawFiles = form.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.", 400);
  }

  // 3b. Extraction des sourceIds (alignés sur files[]).
  const sourceIds = readSourceIds(form, files.length);

  // 4. Extraction + validation des options.
  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse(
      "INVALID_INPUT",
      "Champ 'options' manquant ou mal formé (JSON attendu).",
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
      statusFor(batch.error.code),
      batch.error.details,
    );
  }

  // 6. Traitement séquentiel.
  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index];

    // 6a. Validation primaire.
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

    // 6c. Validation secondaire.
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code} : ${dims.error.message}`,
      });
      continue;
    }

    // 6d. Conversion via moteur.
    const converted = await convert(buffer, options);
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
    const finalFilename = `${safeBasename(file.name)}-converted.${finalExt}`;
    const outBuffer = converted.data.buffer;

    results.push({
      id: crypto.randomUUID(),
      ...(sourceId !== undefined ? { sourceId } : {}),
      filename: finalFilename,
      format: converted.data.format,
      mime: finalMime,
      sizeBytes: outBuffer.length,
      dimensions: {
        width: converted.data.metadata.dimensions.width,
        height: converted.data.metadata.dimensions.height,
      },
      url: null,
      buffer: outBuffer.buffer.slice(
        outBuffer.byteOffset,
        outBuffer.byteOffset + outBuffer.byteLength,
      ) as ArrayBuffer,
      expiresAt: null,
    });
  }

  // 7. Aucun succès : renvoyer la première erreur avec son statut HTTP.
  if (results.length === 0) {
    const first = errors[0]!;
    const code: ProcessingErrorCode = first.message.startsWith(
      "UNSUPPORTED_FORMAT",
    )
      ? "UNSUPPORTED_FORMAT"
      : first.message.startsWith("LIMIT_EXCEEDED")
        ? "LIMIT_EXCEEDED"
        : "PROCESSING_ERROR";
    return errorResponse(code, first.message, statusFor(code), { errors });
  }

  // 8. Réponse : Blob si 1 fichier unique, JSON si lot.
  const durationMs = Date.now() - startedAt;

  if (results.length === 1 && errors.length === 0) {
    // ---- Mode mono : Blob response binaire (inchangé, pas de base64) ----
    const single = results[0]!;
    const body = toBodyBytes(single.buffer);
    if (body === null) {
      return errorResponse(
        "PROCESSING_ERROR",
        "Buffer de sortie introuvable.",
        500,
      );
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

  // ---- Mode multi : JSON avec bufferBase64 (JSON-safe) ----------------
  const resultsForJson = results.map(resultToJson);

  return NextResponse.json(
    { results: resultsForJson, errors, durationMs },
    { status: 200 },
  );
}