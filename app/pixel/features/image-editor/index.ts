/*
path :           app/pixel/features/image-editor/index.ts
tag :            ["pixel", "pixel-forge", "image-editor", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module image-editor.
                 Réexporte ImageEditorPanel.

flow:            Module TypeScript pur → réexport.

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx"]

imports:         ["@/app/pixel/features/image-editor/components/image-editor-panel"]

exports:         ["ImageEditorPanel", "ImageEditorPanelProps"]

useBy:           ["@/app/pixel/edit/retouch/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { ImageEditorPanel } from "@/app/pixel/features/image-editor/components/image-editor-panel";
export type { ImageEditorPanelProps } from "@/app/pixel/features/image-editor/components/image-editor-panel";