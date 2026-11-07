/*
path :           app/pixel/types/conversion.ts
tag :            ["pixel", "pixel-forge", "types", "conversion", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats de conversion de format (outil 01). Décrit les
                 options de conversion (format source/cible, qualité, mode
                 de compression, gestion EXIF/ICC, redimensionnement
                 facultatif), la requête client, et le résultat. Aucune
                 dépendance runtime. Importable client ET serveur.

                 ⚠️ Les capacités réelles par format (mode lossy/lossless
                 supporté, gestion ICC, etc.) sont exposées par
                 lib/image-engine/formats/format-capabilities.ts — pas
                 dupliquées ici. Ce fichier décrit uniquement le CONTRAT
                 de la requête/réponse.

flow:            Module TypeScript pur → export des types.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/conversion.ts",
                   "@/app/pixel/types/processing.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/converter/schemas/converter.schema.ts",
                  "@/app/api/images/convert/route.ts"]

imports:         ["@/app/pixel/types/image"]

exports:         ["ConversionMode",
                  "ConversionOptions",
                  "ConversionRequest",
                  "ConversionResult"]

useBy:           ["@/app/pixel/features/converter/schemas/converter.schema.ts",
                  "@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/api/images/convert/route.ts"]

userStories:     ["*en tant que développeur je veux un contrat de conversion PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ImageFormat } from "@/app/pixel/types/image";

/* ------------------------------------------------------------------ */
/*  Modes de compression                                               */
/* ------------------------------------------------------------------ */

/**
 * Modes supportés selon le format de sortie.
 * - `lossy`         : perte (JPEG, WebP, AVIF).
 * - `lossless`      : sans perte (WebP, PNG, AVIF).
 * - `near-lossless` : quasi sans perte (WebP uniquement).
 *
 * ⚠️ Ce champ n'est HONORÉ QUE si le format cible le supporte réellement
 * (voir format-capabilities.ts). Envoyer `lossless` avec format `jpeg`
 * est rejeté côté serveur avec un code d'erreur explicite.
 */
export type ConversionMode = "lossy" | "lossless" | "near-lossless";

/* ------------------------------------------------------------------ */
/*  Options de conversion                                              */
/* ------------------------------------------------------------------ */

export interface ConversionOptions {
  /** Format cible. */
  readonly format: ImageFormat;
  /**
   * Qualité 1-100 (0 = auto Sharp).
   * Pertinent uniquement pour les formats avec perte.
   */
  readonly quality: number;
  /** Mode de compression (null = défaut du format). */
  readonly mode: ConversionMode | null;
  /** Conserver les métadonnées EXIF ? */
  readonly keepExif: boolean;
  /** Conserver le profil ICC ? */
  readonly keepIcc: boolean;
  /**
   * Redimensionnement facultatif (null = dimensions préservées).
   * Si fourni, applique sharp.resize() avec fit selon mode.
   */
  readonly resize: {
    readonly width: number;
    readonly height: number;
    readonly fit: "cover" | "contain" | "inside";
  } | null;
}

/* ------------------------------------------------------------------ */
/*  Requête (client → serveur)                                         */
/* ------------------------------------------------------------------ */

/**
 * Requête de conversion envoyée par le client.
 * Transportée en multipart/form-data :
 * - `files[]` : les fichiers binaires.
 * - `options` : JSON.stringify(ConversionRequest).
 */
export interface ConversionRequest {
  /** Options de conversion communes à tous les fichiers du lot. */
  readonly options: ConversionOptions;
}

/* ------------------------------------------------------------------ */
/*  Résultat (serveur → client)                                        */
/* ------------------------------------------------------------------ */

import type { ResultImage } from "@/app/pixel/types/image";

/**
 * Résultat de conversion.
 * - `results` : un résultat par fichier traité.
 * - `errors`  : erreurs par fichier (le lot continue même si 1 échoue).
 * - `durationMs` : durée totale du traitement (métrique UI).
 */
export interface ConversionResult {
  readonly results: readonly ResultImage[];
  readonly errors: readonly {
    readonly filename: string;
    readonly message: string;
  }[];
  readonly durationMs: number;
}