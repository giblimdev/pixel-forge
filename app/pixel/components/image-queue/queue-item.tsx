/*
path:            app/pixel/components/image-queue/queue-item.tsx
tag:             ["pixel", "component", "queue", "item"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Ligne de la file d'attente. Affiche :
                 - miniature (via image-thumbnail ou URL blob directe)
                 - nom + taille + dimensions si dispo
                 - statut (badge) + progression si running
                 - actions (retirer)
                 Controle par le parent via props, aucun state local.

flow:            Recoit { item, onRemove } -> rend un flex avec
                 thumbnail + infos + badge + bouton retirer.

ecosystem:       Queue = [
                   "@/app/pixel/components/image-queue/queue-item.tsx",
                   "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                   "@/app/pixel/components/image-queue/queue-progress.tsx",
                   "@/app/pixel/components/image-queue/queue-empty.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/types/queue.ts",
                  "@/app/pixel/components/feedback/processing-status.tsx",
                  "@/app/pixel/components/feedback/processing-progress.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/types/queue",
                  "@/app/pixel/components/feedback/processing-status",
                  "@/app/pixel/components/feedback/processing-progress",
                  "@/components/ui/button"]
exports:         ["QueueItemRow", "QueueItemRowProps"]
useBy:           ["@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir chaque fichier de la file avec son statut"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : bouton retirer + interaction.

import { X } from "lucide-react";

import type { QueueItem } from "@/app/pixel/types/queue";
import { ProcessingStatusBadge } from "@/app/pixel/components/feedback/processing-status";
import { ProcessingProgress } from "@/app/pixel/components/feedback/processing-progress";
import { Button } from "@/components/ui/button";

export interface QueueItemRowProps {
  readonly item: QueueItem;
  readonly onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function QueueItemRow({ item, onRemove }: QueueItemRowProps) {
  const dims = item.source.dimensions;

  return (
    <li className="space-y-2 rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3">
      <div className="flex items-center gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[var(--pf-surface-hover)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.source.url}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
            {item.source.filename}
          </p>
          <p className="font-mono text-[10px] text-[var(--pf-muted)]">
            {formatSize(item.source.sizeBytes)}
            {dims && ` · ${dims.width}x${dims.height}`}
          </p>
        </div>
        <ProcessingStatusBadge status={item.status} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Retirer ${item.source.filename}`}
          className="shrink-0 text-[var(--pf-muted)] hover:text-destructive"
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>

      {item.status === "running" && (
        <ProcessingProgress value={item.progress} label="Traitement" />
      )}

      {item.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive"
        >
          {item.error.code} : {item.error.message}
        </p>
      )}
    </li>
  );
}