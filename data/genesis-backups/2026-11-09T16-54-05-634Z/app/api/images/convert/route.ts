/*
path :           app/api/images/convert/route.ts
tag :            ["pixel", "api", "convert", "route", "reference-endpoint", "debug"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de référence de toutes les routes /api/images/*.
                 Contrat HTTP figé pour PixelForge (Décision 2 hybride B+C) :
                 - 1 fichier   -> Blob response direct (binary + headers).
                 - 2+ fichiers -> JSON { results, errors, durationMs }.

                 ⚠️ sourceId propagé : chaque fichier envoyé par le hook
                 est accompagné d'un champ multipart "sourceIds" (même
                 ordre que "files"). readSourceIds() renvoie un tableau
                 aligné sur les fichiers ; chaque ResultImage porte donc
                 son sourceId, ce qui supprime le matching fragile par
                 préfixe de nom côté client. En réponse binaire (1
                 fichier), l'id est renvoyé dans les headers
                 X-PixelForge-Source-Id / X-PixelForge-Result-Id.

                 Corps de réponse binaire : le buffer du ResultImage est
                 normalisé en Uint8Array<ArrayBuffer> (toBodyBytes). Un
                 Buffer Node (Buffer<ArrayBufferLike>) n'est plus
                 accepté comme BodyInit par les types récents.

                 ⚠️ DIAGNOSTIC v2 (logs temporaires) :
                 7 blocs de logs [route/convert] R1..R8 ajoutés pour
                 diagnostiquer le bug "2 images en cours mais non
                 traitées". Filtre le terminal `npm run dev` sur
                 "route/convert". A SUPPRIMER une fois le bug résolu.

flow:            POST -> cleanupExpiredFiles (fire-and-forget) ->
                 formData -> files + sourceIds -> size/dimension checks ->
                 convert par fichier -> Blob ou JSON.

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
                  "*en tant que developpeur je veux relier chaque ResultImage a sa SourceImage"]

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

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();

  // ⚠️ DEBUG R1 — la route est-elle appelée ?
  console.log("[route/convert] R1 POST reçu", {
    method: request.method,
    url: request.url,
    contentType: request.headers.get("Content-Type"),
    contentLength: request.headers.get("Content-Length"),
  });

  // 1. Cleanup opportuniste (ne bloque jamais le traitement).
  void cleanupExpiredFiles();

  // 2. Parse multipart.
  let form: FormData;
  try {
    form = await request.formData();
    // ⚠️ DEBUG R2 — parsing multipart OK
    console.log("[route/convert] R2 formData OK", {
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("[route/convert] R2 ÉCHEC formData", err);
    return errorResponse("INVALID_INPUT", "Corps multipart invalide.", 400);
  }

  // 3. Extraction des fichiers.
  const rawFiles = form.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File);

  // ⚠️ DEBUG R3 — fichiers + sourceIds bruts reçus
  console.log("[route/convert] R3 fichiers extraits", {
    rawFilesCount: rawFiles.length,
    filesCount: files.length,
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    rawSourceIds: form.getAll("sourceIds"),
  });

  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.", 400);
  }

  // 3b. Extraction des sourceIds (alignés sur files[]).
  const sourceIds = readSourceIds(form, files.length);

  // ⚠️ DEBUG R3b — sourceIds résolus par readSourceIds
  console.log("[route/convert] R3b sourceIds résolus", {
    sourceIds,
    count: sourceIds.length,
    definedCount: sourceIds.filter((s) => s !== undefined).length,
  });

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
    // ⚠️ DEBUG R4 — options validées
    console.log("[route/convert] R4 options validées", {
      options,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("[route/convert] R4 ÉCHEC options", { rawOptions, err });
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
    console.error("[route/convert] R5 ÉCHEC validateBatch", batch.error);
    return errorResponse(
      batch.error.code,
      batch.error.message,
      statusFor(batch.error.code),
      batch.error.details,
    );
  }

  // ⚠️ DEBUG R5 — validation lot OK
  console.log("[route/convert] R5 validateBatch OK", {
    count: files.length,
    totalSize: sizes.reduce((s, x) => s + x, 0),
  });

  // 6. Traitement séquentiel.
  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index];

    // ⚠️ DEBUG R6 — début de traitement d'un fichier
    console.log("[route/convert] R6 fichier " + index + " — début", {
      filename: file.name,
      size: file.size,
      sourceId,
      elapsedMs: Date.now() - startedAt,
    });

    // 6a. Validation primaire.
    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      console.warn("[route/convert] R6a ÉCHEC validateFileBasics", {
        filename: file.name,
        error: basics.error,
      });
      errors.push({
        filename: file.name,
        message: `${basics.error.code} : ${basics.error.message}`,
      });
      continue;
    }

    // 6b. Lecture buffer.
    const buffer = Buffer.from(await file.arrayBuffer());
    // ⚠️ DEBUG R6b — buffer lu
    console.log("[route/convert] R6b buffer lu", {
      filename: file.name,
      byteLength: buffer.length,
    });

    // 6c. Validation secondaire.
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      console.warn("[route/convert] R6c ÉCHEC validateImageDimensions", {
        filename: file.name,
        error: dims.error,
      });
      errors.push({
        filename: file.name,
        message: `${dims.error.code} : ${dims.error.message}`,
      });
      continue;
    }

    // 6d. Conversion via moteur.
    // ⚠️ DEBUG R6d — AVANT convert (suspect n°1 si pas de R6e derrière)
    console.log("[route/convert] R6d avant convert", {
      filename: file.name,
      sizeBytes: buffer.length,
      format: dims.data.format,
      dimensions: { w: dims.data.width, h: dims.data.height },
      elapsedMs: Date.now() - startedAt,
    });

    const converted = await convert(buffer, options);

    // ⚠️ DEBUG R6e — APRÈS convert
    console.log("[route/convert] R6e après convert", {
      filename: file.name,
      ok: converted.ok,
      error: converted.ok ? null : converted.error,
      outSize: converted.ok ? converted.data.buffer.length : null,
      elapsedMs: Date.now() - startedAt,
    });

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
      ...(sourceId !== undefined ? { sourceId } : {}), // ← propagé depuis le multipart
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

    // ⚠️ DEBUG R6f — result poussé
    console.log("[route/convert] R6f result poussé", {
      filename: finalFilename,
      sourceId,
      outSize: outBuffer.length,
    });
  }

  // ⚠️ DEBUG R7 — bilan avant réponse
  console.log("[route/convert] R7 bilan", {
    resultsCount: results.length,
    errorsCount: errors.length,
    results: results.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      filename: r.filename,
      sizeBytes: r.sizeBytes,
    })),
    errors,
    elapsedMs: Date.now() - startedAt,
  });

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

    // ⚠️ DEBUG R7b — aucun succès
    console.error("[route/convert] R7b AUCUN SUCCÈS — réponse erreur", {
      code,
      message: first.message,
    });

    return errorResponse(code, first.message, statusFor(code), { errors });
  }

  // 8. Réponse : Blob si 1 fichier unique, JSON si lot.
  const durationMs = Date.now() - startedAt;

  if (results.length === 1 && errors.length === 0) {
    // ⚠️ DEBUG R8a — réponse Blob (1 fichier)
    console.log("[route/convert] R8a réponse BLOB (1 fichier)", {
      filename: results[0]!.filename,
      sourceId: results[0]!.sourceId,
      durationMs,
    });

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

  // ⚠️ DEBUG R8b — réponse JSON (multi)
  console.log("[route/convert] R8b réponse JSON (multi)", {
    resultsCount: results.length,
    errorsCount: errors.length,
    durationMs,
  });

  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}
