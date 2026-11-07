/*
path:            app/pixel/types/conversion.ts
tag:             ["pixel", "pixel-forge", "types", "conversion", "contract", "zod"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats de conversion de format (outil 01). Decrit les
                 options de conversion (format cible, qualite, mode de
                 compression, gestion EXIF/ICC, redimensionnement
                 facultatif), la requete client, et le resultat. Exporte
                 aussi le schema Zod conversionOptionsSchema (validation
                 runtime, Phase 2 / Phase 6) qui verifie que le format
                 cible est bien dans OUTPUT_FORMATS et que les options
                 sont coherentes.

                 Les capacites reelles par format (mode lossy/lossless
                 supporte, gestion ICC, etc.) sont exposees par
                 lib/image-engine/format-capabilities.ts — pas
                 dupliquees ici. Ce fichier decrit uniquement le CONTRAT
                 de la requete/reponse et sa validation.

                 ATTENTION cycles : ce fichier importe type uniquement
                 ConversionMode depuis le type ConversionMode ci-dessous,
                 et importe en runtime OUTPUT_FORMATS depuis
                 format-registry.ts. format-capabilities.ts importe
                 ConversionMode en `import type` (efface a la
                 compilation), donc AUCUN cycle runtime n'est cree.
                 TypeScript accepte les cycles de types.

flow:            Module TypeScript pur -> export des types
                 (ConversionMode, ConversionOptions, ConversionRequest,
                 ConversionResult) + du schema Zod conversionOptionsSchema
                 derive des constantes du moteur (OUTPUT_FORMATS).

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/conversion.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/lib/image-engine/format-registry.ts",
                  "@/app/api/images/convert/route.ts"]
imports:         ["zod",
                  "@/app/pixel/types/image",
                  "@/app/pixel/lib/image-engine/format-registry"]
exports:         ["ConversionMode",
                  "ConversionOptions",
                  "ConversionRequest",
                  "ConversionResult",
                  "conversionOptionsSchema"]
useBy:           ["@/app/api/images/convert/route.ts"]

userStories:     ["*en tant que developpeur je veux un contrat de conversion PixelForge"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import { OUTPUT_FORMATS } from "@/app/pixel/lib/image-engine/format-registry";

// ---------------------------------------------------------------------------
// Modes de compression
// ---------------------------------------------------------------------------

/**
 * Modes supportes selon le format de sortie.
 * - `lossy`         : perte (JPEG, WebP, AVIF).
 * - `lossless`      : sans perte (WebP, PNG, AVIF).
 * - `near-lossless` : quasi sans perte (WebP uniquement).
 *
 * Ce champ n'est HONORE QUE si le format cible le supporte reellement
 * (voir format-capabilities.ts). Envoyer `lossless` avec format `jpeg`
 * est rejete cote serveur avec un code d'erreur explicite.
 */
export type ConversionMode = "lossy" | "lossless" | "near-lossless";

// ---------------------------------------------------------------------------
// Options de conversion
// ---------------------------------------------------------------------------

export interface ConversionOptions {
  /** Format cible. */
  readonly format: ImageFormat;
  /**
   * Qualite 1-100 (0 = auto Sharp).
   * Pertinent uniquement pour les formats avec perte.
   */
  readonly quality: number;
  /** Mode de compression (null = defaut du format). */
  readonly mode: ConversionMode | null;
  /** Conserver les metadonnees EXIF ? */
  readonly keepExif: boolean;
  /** Conserver le profil ICC ? */
  readonly keepIcc: boolean;
  /**
   * Redimensionnement facultatif (null = dimensions preservees).
   * Si fourni, applique sharp.resize() avec fit selon mode.
   */
  readonly resize: {
    readonly width: number;
    readonly height: number;
    readonly fit: "cover" | "contain" | "inside";
  } | null;
}

// ---------------------------------------------------------------------------
// Requete (client -> serveur)
// ---------------------------------------------------------------------------

/**
 * Requete de conversion envoyee par le client.
 * Transportee en multipart/form-data :
 * - `files[]` : les fichiers binaires.
 * - `options` : JSON.stringify(ConversionRequest).
 */
export interface ConversionRequest {
  /** Options de conversion communes a tous les fichiers du lot. */
  readonly options: ConversionOptions;
}

// ---------------------------------------------------------------------------
// Resultat (serveur -> client)
// ---------------------------------------------------------------------------

/**
 * Resultat de conversion.
 * - `results` : un resultat par fichier traite avec succes.
 * - `errors`  : erreurs par fichier (le lot continue meme si 1 echoue).
 * - `durationMs` : duree totale du traitement (metrique UI).
 */
export interface ConversionResult {
  readonly results: readonly ResultImage[];
  readonly errors: readonly {
    readonly filename: string;
    readonly message: string;
  }[];
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// Schema Zod (validation runtime, Phase 2 / Phase 6)
// ---------------------------------------------------------------------------

/**
 * Schema de validation des options de conversion.
 *
 * - `format` est restreint a OUTPUT_FORMATS (source unique de verite
 *   derivee de FORMAT_CAPABILITIES) : impossible de demander une
 *   conversion vers un format que le moteur ne sait pas produire.
 * - `quality` est borne 0-100.
 * - `mode` accepte null (defaut du format) ou l'une des 3 valeurs.
 * - `resize` accepte null ou un triplet { width, height, fit } borne.
 * - `.strict()` : les cles inconnues sont rejetees (protection contre
 *   les payloads client malveillants ou mal formates).
 */
export const conversionOptionsSchema = z
  .object({
    format: z.enum(
      OUTPUT_FORMATS as unknown as readonly [ImageFormat, ...ImageFormat[]],
    ),
    quality: z.number().int().min(0).max(100),
    mode: z.enum(["lossy", "lossless", "near-lossless"]).nullable(),
    keepExif: z.boolean(),
    keepIcc: z.boolean(),
    resize: z
      .object({
        width: z.number().int().positive().max(8000),
        height: z.number().int().positive().max(8000),
        fit: z.enum(["cover", "contain", "inside"]),
      })
      .nullable(),
  })
  .strict();