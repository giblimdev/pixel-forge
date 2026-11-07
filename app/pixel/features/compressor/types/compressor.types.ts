/*
path:            app/pixel/features/compressor/types/compressor.types.ts
tag:             ["pixel", "feature", "compressor", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module compressor.

flow:            Module TypeScript pur -> export des types.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["CompressorOptions",
                  "CompressorStage",
                  "CompressionSuccessItem",
                  "CompressionErrorItem",
                  "CompressionOutcome",
                  "DEFAULT_COMPRESSOR_OPTIONS"]
useBy:           ["@/app/pixel/features/compressor/hooks/use-compressor.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour le compressor"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export interface CompressorOptions {
  readonly quality: number;
  readonly palette: boolean;
  readonly stripMetadata: boolean;
}

export type CompressorStage = "idle" | "running" | "done";

export interface CompressionSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface CompressionErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface CompressionOutcome {
  readonly stage: CompressorStage;
  readonly success: readonly CompressionSuccessItem[];
  readonly errors: readonly CompressionErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_COMPRESSOR_OPTIONS: CompressorOptions = {
  quality: 80,
  palette: false,
  stripMetadata: true,
};