/*
path:            app/pixel/features/background-removal/index.ts
tag:             ["pixel", "feature", "background-removal", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module background-removal.

flow:            Module TypeScript pur -> reexports.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx"]
imports:         ["@/app/pixel/features/background-removal/components/background-panel",
                  "@/app/pixel/features/background-removal/hooks/use-background-removal",
                  "@/app/pixel/features/background-removal/types/background.types"]
exports:         ["BackgroundPanel", "BackgroundPanelProps",
                  "useBackgroundRemoval", "UseBackgroundRemovalReturn",
                  "BackgroundRemovalOutcome", "DEFAULT_BACKGROUND_OPTIONS"]
useBy:           ["@/app/pixel/edit/background/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour background-removal"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { BackgroundPanel } from "@/app/pixel/features/background-removal/components/background-panel";
export type { BackgroundPanelProps } from "@/app/pixel/features/background-removal/components/background-panel";

export { useBackgroundRemoval } from "@/app/pixel/features/background-removal/hooks/use-background-removal";
export type { UseBackgroundRemovalReturn } from "@/app/pixel/features/background-removal/hooks/use-background-removal";

export type { BackgroundRemovalOutcome } from "@/app/pixel/features/background-removal/types/background.types";
export { DEFAULT_BACKGROUND_OPTIONS } from "@/app/pixel/features/background-removal/types/background.types";