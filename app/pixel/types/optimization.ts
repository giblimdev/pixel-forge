/*
path:            app/pixel/types/optimization.ts
tag:             ["pixel", "pixel-forge", "types", "optimization", "contract", "zod"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats d'optimisation (outil 02). Decrit les profils
                 preregles (web-max, web-balanced, web-aggressive,
                 thumbnail, custom), la strategie (poids cible / qualite
                 fixe / niveau), les options completes, les statistiques
                 comparatives et le resultat. Exporte aussi le schema
                 Zod optimizationOptionsSchema (validation runtime,
                 Phase 2 / Phase 9) utilise par la route
                 /api/images/optimize.

                 Le poids cible est une CIBLE, pas une garantie absolue :
                 le moteur effectue un nombre BORNE d'iterations et
                 retourne le meilleur rendu trouve. Si la cible n'est
                 pas atteignable, la qualite minimale est utilisee.

                 SSIM n'est PAS inclus (Decision 5). Les metriques
                 affichees sont : poids, dimensions, entropie
                 (sharp.stats().entropy), ecart-type.

flow:            Module TypeScript pur -> export des types + du schema
                 Zod derive.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/optimization.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/api/images/optimize/route.ts"]
imports:         ["zod", "@/app/pixel/types/image"]
exports:         ["OptimizationPreset",
                  "OptimizationStrategy",
                  "OptimizationOptions",
                  "OptimizationStats",
                  "OptimizationResult",
                  "optimizationOptionsSchema"]
useBy:           ["@/app/api/images/optimize/route.ts"]

userStories:     ["*en tant que developpeur je veux un contrat d'optimisation PixelForge"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

import type { ImageDimensions, ResultImage } from "@/app/pixel/types/image";

// ---------------------------------------------------------------------------
// Profils preregles
// ---------------------------------------------------------------------------

export type OptimizationPreset =
  | "web-max"
  | "web-balanced"
  | "web-aggressive"
  | "thumbnail"
  | "custom";

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

export type OptimizationStrategy =
  | {
      readonly kind: "target-size";
      readonly targetBytes: number;
      readonly minQuality: number;
    }
  | {
      readonly kind: "quality";
      readonly quality: number;
    }
  | {
      readonly kind: "level";
      readonly level: number;
    };

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface OptimizationOptions {
  readonly preset: OptimizationPreset;
  readonly strategy: OptimizationStrategy;
  readonly resize: {
    readonly maxWidth: number | null;
    readonly maxHeight: number | null;
    readonly fit: "cover" | "contain" | "inside";
  } | null;
  readonly stripMetadata: boolean;
}

// ---------------------------------------------------------------------------
// Statistiques comparatives
// ---------------------------------------------------------------------------

export interface OptimizationStats {
  readonly sizeBefore: number;
  readonly sizeAfter: number;
  readonly savedBytes: number;
  readonly savedPercent: number;
  readonly dimensionsBefore: ImageDimensions;
  readonly dimensionsAfter: ImageDimensions;
  readonly entropyBefore: number;
  readonly entropyAfter: number;
}

// ---------------------------------------------------------------------------
// Resultat
// ---------------------------------------------------------------------------

export interface OptimizationResult {
  readonly image: ResultImage;
  readonly stats: OptimizationStats;
  readonly reachedTarget: boolean;
  readonly iterations: number;
}

// ---------------------------------------------------------------------------
// Schema Zod (validation runtime, Phase 2 / Phase 9)
// ---------------------------------------------------------------------------

export const optimizationOptionsSchema = z
  .object({
    preset: z.enum([
      "web-max",
      "web-balanced",
      "web-aggressive",
      "thumbnail",
      "custom",
    ]),
    strategy: z.discriminatedUnion("kind", [
      z.object({
        kind: z.literal("target-size"),
        targetBytes: z.number().int().positive().max(25 * 1024 * 1024),
        minQuality: z.number().int().min(0).max(100),
      }),
      z.object({
        kind: z.literal("quality"),
        quality: z.number().int().min(0).max(100),
      }),
      z.object({
        kind: z.literal("level"),
        level: z.number().int().min(1).max(10),
      }),
    ]),
    resize: z
      .object({
        maxWidth: z.number().int().positive().max(8000).nullable(),
        maxHeight: z.number().int().positive().max(8000).nullable(),
        fit: z.enum(["cover", "contain", "inside"]),
      })
      .nullable(),
    stripMetadata: z.boolean(),
  })
  .strict();