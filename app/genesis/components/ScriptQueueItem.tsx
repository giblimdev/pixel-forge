/*
path :           app/genesis/components/ScriptQueueItem.tsx
tag :            ["genesis", "create-files", "queue", "item", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Ligne de la file de scripts. Affiche un Input éditable pour
                 le path, un Badge pour l'action (créer / écraser), la taille
                 en octets et un bouton Retirer. Contrôlée par le parent :
                 aucun state local, tous les changements remontent par callbacks.

flow:            Reçoit entry + existsInProject + 2 callbacks → rend une ligne
                 avec Input path (onChange → onChangePath), Badge calculé
                 (existsInProject ? "Écraser" : "Créer"), taille, bouton Retirer.

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

relatedFiles:    ["@/app/genesis/components/ScriptQueue.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["lucide-react",
                  "@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/input"]

exports:         ["ScriptQueueItem", "ScriptQueueItemProps"]

useBy:           ["@/app/genesis/components/ScriptQueue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer le path d'un script avant écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : Input contrôlé (onChange), bouton Retirer.

import { Trash2 } from "lucide-react";

import type { ScriptEntry } from "@/app/genesis/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ScriptQueueItemProps {
  readonly entry: ScriptEntry;
  readonly existsInProject: boolean;
  readonly onChangePath: (id: string, path: string) => void;
  readonly onRemove: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ScriptQueueItem({
  entry,
  existsInProject,
  onChangePath,
  onRemove,
}: ScriptQueueItemProps) {
  const bytes = new TextEncoder().encode(entry.content).byteLength;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Input
          value={entry.path}
          onChange={(event) => onChangePath(entry.id, event.target.value)}
          spellCheck={false}
          aria-label={`Path du script ${entry.id}`}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
            existsInProject
              ? "bg-destructive/10 text-destructive"
              : "bg-chart-2/10 text-chart-2"
          }`}
        >
          {existsInProject ? "Écraser" : "Créer"}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatBytes(bytes)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(entry.id)}
          aria-label={`Retirer le script ${entry.path}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>
    </li>
  );
}