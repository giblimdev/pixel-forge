/*
path:            app/pixel/features/converter/schemas/converter.schema.ts
tag:             ["pixel", "feature", "converter", "schema", "zod"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Schema Zod LOCAL au converter. Etend
                 conversionOptionsSchema (deja dans
                 @/app/pixel/types/conversion) en ajoutant une regle de
                 coherence metier : si le format cible ne supporte pas
                 la qualite, `quality` doit etre a 0. Le schema global
                 reste la reference pour l'API ; ce schema est utilise
                 par le formulaire pour valider l'UI avant l'envoi.

flow:            Module TypeScript pur -> export du schema + du type
                 inferé. Utilise par use-converter.ts avant le fetch.

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
relatedFiles:    ["@/app/pixel/types/conversion.ts",
                  "@/app/pixel/lib/image-engine/format-capabilities.ts"]
imports:         ["zod",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/lib/image-engine/format-capabilities"]
exports:         ["converterFormSchema", "ConverterFormInput"]
useBy:           ["@/app/pixel/features/converter/hooks/use-converter.ts"]

userStories:     ["*en tant que developpeur je veux valider les options du converter cote client"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { z } from "zod";

import { conversionOptionsSchema } from "@/app/pixel/types/conversion";
import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";

/**
 * Etend le schema global avec une regle metier : si le format cible ne
 * supporte pas la qualite (`FORMAT_CAPABILITIES[format].quality === false`,
 * comme TIFF), alors `quality` doit valoir 0. Cela evite d'envoyer une
 * option ignoree par le moteur et de faire echouer la conversion.
 */
export const converterFormSchema = conversionOptionsSchema.superRefine(
  (data, ctx) => {
    const caps = FORMAT_CAPABILITIES[data.format];
    if (!caps.quality && data.quality !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quality"],
        message: `Le format ${data.format} ne supporte pas le reglage de qualite (mettre 0).`,
      });
    }
  },
);

export type ConverterFormInput = z.infer<typeof converterFormSchema>;