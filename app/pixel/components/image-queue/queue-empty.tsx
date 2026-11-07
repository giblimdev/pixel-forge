/*
path:            app/pixel/components/image-queue/queue-empty.tsx
tag:             ["pixel", "component", "queue", "empty"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Etat vide de la file : icone Inbox, titre, description.
                 Utilise EmptyState de feedback/ pour rester coherent avec
                 les autres etats vides de l'app.

flow:            Recoit { className? } -> rend EmptyState avec
                 icone Inbox + message.

ecosystem:       Queue = [
                   "@/app/pixel/components/image-queue/queue-item.tsx",
                   "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                   "@/app/pixel/components/image-queue/queue-progress.tsx",
                   "@/app/pixel/components/image-queue/queue-empty.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/feedback/empty-state.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/components/feedback/empty-state"]
exports:         ["QueueEmpty", "QueueEmptyProps"]
useBy:           ["@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un etat vide clair quand la file est vide"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { Inbox } from "lucide-react";

import { EmptyState } from "@/app/pixel/components/feedback/empty-state";

export interface QueueEmptyProps {
  readonly className?: string;
}

export function QueueEmpty({ className }: QueueEmptyProps) {
  return (
    <EmptyState
      icon={Inbox}
      title="Aucun fichier dans la file"
      description="Ajoutez des images via le glisser-deposer, le selecteur de fichiers ou Ctrl+V pour commencer."
      className={className}
    />
  );
}