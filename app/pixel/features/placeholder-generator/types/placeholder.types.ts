/*
path:            app/pixel/features/placeholder-generator/types/placeholder.types.ts
tag:             ["pixel", "feature", "placeholder-generator", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module placeholder-generator : format de
                 sortie (LQIP / BlurHash / SVG / Base64), options, stage,
                 outcome, defaults. Aucune dependance runtime.

flow:            Module TypeScript pur -> export des types.

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/processing"]
exports:         ["PlaceholderFormat",
                  "PlaceholderGeneratorOptions",
                  "PlaceholderStage",
                  "PlaceholderResult",
                  "PlaceholderErrorItem",
                  "PlaceholderOutcome",
                  "DEFAULT_PLACEHOLDER_OPTIONS"]
useBy:           ["@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour placeholder-generator"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Format de sortie
// ---------------------------------------------------------------------------

export type PlaceholderFormat = "lqip" | "blurhash" | "svg" | "base64";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface PlaceholderGeneratorOptions {
  /** Format de sortie souhaite. */
  readonly format: PlaceholderFormat;
  /** Largeur du LQIP en px (miniature, defaut 20). */
  readonly lqipWidth: number;
  /** Nombre de composantes BlurHash (1-9, defaut 4). */
  readonly blurhashComponents: number;
  /** Qualite JPEG du LQIP (1-100, defaut 70). */
  readonly quality: number;
}

// ---------------------------------------------------------------------------
// Resultat
// ---------------------------------------------------------------------------

export interface PlaceholderResult {
  /** Code a integrer dans la page (data URL, hash, SVG, base64). */
  readonly code: string;
  /** Largeur du placeholder (utile pour width/height HTML). */
  readonly width: number;
  /** Hauteur du placeholder. */
  readonly height: number;
  /** Description courte du format de sortie. */
  readonly description: string;
}

export interface PlaceholderErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export type PlaceholderStage = "idle" | "running" | "done";

export interface PlaceholderOutcome {
  readonly stage: PlaceholderStage;
  readonly success: readonly PlaceholderResult[];
  readonly errors: readonly PlaceholderErrorItem[];
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_PLACEHOLDER_OPTIONS: PlaceholderGeneratorOptions = {
  format: "lqip",
  lqipWidth: 20,
  blurhashComponents: 4,
  quality: 70,
};