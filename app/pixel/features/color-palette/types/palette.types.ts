/*
path:            app/pixel/features/color-palette/types/palette.types.ts
tag:             ["pixel", "feature", "color-palette", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module color-palette : palette
                 (couleur + ratio), options d'extraction, format
                 d'export (CSS / Tailwind / JSON), stage, outcome,
                 defaults. Aucune dependance runtime.

flow:            Module TypeScript pur -> export des types.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["@/app/pixel/types/processing"]
exports:         ["PaletteColor",
                  "PaletteResult",
                  "PaletteExportFormat",
                  "PaletteGeneratorOptions",
                  "PaletteStage",
                  "PaletteErrorItem",
                  "PaletteOutcome",
                  "DEFAULT_PALETTE_OPTIONS"]
useBy:           ["@/app/pixel/features/color-palette/hooks/use-color-palette.ts"]

userStories:     ["*en tant que developpeur je veux des types locaux pour color-palette"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

/**
 * Une couleur de la palette.
 * - `hex` : notation `#RRGGBB` (toujours 6 chiffres hexa).
 * - `rgb` : triplet 0-255 pour l'affichage et le CSS `rgb(...)`.
 * - `ratio` : proportion de pixels de cette couleur dans l'image (0-1).
 */
export interface PaletteColor {
  readonly hex: string;
  readonly rgb: { readonly r: number; readonly g: number; readonly b: number };
  readonly ratio: number;
}

/**
 * Resultat d'extraction pour une image.
 * - `sourceId` : ID de l'image source (aligne sur le hook).
 * - `sourceFilename` : nom original (utile pour l'export multi-fichier).
 * - `colors` : 1 a N couleurs triees par ratio decroissant.
 * - `totalPixels` : nombre de pixels analyses (indicatif).
 */
export interface PaletteResult {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly colors: readonly PaletteColor[];
  readonly totalPixels: number;
}

// ---------------------------------------------------------------------------
// Format d'export
// ---------------------------------------------------------------------------

export type PaletteExportFormat = "css" | "tailwind" | "json";

// ---------------------------------------------------------------------------
// Options d'extraction
// ---------------------------------------------------------------------------

export interface PaletteGeneratorOptions {
  /**
   * Nombre de couleurs dominantes a extraire (1-10).
   * Defaut : 5.
   */
  readonly colorCount: number;
  /**
   * Ignorer les pixels quasi-blancs / quasi-noirs (utile pour
   * eviter que le fond domine la palette). Defaut : false.
   */
  readonly skipExtremes: boolean;
  /**
   * Reduire l'image a cette taille avant clustering (perf).
   * Defaut : 100 px. Entre 50 et 400.
   */
  readonly sampleSize: number;
}

// ---------------------------------------------------------------------------
// Etat et resultat
// ---------------------------------------------------------------------------

export type PaletteStage = "idle" | "running" | "done";

export interface PaletteErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

export interface PaletteOutcome {
  readonly stage: PaletteStage;
  readonly success: readonly PaletteResult[];
  readonly errors: readonly PaletteErrorItem[];
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_PALETTE_OPTIONS: PaletteGeneratorOptions = {
  colorCount: 5,
  skipExtremes: false,
  sampleSize: 100,
};