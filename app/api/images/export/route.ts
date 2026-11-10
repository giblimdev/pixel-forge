/*
path:            app/api/images/export/route.ts
tag:             ["pixel", "api", "export", "zip", "route"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de creation d'archive ZIP. Recoit une liste
                 d'URLs (blob @vercel/blob ou data URL) + les options
                 d'organisation (flat, by-format, by-size) + le choix
                 d'inclure un manifest, construit le ZIP en memoire via
                 archive-builder.ts, l'uploade sur @vercel/blob et
                 retourne l'URL temporaire.

                 Meme contrat d'erreur que les autres routes :
                 { error: { code, message, details? } } avec les codes
                 ProcessingErrorCode de Phase 1.

                 maxDuration = 60 (limite Vercel). Runtime Node.js
                 implicite (cacheComponents interdit l'export runtime).

flow:            POST -> cleanup -> formData -> files[] (url + filename)
                 -> options parse (exportOptionsSchema) -> archiveBuilder
                 -> upload blob -> { url, filename, sizeBytes,
                 expiresAt }.

ecosystem:       ApiExport = [
                   "@/app/api/images/export/route.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/archive/archive-builder.ts",
                  "@/app/pixel/lib/archive/archive-entry.ts",
                  "@/app/pixel/lib/archive/archive.types.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/types/export.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["next/server", "zod", "@vercel/blob",
                  "@/app/pixel/lib/archive/archive-builder",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/export",
                  "@/app/pixel/types/processing"]
exports:         ["POST", "maxDuration", "exportOptionsSchema", "ExportOptions"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux telecharger tous mes resultats en un seul ZIP"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { NextResponse } from "next/server";
import { z } from "zod";
import { put } from "@vercel/blob";

import { buildArchive } from "@/app/pixel/lib/archive/archive-builder";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import type { ExportOptions } from "@/app/pixel/types/export";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Schema de validation des options
// ---------------------------------------------------------------------------

export const exportOptionsSchema = z
  .object({
    organization: z.enum(["flat", "by-format", "by-size"]),
    includeManifest: z.boolean(),
  })
  .strict();

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

interface ExportFileInput {
  readonly url: string;
  readonly filename: string;
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

  // 1. Fichiers : chaque entree porte "url|filename".
  const rawFiles = form.getAll("files");
  const files: ExportFileInput[] = [];

  for (const entry of rawFiles) {
    if (typeof entry !== "string") continue;
    const [url, filename] = entry.split("|");
    if (!url || !filename) continue;
    files.push({ url, filename });
  }

  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.");
  }

  // 2. Options.
  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: ExportOptions;
  try {
    options = exportOptionsSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options invalides.";
    return errorResponse("INVALID_INPUT", message);
  }

  // 3. Telechargement des buffers sources (URLs @vercel/blob ou http).
  const fetched: { filename: string; buffer: Buffer }[] = [];
  for (const file of files) {
    try {
      const res = await fetch(file.url);
      if (!res.ok) {
        return errorResponse(
          "NOT_FOUND",
          `Fichier introuvable : ${file.filename} (HTTP ${res.status}).`,
          { filename: file.filename },
        );
      }
      const arrayBuffer = await res.arrayBuffer();
      fetched.push({
        filename: file.filename,
        buffer: Buffer.from(arrayBuffer),
      });
    } catch (err) {
      return errorResponse(
        "PROCESSING_ERROR",
        `Echec du telechargement de ${file.filename} : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
      );
    }
  }

  // 4. Construction de l'archive.
  const archive = await buildArchive(fetched, {
    organization: options.organization,
    includeManifest: options.includeManifest,
    compressionLevel: 6,
  });

  if (!archive.ok) {
    return errorResponse(
      archive.error.code,
      archive.error.message,
      archive.error.details,
    );
  }

  // 5. Upload sur @vercel/blob (token depuis .env.local ou Vercel).
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const zipFilename = `pixel-forge-export-${timestamp}.zip`;

  let blobUrl: string;
  try {
    const uploaded = await put(`temp/${zipFilename}`, archive.buffer, {
      access: "public",
      contentType: "application/zip",
    });
    blobUrl = uploaded.url;
  } catch (err) {
    return errorResponse(
      "PROCESSING_ERROR",
      `Echec de l'upload du ZIP : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }

  const durationMs = Date.now() - startedAt;

  return NextResponse.json(
    {
      url: blobUrl,
      filename: zipFilename,
      sizeBytes: archive.sizeBytes,
      entryCount: archive.entryCount,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      durationMs,
    },
    { status: 200 },
  );
}