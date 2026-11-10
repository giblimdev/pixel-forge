/*
path:            app/pixel/features/metadata/index.ts
tag:             ["pixel", "feature", "metadata", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module metadata. Reexporte le panel,
                 le hook, les types locaux et les defaults.

flow:            Module TypeScript pur -> reexports.

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
relatedFiles:    ["@/app/pixel/features/metadata/components/metadata-panel.tsx",
                  "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                  "@/app/pixel/features/metadata/types/metadata.types.ts"]
imports:         ["@/app/pixel/features/metadata/components/metadata-panel",
                  "@/app/pixel/features/metadata/hooks/use-image-metadata",
                  "@/app/pixel/features/metadata/types/metadata.types",
                  "@/app/pixel/features/metadata/schemas/metadata.schema"]
exports:         ["MetadataPanel", "MetadataPanelProps",
                  "useImageMetadata", "UseImageMetadataReturn",
                  "MetadataOutcome", "MetadataAnalysis",
                  "DEFAULT_METADATA_OPTIONS",
                  "metadataFormSchema", "MetadataFormInput"]
useBy:           ["@/app/pixel/analyze/page.tsx",
                  "@/app/pixel/analyze/metadata/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour metadata"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { MetadataPanel } from "@/app/pixel/features/metadata/components/metadata-panel";
export type { MetadataPanelProps } from "@/app/pixel/features/metadata/components/metadata-panel";

export { useImageMetadata } from "@/app/pixel/features/metadata/hooks/use-image-metadata";
export type { UseImageMetadataReturn } from "@/app/pixel/features/metadata/hooks/use-image-metadata";

export type {
  MetadataOutcome,
  MetadataAnalysis,
} from "@/app/pixel/features/metadata/types/metadata.types";
export { DEFAULT_METADATA_OPTIONS } from "@/app/pixel/features/metadata/types/metadata.types";

export { metadataFormSchema } from "@/app/pixel/features/metadata/schemas/metadata.schema";
export type { MetadataFormInput } from "@/app/pixel/features/metadata/schemas/metadata.schema";