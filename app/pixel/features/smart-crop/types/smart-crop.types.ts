/*
path:            app/pixel/features/smart-crop/types/smart-crop.types.ts
tag:             ["pixel", "feature", "smart-crop", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module smart-crop.

flow:            Module TypeScript pur -> export des types.

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/types/smart-crop.types.ts",
                   "@/app/pixel/features/smart-crop/schemas/smart-crop.schema.ts",
                   "@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                   "@/app/pixel/features/smart-crop/components/crop-ratio-selector.tsx",
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["CropRatio", "SmartCropStrategy",
                  "SmartCropOptions", "SmartCropStage",
                  "SmartCropSuccessItem", "SmartCropErrorItem",
                  "SmartCropOutcome", "DEFAULT_SMART_CROP_OPTIONS"]
useBy:           ["@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour smart-crop"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export interface CropRatio {
  readonly label: string;
  readonly value: number; // largeur / hauteur
}

export type SmartCropStrategy = "attention" | "entropy";

export interface SmartCropOptions {
  readonly aspectRatio: number;
  readonly strategy: SmartCropStrategy;
  readonly format: ImageFormat;
  readonly quality: number;
}

export type SmartCropStage = "idle" | "running" | "done";

export interface SmartCropSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface SmartCropErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface SmartCropOutcome {
  readonly stage: SmartCropStage;
  readonly success: readonly SmartCropSuccessItem[];
  readonly errors: readonly SmartCropErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_SMART_CROP_OPTIONS: SmartCropOptions = {
  aspectRatio: 16 / 9,
  strategy: "attention",
  format: "webp",
  quality: 85,
};