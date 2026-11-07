/*
path:            app/pixel/components/image-queue/queue-progress.tsx
tag:             ["pixel", "component", "queue", "progress"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Barre de progression globale de la file (0-100 %).
                 Utilise ProcessingProgress de feedback/. Affiche
                 "X / Y" et un libelle "Progression globale". Ne rend
                 rien si total === 0.

flow:            Recoit { progress: QueueProgress, className? } ->
                 si total === 0 : null -> sinon ProcessingProgress
                 avec label "X / Y".

ecosystem:       Queue = [
                   "@/app/pixel/components/image-queue/queue-item.tsx",
                   "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                   "@/app/pixel/components/image-queue/queue-progress.tsx",
                   "@/app/pixel/components/image-queue/queue-empty.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/types/queue.ts",
                  "@/app/pixel/components/feedback/processing-progress.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["@/app/pixel/types/queue",
                  "@/app/pixel/components/feedback/processing-progress"]
exports:         ["QueueProgressBar", "QueueProgressBarProps"]
useBy:           ["@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la progression globale de la file"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { QueueProgress } from "@/app/pixel/types/queue";
import { ProcessingProgress } from "@/app/pixel/components/feedback/processing-progress";

export interface QueueProgressBarProps {
  readonly progress: QueueProgress;
  readonly className?: string;
}

export function QueueProgressBar({
  progress,
  className,
}: QueueProgressBarProps) {
  if (progress.total === 0) return null;

  return (
    <ProcessingProgress
      value={progress.percent}
      label={`${progress.completed} / ${progress.total}`}
      className={className}
    />
  );
}