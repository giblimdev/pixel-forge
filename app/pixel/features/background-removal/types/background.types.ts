/*
path:            app/pixel/features/background-removal/types/background.types.ts
tag:             ["pixel", "feature", "background-removal", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module background-removal.

flow:            Module TypeScript pur -> export des types.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["RgbColor", "BackgroundRemovalOptions",
                  "BackgroundRemovalStage", "BackgroundRemovalSuccessItem",
                  "BackgroundRemovalErrorItem", "BackgroundRemovalOutcome",
                  "DEFAULT_BACKGROUND_OPTIONS"]
useBy:           ["@/app/pixel/features/background-removal/hooks/use-background-removal.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour background-removal"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface BackgroundRemovalOptions {
  readonly target: RgbColor;
  readonly tolerance: number;
  readonly feathering: boolean;
}

export type BackgroundRemovalStage = "idle" | "running" | "done";

export interface BackgroundRemovalSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface BackgroundRemovalErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface BackgroundRemovalOutcome {
  readonly stage: BackgroundRemovalStage;
  readonly success: readonly BackgroundRemovalSuccessItem[];
  readonly errors: readonly BackgroundRemovalErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_BACKGROUND_OPTIONS: BackgroundRemovalOptions = {
  target: { r: 255, g: 255, b: 255 },
  tolerance: 0.15,
  feathering: true,
};