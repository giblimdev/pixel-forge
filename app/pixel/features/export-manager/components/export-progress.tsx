/*
path:            app/pixel/features/export-manager/components/export-progress.tsx
tag:             ["pixel", "feature", "export-manager", "component", "progress"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Barre de progression pendant la construction du ZIP.
                 Utilise ProcessingProgress de feedback/. Affiche
                 "Construction du ZIP..." en indeterminate.

flow:            Props { running } -> si !running : null -> sinon
                 ProcessingProgress value={null}.

ecosystem:       ExportManager = [
                   "@/app/pixel/features/export-manager/types/export-manager.types.ts",
                   "@/app/pixel/features/export-manager/schemas/export-manager.schema.ts",
                   "@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "@/app/pixel/features/export-manager/components/export-options.tsx",
                   "@/app/pixel/features/export-manager/components/export-item.tsx",
                   "@/app/pixel/features/export-manager/components/export-progress.tsx",
                   "@/app/pixel/features/export-manager/components/export-manager.tsx",
                   "@/app/pixel/features/export-manager/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/components/feedback/processing-progress.tsx",
                  "@/app/pixel/features/export-manager/components/export-manager.tsx"]
imports:         ["@/app/pixel/components/feedback/processing-progress"]
exports:         ["ExportProgress", "ExportProgressProps"]
useBy:           ["@/app/pixel/features/export-manager/components/export-manager.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la progression du ZIP"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { ProcessingProgress } from "@/app/pixel/components/feedback/processing-progress";

export interface ExportProgressProps {
  readonly running: boolean;
}

export function ExportProgress({ running }: ExportProgressProps) {
  if (!running) return null;
  return <ProcessingProgress value={null} label="Construction du ZIP..." />;
}