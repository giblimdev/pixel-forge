/*
path:            app/pixel/features/smart-crop/index.ts
tag:             ["pixel", "feature", "smart-crop", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module smart-crop.

flow:            Module TypeScript pur -> reexports.

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/types/smart-crop.types.ts",
                   "@/app/pixel/features/smart-crop/schemas/smart-crop.schema.ts",
                   "@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                   "@/app/pixel/features/smart-crop/components/crop-ratio-selector.tsx",
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx"]
imports:         ["@/app/pixel/features/smart-crop/components/smart-crop-panel",
                  "@/app/pixel/features/smart-crop/hooks/use-smart-crop",
                  "@/app/pixel/features/smart-crop/types/smart-crop.types"]
exports:         ["SmartCropPanel", "SmartCropPanelProps",
                  "useSmartCrop", "UseSmartCropReturn",
                  "SmartCropOutcome", "DEFAULT_SMART_CROP_OPTIONS"]
useBy:           ["@/app/pixel/optimize/smart-crop/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour smart-crop"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { SmartCropPanel } from "@/app/pixel/features/smart-crop/components/smart-crop-panel";
export type { SmartCropPanelProps } from "@/app/pixel/features/smart-crop/components/smart-crop-panel";
export { useSmartCrop } from "@/app/pixel/features/smart-crop/hooks/use-smart-crop";
export type { UseSmartCropReturn } from "@/app/pixel/features/smart-crop/hooks/use-smart-crop";
export type { SmartCropOutcome } from "@/app/pixel/features/smart-crop/types/smart-crop.types";
export { DEFAULT_SMART_CROP_OPTIONS } from "@/app/pixel/features/smart-crop/types/smart-crop.types";