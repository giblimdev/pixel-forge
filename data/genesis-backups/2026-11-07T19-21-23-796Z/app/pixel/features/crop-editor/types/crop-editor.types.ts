/*
path :           app/pixel/features/crop-editor/types/crop-editor.types.ts
tag :            ["pixelforge", "crop-editor", "types", "react-easy-crop", "editing"]
projectId:       <Pixel-fotgen>
type :           helper
generic:         false

role:            Contrats de l'éditeur de recadrage manuel (outil 06).
                 Alignés sur react-easy-crop et sur le code existant
                 (crop-editor-panel.tsx, crop-controls.tsx,
                 use-crop-editor.ts, crop-editor.store.ts). Les propriétés
                 sont nommées aspectRatio, format, flipHorizontal pour
                 correspondre aux composants déjà écrits. L'outcome est un
                 objet plat (stage + success[] + errors[]) pour permettre
                 l'accès direct à outcome.success et outcome.errors.

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
                 ]
imports:         ["react-easy-crop"]
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
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { Area } from "react-easy-crop";

export type CropAreaPixels = Area;

export type CropRotation = 0 | 90 | 180 | 270;

export type CropOutputFormat = "jpeg" | "png" | "webp";

export type CropEditorOptions = {
  readonly aspectRatio: number | undefined;
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
  readonly id: string;
  readonly filename: string;
  readonly mime: string;
  readonly size: number;
  readonly width: number;
  readonly height: number;
  readonly url: string;
};

export type CropEditorErrorItem = {
  readonly sourceId: string;
  readonly code:
    | "INVALID_INPUT"
    | "UNSUPPORTED_FORMAT"
    | "LIMIT_EXCEEDED"
    | "PROCESSING_ERROR";
  readonly message: string;
  readonly details?: unknown;
};

export type CropEditorOutcome = {
  readonly stage: CropEditorStage;
  readonly success: readonly CropEditorSuccessItem[];
  readonly errors: readonly CropEditorErrorItem[];
};

export const DEFAULT_CROP_EDITOR_OPTIONS: CropEditorOptions = {
  aspectRatio: undefined,
  zoom: 1,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  format: "webp",
  quality: 82,
  keepMetadata: false,
} as const;