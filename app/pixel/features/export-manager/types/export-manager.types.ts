/*
path:            app/pixel/features/export-manager/types/export-manager.types.ts
tag:             ["pixel", "feature", "export-manager", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module export-manager : options,
                 stage, outcome, defaults.

flow:            Module TypeScript pur -> export des types.

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
relatedFiles:    ["@/app/pixel/types/export.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/export",
                  "@/app/pixel/types/processing"]
exports:         ["ExportStage",
                  "ExportSuccessPayload",
                  "ExportErrorItem",
                  "ExportOutcome",
                  "DEFAULT_EXPORT_OPTIONS"]
useBy:           ["@/app/pixel/features/export-manager/hooks/use-export-manager.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour l'export manager"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ExportOptions } from "@/app/pixel/types/export";
import type { ProcessingError } from "@/app/pixel/types/processing";

export type ExportStage = "idle" | "running" | "done";

export interface ExportSuccessPayload {
  readonly url: string;
  readonly filename: string;
  readonly sizeBytes: number;
  readonly entryCount: number;
  readonly expiresAt: string;
  readonly durationMs: number;
}

export interface ExportErrorItem {
  readonly code: string;
  readonly message: string;
}

export interface ExportOutcome {
  readonly stage: ExportStage;
  readonly success: ExportSuccessPayload | null;
  readonly error: ProcessingError | null;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  organization: "flat",
  includeManifest: false,
};