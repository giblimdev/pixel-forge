/*
path:            app/pixel/lib/image-engine/sharp.options.ts
tag:             ["pixel", "image-engine", "sharp", "options", "security"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Options communes appliquees a TOUTE instance Sharp du
                 moteur. Centralise les garde-fous de securite :
                 - limitInputPixels (anti decompression bomb) ;
                 - failOn "error" (refuse les images corrompues) ;
                 - sequentialRead (moins de memoire sur les gros fichiers).

                 Le timeout de pipeline est expose separement via
                 PIPELINE_TIMEOUT_SECONDS : dans sharp, ce n'est PAS une
                 option de constructeur mais un appel sur la pipeline
                 (.timeout({ seconds })). L'adaptateur l'applique avant
                 chaque .toBuffer().

flow:            Module TypeScript pur -> constantes readonly.

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
relatedFiles:    ["@/app/pixel/lib/validators/image-limits.ts"]
imports:         ["sharp", "@/app/pixel/lib/validators/image-limits"]
exports:         ["SHARP_OPTIONS", "PIPELINE_TIMEOUT_SECONDS"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.factory.ts",
                  "@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux des garde-fous Sharp centralises"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { SharpOptions } from "sharp";

import { LIMITS } from "@/app/pixel/lib/validators/image-limits";

// ---------------------------------------------------------------------------
// Options constructeur (SharpOptions)
// ---------------------------------------------------------------------------

export const SHARP_OPTIONS: Readonly<SharpOptions> = {
  limitInputPixels: LIMITS.MAX_PIXELS,
  sequentialRead: true,
  failOn: "error",
};

// ---------------------------------------------------------------------------
// Timeout de pipeline (applique via .timeout({ seconds }))
// ---------------------------------------------------------------------------

export const PIPELINE_TIMEOUT_SECONDS = 60;