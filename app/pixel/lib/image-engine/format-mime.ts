/*
path:            app/pixel/lib/image-engine/format-mime.ts
tag:             ["pixel", "image-engine", "format", "mime"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Table de correspondance entre les formats canoniques
                 (ImageFormat) et les MIME types (ImageMimeType), ainsi
                 que les extensions de fichier. Source unique pour :
                 - l'UI (input accept, dropdowns de conversion) ;
                 - les routes API (Content-Type de reponse) ;
                 - les archives ZIP (extension du nom de fichier) ;
                 - la detection (mime-validator reutilise cette table).

flow:            Module TypeScript pur -> constantes et helpers purs.

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
relatedFiles:    ["@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/types/image"]
exports:         ["FORMAT_TO_MIME", "MIME_TO_FORMAT",
                  "FORMAT_TO_EXTENSION", "mimeForFormat",
                  "formatForMime", "extensionForFormat"]
useBy:           ["@/app/pixel/lib/image-engine/format-registry.ts",
                  "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                  "@/app/pixel/lib/validators/mime-validator.ts"]

userStories:     ["*en tant que developpeur je veux une table format/mime/extension unique"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat, ImageMimeType } from "@/app/pixel/types/image";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const FORMAT_TO_MIME: Readonly<Record<ImageFormat, ImageMimeType>> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  tiff: "image/tiff",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export const MIME_TO_FORMAT: Readonly<Record<ImageMimeType, ImageFormat>> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/tiff": "tiff",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const FORMAT_TO_EXTENSION: Readonly<Record<ImageFormat, string>> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  tiff: "tiff",
  gif: "gif",
  svg: "svg",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function mimeForFormat(format: ImageFormat): ImageMimeType {
  return FORMAT_TO_MIME[format];
}

export function formatForMime(mime: string): ImageFormat | null {
  if (mime in MIME_TO_FORMAT) {
    return MIME_TO_FORMAT[mime as ImageMimeType];
  }
  return null;
}

export function extensionForFormat(format: ImageFormat): string {
  return FORMAT_TO_EXTENSION[format];
}