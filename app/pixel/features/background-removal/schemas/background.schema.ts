/*
path:            app/pixel/features/background-removal/schemas/background.schema.ts
tag:             ["pixel", "feature", "background-removal", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module background-removal.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/types/background.types.ts"]
imports:         ["zod"]
exports:         ["backgroundFormSchema", "BackgroundFormInput"]
useBy:           ["@/app/pixel/features/background-removal/hooks/use-background-removal.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de detourage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const backgroundFormSchema = z
  .object({
    target: z.object({
      r: z.number().int().min(0).max(255),
      g: z.number().int().min(0).max(255),
      b: z.number().int().min(0).max(255),
    }),
    tolerance: z.number().min(0).max(1),
    feathering: z.boolean(),
  })
  .strict();

export type BackgroundFormInput = z.infer<typeof backgroundFormSchema>;