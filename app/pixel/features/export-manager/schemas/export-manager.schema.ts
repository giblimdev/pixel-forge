/*
path:            app/pixel/features/export-manager/schemas/export-manager.schema.ts
tag:             ["pixel", "feature", "export-manager", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au module export-manager. Valide les
                 options avant envoi.

flow:            Module TypeScript pur -> export du schema.

ecosystem:       ExportManager = [
                   "@/app/pixel/features/export-manager/types/export-manager.types.ts",
                   "@/app/pixel/features/export-manager/schemas/export-manager.schema.ts",
                   "@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "@/app/pixel/features/export-manager/components/export-options.tsx",
                   "@/app/pixel/features/export-manager/components/export-item.tsx",
                   "@/app/pixel/features/export-manager/components/export-progress.tsx",
                   "@/app/pixel/features/export-manager/components/export-manager.tsx",
                   "@/app/pixel/features/export-manager/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/export.ts"]
imports:         ["zod"]
exports:         ["exportFormSchema", "ExportFormInput"]
useBy:           ["@/app/pixel/features/export-manager/hooks/use-export-manager.ts"]

userStories:     ["*en tant que developpeur je veux valider les options d'export"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

export const exportFormSchema = z
  .object({
    organization: z.enum(["flat", "by-format", "by-size"]),
    includeManifest: z.boolean(),
  })
  .strict();

export type ExportFormInput = z.infer<typeof exportFormSchema>;