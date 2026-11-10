/*
path :           app/pixel/features/crop-editor/types/crop-editor.types.ts
tag :            ["pixelforge", "crop-editor", "types", "react-easy-crop", "editing"]
projectId:       <Pixel-fotgen>
type :           helper
generic:         false

role:            Contrats de l'éditeur de recadrage manuel (outil 06).
                 Alignés sur react-easy-crop et sur le code existant
                 (crop-editor-panel.tsx, crop-controls.tsx,
                 use-crop-editor.ts, crop-editor.store.ts) :
                 - options : aspectRatio (0 = cadrage libre), format,
                   flipHorizontal, etc.
                 - stage : inclut "running" et "done"
                 - outcome : plat avec stage + success + errors + durationMs
                 - success item : sourceId, sourceFilename, sourceSizeBytes,
                   result (ResultImage), downloadUrl
                 - error item : sourceId, sourceFilename, error (ProcessingError)

flow:            DEFAULT_CROP_EDITOR_OPTIONS → état initial du hook.
                 CropEditorOptions → options contrôlées par l'UI.
                 CropEditorOutcome → consommé par le store et le panel.
                 CropAreaPixels → { x, y, width, height } en pixels image
                 source, transmis tel quel au serveur.

ecosystem:       PIXELFORGE_EDITING
relatedFiles:    [
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "app/pixel/features/crop-editor/store/crop-editor.store.ts",
                   "app/pixel/types/image.ts",
                   "app/pixel/types/processing.ts",
                 ]
imports:         [
                   "react-easy-crop",
                   "@/app/pixel/types/image",
                   "@/app/pixel/types/processing",
                 ]
exports:         [
                   "CropAreaPixels",
                   "CropEditorOptions",
                   "CropEditorStage",
                   "CropEditorSuccessItem",
                   "CropEditorErrorItem",
                   "CropEditorOutcome",
                   "DEFAULT_CROP_EDITOR_OPTIONS",
                 ]
useBy:           [
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "app/pixel/features/crop-editor/store/crop-editor.store.ts",
                 ]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import type { Area } from "react-easy-crop";
import type { ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export type CropAreaPixels = Area;

export type CropRotation = 0 | 90 | 180 | 270;

export type CropOutputFormat = "jpeg" | "png" | "webp";

/**
 * Options de l'éditeur de recadrage.
 * `aspectRatio` : 0 signifie cadrage libre (aucun ratio verrouillé).
 * Toutes les autres valeurs sont des ratios positifs (1 = carré,
 * 16/9, 4/3, etc.).
 */
export type CropEditorOptions = {
  readonly aspectRatio: number;
  readonly zoom: number;
  readonly rotation: CropRotation;
  readonly flipHorizontal: boolean;
  readonly flipVertical: boolean;
  readonly format: CropOutputFormat;
  readonly quality: number;
  readonly keepMetadata: boolean;
};

export type CropEditorStage =
  | "idle"
  | "ready"
  | "running"
  | "done"
  | "partial"
  | "error";

export type CropEditorSuccessItem = {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
};

export type CropEditorErrorItem = {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
};

export type CropEditorOutcome = {
  readonly stage: CropEditorStage;
  readonly success: readonly CropEditorSuccessItem[];
  readonly errors: readonly CropEditorErrorItem[];
  readonly durationMs: number;
};

export const DEFAULT_CROP_EDITOR_OPTIONS: CropEditorOptions = {
  aspectRatio: 0,
  zoom: 1,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  format: "webp",
  quality: 82,
  keepMetadata: false,
} as const;