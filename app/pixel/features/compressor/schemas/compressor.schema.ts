/*
path:            app/pixel/features/compressor/schemas/compressor.schema.ts
tag:             ["pixel", "feature", "compressor", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module compressor.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/types/compressor.types.ts"]
imports:         ["zod"]
exports:         ["compressorFormSchema", "CompressorFormInput"]
useBy:           ["@/app/pixel/features/compressor/hooks/use-compressor.ts"]

userStories:     ["*en tant que developpeur je veux valider les options du compressor"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const compressorFormSchema = z
  .object({
    quality: z.number().int().min(0).max(100),
    palette: z.boolean(),
    stripMetadata: z.boolean(),
  })
  .strict();

export type CompressorFormInput = z.infer<typeof compressorFormSchema>;