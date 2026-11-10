/*
path:            app/pixel/components/image-queue/image-queue.tsx
tag:             ["pixel", "component", "queue", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de la file d'attente. Se connecte au
                 store Zustand via un SELECTEUR GROUPE stabilise par
                 useShallow (zustand/react/shallow) pour eviter les
                 re-renders infinis. React compare Object.is(prev, next)
                 pour decider d'un re-render : certains selecteurs
                 comme selectProgress creent un nouvel objet a chaque
                 appel, ce qui provoquerait une boucle infinie sans
                 useShallow. Compose QueueToolbar, QueueProgressBar, la
                 liste de QueueItemRow et QueueEmpty.

                 CRITIQUE : "use client" + useShallow + selecteur unique.
                 Sans ces trois elements, React leve
                 "getServerSnapshot should be cached to avoid an infinite
                 loop" parce que le composant est evalue cote serveur
                 avec un snapshot dont la reference change a chaque appel.

                 La valeur `progress` est MEMOISEE via un objet retourne
                 dans useShallow : quand les champs internes ne changent
                 pas, useShallow retourne le meme objet → React considere
                 le snapshot stable → pas de boucle.

flow:            useImageQueueStore(useShallow((s) => ({ items, total,
                 done, failed, pending, progress, remove, clear }))) ->
                 un seul render par changement reel -> rend QueueToolbar
                 + QueueProgressBar + liste (ou QueueEmpty si vide).

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
imports:         ["zustand/react/shallow",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/components/image-queue/queue-item",
                  "@/app/pixel/components/image-queue/queue-toolbar",
                  "@/app/pixel/components/image-queue/queue-progress",
                  "@/app/pixel/components/image-queue/queue-empty"]
exports:         ["ImageQueue", "ImageQueueProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir et gerer la file d'attente"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : lecture du store + boutons interactifs.

import { useShallow } from "zustand/react/shallow";

import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { QueueItemRow } from "@/app/pixel/components/image-queue/queue-item";
import { QueueToolbar } from "@/app/pixel/components/image-queue/queue-toolbar";
import { QueueProgressBar } from "@/app/pixel/components/image-queue/queue-progress";
import { QueueEmpty } from "@/app/pixel/components/image-queue/queue-empty";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ImageQueueProps {
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function ImageQueue({ className }: ImageQueueProps) {
  // Un SEUL appel au store, stabilise par useShallow : compare les
  // proprietes une a une au lieu de comparer les references. Empeche
  // les boucles infinies dues aux selecteurs qui creent un objet
  // (progress) et garantit un comportement correct au SSR.
  const state = useImageQueueStore(
    useShallow((s) => {
      const total = s.items.length;
      const done = s.items.filter((i) => i.status === "success").length;
      const failed = s.items.filter((i) => i.status === "error").length;
      const pending = s.items.filter((i) => i.status === "pending").length;
      const completed = done + failed;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        items: s.items,
        total,
        done,
        failed,
        pending,
        // On retourne des PRIMITIVES, pas un objet imbrique.
        // useShallow compare les champs un par un : si tous les
        // primitives sont egales, il retourne le meme objet.
        completed,
        percent,
        isComplete: total > 0 && completed === total,
        remove: s.remove,
        clear: s.clear,
      };
    }),
  );

  // Reconstitue l'objet progress cote composant (stable car les
  // primitives ne changent que si necessaire).
  const progress = {
    completed: state.completed,
    total: state.total,
    percent: state.percent,
    isComplete: state.isComplete,
  };

  return (
    <section
      aria-label="File d'attente"
      className={`space-y-3 ${className ?? ""}`}
    >
      <QueueToolbar
        total={state.total}
        done={state.done}
        failed={state.failed}
        pending={state.pending}
        onClear={state.clear}
      />

      <QueueProgressBar progress={progress} />

      {state.items.length === 0 ? (
        <QueueEmpty />
      ) : (
        <ul className="space-y-2">
          {state.items.map((item) => (
            <QueueItemRow
              key={item.source.id}
              item={item}
              onRemove={() => state.remove(item.source.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
