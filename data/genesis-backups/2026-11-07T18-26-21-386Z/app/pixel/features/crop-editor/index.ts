/*
path :           app/pixel/features/crop-editor/index.ts
tag :            ["pixel", "pixel-forge", "crop-editor", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module crop-editor.
                 Réexporte CropEditorPanel. Sera complété avec les hooks
                 (use-crop-editor), types et schémas Zod quand la feature
                 sera implémentée.

flow:            Module TypeScript pur → réexport.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]

imports:         ["@/app/pixel/features/crop-editor/components/crop-editor-panel"]

exports:         ["CropEditorPanel", "CropEditorPanelProps"]

useBy:           ["@/app/pixel/edit/crop/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { CropEditorPanel } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";
export type { CropEditorPanelProps } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";