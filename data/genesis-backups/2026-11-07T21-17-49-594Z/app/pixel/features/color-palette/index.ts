/*
path :           app/pixel/features/color-palette/index.ts
tag :            ["pixel", "pixel-forge", "color-palette", "index", "placeholder", "public-api"]
projectId:       pixel
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module color-palette.
                 Réexporte PalettePanel.

flow:            Module TypeScript pur → réexport.

ecosystem:       ColorPalette = [
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/color-palette/components/palette-panel.tsx"]

imports:         ["@/app/pixel/features/color-palette/components/palette-panel"]

exports:         ["PalettePanel", "PalettePanelProps"]

useBy:           ["@/app/pixel/generate/palette/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { PalettePanel } from "@/app/pixel/features/color-palette/components/palette-panel";
export type { PalettePanelProps } from "@/app/pixel/features/color-palette/components/palette-panel";
