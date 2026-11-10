/*
path:            app/pixel/features/color-palette/index.ts
tag:             ["pixel", "feature", "color-palette", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module color-palette. Reexporte le
                 panel, le hook, les types locaux et les defaults.
                 Les imports externes doivent passer par CET index
                 pour laisser la liberte de refactorer l'implementation.

flow:            Module TypeScript pur -> reexports.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/color-palette/components/palette-panel.tsx",
                  "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                  "@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["@/app/pixel/features/color-palette/components/palette-panel",
                  "@/app/pixel/features/color-palette/hooks/use-color-palette",
                  "@/app/pixel/features/color-palette/types/palette.types",
                  "@/app/pixel/features/color-palette/schemas/palette.schema"]
exports:         ["PalettePanel", "PalettePanelProps",
                  "useColorPalette", "UseColorPaletteReturn",
                  "PaletteOutcome", "DEFAULT_PALETTE_OPTIONS",
                  "paletteFormSchema", "PaletteFormInput"]
useBy:           ["@/app/pixel/generate/palette/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour color-palette"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { PalettePanel } from "@/app/pixel/features/color-palette/components/palette-panel";
export type { PalettePanelProps } from "@/app/pixel/features/color-palette/components/palette-panel";

export { useColorPalette } from "@/app/pixel/features/color-palette/hooks/use-color-palette";
export type { UseColorPaletteReturn } from "@/app/pixel/features/color-palette/hooks/use-color-palette";

export type { PaletteOutcome } from "@/app/pixel/features/color-palette/types/palette.types";
export { DEFAULT_PALETTE_OPTIONS } from "@/app/pixel/features/color-palette/types/palette.types";

export { paletteFormSchema } from "@/app/pixel/features/color-palette/schemas/palette.schema";
export type { PaletteFormInput } from "@/app/pixel/features/color-palette/schemas/palette.schema";