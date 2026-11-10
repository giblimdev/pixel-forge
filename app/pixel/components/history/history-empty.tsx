/*
path:            app/pixel/components/history/history-empty.tsx
tag:             ["pixel", "component", "history", "empty"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Etat vide de l'historique. Reutilise EmptyState de
                 feedback/ pour la coherence visuelle.

flow:            Recoit { className? } -> rend EmptyState avec
                 icone Clock + message.

ecosystem:       History = [
                   "@/app/pixel/lib/history/local-history.ts",
                   "@/app/pixel/components/history/history-empty.tsx",
                   "@/app/pixel/components/history/history-list.tsx",
                   "@/app/pixel/components/history/history-toolbar.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/feedback/empty-state.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/components/feedback/empty-state"]
exports:         ["HistoryEmpty", "HistoryEmptyProps"]
useBy:           ["@/app/pixel/components/history/history-list.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un etat vide clair quand je n'ai pas encore de traitements"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Clock } from "lucide-react";

import { EmptyState } from "@/app/pixel/components/feedback/empty-state";

export interface HistoryEmptyProps {
  readonly className?: string;
}

export function HistoryEmpty({ className }: HistoryEmptyProps) {
  return (
    <EmptyState
      icon={Clock}
      title="Aucun traitement pour l'instant"
      description="Vos derniers traitements apparaîtront ici. L'historique est stocké localement (localStorage) et ne quitte jamais votre navigateur."
      className={className}
    />
  );
}