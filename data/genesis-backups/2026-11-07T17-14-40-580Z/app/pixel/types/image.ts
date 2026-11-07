/*
path :           app/pixel/types/image.ts
tag :            ["pixel", "pixel-forge", "types", "image", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Modèle commun d'une image dans PixelForge. Décrit une
                 image SOURCE (entrante) ou une image RÉSULTAT (sortante)
                 avec toutes les propriétés techniques dont l'UI et les
                 routes API ont besoin. Aucune dépendance runtime, aucun
                 effet. Importable client ET serveur.

                 SourceImage  : image uploadée par l'utilisateur, avant
                                traitement. Contient le File/Blob natif
                                + les métadonnées extraites (MIME, taille,
                                dimensions).
                 ResultImage  : image produite par le moteur. Contient
                                soit un Buffer (Vercel : blob response),
                                soit une URL (Vercel : stockage temporaire
                                @vercel/blob).
                 ImageDimensions : { width, height } réutilisable.
                 ImageFormat     : union des formats supportés.

flow:            Module TypeScript pur → export des types.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/conversion.ts",
                   "@/app/pixel/types/optimization.ts",
                   "@/app/pixel/types/processing.ts",
                   "@/app/pixel/types/queue.ts",
                   "@/app/pixel/types/export.ts",
                 ]

relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts",
                  "@/app/pixel/types/processing.ts"]

imports:         []

exports:         ["ImageFormat",
                  "ImageDimensions",
                  "SourceImage",
                  "ResultImage",
                  "ImageMimeType"]

useBy:           ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/optimization.ts",
                  "@/app/pixel/types/queue.ts",
                  "@/app/pixel/types/export.ts"]

userStories:     ["*en tant que développeur je veux un modèle commun d'image PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/* ------------------------------------------------------------------ */
/*  Formats                                                            */
/* ------------------------------------------------------------------ */

/**
 * Formats pris en charge par PixelForge.
 * - Entrée : jpeg, png, webp, avif, tiff, gif, svg (rasterisé).
 * - Sortie : jpeg, png, webp, avif, tiff (selon capacités Sharp réelles).
 *
 * ⚠️ `gif` en sortie est exclu : Sharp ne préserve pas l'animation par
 * défaut. Si un jour le support est ajouté, retirer cette exclusion.
 * ⚠️ `svg` en sortie est exclu : c'est un format d'entrée rasterisé
 * uniquement, pas de sortie équivalente à WebP/PNG.
 */
export type ImageFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "gif"
  | "svg";

/**
 * MIME types associés aux formats. Utilisé par les validateurs côté
 * client (input accept) ET côté serveur (vérification magic bytes).
 */
export type ImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/tiff"
  | "image/gif"
  | "image/svg+xml";

/* ------------------------------------------------------------------ */
/*  Dimensions                                                         */
/* ------------------------------------------------------------------ */

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

/* ------------------------------------------------------------------ */
/*  Source (entrante)                                                  */
/* ------------------------------------------------------------------ */

/**
 * Image uploadée par l'utilisateur, avant tout traitement.
 *
 * Le `file` est le `File` natif du navigateur (ou `Blob` côté serveur
 * après un `request.formData()`). Les champs `format`, `dimensions`,
 * `sizeBytes` peuvent être `null` tant que la détection n'a pas eu lieu
 * (côté client : avant lecture avec `FileReader` / `createImageBitmap` ;
 * côté serveur : avant `sharp().metadata()`).
 */
export interface SourceImage {
  /** Identifiant unique pour la durée de vie de la session. */
  readonly id: string;
  /** Nom de fichier d'origine (peut contenir des caractères spéciaux). */
  readonly filename: string;
  /** Contenu binaire de l'image. */
  readonly file: File | Blob;
  /** MIME déclaré par le navigateur (falsifiable, à revérifier serveur). */
  readonly mime: string;
  /** Taille du fichier en octets. */
  readonly sizeBytes: number;
  /** Format détecté (null tant que non détecté). */
  readonly format: ImageFormat | null;
  /** Dimensions détectées (null tant que non détectées). */
  readonly dimensions: ImageDimensions | null;
  /** L'image a-t-elle un canal alpha ? null tant que non détecté. */
  readonly hasAlpha: boolean | null;
}

/* ------------------------------------------------------------------ */
/*  Résultat (sortant)                                                 */
/* ------------------------------------------------------------------ */

/**
 * Image produite par le moteur.
 *
 * Deux modes de transport (voir Décision technique 2 — hybride B+C) :
 * - `buffer` : Blob response direct (traitement unitaire, 1 fichier).
 * - `url`    : URL temporaire @vercel/blob (traitement par lot, 2+).
 * Un seul des deux est défini, jamais les deux.
 */
export interface ResultImage {
  /** Identifiant unique du résultat. */
  readonly id: string;
  /** Nom de fichier suggéré pour le téléchargement (avec suffixe). */
  readonly filename: string;
  /** Format effectif du résultat. */
  readonly format: ImageFormat;
  /** MIME effectif. */
  readonly mime: ImageMimeType;
  /** Taille finale en octets. */
  readonly sizeBytes: number;
  /** Dimensions finales. */
  readonly dimensions: ImageDimensions;
  /** URL temporaire (@vercel/blob) — présente si traitement par lot. */
  readonly url: string | null;
  /** Buffer binaire — présent si traitement unitaire. */
  readonly buffer: ArrayBuffer | null;
  /** Date d'expiration de l'URL (ISO 8601) — null si buffer. */
  readonly expiresAt: string | null;
}