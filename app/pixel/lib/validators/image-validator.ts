/*
path:            app/pixel/lib/validators/image-validator.ts
tag:             ["pixel", "validation", "image", "sharp", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Validation de la decodabilite et des dimensions d'une
                 image via sharp. Seul validateur autorise a importer
                 sharp : file-validator ne lit pas le binaire,
                 mime-validator ne lit que les magic bytes. Ce fichier
                 ouvre le flux une fois pour verifier que l'image est
                 decodable et que ses dimensions respectent LIMITS
                 (MAX_WIDTH, MAX_HEIGHT, MAX_PIXELS — anti decompression
                 bomb). Ne leve jamais : retourne un ProcessingError
                 structure. Importable UNIQUEMENT cote serveur.

flow:            validateImageDimensions(buffer) -> sharp(buffer)
                 .metadata() -> si erreur de decodage : erreur
                 UNSUPPORTED_FORMAT -> verifie width/height/pixels via
                 isDimensionsAllowed + isPixelCountAllowed -> retourne
                 { ok: true, data: { format, width, height, hasAlpha } }
                 ou { ok: false, error }.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only", "sharp",
                  "@/app/pixel/lib/validators/image-limits",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["ValidatedImageInfo", "validateImageDimensions"]
useBy:           ["@/app/api/images/convert/route.ts",
                  "@/app/api/images/optimize/route.ts",
                  "@/app/api/images/compress/route.ts",
                  "@/app/api/images/resize/route.ts",
                  "@/app/api/images/crop/route.ts",
                  "@/app/api/images/background/route.ts",
                  "@/app/api/images/retouch/route.ts",
                  "@/app/api/images/favicon/route.ts",
                  "@/app/api/images/placeholder/route.ts",
                  "@/app/api/images/palette/route.ts",
                  "@/app/api/images/metadata/route.ts"]

userStories:     ["*en tant que developpeur je veux valider les dimensions d'une image",
                  "*en tant qu'utilisateur je veux etre protege des decompression bombs"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import sharp from "sharp";
import type { Metadata as SharpMetadata } from "sharp";

import {
  isDimensionsAllowed,
  isPixelCountAllowed,
  LIMITS,
} from "@/app/pixel/lib/validators/image-limits";
import type { ImageFormat } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface ValidatedImageInfo {
  readonly format: ImageFormat;
  readonly width: number;
  readonly height: number;
  readonly hasAlpha: boolean;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): ProcessingError {
  return details === undefined ? { code, message } : { code, message, details };
}

const SUPPORTED_SHARP_FORMATS: ReadonlySet<string> = new Set([
  "jpeg",
  "png",
  "webp",
  "avif",
  "tiff",
  "gif",
  "svg",
]);

function toImageFormat(sharpFormat: string | undefined): ImageFormat | null {
  if (!sharpFormat) return null;
  if (!SUPPORTED_SHARP_FORMATS.has(sharpFormat)) return null;
  return sharpFormat as ImageFormat;
}

// ---------------------------------------------------------------------------
// Validation (decodabilite + dimensions + pixels)
// ---------------------------------------------------------------------------

export async function validateImageDimensions(
  buffer: Buffer,
): Promise<
  | { readonly ok: true; readonly data: ValidatedImageInfo }
  | { readonly ok: false; readonly error: ProcessingError }
> {
  if (buffer.length === 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Buffer vide."),
    };
  }

  let metadata: SharpMetadata;
  try {
    metadata = await sharp(buffer, {
      // Anti decompression bomb : sharp limite la taille d'entree.
      limitInputPixels: LIMITS.MAX_PIXELS,
    }).metadata();
  } catch (err) {
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        `Image non decodable : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
      ),
    };
  }

  const format = toImageFormat(metadata.format);
  if (!format) {
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        `Format Sharp non supporte : ${metadata.format ?? "(inconnu)"}.`,
        { sharpFormat: metadata.format },
      ),
    };
  }

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (!isDimensionsAllowed(width, height)) {
    return {
      ok: false,
      error: errorOf(
        "LIMIT_EXCEEDED",
        `Dimensions hors limites (${width}x${height}, max ${LIMITS.MAX_WIDTH}x${LIMITS.MAX_HEIGHT}).`,
        { width, height, max: { w: LIMITS.MAX_WIDTH, h: LIMITS.MAX_HEIGHT } },
      ),
    };
  }

  if (!isPixelCountAllowed(width, height)) {
    return {
      ok: false,
      error: errorOf(
        "LIMIT_EXCEEDED",
        `Nombre de pixels hors limites (${width * height}, max ${LIMITS.MAX_PIXELS}).`,
        { width, height, pixels: width * height, max: LIMITS.MAX_PIXELS },
      ),
    };
  }

  return {
    ok: true,
    data: {
      format,
      width,
      height,
      hasAlpha: metadata.hasAlpha === true,
    },
  };
}