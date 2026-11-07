/*
path:            app/pixel/lib/image-engine/sharp.factory.ts
tag:             ["pixel", "image-engine", "sharp", "factory", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Fabrique d'instances Sharp. Une seule porte d'entree :
                 createSharp(buffer). Toute la flotte du moteur passe
                 par ici, ce qui garantit que les garde-fous de
                 SHARP_OPTIONS sont TOUJOURS appliques. Interdit
                 d'importer sharp ailleurs dans le moteur (sauf
                 sharp.adapter.ts qui utilise cette fabrique).

flow:            createSharp(buffer) -> sharp(buffer, SHARP_OPTIONS) ->
                 retourne Sharp. En cas de buffer vide : throw (le
                 caller est cense avoir valide en amont via
                 image-validator, mais on garde un garde-fou).

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
exports:         ["createSharp"]
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
// Fabrique
// ---------------------------------------------------------------------------

export function createSharp(buffer: Buffer): Sharp {
  if (buffer.length === 0) {
    throw new Error("createSharp : buffer vide.");
  }
  return sharp(buffer, SHARP_OPTIONS);
}