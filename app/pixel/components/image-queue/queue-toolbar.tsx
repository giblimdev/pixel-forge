/*
path:            app/pixel/components/image-queue/queue-toolbar.tsx
tag:             ["pixel", "component", "queue", "toolbar"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Barre d'actions de la file : compteurs (total, done,
                 failed, pending), bouton "Vider la file" (desactive si
                 vide). Controlee par le parent : onClear remonte au
                 store via ImageQueue.

flow:            Recoit { total, done, failed, pending, onClear,
                 className? } -> rend un flex avec badges + bouton.

ecosystem:       Queue = [
                   "@/app/pixel/components/image-queue/queue-item.tsx",
                   "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                   "@/app/pixel/components/image-queue/queue-progress.tsx",
                   "@/app/pixel/components/image-queue/queue-empty.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["lucide-react",
                  "@/components/ui/button"]
exports:         ["QueueToolbar", "QueueToolbarProps"]
useBy:           ["@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les compteurs et pouvoir vider la file"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : bouton interactif (onClear).

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface QueueToolbarProps {
  readonly total: number;
  readonly done: number;
  readonly failed: number;
  readonly pending: number;
  readonly onClear: () => void;
  readonly className?: string;
}

export function QueueToolbar({
  total,
  done,
  failed,
  pending,
  onClear,
  className,
}: QueueToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-[var(--pf-surface-hover)]/60 px-2 py-0.5 font-mono text-[var(--pf-muted)]">
          {total} total
        </span>
        <span className="rounded-full bg-[var(--pf-success)]/15 px-2 py-0.5 font-mono text-[var(--pf-success)]">
          {done} termines
        </span>
        <span className="rounded-full bg-[var(--pf-warning)]/15 px-2 py-0.5 font-mono text-[var(--pf-warning)]">
          {pending} en attente
        </span>
        {failed > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-destructive">
            {failed} en erreur
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={total === 0}
        className="gap-1.5 border-[var(--pf-border)]/60"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Vider la file
      </Button>
    </div>
  );
}