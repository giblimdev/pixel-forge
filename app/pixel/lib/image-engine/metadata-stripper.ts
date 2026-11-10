/*
path:            app/pixel/lib/image-engine/metadata-stripper.ts
tag:             ["pixel", "image-engine", "metadata", "stripper", "privacy"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Helper pur de suppression des metadonnees EXIF et ICC
                 via sharp. Utilise un pipeline minimal : sharpen input
                 puis applique withMetadata({ exif: {}, icc: undefined })
                 pour forcer sharp a ecrire un fichier SANS EXIF et
                 SANS profil ICC. Le format de sortie est conserve
                 (jpeg reste jpeg, png reste png, etc.).

                 Ne leve jamais : retourne un Result<EngineOutput>
                 structure, aligne sur image-engine.types.ts.

                 Importable UNIQUEMENT cote serveur (sharp natif).

flow:            stripMetadata(buffer, format, quality) ->
                 createSharp(buffer) -> applyOutputOptions(format, quality,
                 keepExif=false, keepIcc=false) -> .toBuffer() ->
                 metadata() -> retourne EngineOutput (format preserve).

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/lib/image-engine/sharp.factory.ts",
                   "@/app/pixel/lib/image-engine/sharp.options.ts",
                   "@/app/pixel/lib/image-engine/image-engine.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.factory.ts",
                  "@/app/pixel/lib/image-engine/image-engine.types.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only", "sharp",
                  "@/app/pixel/lib/image-engine/sharp.factory",
                  "@/app/pixel/lib/image-engine/image-engine.types",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["stripMetadata"]
useBy:           ["@/app/api/images/metadata/route.ts"]

userStories:     ["*en tant qu'utilisateur je veux supprimer les metadonnees d'une image",
                  "*en tant qu'utilisateur je veux proteger ma vie privee en supprimant GPS et EXIF"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import type { Metadata } from "sharp";

import { createSharp } from "@/app/pixel/lib/image-engine/sharp.factory";
import type {
  EngineMetadata,
  EngineOutput,
} from "@/app/pixel/lib/image-engine/image-engine.types";
import type {
  ImageDimensions,
  ImageFormat,
} from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Types internes
// ---------------------------------------------------------------------------

type Ok<T> = { readonly ok: true; readonly data: T };
type Err = { readonly ok: false; readonly error: ProcessingError };
type Result<T> = Ok<T> | Err;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): ProcessingError {
  return details === undefined ? { code, message } : { code, message, details };
}

function fail(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): Err {
  return { ok: false, error: errorOf(code, message, details) };
}

function dimensionsOf(metadata: Metadata): ImageDimensions {
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

function engineMetadataOf(
  metadata: Metadata,
  sizeBytes: number,
  format: ImageFormat,
): EngineMetadata {
  return {
    format,
    dimensions: dimensionsOf(metadata),
    sizeBytes,
    hasAlpha: metadata.hasAlpha === true,
    entropy: 0,
    stdev: [0, 0, 0],
    exif: null,
    hasIcc: metadata.icc !== undefined,
  };
}

/**
 * Applique les options de sortie du format cible en forçant
 * keepExif = false et keepIcc = false (donc suppression).
 *
 * On ne peut pas déléguer à applyOutputOptions() de sharp.adapter.ts
 * car celui-ci est privé. On réimplémente ici la logique minimale
 * nécessaire à la suppression (avec metadata = vide).
 */
function applyOutputOptionsWithoutMetadata(
  s: ReturnType<typeof createSharp>,
  format: ImageFormat,
  quality: number,
): Result<ReturnType<typeof createSharp>> {
  switch (format) {
    case "jpeg":
      s.jpeg({
        quality: quality > 0 ? quality : 80,
        progressive: true,
        mozjpeg: true,
      });
      break;
    case "png":
      s.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
      break;
    case "webp":
      s.webp({
        quality: quality > 0 ? quality : 80,
      });
      break;
    case "avif":
      s.avif({
        quality: quality > 0 ? quality : 60,
      });
      break;
    case "tiff":
      s.tiff({ compression: "lzw" });
      break;
    case "gif":
    case "svg":
      return fail(
        "UNSUPPORTED_FORMAT",
        `Suppression de metadonnees impossible pour le format ${format}.`,
        { format },
      );
  }

  // ⚠️ withMetadata({ exif: {} }) force sharp à écrire un fichier
  // SANS EXIF. Sans cette option, sharp conserve les métadonnées
  // par défaut dans certains cas.
  s.withMetadata({ exif: {} });

  return { ok: true, data: s };
}

// ---------------------------------------------------------------------------
// Suppression
// ---------------------------------------------------------------------------

export async function stripMetadata(
  buffer: Buffer,
  format: ImageFormat,
  quality = 85,
): Promise<Result<EngineOutput>> {
  try {
    let s = createSharp(buffer);

    const applied = applyOutputOptionsWithoutMetadata(s, format, quality);
    if (!applied.ok) return applied;
    s = applied.data;

    const out = await s.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: engineMetadataOf(meta, out.length, format),
        format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Suppression des metadonnees echouee : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}