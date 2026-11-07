/*
path:            app/pixel/components/image-queue/image-queue.tsx
tag:             ["pixel", "component", "queue", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de la file d'attente. Se connecte au
                 store Zustand via selecteurs, compose QueueToolbar,
                 QueueProgressBar, la liste de QueueItemRow et
                 QueueEmpty. Aucune logique metier : les actions sont
                 remontees par le store (remove, clear).

flow:            useImageQueueStore(selectItems) -> items ->
                 useImageQueueStore(selectTotal) -> total -> etc.
                 pour chaque item : QueueItemRow(item, onRemove=
                 remove(id)) -> si items vide : QueueEmpty.

ecosystem:       Queue = [
                   "@/app/pixel/components/image-queue/queue-item.tsx",
                   "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                   "@/app/pixel/components/image-queue/queue-progress.tsx",
                   "@/app/pixel/components/image-queue/queue-empty.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/queue.ts",
                  "@/app/pixel/components/image-queue/queue-item.tsx",
                  "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                  "@/app/pixel/components/image-queue/queue-progress.tsx",
                  "@/app/pixel/components/image-queue/queue-empty.tsx"]
imports:         ["@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/components/image-queue/queue-item",
                  "@/app/pixel/components/image-queue/queue-toolbar",
                  "@/app/pixel/components/image-queue/queue-progress",
                  "@/app/pixel/components/image-queue/queue-empty"]
exports:         ["ImageQueue", "ImageQueueProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir et gerer la file d'attente"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : lecture du store + boutons interactifs.

import {
  selectDone,
  selectFailed,
  selectItems,
  selectPending,
  selectProgress,
  selectTotal,
  useImageQueueStore,
} from "@/app/pixel/stores/image-queue.store";
import { QueueItemRow } from "@/app/pixel/components/image-queue/queue-item";
import { QueueToolbar } from "@/app/pixel/components/image-queue/queue-toolbar";
import { QueueProgressBar } from "@/app/pixel/components/image-queue/queue-progress";
import { QueueEmpty } from "@/app/pixel/components/image-queue/queue-empty";

export interface ImageQueueProps {
  readonly className?: string;
}

export function ImageQueue({ className }: ImageQueueProps) {
  const items = useImageQueueStore(selectItems);
  const total = useImageQueueStore(selectTotal);
  const done = useImageQueueStore(selectDone);
  const failed = useImageQueueStore(selectFailed);
  const pending = useImageQueueStore(selectPending);
  const progress = useImageQueueStore(selectProgress);
  const remove = useImageQueueStore((s) => s.remove);
  const clear = useImageQueueStore((s) => s.clear);

  return (
    <section
      aria-label="File d'attente"
      className={`space-y-3 ${className ?? ""}`}
    >
      <QueueToolbar
        total={total}
        done={done}
        failed={failed}
        pending={pending}
        onClear={clear}
      />

      <QueueProgressBar progress={progress} />

      {items.length === 0 ? (
        <QueueEmpty />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <QueueItemRow
              key={item.source.id}
              item={item}
              onRemove={() => remove(item.source.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}