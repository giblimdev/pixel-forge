/*
path:            app/pixel/features/crop-editor/schemas/crop-editor.schema.ts
tag:             ["pixel", "feature", "crop-editor", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module crop-editor. Valide les
                 options + la zone de recadrage (coordonnees en pixels
                 issues de react-easy-crop onCropComplete).

flow:            Module TypeScript pur -> export du schema.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/crop-editor/types/crop-editor.types.ts"]
imports:         ["zod"]
exports:         ["cropEditorFormSchema", "CropEditorFormInput"]
useBy:           ["@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts"]

userStories:     ["*en tant que developpeur je veux valider les options et la zone de recadrage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const cropEditorFormSchema = z
  .object({
    aspectRatio: z.number().positive().max(10),
    rotation: z.union([
      z.literal(0),
      z.literal(90),
      z.literal(180),
      z.literal(270),
    ]),
    flipHorizontal: z.boolean(),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
    cropArea: z
      .object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .nullable(),
  })
  .strict();

export type CropEditorFormInput = z.infer<typeof cropEditorFormSchema>;