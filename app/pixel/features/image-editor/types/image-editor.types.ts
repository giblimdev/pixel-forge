/*
path:            app/pixel/features/image-editor/types/image-editor.types.ts
tag:             ["pixel", "feature", "image-editor", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module image-editor (retouche +
                 watermark).

flow:            Module TypeScript pur -> export des types.

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/types/image-editor.types.ts",
                   "@/app/pixel/features/image-editor/schemas/image-editor.schema.ts",
                   "@/app/pixel/features/image-editor/hooks/use-image-editor.ts",
                   "@/app/pixel/features/image-editor/components/adjustment-controls.tsx",
                   "@/app/pixel/features/image-editor/components/watermark-editor.tsx",
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["RetouchAdjustments", "WatermarkConfig",
                  "WatermarkPosition", "WATERMARK_POSITIONS",
                  "ImageEditorOptions", "ImageEditorStage",
                  "ImageEditorSuccessItem", "ImageEditorErrorItem",
                  "ImageEditorOutcome", "DEFAULT_ADJUSTMENTS",
                  "DEFAULT_WATERMARK", "DEFAULT_IMAGE_EDITOR_OPTIONS"]
useBy:           ["@/app/pixel/features/image-editor/hooks/use-image-editor.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour l'editeur d'image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Retouche
// ---------------------------------------------------------------------------

export interface RetouchAdjustments {
  readonly brightness: number;
  readonly contrast: number;
  readonly saturation: number;
  readonly hue: number;
  readonly blur: number;
  readonly sharpen: number;
  readonly grayscale: boolean;
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const WATERMARK_POSITIONS: readonly WatermarkPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export interface WatermarkConfig {
  readonly kind: "text" | "logo";
  readonly text: string;
  readonly sizePercent: number;
  readonly position: WatermarkPosition;
  readonly opacity: number;
  readonly color: string;
}

// ---------------------------------------------------------------------------
// Options globales
// ---------------------------------------------------------------------------

export interface ImageEditorOptions {
  readonly adjustments: RetouchAdjustments;
  readonly watermark: WatermarkConfig | null;
  readonly format: ImageFormat;
  readonly quality: number;
}

export type ImageEditorStage = "idle" | "running" | "done";

export interface ImageEditorSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface ImageEditorErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface ImageEditorOutcome {
  readonly stage: ImageEditorStage;
  readonly success: readonly ImageEditorSuccessItem[];
  readonly errors: readonly ImageEditorErrorItem[];
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// Valeurs par defaut
// ---------------------------------------------------------------------------

export const DEFAULT_ADJUSTMENTS: RetouchAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  grayscale: false,
};

export const DEFAULT_WATERMARK: WatermarkConfig = {
  kind: "text",
  text: "PixelForge",
  sizePercent: 20,
  position: "bottom-right",
  opacity: 70,
  color: "#ffffff",
};

export const DEFAULT_IMAGE_EDITOR_OPTIONS: ImageEditorOptions = {
  adjustments: DEFAULT_ADJUSTMENTS,
  watermark: null,
  format: "webp",
  quality: 90,
};