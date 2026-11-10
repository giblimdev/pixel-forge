/*
path :           app/pixel/features/resize/index.ts
tag :            ["pixel", "pixel-forge", "resize", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module resize.
                 Réexporte ResizePanel. Sera complété plus tard.

flow:            Module TypeScript pur → réexport.

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/resize/components/resize-panel.tsx"]

imports:         ["@/app/pixel/features/resize/components/resize-panel"]

exports:         ["ResizePanel", "ResizePanelProps"]

useBy:           ["@/app/pixel/optimize/resize/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { ResizePanel } from "@/app/pixel/features/resize/components/resize-panel";
export type { ResizePanelProps } from "@/app/pixel/features/resize/components/resize-panel";