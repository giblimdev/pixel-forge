/*
path:            app/pixel/features/compressor/index.ts
tag:             ["pixel", "feature", "compressor", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module compressor.

flow:            Module TypeScript pur -> reexports.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/components/compressor-panel.tsx"]
imports:         ["@/app/pixel/features/compressor/components/compressor-panel",
                  "@/app/pixel/features/compressor/hooks/use-compressor",
                  "@/app/pixel/features/compressor/types/compressor.types"]
exports:         ["CompressorPanel", "CompressorPanelProps",
                  "useCompressor", "UseCompressorReturn",
                  "CompressionOutcome", "DEFAULT_COMPRESSOR_OPTIONS"]
useBy:           ["@/app/pixel/optimize/compress/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour le compressor"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { CompressorPanel } from "@/app/pixel/features/compressor/components/compressor-panel";
export type { CompressorPanelProps } from "@/app/pixel/features/compressor/components/compressor-panel";

export { useCompressor } from "@/app/pixel/features/compressor/hooks/use-compressor";
export type { UseCompressorReturn } from "@/app/pixel/features/compressor/hooks/use-compressor";

export type { CompressionOutcome } from "@/app/pixel/features/compressor/types/compressor.types";
export { DEFAULT_COMPRESSOR_OPTIONS } from "@/app/pixel/features/compressor/types/compressor.types";