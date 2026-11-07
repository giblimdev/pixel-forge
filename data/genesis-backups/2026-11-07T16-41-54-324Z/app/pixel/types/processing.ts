/*
path:            app/pixel/types/processing.ts
tag:             ["pixel", "types", "processing", "image"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Centralise les types du pipeline de traitement d'image
                 (statut, etapes, resultat, erreurs) et re-exporte le type
                 ImageLimits depuis le validateur pour eviter les cycles
                 d'import. Aucune valeur runtime autre que les enums/consts
                 de statut, aucune logique metier.

flow:            import type { ImageLimits } depuis le validateur ->
                 definition des types ProcessingStatus, ProcessingStep,
                 ProcessingResult, ProcessingError -> export unique
                 consomme par les pages et Server Actions pixel.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts"]
imports:         ["@/app/pixel/lib/validators/image-limits"]
exports:         ["ProcessingStatus", "ProcessingStep",
                  "ProcessingResult", "ProcessingError", "ImageLimits"]
useBy:           []

userStories:     ["*en tant que developpeur je veux typer le pipeline de traitement"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ImageLimits } from "@/app/pixel/lib/validators/image-limits";

// ---------------------------------------------------------------------------
// Re-export (evite les imports circulaires depuis les consommateurs)
// ---------------------------------------------------------------------------

export type { ImageLimits };

// ---------------------------------------------------------------------------
// Statuts / etapes du pipeline
// ---------------------------------------------------------------------------

export const PROCESSING_STATUSES = [
  "idle",
  "validating",
  "uploading",
  "processing",
  "done",
  "error",
] as const;

export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const PROCESSING_STEPS = [
  "receive",
  "validate",
  "resize",
  "optimize",
  "store",
] as const;

export type ProcessingStep = (typeof PROCESSING_STEPS)[number];

// ---------------------------------------------------------------------------
// Resultat / erreurs
// ---------------------------------------------------------------------------

export type ProcessingError = {
  step: ProcessingStep;
  code: string;
  message: string;
};

export type ProcessingResult =
  | {
      status: "done";
      url: string;
      limits: ImageLimits;
      steps: ProcessingStep[];
    }
  | {
      status: "error";
      error: ProcessingError;
    };