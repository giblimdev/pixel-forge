/*
path:            app/pixel/features/crop-editor/index.ts
tag:             ["pixel", "feature", "crop-editor", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module crop-editor.

flow:            Module TypeScript pur -> reexports.

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
relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]
imports:         ["@/app/pixel/features/crop-editor/components/crop-editor-panel",
                  "@/app/pixel/features/crop-editor/hooks/use-crop-editor",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types"]
exports:         ["CropEditorPanel", "CropEditorPanelProps",
                  "useCropEditor", "UseCropEditorReturn",
                  "CropEditorOutcome", "DEFAULT_CROP_EDITOR_OPTIONS"]
useBy:           ["@/app/pixel/edit/crop/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour crop-editor"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { CropEditorPanel } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";
export type { CropEditorPanelProps } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";

export { useCropEditor } from "@/app/pixel/features/crop-editor/hooks/use-crop-editor";
export type { UseCropEditorReturn } from "@/app/pixel/features/crop-editor/hooks/use-crop-editor";

export type { CropEditorOutcome } from "@/app/pixel/features/crop-editor/types/crop-editor.types";
export { DEFAULT_CROP_EDITOR_OPTIONS } from "@/app/pixel/features/crop-editor/types/crop-editor.types";