/*
path :           app/pixel/types/export.ts
tag :            ["pixel", "pixel-forge", "types", "export", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats d'export (individuel + ZIP). Décrit une entrée
                 exportable, les options d'export (nommage, suffixes,
                 organisation) et le résultat d'un ZIP. Aucune dépendance
                 runtime. Importable client ET serveur.

                 ⚠️ Convention de nommage :
                 {basename}-{suffix}.{ext}
                 Exemples :
                 - photo-original.jpg → photo-webp.webp
                 - photo-original.jpg → photo-compressed.jpg
                 - photo-original.jpg → photo-640w.webp
                 - logo.png → logo-favicon-16.ico

                 Anti-collision : si deux fichiers produisent le même nom,
                 ajouter -2, -3, etc. avant l'extension.

flow:            Module TypeScript pur → export des types.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                   "@/app/pixel/types/export.ts",
                 ]

relatedFiles:    ["@/app/pixel/lib/archive/archive.types.ts",
                  "@/app/pixel/lib/archive/archive-builder.ts",
                  "@/app/api/images/export/route.ts"]

imports:         ["@/app/pixel/types/image"]

exports:         ["ExportEntry",
                  "ExportOptions",
                  "ExportResult",
                  "ExportNaming"]

useBy:           ["@/app/pixel/lib/archive/archive.types.ts",
                  "@/app/pixel/lib/archive/archive-builder.ts",
                  "@/app/pixel/components/export-manager/*.tsx",
                  "@/app/api/images/export/route.ts"]

userStories:     ["*en tant que développeur je veux un contrat d'export PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ResultImage } from "@/app/pixel/types/image";

/* ------------------------------------------------------------------ */
/*  Convention de nommage                                              */
/* ------------------------------------------------------------------ */

/**
 * Génère un nom de fichier à partir du basename + suffixe + extension.
 * Applique la règle `{basename}-{suffix}.{ext}`.
 *
 * Pure function, testable. Ne gère pas l'anti-collision (voir plus bas).
 */
export type ExportNaming = (
  basename: string,
  suffix: string,
  extension: string,
) => string;

/* ------------------------------------------------------------------ */
/*  Entrée exportable                                                  */
/* ------------------------------------------------------------------ */

/**
 * Entrée exportable individuelle.
 * Construite à partir d'un ResultImage + le nom de fichier d'origine.
 */
export interface ExportEntry {
  /** Résultat image à exporter. */
  readonly result: ResultImage;
  /** Nom de fichier d'origine (pour dériver le basename). */
  readonly originalFilename: string;
  /** Nom de fichier final suggéré (avec suffixe). */
  readonly finalFilename: string;
}

/* ------------------------------------------------------------------ */
/*  Options d'export                                                   */
/* ------------------------------------------------------------------ */

/**
 * Options d'export. Détermine le comportement de l'ExportManager.
 */
export interface ExportOptions {
  /**
   * Organisation des fichiers dans le ZIP.
   * - `flat`      : tous à la racine.
   * - `by-format` : un sous-dossier par format (webp/, png/, …).
   * - `by-size`   : un sous-dossier par suffixe (-640w/, -1280w/…).
   */
  readonly organization: "flat" | "by-format" | "by-size";
  /**
   * Générer un fichier `manifest.txt` listant les entrées du ZIP ?
   */
  readonly includeManifest: boolean;
}

/* ------------------------------------------------------------------ */
/*  Résultat d'export                                                  */
/* ------------------------------------------------------------------ */

/**
 * Résultat d'une opération d'export.
 * - `kind: "single"` : un fichier téléchargé individuellement.
 * - `kind: "zip"`    : archive ZIP générée et stockée temporairement.
 */
export type ExportResult =
  | {
      readonly kind: "single";
      readonly filename: string;
      readonly sizeBytes: number;
    }
  | {
      readonly kind: "zip";
      readonly filename: string;
      readonly sizeBytes: number;
      /** URL temporaire @vercel/blob pour télécharger le ZIP. */
      readonly url: string;
      /** Date d'expiration (ISO 8601). */
      readonly expiresAt: string;
    };