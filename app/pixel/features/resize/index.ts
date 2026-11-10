/*
path:            app/pixel/features/resize/index.ts
tag:             ["pixel", "feature", "resize", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module resize.

flow:            Module TypeScript pur -> reexports.

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/types/resize.types.ts",
                   "@/app/pixel/features/resize/schemas/resize.schema.ts",
                   "@/app/pixel/features/resize/hooks/use-resize.ts",
                   "@/app/pixel/features/resize/components/dimensions-input.tsx",
                   "@/app/pixel/features/resize/components/aspect-ratio-control.tsx",
                   "@/app/pixel/features/resize/components/resize-presets.tsx",
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/resize/components/resize-panel.tsx"]
imports:         ["@/app/pixel/features/resize/components/resize-panel",
                  "@/app/pixel/features/resize/hooks/use-resize",
                  "@/app/pixel/features/resize/types/resize.types"]
exports:         ["ResizePanel", "ResizePanelProps",
                  "useResize", "UseResizeReturn",
                  "ResizeOutcome", "DEFAULT_RESIZE_OPTIONS"]
useBy:           ["@/app/pixel/optimize/resize/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour resize"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { ResizePanel } from "@/app/pixel/features/resize/components/resize-panel";
export type { ResizePanelProps } from "@/app/pixel/features/resize/components/resize-panel";
export { useResize } from "@/app/pixel/features/resize/hooks/use-resize";
export type { UseResizeReturn } from "@/app/pixel/features/resize/hooks/use-resize";
export type { ResizeOutcome } from "@/app/pixel/features/resize/types/resize.types";
export { DEFAULT_RESIZE_OPTIONS } from "@/app/pixel/features/resize/types/resize.types";