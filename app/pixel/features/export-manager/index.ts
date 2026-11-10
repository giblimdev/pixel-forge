/*
path:            app/pixel/features/export-manager/index.ts
tag:             ["pixel", "feature", "export-manager", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module export-manager.

flow:            Module TypeScript pur -> reexports.

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
relatedFiles:    ["@/app/pixel/features/export-manager/components/export-manager.tsx"]
imports:         ["@/app/pixel/features/export-manager/components/export-manager",
                  "@/app/pixel/features/export-manager/hooks/use-export-manager",
                  "@/app/pixel/features/export-manager/types/export-manager.types"]
exports:         ["ExportManager", "ExportManagerProps",
                  "useExportManager", "UseExportManagerReturn",
                  "ExportOutcome", "DEFAULT_EXPORT_OPTIONS"]
useBy:           ["@/app/pixel/optimize/page.tsx",
                  "@/app/pixel/optimize/compress/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour l'export manager"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { ExportManager } from "@/app/pixel/features/export-manager/components/export-manager";
export type { ExportManagerProps } from "@/app/pixel/features/export-manager/components/export-manager";

export { useExportManager } from "@/app/pixel/features/export-manager/hooks/use-export-manager";
export type { UseExportManagerReturn } from "@/app/pixel/features/export-manager/hooks/use-export-manager";

export type { ExportOutcome } from "@/app/pixel/features/export-manager/types/export-manager.types";
export { DEFAULT_EXPORT_OPTIONS } from "@/app/pixel/features/export-manager/types/export-manager.types";