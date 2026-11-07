/*
path:            app/pixel/lib/image-engine/format-registry.ts
tag:             ["pixel", "image-engine", "format", "registry"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Registre des formats exposables a l'UI : formats
                 d'ENTREE acceptes et formats de SORTIE proposes.

                 Les deux listes sont DERIVEES de sources de verite
                 uniques, jamais ecrites a la main :
                 - INPUT_FORMATS  derive de FORMAT_TO_MIME (toutes les
                   cles) ;
                 - OUTPUT_FORMATS derive de FORMAT_CAPABILITIES filtre
                   sur capability.output === true.

                 Consequence directe : ajouter un format a
                 FORMAT_TO_MIME ou basculer une capability.output dans
                 format-capabilities.ts fait apparaitre/disparaitre le
                 format dans l'UI SANS toucher ce fichier. Aucun risque
                 de divergence entre la liste des formats supportes et
                 l'UI qui les propose.

                 Ce fichier n'importe PAS sharp (la facade ne doit pas
                 dependre du natif) : il ne manipule que des chaines et
                 des booleens.

flow:            Module TypeScript pur -> constantes readonly et
                 helpers purs. Aucun etat, aucun effet.

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/format-mime.ts",
                   "@/app/pixel/lib/image-engine/format-capabilities.ts",
                   "@/app/pixel/lib/image-engine/format-registry.ts",
                   "@/app/pixel/lib/image-engine/sharp.options.ts",
                   "@/app/pixel/lib/image-engine/sharp.factory.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/lib/image-engine/image-engine.ts",
                   "@/app/pixel/lib/image-engine/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/lib/image-engine/format-mime.ts",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/lib/image-engine/format-mime",
                  "@/app/pixel/types/image"]
exports:         ["INPUT_FORMATS", "OUTPUT_FORMATS",
                  "isInputFormatSupported",
                  "isOutputFormatSupported"]
useBy:           ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux un registre unique des formats d'entree et de sortie"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat } from "@/app/pixel/types/image";
import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";
import { FORMAT_TO_MIME } from "@/app/pixel/lib/image-engine/format-mime";

// ---------------------------------------------------------------------------
// Listes derivees (source de verite unique)
// ---------------------------------------------------------------------------

/**
 * Tous les formats connus du moteur, dans l'ordre de FORMAT_TO_MIME.
 * Equivalent a "formats d'entree" : tout ce que l'utilisateur peut
 * deposer, y compris SVG (rasterise avant traitement).
 */
export const INPUT_FORMATS: readonly ImageFormat[] = Object.keys(
  FORMAT_TO_MIME,
) as readonly ImageFormat[];

/**
 * Formats de SORTIE uniquement : ceux dont FORMAT_CAPABILITIES[format]
 * .output === true. GIF et SVG sont donc exclus par construction.
 */
export const OUTPUT_FORMATS: readonly ImageFormat[] = (
  Object.keys(FORMAT_TO_MIME) as readonly ImageFormat[]
).filter((format) => FORMAT_CAPABILITIES[format].output);

// ---------------------------------------------------------------------------
// Helpers purs
// ---------------------------------------------------------------------------

export function isInputFormatSupported(format: ImageFormat): boolean {
  return INPUT_FORMATS.includes(format);
}

export function isOutputFormatSupported(format: ImageFormat): boolean {
  return OUTPUT_FORMATS.includes(format);
}