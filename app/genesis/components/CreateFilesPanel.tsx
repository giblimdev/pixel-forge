/*
path :           app/genesis/components/CreateFilesPanel.tsx
tag :            ["genesis", "create-files", "panel", "orchestrator", "reports"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil CreateFiles. Gère la file locale
                 (state), l'ajout via ScriptInput, l'édition de path, le
                 retrait, le vidage, et l'écriture via writeScriptsAction.
                 Après écriture : sauvegarde AUTOMATIQUE du rapport dans
                 l'historique (via saveReportAction) et affichage d'un
                 toast (plus de Dialog systématique). Un bouton « Voir
                 les rapports » est toujours visible et mène à
                 /genesis/create-files/reports.

flow:            Reçoit existingPaths (Set) → useState(queue, isPending)
                 → ScriptInput(onAdd) → ScriptQueue → à l'écriture,
                 writeScriptsAction(queue) → succès : saveReportAction
                 (fire and forget) + toast + vide la file → erreur
                 globale : toast. Le rapport n'est plus affiché dans une
                 Dialog : il est persisté et consultable via le bouton.

ecosystem:       Genesis = [
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ReportsList.tsx",
                   "@/app/genesis/actions/reports.ts",
                 ]

relatedFiles:    ["@/app/genesis/actions/write-files.ts",
                  "@/app/genesis/actions/reports.ts",
                  "@/app/genesis/components/ScriptInput.tsx",
                  "@/app/genesis/components/ScriptQueue.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "next/navigation", "next/link",
                  "lucide-react", "sonner",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/write-files",
                  "@/app/genesis/actions/reports",
                  "@/app/genesis/components/ScriptInput",
                  "@/app/genesis/components/ScriptQueue",
                  "@/components/ui/button"]

exports:         ["CreateFilesPanel", "CreateFilesPanelProps"]

useBy:           ["@/app/genesis/create-files/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux coller plusieurs scripts et les écrire",
                  "*en tant qu'utilisateur je veux consulter l'historique des rapports"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileBarChart } from "lucide-react";
import { toast } from "sonner";

import type { ScriptEntry } from "@/app/genesis/lib/types";
import { writeScriptsAction } from "@/app/genesis/actions/write-files";
import { saveReportAction } from "@/app/genesis/actions/reports";
import { ScriptInput } from "@/app/genesis/components/ScriptInput";
import { ScriptQueue } from "@/app/genesis/components/ScriptQueue";
import { Button } from "@/components/ui/button";

export interface CreateFilesPanelProps {
  readonly existingPaths: readonly string[];
}

export function CreateFilesPanel({ existingPaths }: CreateFilesPanelProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<ScriptEntry[]>([]);
  const [isPending, startTransition] = useTransition();

  const existingSet = new Set(existingPaths);

  function handleAdd(path: string, content: string) {
    const entry: ScriptEntry = {
      id: crypto.randomUUID(),
      path,
      content,
    };
    setQueue((prev) => [...prev, entry]);
  }

  function handleChangePath(id: string, path: string) {
    setQueue((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, path } : entry)),
    );
  }

  function handleRemove(id: string) {
    setQueue((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleClear() {
    setQueue([]);
  }

  function handleWrite() {
    if (queue.length === 0) return;
    startTransition(async () => {
      const response = await writeScriptsAction(
        queue.map(({ path, content }) => ({ path, content })),
      );
      if (response.ok) {
        // Sauvegarde automatique du rapport (fire and forget).
        void saveReportAction(response.data);

        toast.success(
          `${response.data.created.length} créé(s) · ${response.data.overwritten.length} écrasé(s) · ${response.data.rejected.length} rejeté(s).`,
        );
        setQueue([]);
        router.refresh();
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/genesis/create-files/reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <FileBarChart className="size-4" aria-hidden />
          Voir les rapports
        </Link>
      </div>

      <ScriptInput onAdd={handleAdd} />

      <ScriptQueue
        queue={queue}
        existingPaths={existingSet}
        isPending={isPending}
        onChangePath={handleChangePath}
        onRemove={handleRemove}
        onWrite={handleWrite}
        onClear={handleClear}
      />
    </div>
  );
}