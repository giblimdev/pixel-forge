/*
path:            app/pixel/lib/image-engine/index.ts
tag:             ["pixel", "image-engine", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         true

role:            API publique du moteur Image Engine. Reexporte :
                 - les operations (convert, resize, crop, rotate, flip,
                   grayscale, analyze) ;
                 - les types (EngineInput, EngineOutput, EngineMetadata,
                   EngineOptions) ;
                 - le registre des formats (INPUT_FORMATS,
                   OUTPUT_FORMATS, FORMAT_CAPABILITIES) ;
                 - les tables MIME/extension.

                 Les consommateurs (routes API, Server Actions) doivent
                 importer depuis CET index et jamais depuis les fichiers
                 internes (sharp.adapter, sharp.factory, etc.). Cela
                 laisse la liberte de changer l'implementation Sharp
                 sans toucher aux consommateurs.

flow:            Module TypeScript pur -> reexports.

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
relatedFiles:    ["@/app/pixel/lib/image-engine/image-engine.ts",
                  "@/app/pixel/lib/image-engine/image-engine.types.ts",
                  "@/app/pixel/lib/image-engine/format-registry.ts",
                  "@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/lib/image-engine/format-mime.ts"]
imports:         ["@/app/pixel/lib/image-engine/image-engine",
                  "@/app/pixel/lib/image-engine/image-engine.types",
                  "@/app/pixel/lib/image-engine/format-registry",
                  "@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/lib/image-engine/format-mime"]
exports:         ["convert", "resize", "crop", "rotate", "flip",
                  "grayscale", "analyze",
                  "Result", "ResizeInput", "CropInput", "RotateInput",
                  "FlipInput", "GrayscaleInput",
                  "EngineInput", "EngineOutput", "EngineMetadata",
                  "EngineOptions",
                  "INPUT_FORMATS", "OUTPUT_FORMATS",
                  "isInputFormatSupported", "isOutputFormatSupported",
                  "FORMAT_CAPABILITIES", "supportsMode",
                  "supportsQuality", "supportsAlpha", "supportsIcc",
                  "FORMAT_TO_MIME", "MIME_TO_FORMAT",
                  "FORMAT_TO_EXTENSION", "mimeForFormat",
                  "formatForMime", "extensionForFormat"]
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

userStories:     ["*en tant que developpeur je veux une API publique unique pour le moteur"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

// Operations
export {
  convert,
  resize,
  crop,
  rotate,
  flip,
  grayscale,
  analyze,
} from "@/app/pixel/lib/image-engine/image-engine";

// Types d'operations
export type {
  Result,
  ResizeInput,
  CropInput,
  RotateInput,
  FlipInput,
  GrayscaleInput,
} from "@/app/pixel/lib/image-engine/image-engine";

// Types du moteur
export type {
  EngineInput,
  EngineOutput,
  EngineMetadata,
  EngineOptions,
} from "@/app/pixel/lib/image-engine/image-engine.types";

// Registre
export {
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  isInputFormatSupported,
  isOutputFormatSupported,
} from "@/app/pixel/lib/image-engine/format-registry";

export {
  FORMAT_CAPABILITIES,
  supportsMode,
  supportsQuality,
  supportsAlpha,
  supportsIcc,
} from "@/app/pixel/lib/image-engine/format-capabilities";

export {
  FORMAT_TO_MIME,
  MIME_TO_FORMAT,
  FORMAT_TO_EXTENSION,
  mimeForFormat,
  formatForMime,
  extensionForFormat,
} from "@/app/pixel/lib/image-engine/format-mime";