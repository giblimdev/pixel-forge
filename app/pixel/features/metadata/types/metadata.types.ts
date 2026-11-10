/*
path:            app/pixel/features/metadata/types/metadata.types.ts
tag:             ["pixel", "feature", "metadata", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module metadata : resultat d'analyse
                 (une image), resultat de suppression, stage, outcome,
                 defaults. Aucune dependance runtime.

flow:            Module TypeScript pur -> export des types.

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
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["MetadataAnalysis",
                  "MetadataOutcome",
                  "MetadataStage",
                  "MetadataErrorItem",
                  "DEFAULT_METADATA_OPTIONS",
                  "MetadataOptions"]
useBy:           ["@/app/pixel/features/metadata/hooks/use-image-metadata.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour metadata"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ImageFormat } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Analyse
// ---------------------------------------------------------------------------

export interface MetadataAnalysis {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly format: ImageFormat;
  readonly dimensions: { readonly width: number; readonly height: number };
  readonly sizeBytes: number;
  readonly hasAlpha: boolean;
  readonly entropy: number;
  readonly stdev: readonly [number, number, number];
  readonly hasIcc: boolean;
  readonly exif: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Etat et resultat
// ---------------------------------------------------------------------------

export type MetadataStage = "idle" | "running" | "done";

export interface MetadataErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface MetadataOutcome {
  readonly stage: MetadataStage;
  readonly analyses: readonly MetadataAnalysis[];
  readonly errors: readonly MetadataErrorItem[];
  readonly durationMs: number;
  readonly action: "analyze" | "strip";
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface MetadataOptions {
  /** Action a executer sur la file pending. */
  readonly action: "analyze" | "strip";
}

export const DEFAULT_METADATA_OPTIONS: MetadataOptions = {
  action: "analyze",
};