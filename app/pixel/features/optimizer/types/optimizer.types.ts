/*
path:            app/pixel/features/optimizer/types/optimizer.types.ts
tag:             ["pixel", "feature", "optimizer", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module optimizer. Etat de soumission,
                 outcome, defaults.

flow:            Module TypeScript pur -> export des types.

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/optimization.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/optimization",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["OptimizerStage",
                  "OptimizationSuccessItem",
                  "OptimizationErrorItem",
                  "OptimizationOutcome",
                  "DEFAULT_OPTIMIZATION_OPTIONS"]
useBy:           ["@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                  "@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]

userStories:     ["*en tant que developpeur je veux des types locaux pour l'optimizer"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type {
  OptimizationOptions,
  OptimizationPreset,
} from "@/app/pixel/types/optimization";
import type { ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

export type OptimizerStage = "idle" | "running" | "done";

export interface OptimizationSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  readonly downloadUrl: string;
}

export interface OptimizationErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface OptimizationOutcome {
  readonly stage: OptimizerStage;
  readonly success: readonly OptimizationSuccessItem[];
  readonly errors: readonly OptimizationErrorItem[];
  readonly durationMs: number;
  readonly preset: OptimizationPreset;
}

export const DEFAULT_OPTIMIZATION_OPTIONS: OptimizationOptions = {
  preset: "web-balanced",
  strategy: { kind: "quality", quality: 80 },
  resize: null,
  stripMetadata: true,
};