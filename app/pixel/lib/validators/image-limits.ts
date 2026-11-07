/*
path:            app/pixel/lib/validators/image-limits.ts
tag:             ["pixel", "validation", "limits", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Source de verite unique des limites PixelForge (taille
                 fichier, nombre de fichiers par requete, dimensions,
                 nombre de pixels, taille ZIP, concurrence). Alignees sur
                 la Decision 1 (plateforme Vercel serverless). Consommees
                 par les validateurs de fichiers (file-validator,
                 mime-validator, image-validator), les routes API et les
                 hooks client. Aucune logique UI, aucune dependance Sharp.

flow:            LIMITS (const as const) -> helpers purs
                 (isFileSizeAllowed, isBatchSizeAllowed,
                 isDimensionsAllowed, isPixelCountAllowed,
                 isZipSizeAllowed) -> consommes par file-validator,
                 mime-validator, image-validator et les routes API.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         []
exports:         ["LIMITS", "Limits",
                  "isFileSizeAllowed", "isBatchSizeAllowed",
                  "isDimensionsAllowed", "isPixelCountAllowed",
                  "isZipSizeAllowed"]
useBy:           ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts"]

userStories:     ["*en tant que developpeur je veux centraliser les limites",
                  "*en tant qu'utilisateur je veux etre protege des fichiers trop lourds"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

// ---------------------------------------------------------------------------
// Limites centralisees (Decision 1 - plateforme Vercel serverless)
// ---------------------------------------------------------------------------

export const LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 Mo / fichier
  MAX_BATCH_SIZE: 20, // 20 fichiers / requete (Vercel)
  MAX_WIDTH: 8000, // px
  MAX_HEIGHT: 8000, // px
  MAX_PIXELS: 100_000_000, // 100 MP (anti decompression bomb)
  MAX_ZIP_SIZE: 500 * 1024 * 1024, // 500 Mo ZIP
  MAX_CONCURRENT_PROCESSING: 4, // p-limit(4) max
} as const;

export type Limits = typeof LIMITS;

// ---------------------------------------------------------------------------
// Helpers purs (aucune dependance, testables isolement)
// ---------------------------------------------------------------------------

export function isFileSizeAllowed(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= LIMITS.MAX_FILE_SIZE;
}

export function isBatchSizeAllowed(count: number): boolean {
  return count > 0 && count <= LIMITS.MAX_BATCH_SIZE;
}

export function isDimensionsAllowed(width: number, height: number): boolean {
  return (
    width > 0 &&
    height > 0 &&
    width <= LIMITS.MAX_WIDTH &&
    height <= LIMITS.MAX_HEIGHT
  );
}

export function isPixelCountAllowed(width: number, height: number): boolean {
  return width > 0 && height > 0 && width * height <= LIMITS.MAX_PIXELS;
}

export function isZipSizeAllowed(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= LIMITS.MAX_ZIP_SIZE;
}