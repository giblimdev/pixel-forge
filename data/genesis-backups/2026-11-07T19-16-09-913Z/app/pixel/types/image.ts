/*
path:            app/pixel/types/image.ts
tag:             ["pixel", "pixel-forge", "types", "image", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Modele commun d'une image dans PixelForge. Decrit une
                 image SOURCE (entrante) ou une image RESULTAT (sortante)
                 avec toutes les proprietes techniques dont l'UI et les
                 routes API ont besoin. Aucune dependance runtime, aucun
                 effet. Importable client ET serveur.

                 SourceImage  : image uploadee par l'utilisateur, avant
                                traitement. Contient le File/Blob natif,
                                l'URL blob pour l'affichage, et les
                                metadonnees extraites (MIME, taille,
                                dimensions).
                 ResultImage  : image produite par le moteur. Contient
                                soit un Buffer (Vercel : blob response),
                                soit une URL (Vercel : stockage temporaire
                                @vercel/blob).
                 ImageDimensions : { width, height } reutilisable.
                 ImageFormat     : union des formats supportes.

flow:            Module TypeScript pur -> export des types.

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
                  "@/app/pixel/types/export.ts",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/components/image-upload/image-uploader.tsx"]

userStories:     ["*en tant que developpeur je veux un modele commun d'image PixelForge"]
status:          done
pathChecked:     ✔/✘true
metaDataChecked: ✔/✘true
scriptChecked:   ✔/✘true
*/

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

/**
 * Formats pris en charge par PixelForge.
 * - Entree : jpeg, png, webp, avif, tiff, gif, svg (rasterise).
 * - Sortie : jpeg, png, webp, avif, tiff (selon capacites Sharp reelles).
 *
 * `gif` en sortie est exclu : Sharp ne preserve pas l'animation par
 * defaut. Si un jour le support est ajoute, retirer cette exclusion.
 * `svg` en sortie est exclu : c'est un format d'entree rasterise
 * uniquement, pas de sortie equivalente a WebP/PNG.
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
 * MIME types associes aux formats. Utilise par les validateurs cote
 * client (input accept) ET cote serveur (verification magic bytes).
 */
export type ImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/tiff"
  | "image/gif"
  | "image/svg+xml";

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

// ---------------------------------------------------------------------------
// Source (entrante)
// ---------------------------------------------------------------------------

/**
 * Image uploadee par l'utilisateur, avant tout traitement.
 *
 * Le `file` est le `File` natif du navigateur (ou `Blob` cote serveur
 * apres un `request.formData()`). Les champs `format`, `dimensions`,
 * `hasAlpha` peuvent etre `null` tant que la detection n'a pas eu lieu.
 *
 * ⚠️ `url` est une URL blob (creee via `URL.createObjectURL(file)`) :
 * - elle sert uniquement a l'AFFICHAGE (miniature) ;
 * - elle DOIT etre revoquee via `URL.revokeObjectURL` quand l'image
 *   est retiree de la file (fait dans image-queue.store.ts remove/clear) ;
 * - elle N'EST PAS envoyee au serveur : le serveur recoit `file` (le
 *   File natif) via multipart/form-data.
 */
export interface SourceImage {
  /** Identifiant unique pour la duree de vie de la session. */
  readonly id: string;
  /** Nom de fichier d'origine (peut contenir des caracteres speciaux). */
  readonly filename: string;
  /** Contenu binaire de l'image. */
  readonly file: File | Blob;
  /** URL blob pour l'affichage (URL.createObjectURL). */
  readonly url: string;
  /** MIME declare par le navigateur (falsifiable, a reverifier serveur). */
  readonly mime: string;
  /** Taille du fichier en octets. */
  readonly sizeBytes: number;
  /** Format detecte (null tant que non detecte). */
  readonly format: ImageFormat | null;
  /** Dimensions detectees (null tant que non detectees). */
  readonly dimensions: ImageDimensions | null;
  /** L'image a-t-elle un canal alpha ? null tant que non detecte. */
  readonly hasAlpha: boolean | null;
}

// ---------------------------------------------------------------------------
// Resultat (sortant)
// ---------------------------------------------------------------------------

/**
 * Image produite par le moteur.
 *
 * Deux modes de transport (voir Decision technique 2 - hybride B+C) :
 * - `buffer` : Blob response direct (traitement unitaire, 1 fichier).
 * - `url`    : URL temporaire @vercel/blob (traitement par lot, 2+).
 * Un seul des deux est defini, jamais les deux.
 */
export interface ResultImage {
  /** Identifiant unique du resultat. */
  readonly id: string;
  /** Nom de fichier suggere pour le telechargement (avec suffixe). */
  readonly filename: string;
  /** Format effectif du resultat. */
  readonly format: ImageFormat;
  /** MIME effectif. */
  readonly mime: ImageMimeType;
  /** Taille finale en octets. */
  readonly sizeBytes: number;
  /** Dimensions finales. */
  readonly dimensions: ImageDimensions;
  /** URL temporaire (@vercel/blob) - presente si traitement par lot. */
  readonly url: string | null;
  /** Buffer binaire - present si traitement unitaire. */
  readonly buffer: ArrayBuffer | null;
  /** Date d'expiration de l'URL (ISO 8601) - null si buffer. */
  readonly expiresAt: string | null;
}