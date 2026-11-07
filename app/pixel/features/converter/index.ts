/*
path:            app/pixel/features/converter/index.ts
tag:             ["pixel", "feature", "converter", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module converter. Reexporte le panel
                 (seul consommateur : app/pixel/convert/page.tsx), les
                 types locaux, le schema Zod local et le hook. Les
                 imports externes doivent passer par CET index — pas par
                 les fichiers internes — pour laisser la liberte de
                 refactorer l'implementation sans casser les
                 consommateurs.

flow:            Module TypeScript pur -> reexports.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/converter/components/converter-panel.tsx",
                  "@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/pixel/features/converter/types/converter.types.ts"]
imports:         ["@/app/pixel/features/converter/components/converter-panel",
                  "@/app/pixel/features/converter/hooks/use-converter",
                  "@/app/pixel/features/converter/types/converter.types",
                  "@/app/pixel/features/converter/schemas/converter.schema"]
exports:         ["ConverterPanel", "ConverterPanelProps",
                  "useConverter", "UseConverterReturn",
                  "ConversionOutcome", "ConversionSuccessItem",
                  "ConversionErrorItem", "ConverterStage",
                  "DEFAULT_CONVERSION_OPTIONS",
                  "converterFormSchema", "ConverterFormInput"]
useBy:           ["@/app/pixel/convert/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour le converter"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { ConverterPanel } from "@/app/pixel/features/converter/components/converter-panel";
export type { ConverterPanelProps } from "@/app/pixel/features/converter/components/converter-panel";

export { useConverter } from "@/app/pixel/features/converter/hooks/use-converter";
export type { UseConverterReturn } from "@/app/pixel/features/converter/hooks/use-converter";

export type {
  ConversionOutcome,
  ConversionSuccessItem,
  ConversionErrorItem,
  ConverterStage,
} from "@/app/pixel/features/converter/types/converter.types";

export { DEFAULT_CONVERSION_OPTIONS } from "@/app/pixel/features/converter/types/converter.types";

export { converterFormSchema } from "@/app/pixel/features/converter/schemas/converter.schema";
export type { ConverterFormInput } from "@/app/pixel/features/converter/schemas/converter.schema";