/*
path:            app/pixel/features/image-editor/index.ts
tag:             ["pixel", "feature", "image-editor", "index"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            API publique du module image-editor.

flow:            Module TypeScript pur -> reexports.

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/types/image-editor.types.ts",
                   "@/app/pixel/features/image-editor/schemas/image-editor.schema.ts",
                   "@/app/pixel/features/image-editor/hooks/use-image-editor.ts",
                   "@/app/pixel/features/image-editor/components/adjustment-controls.tsx",
                   "@/app/pixel/features/image-editor/components/watermark-editor.tsx",
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx"]
imports:         ["@/app/pixel/features/image-editor/components/image-editor-panel",
                  "@/app/pixel/features/image-editor/hooks/use-image-editor",
                  "@/app/pixel/features/image-editor/types/image-editor.types"]
exports:         ["ImageEditorPanel", "ImageEditorPanelProps",
                  "useImageEditor", "UseImageEditorReturn",
                  "ImageEditorOutcome", "DEFAULT_IMAGE_EDITOR_OPTIONS"]
useBy:           ["@/app/pixel/edit/retouch/page.tsx"]

userStories:     ["*en tant que developpeur je veux une API publique unique pour image-editor"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export { ImageEditorPanel } from "@/app/pixel/features/image-editor/components/image-editor-panel";
export type { ImageEditorPanelProps } from "@/app/pixel/features/image-editor/components/image-editor-panel";

export { useImageEditor } from "@/app/pixel/features/image-editor/hooks/use-image-editor";
export type { UseImageEditorReturn } from "@/app/pixel/features/image-editor/hooks/use-image-editor";

export type { ImageEditorOutcome } from "@/app/pixel/features/image-editor/types/image-editor.types";
export { DEFAULT_IMAGE_EDITOR_OPTIONS } from "@/app/pixel/features/image-editor/types/image-editor.types";