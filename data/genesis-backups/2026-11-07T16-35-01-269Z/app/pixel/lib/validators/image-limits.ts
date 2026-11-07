/*
path :           app/pixel/lib/validators/image-limits.ts
tag :            ["pixel", "pixel-forge", "validators", "limits", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Source unique de vérité pour toutes les limites de
                 fichiers, dimensions et traitements de PixelForge.
                 Centralise les valeurs utilisées par les validateurs,
                 les routes API et les composants de la file d'attente.
                 Aucune dépendance runtime — module TypeScript pur,
                 importable client ET serveur.

                 Valeurs calibrées pour Vercel (serverless) :
                 - MAX_BATCH_SIZE = 20 → traitement séquentiel borné
                   compatible avec maxDuration = 60 s.
                 - MAX_CONCURRENT_PROCESSING = 4 → p-limit anti-DoS.
                 - MAX_PIXELS = 100 MP → anti decompression bomb.

flow:            Module TypeScript pur → export de LIMITS (const) et
                 des helpers de validation pure (isFileSizeValid,
                 isDimensionsValid, isPixelsValid, isBatchSizeValid).

ecosystem:       Validators = [
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]

imports:         []

exports:         ["LIMITS",
                  "isFileSizeValid", "isDimensionsValid",
                  "isPixelsValid", "isBatchSizeValid",
                  "MAX_FILE_SIZE_BYTES", "MAX_BATCH_SIZE",
                  "MAX_CONCURRENT_PROCESSING"]

useBy:           ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                  "@/app/api/images/*/route.ts"]

userStories:     ["*en tant que développeur je veux centraliser les limites de fichiers PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/* ------------------------------------------------------------------ */
/*  Limites                                                            */
/* ------------------------------------------------------------------ */

export const LIMITS = {
  /** Taille maximale d'un fichier uploadé : 25 Mo. */
  MAX_FILE_SIZE: 25 * 1024 * 1024,

  /** Nombre maximal de fichiers par requête API (Vercel-friendly). */
  MAX_BATCH_SIZE: 20,

  /** Largeur maximale d'une image traitée (px). */
  MAX_WIDTH: 8000,

  /** Hauteur maximale d'une image traitée (px). */
  MAX_HEIGHT: 8000,

  /** Nombre maximal de pixels (anti decompression bomb). */
  MAX_PIXELS: 100_000_000,

  /** Taille maximale d'une archive ZIP produite : 500 Mo. */
  MAX_ZIP_SIZE: 500 * 1024 * 1024,

  /** Concurrence max de traitement d'image (p-limit). */
  MAX_CONCURRENT_PROCESSING: 4,

  /** Nombre max de variantes générées en une passe (ex. resize). */
  MAX_VARIANTS: 10,

  /** Nombre max d'entrées dans un historique local (dashboard). */
  MAX_HISTORY_ENTRIES: 50,

  /** Nombre max de couleurs retournées par l'extracteur de palette. */
  MAX_PALETTE_COLORS: 10,

  /** TTL des fichiers temporaires (Vercel Blob) : 1 heure. */
  TEMP_FILE_TTL_MS: 60 * 60 * 1000,
} as const;

/* ------------------------------------------------------------------ */
/*  Constantes dérivées (raccourcis d'usage fréquent)                  */
/* ------------------------------------------------------------------ */

export const MAX_FILE_SIZE_BYTES = LIMITS.MAX_FILE_SIZE;
export const MAX_BATCH_SIZE = LIMITS.MAX_BATCH_SIZE;
export const MAX_CONCURRENT_PROCESSING = LIMITS.MAX_CONCURRENT_PROCESSING;

/* ------------------------------------------------------------------ */
/*  Helpers purs                                                       */
/* ------------------------------------------------------------------ */

/**
 * Vrai si la taille du fichier (en octets) respecte la limite.
 */
export function isFileSizeValid(sizeBytes: number): boolean {
  return Number.isFinite(sizeBytes) && sizeBytes > 0 && sizeBytes <= LIMITS.MAX_FILE_SIZE;
}

/**
 * Vrai si les dimensions respectent les limites max.
 */
export function isDimensionsValid(width: number, height: number): boolean {
  return (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0 &&
    width <= LIMITS.MAX_WIDTH &&
    height <= LIMITS.MAX_HEIGHT
  );
}

/**
 * Vrai si le nombre de pixels respecte la limite max (anti bomb).
 */
export function isPixelsValid(width: number, height: number): boolean {
  return (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0 &&
    width * height <= LIMITS.MAX_PIXELS
  );
}

/**
 * Vrai si le nombre de fichiers respecte la limite de batch.
 */
export function isBatchSizeValid(count: number): boolean {
  return Number.isFinite(count) && count >= 1 && count <= LIMITS.MAX_BATCH_SIZE;
}