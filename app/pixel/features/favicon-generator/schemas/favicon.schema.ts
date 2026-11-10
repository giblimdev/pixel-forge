/*
path:            app/pixel/features/favicon-generator/schemas/favicon.schema.ts
tag:             ["pixel", "feature", "favicon-generator", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module favicon-generator.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["zod"]
exports:         ["faviconFormSchema", "FaviconFormInput"]
useBy:           ["@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts"]

userStories:     ["*en tant que developpeur je veux valider les options du generateur de favicons"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const faviconFormSchema = z
  .object({
    sizes: z
      .array(z.union([z.literal(16), z.literal(24), z.literal(32), z.literal(48), z.literal(64), z.literal(128), z.literal(256)]))
      .min(1, "Au moins une taille requise."),
    manifest: z.object({
      appName: z.string().trim().min(1).max(100),
      shortName: z.string().trim().min(1).max(30),
      themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
    includeAppleTouch: z.boolean(),
    includeAndroidChrome: z.boolean(),
  })
  .strict();

export type FaviconFormInput = z.infer<typeof faviconFormSchema>;