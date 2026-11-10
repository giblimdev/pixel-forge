/*
path:            app/pixel/lib/image-engine/image-engine.ts
tag:             ["pixel", "image-engine", "facade"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Facade publique du moteur. Point d'entree UNIQUE pour
                 les routes API, les Server Actions et les hooks. Cette
                 facade N'IMPORTE PAS sharp : elle delegue a
                 sharp.adapter.ts, qui est le seul a parler a la
                 librairie native. Les consommateurs n'ont donc aucune
                 dependance a Sharp dans leur bundle ni dans leurs
                 types.

                 Phase 13 : ajout de removeBackground.

flow:            convert -> convertSharp
                 resize -> resizeSharp
                 crop -> cropSharp
                 rotate -> rotateSharp
                 flip -> flipSharp
                 grayscale -> grayscaleSharp
                 removeBackground -> removeBackgroundSharp
                 analyze -> analyzeSharp

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
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.adapter.ts",
                  "@/app/pixel/lib/image-engine/image-engine.types.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only",
                  "@/app/pixel/lib/image-engine/sharp.adapter",
                  "@/app/pixel/lib/image-engine/image-engine.types",
                  "@/app/pixel/types/conversion"]
exports:         ["convert", "resize", "crop", "rotate", "flip",
                  "grayscale", "removeBackground", "analyze",
                  "Result",
                  "ResizeInput", "CropInput", "RotateInput", "FlipInput",
                  "GrayscaleInput", "RemoveBackgroundInput"]
useBy:           ["@/app/api/images/convert/route.ts",
                  "@/app/api/images/optimize/route.ts",
                  "@/app/api/images/compress/route.ts",
                  "@/app/api/images/resize/route.ts",
                  "@/app/api/images/crop/route.ts",
                  "@/app/api/images/background/route.ts",
                  "@/app/api/images/retouch/route.ts",
                  "@/app/api/images/favicon/route.ts",
                  "@/app/api/images/placeholder/route.ts",
                  "@/app/api/images/palette/route.ts",
                  "@/app/api/images/metadata/route.ts"]

userStories:     ["*en tant que developpeur je veux une facade moteur independante de Sharp"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import {
  analyzeSharp,
  convertSharp,
  cropSharp,
  flipSharp,
  grayscaleSharp,
  removeBackgroundSharp,
  resizeSharp,
  rotateSharp,
  type CropSharpOptions,
  type FlipSharpOptions,
  type GrayscaleSharpOptions,
  type RemoveBackgroundSharpOptions,
  type ResizeSharpOptions,
  type RotateSharpOptions,
} from "@/app/pixel/lib/image-engine/sharp.adapter";
import type {
  EngineMetadata,
  EngineOutput,
} from "@/app/pixel/lib/image-engine/image-engine.types";
import type { ConversionOptions } from "@/app/pixel/types/conversion";
import type { ProcessingError } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Types publics (reexportes pour les consommateurs)
// ---------------------------------------------------------------------------

export type Result<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ProcessingError };

export type ResizeInput = ResizeSharpOptions;
export type CropInput = CropSharpOptions;
export type RotateInput = RotateSharpOptions;
export type FlipInput = FlipSharpOptions;
export type GrayscaleInput = GrayscaleSharpOptions;
export type RemoveBackgroundInput = RemoveBackgroundSharpOptions;

// ---------------------------------------------------------------------------
// Facade publique
// ---------------------------------------------------------------------------

export function convert(
  buffer: Buffer,
  options: ConversionOptions,
): Promise<Result<EngineOutput>> {
  return convertSharp(buffer, options);
}

export function resize(
  buffer: Buffer,
  options: ResizeInput,
): Promise<Result<EngineOutput>> {
  return resizeSharp(buffer, options);
}

export function crop(
  buffer: Buffer,
  options: CropInput,
): Promise<Result<EngineOutput>> {
  return cropSharp(buffer, options);
}

export function rotate(
  buffer: Buffer,
  options: RotateInput,
): Promise<Result<EngineOutput>> {
  return rotateSharp(buffer, options);
}

export function flip(
  buffer: Buffer,
  options: FlipInput,
): Promise<Result<EngineOutput>> {
  return flipSharp(buffer, options);
}

export function grayscale(
  buffer: Buffer,
  options: GrayscaleInput,
): Promise<Result<EngineOutput>> {
  return grayscaleSharp(buffer, options);
}

export function removeBackground(
  buffer: Buffer,
  options: RemoveBackgroundInput,
): Promise<Result<EngineOutput>> {
  return removeBackgroundSharp(buffer, options);
}

export function analyze(buffer: Buffer): Promise<Result<EngineMetadata>> {
  return analyzeSharp(buffer);
}