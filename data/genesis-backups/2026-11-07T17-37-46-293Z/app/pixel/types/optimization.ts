/*
path :           app/pixel/types/optimization.ts
tag :            ["pixel", "pixel-forge", "types", "optimization", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats d'optimisation (outil 02). Décrit les profils
                 prédéfinis, la stratégie (poids cible / qualité / niveau),
                 les options, et les statistiques comparatives. Aucune
                 dépendance runtime. Importable client ET serveur.

                 ⚠️ Le poids cible est une CIBLE, pas une garantie
                 absolue. Le moteur effectue un nombre BORNÉ d'itérations
                 (voir lib/image-engine/optimization/target-size.ts) et
                 retourne le meilleur rendu trouvé. Si la cible n'est pas
                 atteignable, `reachedTarget` est `false` et la qualité
                 minimale est utilisée.

                 ⚠️ SSIM n'est PAS inclus (décision technique 5). Les
                 métriques affichées sont : poids, dimensions, entropie
                 (sharp.stats().entropy), écart-type.

flow:            Module TypeScript pur → export des types.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/optimization.ts",
                   "@/app/pixel/types/processing.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                  "@/app/api/images/optimize/route.ts"]

imports:         ["@/app/pixel/types/image"]

exports:         ["OptimizationPreset",
                  "OptimizationStrategy",
                  "OptimizationOptions",
                  "OptimizationStats",
                  "OptimizationResult"]

useBy:           ["@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                  "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                  "@/app/api/images/optimize/route.ts"]

userStories:     ["*en tant que développeur je veux un contrat d'optimisation PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ImageDimensions } from "@/app/pixel/types/image";

/* ------------------------------------------------------------------ */
/*  Profils prédéfinis                                                 */
/* ------------------------------------------------------------------ */

/**
 * Profils d'optimisation prédéfinis exposés dans l'UI.
 * Chaque profil correspond à un preset de stratégie + paramètres.
 */
export type OptimizationPreset =
  | "web-max"       // Meilleure qualité perceptible, poids raisonnable
  | "web-balanced"  // Équilibre qualité/poids
  | "web-aggressive" // Poids minimal, qualité dégradée acceptable
  | "thumbnail"     // Petites dimensions, poids minimal
  | "custom";       // Configuration manuelle

/* ------------------------------------------------------------------ */
/*  Stratégies                                                         */
/* ------------------------------------------------------------------ */

/**
 * Stratégie d'optimisation.
 * - `target-size` : viser un poids cible (ex. 200 Ko).
 * - `quality`     : viser une qualité fixe (ex. 80).
 * - `level`       : niveau de compression (1-10).
 */
export type OptimizationStrategy =
  | {
      readonly kind: "target-size";
      /** Poids cible en octets. */
      readonly targetBytes: number;
      /** Qualité minimale acceptée (défaut 20). */
      readonly minQuality: number;
    }
  | {
      readonly kind: "quality";
      /** Qualité cible (1-100). */
      readonly quality: number;
    }
  | {
      readonly kind: "level";
      /** Niveau 1-10 (mapping interne vers quality/effort). */
      readonly level: number;
    };

/* ------------------------------------------------------------------ */
/*  Options                                                            */
/* ------------------------------------------------------------------ */

export interface OptimizationOptions {
  /** Profil prédéfini (custom = configuration manuelle). */
  readonly preset: OptimizationPreset;
  /** Stratégie effective. */
  readonly strategy: OptimizationStrategy;
  /** Redimensionnement facultatif (null = dimensions préservées). */
  readonly resize: {
    readonly maxWidth: number | null;
    readonly maxHeight: number | null;
    readonly fit: "cover" | "contain" | "inside";
  } | null;
  /** Supprimer les métadonnées EXIF/ICC (défaut true). */
  readonly stripMetadata: boolean;
}

/* ------------------------------------------------------------------ */
/*  Statistiques comparatives                                          */
/* ------------------------------------------------------------------ */

/**
 * Statistiques avant/après.
 *
 * ⚠️ `entropyBefore` et `entropyAfter` proviennent de
 * `sharp.stats().entropy` — indicateur de richesse visuelle (0-8).
 * PAS de SSIM. L'utilisateur juge visuellement via le slider.
 */
export interface OptimizationStats {
  readonly sizeBefore: number;
  readonly sizeAfter: number;
  readonly savedBytes: number;
  /** Économie en pourcentage (0-100). */
  readonly savedPercent: number;
  readonly dimensionsBefore: ImageDimensions;
  readonly dimensionsAfter: ImageDimensions;
  /** Entropie avant (0-8). */
  readonly entropyBefore: number;
  /** Entropie après (0-8). */
  readonly entropyAfter: number;
}

/* ------------------------------------------------------------------ */
/*  Résultat                                                           */
/* ------------------------------------------------------------------ */

import type { ResultImage } from "@/app/pixel/types/image";

export interface OptimizationResult {
  readonly image: ResultImage;
  readonly stats: OptimizationStats;
  /** La cible de poids a-t-elle été atteinte ? (pertinent pour target-size). */
  readonly reachedTarget: boolean;
  /** Nombre d'itérations effectuées (bornage visible pour l'UI). */
  readonly iterations: number;
}