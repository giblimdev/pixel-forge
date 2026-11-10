/*
path:            app/pixel/components/history/history-toolbar.tsx
tag:             ["pixel", "component", "history", "toolbar"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Barre d'actions de l'historique : compteur + bouton
                 "Vider l'historique" (avec confirmation via
                 window.confirm pour eviter les clics accidentels).

flow:            Props { count, onClear } -> rend un flex avec badge
                 + bouton. Au clic : window.confirm(...) puis onClear().

ecosystem:       History = [
                   "@/app/pixel/lib/history/local-history.ts",
                   "@/app/pixel/components/history/history-empty.tsx",
                   "@/app/pixel/components/history/history-list.tsx",
                   "@/app/pixel/components/history/history-toolbar.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/history/history-list.tsx",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/components/ui/button"]
exports:         ["HistoryToolbar", "HistoryToolbarProps"]
useBy:           ["@/app/pixel/components/history/history-list.tsx"]

userStories:     ["*en tant qu'utilisateur je veux pouvoir vider mon historique"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : bouton interactif + window.confirm.

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface HistoryToolbarProps {
  readonly count: number;
  readonly onClear: () => void;
  readonly className?: string;
}

export function HistoryToolbar({
  count,
  onClear,
  className,
}: HistoryToolbarProps) {
  function handleClear() {
    const confirmed = window.confirm(
      `Supprimer les ${count} entrées de l'historique ? Cette action est irréversible.`,
    );
    if (confirmed) onClear();
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${className ?? ""}`}
    >
      <p className="text-xs text-[var(--pf-muted)]">
        {count} traitement{count > 1 ? "s" : ""} enregistré
        {count > 1 ? "s" : ""} · stocké localement
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClear}
        className="gap-1.5 border-[var(--pf-border)]/60"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Vider l&apos;historique
      </Button>
    </div>
  );
}