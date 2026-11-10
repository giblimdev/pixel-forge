/*
path:            app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts
tag:             ["pixel", "feature", "placeholder-generator", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module placeholder-generator.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/placeholder-generator/types/placeholder.types.ts"]
imports:         ["zod"]
exports:         ["placeholderFormSchema", "PlaceholderFormInput"]
useBy:           ["@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                  "@/app/api/images/placeholder/route.ts"]

userStories:     ["*en tant que developpeur je veux valider les options du placeholder generator"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { z } from "zod";

export const placeholderFormSchema = z
  .object({
    format: z.enum(["lqip", "blurhash", "svg", "base64"]),
    lqipWidth: z.number().int().min(8).max(64),
    blurhashComponents: z.number().int().min(1).max(9),
    quality: z.number().int().min(1).max(100),
  })
  .strict();

export type PlaceholderFormInput = z.infer<typeof placeholderFormSchema>;