/*
path :           app/pixel/types/image.ts
tag :            ["pixelforge", "types", "image", "contracts", "foundation"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Contrat racine du modèle Image pour PixelForge. Définit
                 l'asset image manipulé par l'UI (file d'attente, aperçu,
                 propriétés) et les capacités réelles des formats exposées
                 par le registre du moteur. Source de vérité partagée entre
                 composants client, hooks, routes API et moteur image.
                 Aucun import serveur (sharp, file-type) : ce fichier est
                 isomorphe client/serveur.

flow:            Consommé en lecture par :
                 - stores/image-queue.store.ts (QueueItem.asset)
                 - components/image-properties/* (dimensions, mime, poids)
                 - features/*/hooks/use-*.ts (validation UI avant envoi)
                 - app/api/images/*/route.ts (typage des réponses)
                 Aucune logique runtime : uniquement des types et des
                 constantes readonly.

ecosystem:       PIXELFORGE_CONTRACTS
relatedFiles:    [
                   "app/pixel/types/processing.ts",
                   "app/pixel/types/queue.ts",
                   "app/pixel/types/conversion.ts",
                   "app/pixel/lib/image-engine/image-engine.types.ts",
                   "app/pixel/lib/image-engine/formats/format-registry.ts",
                   "app/pixel/lib/image-engine/formats/format-capabilities.ts",
                 ]
imports:         []
exports:         [
                   "ImageFormat",
                   "ImageMime",
                   "ImageFit",
                   "ImageCapabilities",
                   "ImageDimensions",
                   "ImageTransparency",
                   "ImageAsset",
                   "IMAGE_FORMATS",
                   "IMAGE_MIME_BY_FORMAT",
                   "IMAGE_EXTENSION_BY_FORMAT",
                   "IMAGE_CAPABILITIES",
                   "isImageFormat",
                   "isImageMime",
                   "getFormatFromMime",
                   "getExtensionForFormat",
                   "getMimeForFormat",
                 ]
useBy:           [
                   "app/pixel/types/queue.ts",
                   "app/pixel/types/conversion.ts",
                   "app/pixel/types/optimization.ts",
                   "app/pixel/lib/image-engine/image-engine.types.ts",
                   "app/pixel/lib/validators/mime-validator.ts",
                   "app/pixel/stores/image-queue.store.ts",
                 ]

userStories:     ["*en tant que développeur je veux un contrat Image unique partagé par tous les outils PixelForge"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/**
 * Formats d'image supportés par PixelForge.
 * Liste alignée sur les capacités réelles de sharp 0.35+ :
 * - Entrée : jpeg, png, webp, avif, tiff, gif, svg
 * - Sortie : jpeg, png, webp, avif, tiff (gif et svg sont entrée seule)
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
 * Types MIME canoniques associés aux formats.
 * `image/jpg` (non standard) est volontairement exclu : on normalise
 * toujours vers `image/jpeg`.
 */
export type ImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/tiff"
  | "image/gif"
  | "image/svg+xml";

/**
 * Modes de redimensionnement (alignés sur sharp.fit).
 * - cover   : remplit la zone, peut rogner.
 * - contain : tient dans la zone, peut laisser des marges.
 * - inside  : réduit uniquement si plus grand que la cible.
 * - outside : agrandit uniquement si plus petit que la cible.
 * - fill    : étire sans respecter le ratio.
 */
export type ImageFit = "cover" | "contain" | "inside" | "outside" | "fill";

/**
 * Dimensions d'une image en pixels.
 * Toutes les valeurs sont des entiers positifs.
 */
export type ImageDimensions = {
  readonly width: number;
  readonly height: number;
};

/**
 * Informations de transparence détectées sur l'image source.
 * `hasAlpha` est vrai si le canal alpha existe et contient au moins
 * un pixel non opaque (sharp.stats().isOpaque === false).
 */
export type ImageTransparency = {
  readonly hasAlpha: boolean;
  readonly isOpaque: boolean;
};

/**
 * Capacités réelles d'un format, exposées par le registre du moteur.
 * Permet à l'UI de filtrer les options proposées (ne jamais afficher
 * une option que le moteur ne sait pas appliquer).
 */
export type ImageCapabilities = {
  /** Le format peut-il être lu en entrée ? */
  readonly canRead: boolean;
  /** Le format peut-il être produit en sortie ? */
  readonly canWrite: boolean;
  /** Le format supporte-t-il le canal alpha ? */
  readonly supportsAlpha: boolean;
  /** Le format supporte-t-il une qualité 1-100 ? */
  readonly supportsQuality: boolean;
  /** Le format supporte-t-il le mode lossless ? */
  readonly supportsLossless: boolean;
  /** Le format supporte-t-il le mode near-lossless (webp uniquement) ? */
  readonly supportsNearLossless: boolean;
  /** Le format supporte-t-il l'embedding de métadonnées EXIF/ICC ? */
  readonly supportsMetadata: boolean;
  /** Le format peut-il contenir plusieurs frames (gif animé) ? */
  readonly supportsAnimation: boolean;
};

/**
 * Asset image manipulé par PixelForge.
 * Représente un fichier chargé côté client avant tout traitement.
 *
 * `id` est un identifiant local stable (généré côté client via crypto.randomUUID),
 * distinct de l'`id` de traitement retourné par le serveur.
 *
 * `file` est la référence au File navigateur (non sérialisable) :
 * il n'est jamais transmis tel quel à l'API — les hooks utilisent
 * FormData pour l'upload.
 */
export type ImageAsset = {
  /** Identifiant local stable côté client. */
  readonly id: string;
  /** Nom de fichier d'origine, avec extension. */
  readonly name: string;
  /** Taille en octets. */
  readonly size: number;
  /** MIME déclaré par le navigateur (non fiable avant validation serveur). */
  readonly declaredMime: string;
  /** Format détecté côté client (heuristique extension + MIME). */
  readonly format: ImageFormat;
  /** Dimensions connues après chargement (createImageBitmap ou <img>). */
  readonly dimensions: ImageDimensions;
  /** Informations de transparence (détectées après chargement). */
  readonly transparency: ImageTransparency;
  /** Référence navigateur au fichier (jamais sérialisé). */
  readonly file: File;
  /** URL blob locale pour l'aperçu (à révoquer au retrait). */
  readonly objectUrl: string;
  /** Horodatage d'ajout à la file (ISO 8601). */
  readonly addedAt: string;
};

/**
 * Liste exhaustive des formats supportés, triée alphabétiquement.
 * Utile pour itérer sur les formats dans l'UI et les tests.
 */
export const IMAGE_FORMATS: readonly ImageFormat[] = [
  "avif",
  "gif",
  "jpeg",
  "png",
  "svg",
  "tiff",
  "webp",
] as const;

/**
 * Correspondance format → MIME canonique.
 */
export const IMAGE_MIME_BY_FORMAT: Readonly<Record<ImageFormat, ImageMime>> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  webp: "image/webp",
} as const;

/**
 * Correspondance format → extension canonique (sans point).
 */
export const IMAGE_EXTENSION_BY_FORMAT: Readonly<Record<ImageFormat, string>> = {
  avif: "avif",
  gif: "gif",
  jpeg: "jpg",
  png: "png",
  svg: "svg",
  tiff: "tiff",
  webp: "webp",
} as const;

/**
 * Capacités réelles par format, alignées sur sharp 0.35+.
 * Source de vérité consommée par l'UI pour filtrer les options.
 */
export const IMAGE_CAPABILITIES: Readonly<
  Record<ImageFormat, ImageCapabilities>
> = {
  avif: {
    canRead: true,
    canWrite: true,
    supportsAlpha: true,
    supportsQuality: true,
    supportsLossless: true,
    supportsNearLossless: false,
    supportsMetadata: true,
    supportsAnimation: false,
  },
  gif: {
    canRead: true,
    canWrite: false,
    supportsAlpha: true,
    supportsQuality: false,
    supportsLossless: false,
    supportsNearLossless: false,
    supportsMetadata: false,
    supportsAnimation: true,
  },
  jpeg: {
    canRead: true,
    canWrite: true,
    supportsAlpha: false,
    supportsQuality: true,
    supportsLossless: false,
    supportsNearLossless: false,
    supportsMetadata: true,
    supportsAnimation: false,
  },
  png: {
    canRead: true,
    canWrite: true,
    supportsAlpha: true,
    supportsQuality: false,
    supportsLossless: true,
    supportsNearLossless: false,
    supportsMetadata: true,
    supportsAnimation: false,
  },
  svg: {
    canRead: true,
    canWrite: false,
    supportsAlpha: true,
    supportsQuality: false,
    supportsLossless: false,
    supportsNearLossless: false,
    supportsMetadata: false,
    supportsAnimation: false,
  },
  tiff: {
    canRead: true,
    canWrite: true,
    supportsAlpha: true,
    supportsQuality: true,
    supportsLossless: true,
    supportsNearLossless: false,
    supportsMetadata: true,
    supportsAnimation: false,
  },
  webp: {
    canRead: true,
    canWrite: true,
    supportsAlpha: true,
    supportsQuality: true,
    supportsLossless: true,
    supportsNearLossless: true,
    supportsMetadata: true,
    supportsAnimation: true,
  },
} as const;

/**
 * Type guard : vérifie qu'une valeur est un ImageFormat valide.
 */
export function isImageFormat(value: unknown): value is ImageFormat {
  return (
    typeof value === "string" &&
    (IMAGE_FORMATS as readonly string[]).includes(value)
  );
}

/**
 * Type guard : vérifie qu'une valeur est un ImageMime valide.
 */
export function isImageMime(value: unknown): value is ImageMime {
  if (typeof value !== "string") return false;
  return (Object.values(IMAGE_MIME_BY_FORMAT) as readonly string[]).includes(
    value,
  );
}

/**
 * Retourne le format correspondant à un MIME, ou null si non supporté.
 */
export function getFormatFromMime(mime: string): ImageFormat | null {
  for (const format of IMAGE_FORMATS) {
    if (IMAGE_MIME_BY_FORMAT[format] === mime) return format;
  }
  return null;
}

/**
 * Retourne l'extension canonique d'un format (sans point).
 */
export function getExtensionForFormat(format: ImageFormat): string {
  return IMAGE_EXTENSION_BY_FORMAT[format];
}

/**
 * Retourne le MIME canonique d'un format.
 */
export function getMimeForFormat(format: ImageFormat): ImageMime {
  return IMAGE_MIME_BY_FORMAT[format];
}