/*
path :           app/genesis/components/ScriptQueue.tsx
tag :            ["genesis", "create-files", "queue", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            File d'attente des scripts. Affiche un compteur, la liste
                 des ScriptQueueItem, et les boutons Écrire / Vider. Le bouton
                 Écrire est désactivé si la file est vide ou si une écriture
                 est en cours. Aucun state local : tout remonte au parent.

flow:            Reçoit queue + existingPaths (Set) + isPending + 2 callbacks
                 (onChangePath, onRemove) + 2 handlers (onWrite, onClear) →
                 rend compteur + liste + boutons.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/components/ScriptQueueItem.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["lucide-react",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/components/ScriptQueueItem",
                  "@/components/ui/button"]

exports:         ["ScriptQueue", "ScriptQueueProps"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la file de scripts avant écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : boutons interactifs (Écrire, Vider, retirer).

import { Save, Trash2 } from "lucide-react";

import type { ScriptEntry } from "@/app/genesis/lib/types";
import { ScriptQueueItem } from "@/app/genesis/components/ScriptQueueItem";
import { Button } from "@/components/ui/button";

export interface ScriptQueueProps {
  readonly queue: readonly ScriptEntry[];
  readonly existingPaths: ReadonlySet<string>;
  readonly isPending: boolean;
  readonly onChangePath: (id: string, path: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onWrite: () => void;
  readonly onClear: () => void;
}

export function ScriptQueue({
  queue,
  existingPaths,
  isPending,
  onChangePath,
  onRemove,
  onWrite,
  onClear,
}: ScriptQueueProps) {
  if (queue.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Aucun script en attente. Colle un script ci-dessus et clique sur
        « Ajouter ».
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {queue.length} script{queue.length > 1 ? "s" : ""} en attente
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isPending}
          >
            <Trash2 className="size-4" aria-hidden />
            Vider la file
          </Button>
          <Button type="button" size="sm" onClick={onWrite} disabled={isPending}>
            <Save className="size-4" aria-hidden />
            {isPending ? "Écriture…" : "Écrire"}
          </Button>
        </div>
      </div>

      <ul className="space-y-2">
        {queue.map((entry) => (
          <ScriptQueueItem
            key={entry.id}
            entry={entry}
            existsInProject={existingPaths.has(entry.path)}
            onChangePath={onChangePath}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </div>
  );
}