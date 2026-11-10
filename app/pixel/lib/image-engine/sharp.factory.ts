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
                 Buffer RGBA brut apres chroma-key).

                 ATTENTION : `channels` doit etre un Channels (union
                 litterale 1 | 2 | 3 | 4), PAS un number. C'est le type
                 impose par sharp.CreateRaw. Voir RawChannels ci-dessous.

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
exports:         ["RawChannels", "CreateSharpOptions", "createSharp"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux une fabrique Sharp securisee unique"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import sharp from "sharp";
import type { Sharp, SharpOptions, CreateRaw } from "sharp";

import { SHARP_OPTIONS } from "@/app/pixel/lib/image-engine/sharp.options";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Union litterale imposee par sharp.CreateRaw pour `channels`.
 * Impossible d'utiliser un `number` generique : sharp refuse tout ce
 * qui n'est pas 1, 2, 3 ou 4 a la compilation.
 */
export type RawChannels = CreateRaw["channels"]; // 1 | 2 | 3 | 4

/**
 * Options specifiques acceptees en plus des SHARP_OPTIONS communes.
 *
 * `raw` est utilise pour reconstruire une image depuis un Buffer RGBA
 * brut (apres chroma-key par exemple) :
 *   createSharp(modified, { raw: { width, height, channels: 4 } })
 *
 * Le cast `channels: 4 as RawChannels` n'est pas necessaire si le
 * litteral `4` est utilise directement (TypeScript l'inferre comme
 * RawChannels).
 */
export interface CreateSharpOptions {
  readonly raw?: {
    readonly width: number;
    readonly height: number;
    readonly channels: RawChannels;
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
  // Fusion : SHARP_OPTIONS (garde-fous) + options specifiques.
  // Le cast `as SharpOptions` est necessaire car TS ne peut pas
  // prouver que la fusion de deux objets partiels reste compatible
  // avec SharpOptions (les proprietes optionnelles se telescopent).
  return sharp(input, {
    ...SHARP_OPTIONS,
    ...options,
  } as SharpOptions);
}