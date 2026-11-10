/*
path :           app/pixel/types/image.ts
tag :            ["pixelforge", "types", "image", "contracts", "foundation"]
projectId:       <Pixel-fotgen>
type :           helper
generic:         true

role:            Contrat racine du modèle Image pour PixelForge. Distingue
                 SourceImage (fichier uploadé côté client) et ResultImage
                 (fichier produit côté serveur). Les propriétés sont
                 alignées sur le code existant (routes API, hooks,
                 composants) : filename, sizeBytes, dimensions, hasAlpha,
                 mime, url, buffer. url et expiresAt sont nullables pour
                 couvrir le fallback « buffer en mémoire si Vercel Blob
                 n'est pas configuré ». buffer est ArrayBuffer ou
                 Uint8Array<ArrayBuffer> | null : les routes API
                 construisent un ArrayBuffer (résultat de buffer.slice),
                 les hooks client passent null quand seul l'URL est
                 disponible. hasAlpha est boolean | null : null tant que
                 createImageBitmap n'a pas fini la lecture. mime accepte
                 string | ImageMimeType : le navigateur fournit parfois
                 un MIME non canonique (ex. image/jpg). sourceId est
                 optionnel : les routes API qui ne connaissent pas l'id
                 source l'omettent, les hooks client le fournissent quand
                 ils ont un SourceImage sous la main.

flow:            Consommé en lecture par toutes les couches PixelForge.
                 Les routes API construisent des ResultImage depuis les
                 buffers sharp ; les hooks client construisent des
                 SourceImage depuis les File navigateur.

ecosystem:       PIXELFORGE_CONTRACTS
relatedFiles:    [
                   "app/pixel/types/processing.ts",
                   "app/pixel/types/queue.ts",
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
                   "app/api/images/convert/route.ts",
                   "app/api/images/optimize/route.ts",
                   "app/api/images/compress/route.ts",
                   "app/api/images/resize/route.ts",
                   "app/api/images/crop/route.ts",
                   "app/api/images/background/route.ts",
                   "app/api/images/retouch/route.ts",
                   "app/pixel/components/image-comparison/image-comparison.tsx",
                   "app/pixel/components/image-properties/image-properties.tsx",
                   "app/pixel/components/image-queue/queue-item.tsx",
                   "app/pixel/components/image-upload/image-uploader.tsx",
                   "app/pixel/features/converter/hooks/use-converter.ts",
                   "app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "app/pixel/features/compressor/hooks/use-compressor.ts",
                   "app/pixel/features/resize/hooks/use-resize.ts",
                   "app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                   "app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "app/pixel/features/image-editor/hooks/use-image-editor.ts",
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "app/pixel/stores/image-queue.store.ts",
                 ]

userStories:     ["*en tant que développeur je veux un contrat Image aligné sur le code existant"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
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
 * `file` et `url` sont des références navigateur, jamais sérialisées.
 * `format`, `dimensions`, `hasAlpha` sont nullables tant que
 * createImageBitmap n'a pas terminé la lecture des métadonnées.
 * `mime` accepte `string` en plus de `ImageMimeType` : le navigateur
 * peut fournir un MIME non canonique (ex. `image/jpg`) ou vide.
 */
export type SourceImage = {
  readonly id: string;
  readonly filename: string;
  readonly sizeBytes: number;
  readonly declaredMime: string;
  readonly mime: ImageMimeType | string;
  readonly format: ImageFormat | null;
  readonly dimensions: ImageDimensions | null;
  readonly hasAlpha: boolean | null;
  readonly file: File;
  readonly url: string;
  readonly addedAt: string;
};

/**
 * Image résultat : fichier produit par le serveur.
 * `sourceId` est optionnel : les routes API qui ne connaissent pas
 * l'id source l'omettent ; les hooks client le fournissent quand ils
 * ont un SourceImage sous la main.
 * `url` et `expiresAt` sont nullables : si Vercel Blob n'est pas
 * configuré, la route peut retourner un buffer en mémoire (champ
 * `buffer`) sans URL.
 * `buffer` accepte ArrayBuffer (routes API via buffer.slice) et
 * Uint8Array<ArrayBuffer> (compatible BlobPart pour new Blob([...]))
 * ainsi que null (hooks client quand seul l'URL est disponible).
 */
export type ResultImage = {
  readonly id: string;
  readonly sourceId?: string;
  readonly filename: string;
  readonly mime: ImageMimeType;
  readonly format: ImageFormat;
  readonly sizeBytes: number;
  readonly dimensions: ImageDimensions;
  readonly url: string | null;
  readonly expiresAt: string | null;
  readonly buffer?: ArrayBuffer | Uint8Array<ArrayBuffer> | null;
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