/*
path:            app/pixel/features/metadata/schemas/metadata.schema.ts
tag:             ["pixel", "feature", "metadata", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module metadata.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       Metadata = [
                   "@/app/api/images/metadata/route.ts",
                   "@/app/pixel/analyze/metadata/page.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                   "@/app/pixel/features/metadata/components/metadata-details.tsx",
                   "@/app/pixel/features/metadata/components/metadata-panel.tsx",
                   "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                   "@/app/pixel/features/metadata/index.ts",
                   "@/app/pixel/features/metadata/schemas/metadata.schema.ts",
                   "@/app/pixel/features/metadata/types/metadata.types.ts",
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/metadata/types/metadata.types.ts"]
imports:         ["zod"]
exports:         ["metadataFormSchema", "MetadataFormInput"]
useBy:           ["@/app/pixel/features/metadata/hooks/use-image-metadata.ts"]

userStories:     ["*en tant que developpeur je veux valider les options de metadata"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { z } from "zod";

export const metadataFormSchema = z
  .object({
    action: z.enum(["analyze", "strip"]),
  })
  .strict();

export type MetadataFormInput = z.infer<typeof metadataFormSchema>;