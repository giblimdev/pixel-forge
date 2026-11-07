/*
path:            app/pixel/features/optimizer/schemas/optimizer.schema.ts
tag:             ["pixel", "feature", "optimizer", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module optimizer (valide les
                 options avant envoi). Meme structure que
                 optimizationOptionsSchema global mais SANS le champ
                 format (l'optimizer conserve le format source).

flow:            Module TypeScript pur -> export du schema.

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/optimization.ts"]
imports:         ["zod", "@/app/pixel/types/optimization"]
exports:         ["optimizerFormSchema", "OptimizerFormInput"]
useBy:           ["@/app/pixel/features/optimizer/hooks/use-optimizer.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de l'optimizer cote client"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const optimizerFormSchema = z
  .object({
    preset: z.enum(["web-max", "web-balanced", "web-aggressive", "thumbnail", "custom"]),
    strategy: z.discriminatedUnion("kind", [
      z.object({
        kind: z.literal("target-size"),
        targetBytes: z.number().int().positive().max(25 * 1024 * 1024),
        minQuality: z.number().int().min(0).max(100),
      }),
      z.object({
        kind: z.literal("quality"),
        quality: z.number().int().min(0).max(100),
      }),
      z.object({
        kind: z.literal("level"),
        level: z.number().int().min(1).max(10),
      }),
    ]),
    resize: z
      .object({
        maxWidth: z.number().int().positive().max(8000).nullable(),
        maxHeight: z.number().int().positive().max(8000).nullable(),
        fit: z.enum(["cover", "contain", "inside"]),
      })
      .nullable(),
    stripMetadata: z.boolean(),
  })
  .strict();

export type OptimizerFormInput = z.infer<typeof optimizerFormSchema>;