/*
path :           app/pixel/features/background-removal/index.ts
tag :            ["pixel", "pixel-forge", "background-removal", "index", "placeholder", "public-api"]
projectId:       pixel
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module
                 background-removal. Réexporte BackgroundPanel.

flow:            Module TypeScript pur → réexport.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx"]

imports:         ["@/app/pixel/features/background-removal/components/background-panel"]

exports:         ["BackgroundPanel", "BackgroundPanelProps"]

useBy:           ["@/app/pixel/edit/background/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { BackgroundPanel } from "@/app/pixel/features/background-removal/components/background-panel";
export type { BackgroundPanelProps } from "@/app/pixel/features/background-removal/components/background-panel";
