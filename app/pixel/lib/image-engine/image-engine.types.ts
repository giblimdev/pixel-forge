/*
path :           app/pixel/lib/image-engine/image-engine.types.ts
tag :            ["pixel", "pixel-forge", "image-engine", "types",
                  "contract", "independent-from-sharp"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats internes du moteur Image Engine. Décrit les
                 entrées (Buffer source, options) et sorties (Buffer
                 résultat, métadonnées) des opérations du moteur.
                 ⚠️ CRITIQUE : ces types NE DÉPENDENT JAMAIS de Sharp.
                 Le moteur expose une façade abstraite ; l'adaptateur
                 Sharp (lib/image-engine/sharp/) est la SEULE couche qui
                 connaît Sharp. Cela permet :
                 - de remplacer Sharp par une autre lib sans toucher les
                   consommateurs (routes, hooks) ;
                 - de tester le moteur avec des buffers fixtures ;
                 - d'éviter toute fuite de `sharp.Sharp` dans les types
                   métier.

flow:            Module TypeScript pur → export des types.

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/image-engine.types.ts",
                   "@/app/pixel/lib/image-engine/image-engine.ts",
                   "@/app/pixel/lib/image-engine/sharp/sharp.adapter.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/image.ts"]

imports:         ["@/app/pixel/types/image"]

exports:         ["EngineInput",
                  "EngineOutput",
                  "EngineMetadata",
                  "EngineOptions"]

useBy:           ["@/app/pixel/lib/image-engine/image-engine.ts",
                  "@/app/pixel/lib/image-engine/sharp/sharp.adapter.ts",
                  "@/app/pixel/lib/image-engine/formats/*.ts",
                  "@/app/pixel/lib/image-engine/transformations/*.ts",
                  "@/app/pixel/lib/image-engine/optimization/*.ts",
                  "@/app/pixel/lib/image-engine/metadata/*.ts"]

userStories:     ["*en tant que développeur je veux des contrats moteur indépendants de Sharp"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ImageDimensions, ImageFormat } from "@/app/pixel/types/image";

/* ------------------------------------------------------------------ */
/*  Entrée du moteur                                                   */
/* ------------------------------------------------------------------ */

/**
 * Entrée du moteur : un Buffer + le format détecté.
 * Le moteur ne reçoit JAMAIS un File/Blob (couche API = Buffer).
 */
export interface EngineInput {
  /** Contenu binaire du fichier (résultat de `buffer = await file.arrayBuffer()`). */
  readonly buffer: Buffer | ArrayBuffer;
  /** Format détecté (via format-detection.ts). */
  readonly format: ImageFormat;
}

/* ------------------------------------------------------------------ */
/*  Métadonnées extraites                                              */
/* ------------------------------------------------------------------ */

/**
 * Métadonnées extraites d'une image par le moteur.
 * Ces champs sont les mêmes que ceux de `SourceImage` mais peuplés
 * côté serveur après lecture Sharp.
 */
export interface EngineMetadata {
  readonly format: ImageFormat;
  readonly dimensions: ImageDimensions;
  readonly sizeBytes: number;
  readonly hasAlpha: boolean;
  /** Entropie 0-8 (sharp.stats().entropy). */
  readonly entropy: number;
  /** Écart-type par canal (sharp.stats().stdev). */
  readonly stdev: readonly [number, number, number];
  /** Métadonnées EXIF si présentes (clé → valeur sérialisable). */
  readonly exif: Readonly<Record<string, unknown>> | null;
  /** Profil ICC présent ? */
  readonly hasIcc: boolean;
}

/* ------------------------------------------------------------------ */
/*  Options génériques du moteur                                       */
/* ------------------------------------------------------------------ */

/**
 * Options communes à toutes les opérations du moteur.
 * Chaque opération spécifique (conversion, resize, …) reçoit ses
 * propres options typées, qui étendent ou complètent celles-ci.
 */
export interface EngineOptions {
  /**
   * Qualité 1-100 (0 = défaut du format). Ignoré si le format n'a
   * pas de notion de qualité.
   */
  readonly quality: number;
  /** Conserver les métadonnées EXIF ? */
  readonly keepExif: boolean;
  /** Conserver le profil ICC ? */
  readonly keepIcc: boolean;
}

/* ------------------------------------------------------------------ */
/*  Sortie du moteur                                                   */
/* ------------------------------------------------------------------ */

/**
 * Sortie du moteur : un Buffer + les métadonnées du résultat.
 * Le moteur ne renvoie JAMAIS d'URL (couche API = Buffer → transport).
 */
export interface EngineOutput {
  /** Buffer résultat. */
  readonly buffer: Buffer;
  /** Métadonnées extraites du résultat. */
  readonly metadata: EngineMetadata;
  /** Format effectif du résultat. */
  readonly format: ImageFormat;
}