/*
path:            app/pixel/features/favicon-generator/types/favicon.types.ts
tag:             ["pixel", "feature", "favicon-generator", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module favicon-generator.

flow:            Module TypeScript pur -> export des types.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["FaviconSize", "FAVICON_SIZES",
                  "ManifestOptions", "FaviconGeneratorOptions",
                  "FaviconStage", "FaviconSuccessItem",
                  "FaviconErrorItem", "FaviconOutcome",
                  "DEFAULT_MANIFEST_OPTIONS", "DEFAULT_FAVICON_OPTIONS"]
useBy:           ["@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour le generateur de favicons"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export type FaviconSize = 16 | 24 | 32 | 48 | 64 | 128 | 256;

export const FAVICON_SIZES: readonly FaviconSize[] = [
  16, 24, 32, 48, 64, 128, 256,
];

export interface ManifestOptions {
  readonly appName: string;
  readonly shortName: string;
  readonly themeColor: string;
  readonly backgroundColor: string;
}

export interface FaviconGeneratorOptions {
  readonly sizes: readonly FaviconSize[];
  readonly manifest: ManifestOptions;
  readonly includeAppleTouch: boolean;
  readonly includeAndroidChrome: boolean;
}

export type FaviconStage = "idle" | "running" | "done";

export interface FaviconSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly icoBuffer: Buffer | null;
  readonly pngFiles: readonly { filename: string; buffer: Buffer }[];
  readonly manifestJson: string;
  readonly downloadUrl: string;
}

export interface FaviconErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface FaviconOutcome {
  readonly stage: FaviconStage;
  readonly success: readonly FaviconSuccessItem[];
  readonly errors: readonly FaviconErrorItem[];
  readonly durationMs: number;
}

export const DEFAULT_MANIFEST_OPTIONS: ManifestOptions = {
  appName: "My App",
  shortName: "App",
  themeColor: "#ffffff",
  backgroundColor: "#ffffff",
};

export const DEFAULT_FAVICON_OPTIONS: FaviconGeneratorOptions = {
  sizes: [16, 32, 48],
  manifest: DEFAULT_MANIFEST_OPTIONS,
  includeAppleTouch: true,
  includeAndroidChrome: true,
};