/*
path:            app/pixel/features/crop-editor/types/crop-editor.types.ts
tag:             ["pixel", "feature", "crop-editor", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module crop-editor. Etat de la
                 soumission, outcome, defaults. Reutilise CropRatio et
                 SmartCropStrategy de smart-crop.types pour eviter la
                 duplication des ratios et des strategies.

flow:            Module TypeScript pur -> export des types.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["CropAreaPixels", "CropEditorOptions",
                  "CropEditorStage", "CropEditorSuccessItem",
                  "CropEditorErrorItem", "CropEditorOutcome",
                  "DEFAULT_CROP_EDITOR_OPTIONS"]
useBy:           ["@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour l'editeur de recadrage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export interface CropAreaPixels {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CropEditorOptions {
  readonly aspectRatio: number;
  readonly rotation: 0 | 90 | 180 | 270;
  readonly flipHorizontal: boolean;
  readonly format: ImageFormat;
  readonly quality: number;
}

export type CropEditorStage = "idle" | "running" | "done";

export interface CropEditorSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface CropEditorErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface CropEditorOutcome {
  readonly stage: CropEditorStage;
  readonly success: readonly CropEditorSuccessItem[];
  readonly errors: readonly CropEditorErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_CROP_EDITOR_OPTIONS: CropEditorOptions = {
  aspectRatio: 1,
  rotation: 0,
  flipHorizontal: false,
  format: "webp",
  quality: 90,
};