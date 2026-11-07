/*
path:            app/pixel/lib/image-engine/format-capabilities.ts
tag:             ["pixel", "image-engine", "format", "capabilities"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Capacites reelles par format de SORTIE, independantes de
                 Sharp (source unique consommee par l'UI et par
                 l'adaptateur). Une UI ne doit JAMAIS proposer une option
                 que le format cible ne supporte pas (ex. mode lossless
                 pour JPEG). Ce fichier decrit la verite metier, pas
                 l'implementation Sharp.

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
relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/conversion.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/conversion"]
exports:         ["FormatCapabilities", "FORMAT_CAPABILITIES",
                  "supportsMode", "supportsQuality",
                  "supportsAlpha", "supportsIcc"]
useBy:           ["@/app/pixel/lib/image-engine/format-registry.ts",
                  "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                  "@/app/pixel/lib/image-engine/index.ts"]

userStories:     ["*en tant que developpeur je veux connaitre les capacites reelles d'un format",
                  "*en tant qu'utilisateur je veux que l'UI ne propose que les options supportees"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat } from "@/app/pixel/types/image";
import type { ConversionMode } from "@/app/pixel/types/conversion";

// ---------------------------------------------------------------------------
// Type de capacites
// ---------------------------------------------------------------------------

export interface FormatCapabilities {
  readonly output: boolean;
  readonly quality: boolean;
  readonly alpha: boolean;
  readonly icc: boolean;
  readonly exif: boolean;
  readonly modes: readonly ConversionMode[];
}

// ---------------------------------------------------------------------------
// Table des capacites (verite metier, alignee sur sharp 0.35)
// ---------------------------------------------------------------------------

export const FORMAT_CAPABILITIES: Readonly<
  Record<ImageFormat, FormatCapabilities>
> = {
  jpeg: {
    output: true,
    quality: true,
    alpha: false,
    icc: true,
    exif: true,
    modes: ["lossy"],
  },
  png: {
    output: true,
    quality: true,
    alpha: true,
    icc: true,
    exif: false,
    modes: ["lossless"],
  },
  webp: {
    output: true,
    quality: true,
    alpha: true,
    icc: true,
    exif: true,
    modes: ["lossy", "lossless", "near-lossless"],
  },
  avif: {
    output: true,
    quality: true,
    alpha: true,
    icc: true,
    exif: true,
    modes: ["lossy", "lossless"],
  },
  tiff: {
    output: true,
    quality: false,
    alpha: true,
    icc: true,
    exif: true,
    modes: ["lossless"],
  },
  gif: {
    output: false,
    quality: false,
    alpha: true,
    icc: false,
    exif: false,
    modes: [],
  },
  svg: {
    output: false,
    quality: false,
    alpha: true,
    icc: false,
    exif: false,
    modes: [],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function supportsMode(
  format: ImageFormat,
  mode: ConversionMode,
): boolean {
  return FORMAT_CAPABILITIES[format].modes.includes(mode);
}

export function supportsQuality(format: ImageFormat): boolean {
  return FORMAT_CAPABILITIES[format].quality;
}

export function supportsAlpha(format: ImageFormat): boolean {
  return FORMAT_CAPABILITIES[format].alpha;
}

export function supportsIcc(format: ImageFormat): boolean {
  return FORMAT_CAPABILITIES[format].icc;
}