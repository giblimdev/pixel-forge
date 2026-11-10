/*
path:            app/pixel/features/smart-crop/schemas/smart-crop.schema.ts
tag:             ["pixel", "feature", "smart-crop", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module smart-crop.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/types/smart-crop.types.ts",
                   "@/app/pixel/features/smart-crop/schemas/smart-crop.schema.ts",
                   "@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                   "@/app/pixel/features/smart-crop/components/crop-ratio-selector.tsx",
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/smart-crop/types/smart-crop.types.ts"]
imports:         ["zod"]
exports:         ["smartCropFormSchema", "SmartCropFormInput"]
useBy:           ["@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de smart-crop"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const smartCropFormSchema = z
  .object({
    aspectRatio: z.number().positive().max(10),
    strategy: z.enum(["attention", "entropy"]),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
  })
  .strict();

export type SmartCropFormInput = z.infer<typeof smartCropFormSchema>;