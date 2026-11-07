/*
path:            app/pixel/lib/image-engine/format-registry.ts
tag:             ["pixel", "image-engine", "format", "registry"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            Registre des formats exposables a l'UI : formats
                 d'ENTREE acceptes et formats de SORTIE proposes. Dérivé
                 directement de FORMAT_CAPABILITIES — un format sans
                 capability.output n'apparait jamais en sortie. Evite de
                 dupliquer la liste des formats dans les pages, les
                 dropdowns et les routes API.

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
relatedFiles:    ["@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/lib/image-engine/format-mime.ts"]
imports:         ["@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/lib/image-engine/format-mime",
                  "@/app/pixel/types/image"]
exports:         ["INPUT_FORMATS", "OUTPUT_FORMATS",
                  "isInputFormatSupported",
                  "isOutputFormatSupported"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux un registre unique des formats d'entree et de sortie"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat } from "@/app/pixel/types/image";
import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";
import { FORMAT_TO_MIME } from "@/app/pixel/lib/image-engine/format-mime";

// ---------------------------------------------------------------------------
// Listes derivees
// ---------------------------------------------------------------------------

const ALL_FORMATS = Object.keys(FORMAT_TO_MIME) as readonly ImageFormat[];

export const INPUT_FORMATS: readonly ImageFormat[] = ALL_FORMATS;

export const OUTPUT_FORMATS: readonly ImageFormat[] = ALL_FORMATS.filter(
  (format) => FORMAT_CAPABILITIES[format].output,
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isInputFormatSupported(format: ImageFormat): boolean {
  return INPUT_FORMATS.includes(format);
}

export function isOutputFormatSupported(format: ImageFormat): boolean {
  return OUTPUT_FORMATS.includes(format);
}