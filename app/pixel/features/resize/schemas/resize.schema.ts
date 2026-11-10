/*
path:            app/pixel/features/resize/schemas/resize.schema.ts
tag:             ["pixel", "feature", "resize", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module resize.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/types/resize.types.ts",
                   "@/app/pixel/features/resize/schemas/resize.schema.ts",
                   "@/app/pixel/features/resize/hooks/use-resize.ts",
                   "@/app/pixel/features/resize/components/dimensions-input.tsx",
                   "@/app/pixel/features/resize/components/aspect-ratio-control.tsx",
                   "@/app/pixel/features/resize/components/resize-presets.tsx",
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/resize/types/resize.types.ts"]
imports:         ["zod"]
exports:         ["resizeFormSchema", "ResizeFormInput"]
useBy:           ["@/app/pixel/features/resize/hooks/use-resize.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de resize"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const resizeFormSchema = z
  .object({
    width: z.number().int().positive().max(8000),
    height: z.number().int().positive().max(8000),
    fit: z.enum(["cover", "contain", "inside"]),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
  })
  .strict();

export type ResizeFormInput = z.infer<typeof resizeFormSchema>;