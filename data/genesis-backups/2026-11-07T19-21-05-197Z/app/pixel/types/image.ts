/*
path :           app/pixel/types/image.ts
tag :            ["pixelforge", "types", "image", "contracts", "foundation"]
projectId:       <Pixel-fotgen>
type :           helper
generic:         true

role:            Contrat racine du modèle Image pour PixelForge. Distingue
                 SourceImage (fichier uploadé côté client) et ResultImage
                 (fichier produit côté serveur), conformément au reste du
                 code (routes API, hooks, composants). Expose aussi les
                 capacités réelles des formats, le type MIME canonique
                 (ImageMimeType) et des helpers de conversion.
                 Aucun import serveur : ce fichier est isomorphe.

flow:            Consommé en lecture par toutes les couches PixelForge.
                 Les routes API construisent des ResultImage depuis les
                 buffers sharp ; les hooks client construisent des
                 SourceImage depuis les File navigateur.

ecosystem:       PIXELFORGE_CONTRACTS
relatedFiles:    [
                   "app/pixel/types/processing.ts",
                   "app/pixel/types/queue.ts",
                   "app/pixel/types/conversion.ts",
                   "app/pixel/features/crop-editor/types/crop-editor.types.ts",
                 ]
imports:         []
exports:         [
                   "ImageFormat",
                   "ImageMimeType",
                   "ImageFit",
                   "ImageCapabilities",
                   "ImageDimensions",
                   "ImageTransparency",
                   "SourceImage",
                   "ResultImage",
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
                   "app/pixel/types/export.ts",
                   "app/pixel/lib/image-engine/image-engine.types.ts",
                   "app/pixel/lib/image-engine/format-mime.ts",
                   "app/pixel/lib/validators/mime-validator.ts",
                   "app/pixel/stores/image-queue.store.ts",
                 ]

userStories:     ["*en tant que développeur je veux un contrat Image unique partagé par tous les outils PixelForge"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export type ImageFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "gif"
  | "svg";

export type ImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/tiff"
  | "image/gif"
  | "image/svg+xml";

export type ImageFit = "cover" | "contain" | "inside" | "outside" | "fill";

export type ImageDimensions = {
  readonly width: number;
  readonly height: number;
};

export type ImageTransparency = {
  readonly hasAlpha: boolean;
  readonly isOpaque: boolean;
};

export type ImageCapabilities = {
  readonly canRead: boolean;
  readonly canWrite: boolean;
  readonly supportsAlpha: boolean;
  readonly supportsQuality: boolean;
  readonly supportsLossless: boolean;
  readonly supportsNearLossless: boolean;
  readonly supportsMetadata: boolean;
  readonly supportsAnimation: boolean;
};

/**
 * Image source : fichier uploadé par l'utilisateur, avant tout traitement.
 * `file` et `objectUrl` sont des références navigateur, jamais sérialisées.
 */
export type SourceImage = {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly declaredMime: string;
  readonly format: ImageFormat;
  readonly dimensions: ImageDimensions;
  readonly transparency: ImageTransparency;
  readonly file: File;
  readonly objectUrl: string;
  readonly addedAt: string;
};

/**
 * Image résultat : fichier produit par le serveur.
 * `url` est une URL temporaire servie par /api/temp/(id) (Décision 2).
 */
export type ResultImage = {
  readonly id: string;
  readonly sourceId: string;
  readonly filename: string;
  readonly mime: ImageMimeType;
  readonly size: number;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly expiresAt?: string;
};

export const IMAGE_FORMATS: readonly ImageFormat[] = [
  "avif",
  "gif",
  "jpeg",
  "png",
  "svg",
  "tiff",
  "webp",
] as const;

export const IMAGE_MIME_BY_FORMAT: Readonly<
  Record<ImageFormat, ImageMimeType>
> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  webp: "image/webp",
} as const;

export const IMAGE_EXTENSION_BY_FORMAT: Readonly<Record<ImageFormat, string>> = {
  avif: "avif",
  gif: "gif",
  jpeg: "jpg",
  png: "png",
  svg: "svg",
  tiff: "tiff",
  webp: "webp",
} as const;

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

export function isImageFormat(value: unknown): value is ImageFormat {
  return (
    typeof value === "string" &&
    (IMAGE_FORMATS as readonly string[]).includes(value)
  );
}

export function isImageMime(value: unknown): value is ImageMimeType {
  if (typeof value !== "string") return false;
  return (Object.values(IMAGE_MIME_BY_FORMAT) as readonly string[]).includes(
    value,
  );
}

export function getFormatFromMime(mime: string): ImageFormat | null {
  for (const format of IMAGE_FORMATS) {
    if (IMAGE_MIME_BY_FORMAT[format] === mime) return format;
  }
  return null;
}

export function getExtensionForFormat(format: ImageFormat): string {
  return IMAGE_EXTENSION_BY_FORMAT[format];
}

export function getMimeForFormat(format: ImageFormat): ImageMimeType {
  return IMAGE_MIME_BY_FORMAT[format];
}