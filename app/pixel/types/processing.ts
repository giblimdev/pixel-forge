/*
path:            app/pixel/types/processing.ts
tag:             ["pixel", "types", "processing", "errors"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Contrats partages du pipeline PixelForge : type de
                 traitement, statuts, codes d'erreur stables, erreur
                 structuree (Phase 1 : { code, message, details? }).
                 Aucune dependance runtime, aucun effet.

flow:            Types purs -> constantes as const -> types derives.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts"]
imports:         []
exports:         ["PROCESSING_TYPES", "ProcessingType",
                  "PROCESSING_STATUSES", "ProcessingStatus",
                  "PROCESSING_ERROR_CODES", "ProcessingErrorCode",
                  "ProcessingError"]
useBy:           ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts",
                  "@/app/pixel/lib/validators/svg-sanitizer.ts"]

userStories:     ["*en tant que developpeur je veux typer le pipeline de traitement"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export const PROCESSING_TYPES = [
  "convert",
  "optimize",
  "compress",
  "resize",
  "smart-crop",
  "crop-manual",
  "background-removal",
  "retouch",
  "favicon",
  "placeholder",
  "palette",
  "metadata",
] as const;

export type ProcessingType = (typeof PROCESSING_TYPES)[number];

export const PROCESSING_STATUSES = [
  "pending",
  "running",
  "success",
  "partial",
  "error",
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const PROCESSING_ERROR_CODES = [
  "INVALID_INPUT",
  "UNSUPPORTED_FORMAT",
  "LIMIT_EXCEEDED",
  "PROCESSING_ERROR",
  "NOT_FOUND",
  "EXPIRED",
] as const;

export type ProcessingErrorCode = (typeof PROCESSING_ERROR_CODES)[number];

export type ProcessingError = {
  readonly code: ProcessingErrorCode;
  readonly message: string;
  readonly details?: unknown;
};