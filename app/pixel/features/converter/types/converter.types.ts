/*
path:            app/pixel/features/converter/types/converter.types.ts
tag:             ["pixel", "feature", "converter", "types"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Types locaux du module converter. Etend les contrats
                 globaux (ConversionOptions, ConversionMode de
                 @/app/pixel/types/conversion) avec les types propres a
                 l'UI du converter : etat de la soumission, resultat
                 enrichi pour l'affichage, et resultat par fichier.
                 Aucune dependance runtime.

                 Phase 19 : ajout de `sourceSizeBytes` dans
                 ConversionSuccessItem pour unifier l'interface avec
                 les autres modules (optimizer, compressor, resize,
                 smart-crop, crop-editor, image-editor). Cela permet
                 a `recordHistory()` de fonctionner sans hack.

flow:            Module TypeScript pur -> export des types.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/lib/history/local-history.ts"]
imports:         ["@/app/pixel/types/conversion",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["ConverterStage",
                  "ConversionOutcome",
                  "ConversionErrorItem",
                  "ConversionSuccessItem"]
useBy:           ["@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/pixel/features/converter/components/conversion-results.tsx"]

userStories:     ["*en tant que developpeur je veux des types locaux pour l'UI converter",
                  "*en tant qu'utilisateur je veux retrouver mes conversions dans mon historique"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ConversionOptions } from "@/app/pixel/types/conversion";
import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Etat de la soumission
// ---------------------------------------------------------------------------

/**
 * Etat global du formulaire converter. Purement UI.
 * - `idle`    : rien en cours, en attente d'une action utilisateur.
 * - `running` : requete en cours, UI desactivee.
 * - `done`    : requete terminee, resultats disponibles.
 */
export type ConverterStage = "idle" | "running" | "done";

// ---------------------------------------------------------------------------
// Resultat par fichier
// ---------------------------------------------------------------------------

/**
 * Fichier converti avec succes. Contient les informations necessaires
 * au telechargement individuel (URL blob creee a partir du Buffer
 * renvoye par l'API pour 1 fichier, ou l'URL temporaire pour 2+).
 *
 * `sourceSizeBytes` est le poids du fichier source (avant conversion).
 * Il est disponible cote client via `item.source.file.size` dans le
 * store Zustand — on le propage ici pour alimenter ComparisonStats et
 * l'historique local.
 */
export interface ConversionSuccessItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly result: ResultImage;
  /** URL blob (createObjectURL) ou URL @vercel/blob, pour telechargement. */
  readonly downloadUrl: string;
}

/**
 * Fichier en erreur. Le code est aligne sur ProcessingErrorCode pour
 * permettre a ErrorMessage de l'afficher.
 */
export interface ConversionErrorItem {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly error: ProcessingError;
}

/**
 * Resultat global d'une soumission.
 * - `stage` : etat courant (running, done).
 * - `success` : fichiers convertis.
 * - `errors` : fichiers en erreur (le lot continue).
 * - `durationMs` : duree totale mesuree cote client.
 * - `format` : format cible utilise (pour afficher le bon libelle).
 */
export interface ConversionOutcome {
  readonly stage: ConverterStage;
  readonly success: readonly ConversionSuccessItem[];
  readonly errors: readonly ConversionErrorItem[];
  readonly durationMs: number;
  readonly format: ImageFormat | null;
}

/**
 * Options par defaut du formulaire. Exportees ici pour que le hook
 * et les composants puissent s'y referer sans dupliquer les valeurs.
 */
export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  format: "webp",
  quality: 80,
  mode: "lossy",
  keepExif: false,
  keepIcc: true,
  resize: null,
};