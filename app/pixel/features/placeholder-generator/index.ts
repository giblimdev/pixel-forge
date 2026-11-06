/*
path :           app/pixel/features/placeholder-generator/index.ts
tag :            ["pixel", "pixel-forge", "placeholder-generator", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module
                 placeholder-generator. Réexporte PlaceholderPanel.

flow:            Module TypeScript pur → réexport.

ecosystem:       PlaceholderGenerator = [
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx"]

imports:         ["@/app/pixel/features/placeholder-generator/components/placeholder-panel"]

exports:         ["PlaceholderPanel", "PlaceholderPanelProps"]

useBy:           ["@/app/pixel/generate/placeholder/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { PlaceholderPanel } from "@/app/pixel/features/placeholder-generator/components/placeholder-panel";
export type { PlaceholderPanelProps } from "@/app/pixel/features/placeholder-generator/components/placeholder-panel";