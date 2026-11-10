/*
path:            app/pixel/features/favicon-generator/index.ts
tag:             ["pixel", "feature", "favicon-generator", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module favicon-generator. Reexporte le
                 panel, le hook, les types locaux et les defaults. Les
                 imports externes doivent passer par CET index pour
                 laisser la liberte de refactorer l'implementation.

flow:            Module TypeScript pur -> reexports.

ecosystem:       FaviconGenerator = [
                   "@/app/api/images/favicon/route.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/index.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                   "@/app/pixel/lib/image-engine/index.ts",
                   "@/app/pixel/lib/storage/temp-cleanup.ts",
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                  "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                  "@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["@/app/pixel/features/favicon-generator/components/favicon-panel",
                  "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator",
                  "@/app/pixel/features/favicon-generator/types/favicon.types",
                  "@/app/pixel/features/favicon-generator/schemas/favicon.schema"]
exports:         ["FaviconPanel", "FaviconPanelProps",
                  "useFaviconGenerator", "UseFaviconGeneratorReturn",
                  "FaviconOutcome", "DEFAULT_FAVICON_OPTIONS",
                  "faviconFormSchema", "FaviconFormInput"]
useBy:           ["@/app/pixel/generate/favicon/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour favicon-generator"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { FaviconPanel } from "@/app/pixel/features/favicon-generator/components/favicon-panel";
export type { FaviconPanelProps } from "@/app/pixel/features/favicon-generator/components/favicon-panel";

export { useFaviconGenerator } from "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator";
export type { UseFaviconGeneratorReturn } from "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator";

export type { FaviconOutcome } from "@/app/pixel/features/favicon-generator/types/favicon.types";
export { DEFAULT_FAVICON_OPTIONS } from "@/app/pixel/features/favicon-generator/types/favicon.types";

export { faviconFormSchema } from "@/app/pixel/features/favicon-generator/schemas/favicon.schema";
export type { FaviconFormInput } from "@/app/pixel/features/favicon-generator/schemas/favicon.schema";