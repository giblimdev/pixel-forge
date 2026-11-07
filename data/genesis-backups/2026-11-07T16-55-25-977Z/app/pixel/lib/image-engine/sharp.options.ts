/*
path:            app/pixel/lib/image-engine/sharp.options.ts
tag:             ["pixel", "image-engine", "sharp", "options", "security"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Options communes appliquees a TOUTE instance Sharp du
                 moteur. Centralise les garde-fous de securite :
                 - limitInputPixels (anti decompression bomb) ;
                 - failOn "error" (refuse les images corrompues plutot
                   que de retourner une image partielle) ;
                 - timeout 60s (coherent avec maxDuration Vercel) ;
                 - sequentialRead (moins de memoire sur les gros
                   fichiers) ;

                 Aucune logique metier, aucune dependance runtime hors
                 le type de sharp (importe en `import type` pour rester
                 neutre).

flow:            Module TypeScript pur -> constante SHARP_OPTIONS
                 readonly, utilisee par sharp.factory.ts.

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
exports:         ["SHARP_OPTIONS"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.factory.ts"]

userStories:     ["*en tant que developpeur je veux des garde-fous Sharp centralises"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { SharpOptions } from "sharp";

import { LIMITS } from "@/app/pixel/lib/validators/image-limits";

// ---------------------------------------------------------------------------
// Options communes
// ---------------------------------------------------------------------------

export const SHARP_OPTIONS: Readonly<SharpOptions> = {
  limitInputPixels: LIMITS.MAX_PIXELS,
  sequentialRead: true,
  failOn: "error",
  timeout: 60,
};