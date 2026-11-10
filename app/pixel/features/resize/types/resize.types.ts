/*
path:            app/pixel/features/resize/types/resize.types.ts
tag:             ["pixel", "feature", "resize", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module resize. Options, stage,
                 outcome, defaults.

flow:            Module TypeScript pur -> export des types.

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/types/resize.types.ts",
                   "@/app/pixel/features/resize/schemas/resize.schema.ts",
                   "@/app/pixel/features/resize/hooks/use-resize.ts",
                   "@/app/pixel/features/resize/components/dimensions-input.tsx",
                   "@/app/pixel/features/resize/components/aspect-ratio-control.tsx",
                   "@/app/pixel/features/resize/components/resize-presets.tsx",
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["ResizeFit", "ResizeFeatureOptions",
                  "ResizeStage", "ResizeSuccessItem",
                  "ResizeErrorItem", "ResizeOutcome",
                  "DEFAULT_RESIZE_OPTIONS"]
useBy:           ["@/app/pixel/features/resize/hooks/use-resize.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour resize"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export type ResizeFit = "cover" | "contain" | "inside";

export interface ResizeFeatureOptions {
  readonly width: number;
  readonly height: number;
  readonly fit: ResizeFit;
  readonly format: ImageFormat;
  readonly quality: number;
}

export type ResizeStage = "idle" | "running" | "done";

export interface ResizeSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface ResizeErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface ResizeOutcome {
  readonly stage: ResizeStage;
  readonly success: readonly ResizeSuccessItem[];
  readonly errors: readonly ResizeErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_RESIZE_OPTIONS: ResizeFeatureOptions = {
  width: 1280,
  height: 720,
  fit: "inside",
  format: "webp",
  quality: 85,
};