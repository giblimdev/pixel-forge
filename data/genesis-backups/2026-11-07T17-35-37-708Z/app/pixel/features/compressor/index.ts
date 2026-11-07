/*
path :           app/pixel/features/compressor/index.ts
tag :            ["pixel", "pixel-forge", "compressor", "index", "placeholder", "public-api"]
projectId:       pixel
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module compressor.
                 Réexporte CompressorPanel. Sera complété plus tard.

flow:            Module TypeScript pur → réexport.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/compressor/components/compressor-panel.tsx"]

imports:         ["@/app/pixel/features/compressor/components/compressor-panel"]

exports:         ["CompressorPanel", "CompressorPanelProps"]

useBy:           ["@/app/pixel/optimize/compress/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { CompressorPanel } from "@/app/pixel/features/compressor/components/compressor-panel";
export type { CompressorPanelProps } from "@/app/pixel/features/compressor/components/compressor-panel";
