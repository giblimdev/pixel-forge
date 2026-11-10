/*
path:            app/pixel/features/image-editor/schemas/image-editor.schema.ts
tag:             ["pixel", "feature", "image-editor", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module image-editor.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/types/image-editor.types.ts",
                   "@/app/pixel/features/image-editor/schemas/image-editor.schema.ts",
                   "@/app/pixel/features/image-editor/hooks/use-image-editor.ts",
                   "@/app/pixel/features/image-editor/components/adjustment-controls.tsx",
                   "@/app/pixel/features/image-editor/components/watermark-editor.tsx",
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/image-editor/types/image-editor.types.ts"]
imports:         ["zod"]
exports:         ["imageEditorFormSchema", "ImageEditorFormInput"]
useBy:           ["@/app/pixel/features/image-editor/hooks/use-image-editor.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de retouche"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const imageEditorFormSchema = z
  .object({
    adjustments: z.object({
      brightness: z.number().min(-100).max(100),
      contrast: z.number().min(-100).max(100),
      saturation: z.number().min(-100).max(100),
      hue: z.number().min(-180).max(180),
      blur: z.number().min(0).max(100),
      sharpen: z.number().min(0).max(100),
      grayscale: z.boolean(),
    }),
    watermark: z
      .object({
        kind: z.enum(["text", "logo"]),
        text: z.string().max(200),
        sizePercent: z.number().min(1).max(100),
        position: z.enum([
          "top-left",
          "top-center",
          "top-right",
          "middle-left",
          "middle-center",
          "middle-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ]),
        opacity: z.number().min(0).max(100),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .nullable(),
    format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
    quality: z.number().int().min(0).max(100),
  })
  .strict();

export type ImageEditorFormInput = z.infer<typeof imageEditorFormSchema>;