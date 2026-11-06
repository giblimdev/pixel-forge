/*
path :           app/pixel/features/favicon-generator/index.ts
tag :            ["pixel", "pixel-forge", "favicon-generator", "index", "placeholder", "public-api"]
projectId:       new-genesis
type:            config
generic:         false

role:            ⚠️ PLACEHOLDER — API publique du module
                 favicon-generator. Réexporte FaviconPanel. Sera
                 complété avec les hooks (use-favicon-generator), les
                 types et les schémas Zod quand la feature sera
                 implémentée.

flow:            Module TypeScript pur → réexport.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx"]

imports:         ["@/app/pixel/features/favicon-generator/components/favicon-panel"]

exports:         ["FaviconPanel", "FaviconPanelProps"]

useBy:           ["@/app/pixel/generate/favicon/page.tsx"]

userStories:     []

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { FaviconPanel } from "@/app/pixel/features/favicon-generator/components/favicon-panel";
export type { FaviconPanelProps } from "@/app/pixel/features/favicon-generator/components/favicon-panel";