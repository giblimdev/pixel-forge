/*
path:            app/pixel/lib/validators/file-validator.ts
tag:             ["pixel", "validation", "file", "security", "batch"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Validation des fichiers entrants au niveau primaire :
                 presence, nom, extension, taille, nombre de fichiers par
                 requete. Ne lit PAS le contenu binaire (delegue a
                 mime-validator pour les magic bytes, image-validator
                 pour la decodabilite). Ne leve jamais : retourne un
                 ProcessingError structure (Phase 1). Importable
                 UNIQUEMENT cote serveur (server-only).

flow:            validateFileBasics(file) -> checks (nom non vide,
                 extension whitelistee, taille dans LIMITS) -> si OK :
                 retourne { ok: true, data: { name, ext, sizeBytes } },
                 sinon { ok: false, error: ProcessingError }.
                 validateBatch(files) -> checks (nombre <= MAX_BATCH_SIZE,
                 taille totale) -> meme contrat.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only",
                  "@/app/pixel/lib/validators/image-limits",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["ALLOWED_INPUT_FORMATS", "AlloweInputFormat",
                  "ValidatedFileBasics", "validateFileBasics",
                  "BatchValidationResult", "validateBatch"]
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

userStories:     ["*en tant qu'utilisateur je veux etre protege des fichiers invalides",
                  "*en tant que developpeur je veux valider le lot avant traitement"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import { LIMITS } from "@/app/pixel/lib/validators/image-limits";
import type { ImageFormat } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Formats d'entree autorises (extension -> format canonique)
// ---------------------------------------------------------------------------

export const ALLOWED_INPUT_FORMATS = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
  tif: "tiff",
  tiff: "tiff",
  gif: "gif",
  svg: "svg",
} as const;

export type AllowedInputFormat = keyof typeof ALLOWED_INPUT_FORMATS;

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface ValidatedFileBasics {
  readonly name: string;
  readonly ext: AllowedInputFormat;
  readonly format: ImageFormat;
  readonly sizeBytes: number;
}

export type BatchValidationResult =
  | {
      readonly ok: true;
      readonly totalSizeBytes: number;
      readonly count: number;
    }
  | {
      readonly ok: false;
      readonly error: ProcessingError;
    };

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

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

// ---------------------------------------------------------------------------
// Validation d'un fichier (nom, extension, taille)
// ---------------------------------------------------------------------------

export function validateFileBasics(
  filename: string,
  sizeBytes: number,
):
  | { readonly ok: true; readonly data: ValidatedFileBasics }
  | { readonly ok: false; readonly error: ProcessingError } {
  // 1. Nom non vide.
  const trimmed = filename.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Nom de fichier vide."),
    };
  }

  // 2. Extension whitelistee.
  const ext = extensionOf(trimmed);
  if (!(ext in ALLOWED_INPUT_FORMATS)) {
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        `Extension .${ext || "(aucune)"} non supportee.`,
        { extension: ext },
      ),
    };
  }
  const typedExt = ext as AllowedInputFormat;

  // 3. Taille.
  if (sizeBytes <= 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Fichier vide."),
    };
  }
  if (sizeBytes > LIMITS.MAX_FILE_SIZE) {
    return {
      ok: false,
      error: errorOf(
        "LIMIT_EXCEEDED",
        `Fichier trop volumineux (${sizeBytes} octets, max ${LIMITS.MAX_FILE_SIZE}).`,
        { sizeBytes, max: LIMITS.MAX_FILE_SIZE },
      ),
    };
  }

  return {
    ok: true,
    data: {
      name: trimmed,
      ext: typedExt,
      format: ALLOWED_INPUT_FORMATS[typedExt],
      sizeBytes,
    },
  };
}

// ---------------------------------------------------------------------------
// Validation d'un lot (nombre + taille totale)
// ---------------------------------------------------------------------------

export function validateBatch(
  sizes: readonly number[],
): BatchValidationResult {
  if (sizes.length === 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Aucun fichier fourni."),
    };
  }

  if (sizes.length > LIMITS.MAX_BATCH_SIZE) {
    return {
      ok: false,
      error: errorOf(
        "LIMIT_EXCEEDED",
        `Trop de fichiers (${sizes.length}, max ${LIMITS.MAX_BATCH_SIZE}).`,
        { count: sizes.length, max: LIMITS.MAX_BATCH_SIZE },
      ),
    };
  }

  let total = 0;
  for (const size of sizes) {
    if (size <= 0) {
      return {
        ok: false,
        error: errorOf("INVALID_INPUT", "Fichier vide dans le lot."),
      };
    }
    total += size;
  }

  return { ok: true, totalSizeBytes: total, count: sizes.length };
}