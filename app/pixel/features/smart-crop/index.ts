/*
path :           app/pixel/features/smart-crop/index.ts
tag :            ["pixel", "pixel-forge", "smart-crop", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module smart-crop.
                 Réexporte SmartCropPanel. Sera complété plus tard.

flow:            Module TypeScript pur → réexport.

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx"]

imports:         ["@/app/pixel/features/smart-crop/components/smart-crop-panel"]

exports:         ["SmartCropPanel", "SmartCropPanelProps"]

useBy:           ["@/app/pixel/optimize/smart-crop/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { SmartCropPanel } from "@/app/pixel/features/smart-crop/components/smart-crop-panel";
export type { SmartCropPanelProps } from "@/app/pixel/features/smart-crop/components/smart-crop-panel";