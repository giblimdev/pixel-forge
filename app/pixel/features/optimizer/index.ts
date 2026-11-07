/*
path:            app/pixel/features/optimizer/index.ts
tag:             ["pixel", "feature", "optimizer", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module optimizer.

flow:            Module TypeScript pur -> reexports.

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]
imports:         ["@/app/pixel/features/optimizer/components/optimizer-panel",
                  "@/app/pixel/features/optimizer/hooks/use-optimizer",
                  "@/app/pixel/features/optimizer/types/optimizer.types"]
exports:         ["OptimizerPanel", "OptimizerPanelProps",
                  "useOptimizer", "UseOptimizerReturn",
                  "OptimizationOutcome", "DEFAULT_OPTIMIZATION_OPTIONS"]
useBy:           ["@/app/pixel/optimize/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour l'optimizer"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { OptimizerPanel } from "@/app/pixel/features/optimizer/components/optimizer-panel";
export type { OptimizerPanelProps } from "@/app/pixel/features/optimizer/components/optimizer-panel";

export { useOptimizer } from "@/app/pixel/features/optimizer/hooks/use-optimizer";
export type { UseOptimizerReturn } from "@/app/pixel/features/optimizer/hooks/use-optimizer";

export type { OptimizationOutcome } from "@/app/pixel/features/optimizer/types/optimizer.types";
export { DEFAULT_OPTIMIZATION_OPTIONS } from "@/app/pixel/features/optimizer/types/optimizer.types";