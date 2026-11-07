/*
path :           app/pixel/lib/archive/archive.types.ts
tag :            ["pixel", "pixel-forge", "archive", "types", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats de l'archive ZIP (Export Manager). Décrit une
                 entrée d'archive (nom + buffer), les options d'assemblage
                 et le résultat. Aucune dépendance runtime (le builder
                 utilise `archiver` côté serveur uniquement). Importable
                 client ET serveur pour les types.

                 ⚠️ Vercel serverless : l'archive est construite en mémoire
                 puis uploadée sur @vercel/blob. Le streaming direct vers
                 la réponse HTTP n'est PAS utilisé (incompatible avec les
                 limites Vercel). Si la taille dépasse MAX_ZIP_SIZE
                 (500 Mo), l'assemblage échoue avec STORAGE_ERROR.

flow:            Module TypeScript pur → export des types.

ecosystem:       Archive = [
                   "@/app/pixel/lib/archive/archive.types.ts",
                   "@/app/pixel/lib/archive/archive-entry.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/export.ts",
                  "@/app/pixel/types/processing.ts"]

imports:         ["@/app/pixel/types/processing"]

exports:         ["ArchiveEntryInput",
                  "ArchiveOptions",
                  "ArchiveResult",
                  "ArchiveFolderStrategy"]

useBy:           ["@/app/pixel/lib/archive/archive-entry.ts",
                  "@/app/pixel/lib/archive/archive-builder.ts",
                  "@/app/api/images/export/route.ts"]

userStories:     ["*en tant que développeur je veux un contrat d'archive ZIP PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/* ------------------------------------------------------------------ */
/*  Entrée d'archive                                                   */
/* ------------------------------------------------------------------ */

/**
 * Entrée d'archive : nom final (avec sous-dossier éventuel) + buffer.
 * Le nom est calculé en amont par `archive-entry.ts` (basename +
 * suffixe + extension, anti-collision).
 */
export interface ArchiveEntryInput {
  /** Nom final dans l'archive, chemin relatif inclus (ex. "webp/photo.webp"). */
  readonly filename: string;
  /** Contenu binaire. */
  readonly buffer: Buffer;
}

/* ------------------------------------------------------------------ */
/*  Options d'assemblage                                               */
/* ------------------------------------------------------------------ */

/**
 * Organisation des fichiers dans l'archive.
 * Aligné sur `ExportOptions.organization` du client (mais dupliqué ici
 * pour éviter une dépendance types → types export).
 */
export type ArchiveFolderStrategy = "flat" | "by-format" | "by-size";

export interface ArchiveOptions {
  /** Organisation des fichiers dans le ZIP. */
  readonly organization: ArchiveFolderStrategy;
  /** Inclure un manifest.txt listant les entrées ? */
  readonly includeManifest: boolean;
  /** Niveau de compression deflate (1-9, défaut 6). */
  readonly compressionLevel: number;
}

/* ------------------------------------------------------------------ */
/*  Résultat                                                           */
/* ------------------------------------------------------------------ */

/**
 * Résultat d'assemblage ZIP.
 * - `ok: true`  : archive construite, `buffer` contient le ZIP.
 * - `ok: false` : erreur structurée (taille dépassée, IO, etc.).
 */
export type ArchiveResult =
  | {
      readonly ok: true;
      readonly buffer: Buffer;
      readonly sizeBytes: number;
      readonly entryCount: number;
    }
  | {
      readonly ok: false;
      readonly error: import("@/app/pixel/types/processing").ProcessingError;
    };