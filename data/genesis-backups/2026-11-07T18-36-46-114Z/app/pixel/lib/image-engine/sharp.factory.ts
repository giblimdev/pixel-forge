/*
path:            app/pixel/lib/image-engine/sharp.factory.ts
tag:             ["pixel", "image-engine", "sharp", "factory", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Fabrique d'instances Sharp. Une seule porte d'entree :
                 createSharp(input, options?). Toute la flotte du
                 moteur passe par ici, ce qui garantit que les
                 garde-fous de SHARP_OPTIONS sont TOUJOURS appliques.
                 Interdit d'importer sharp ailleurs dans le moteur (sauf
                 sharp.adapter.ts qui utilise cette fabrique).

                 Le deuxieme parametre `options` permet de passer des
                 options specifiques (ex. `raw: { width, height,
                 channels }` pour reconstruire une image depuis un
                 Buffer RGBA brut apres chroma-key). Les options
                 specifiques sont fusionnees APRES SHARP_OPTIONS : elles
                 peuvent surcharger les valeurs par defaut, mais les
                 garde-fous essentiels (limitInputPixels) restent si non
                 surcharges.

                 En cas de buffer vide : throw (le caller est cense
                 avoir valide en amont via image-validator, mais on
                 garde un garde-fou).

flow:            createSharp(input, options?) -> sharp(input, {
                 ...SHARP_OPTIONS, ...options }) -> retourne Sharp.

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
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.options.ts"]
imports:         ["server-only", "sharp",
                  "@/app/pixel/lib/image-engine/sharp.options"]
exports:         ["CreateSharpOptions", "createSharp"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux une fabrique Sharp securisee unique"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import sharp from "sharp";
import type { Sharp } from "sharp";

import { SHARP_OPTIONS } from "@/app/pixel/lib/image-engine/sharp.options";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Options specifiques acceptees en plus des SHARP_OPTIONS communes.
 *
 * `raw` est utilise pour reconstruire une image depuis un Buffer RGBA
 * brut (apres chroma-key par exemple) :
 *   createSharp(modified, { raw: { width, height, channels: 4 } })
 */
export interface CreateSharpOptions {
  readonly raw?: {
    readonly width: number;
    readonly height: number;
    readonly channels: number;
  };
}

// ---------------------------------------------------------------------------
// Fabrique
// ---------------------------------------------------------------------------

export function createSharp(
  input: Buffer,
  options?: CreateSharpOptions,
): Sharp {
  if (input.length === 0) {
    throw new Error("createSharp : input vide.");
  }
  return sharp(input, { ...SHARP_OPTIONS, ...options });
}