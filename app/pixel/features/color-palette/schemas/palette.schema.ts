/*
path:            app/pixel/features/color-palette/schemas/palette.schema.ts
tag:             ["pixel", "feature", "color-palette", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module color-palette.

flow:            Module TypeScript pur -> export du schema.

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
relatedFiles:    ["@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["zod"]
exports:         ["paletteFormSchema", "PaletteFormInput"]
useBy:           ["@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                  "@/app/api/images/palette/route.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de palette"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { z } from "zod";

export const paletteFormSchema = z
  .object({
    colorCount: z.number().int().min(1).max(10),
    skipExtremes: z.boolean(),
    sampleSize: z.number().int().min(50).max(400),
  })
  .strict();

export type PaletteFormInput = z.infer<typeof paletteFormSchema>;