/*
path :           app/pixel/features/converter/index.ts
tag :            ["pixel", "pixel-forge", "converter", "index", "placeholder", "public-api"]
projectId:       pixel
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module converter.
                 Réexporte le composant ConverterPanel. Sera complété
                 avec les hooks (use-converter), les types et les
                 schémas Zod quand la feature sera implémentée.

                 Conformément à l'architecture (chaque feature expose
                 son API publique via index.ts), les imports externes
                 devraient passer par ce fichier. Pour l'instant, la
                 page importe directement le composant — c'est toléré
                 en phase de placeholder.

flow:            Module TypeScript pur → réexport.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/converter/components/converter-panel.tsx"]

imports:         ["@/app/pixel/features/converter/components/converter-panel"]

exports:         ["ConverterPanel", "ConverterPanelProps"]

useBy:           ["@/app/pixel/convert/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { ConverterPanel } from "@/app/pixel/features/converter/components/converter-panel";
export type { ConverterPanelProps } from "@/app/pixel/features/converter/components/converter-panel";
