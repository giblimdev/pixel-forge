/*
path :           app/genesis/components/CreateFilesPanel.tsx
tag :            ["genesis", "create-files", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil CreateFiles. Gère la file locale
                 (state), l'ajout via ScriptInput, l'édition de path, le retrait,
                 le vidage, et l'écriture via writeScriptsAction. Affiche le
                 rapport post-écriture dans une Dialog. Reçoit l'ensemble des
                 paths existants du projet pour afficher le badge Créer/Écraser.

flow:            Reçoit existingPaths (Set) → useState(queue, isPending, report,
                 reportOpen) → ScriptInput(onAdd) → ScriptQueue → à l'écriture,
                 writeScriptsAction(queue) → succès : setReport + open dialog +
                 vide la file (les scripts ont été traités ou rejetés) → erreur
                 globale : toast.

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

relatedFiles:    ["@/app/genesis/actions/write-files.ts",
                  "@/app/genesis/components/ScriptInput.tsx",
                  "@/app/genesis/components/ScriptQueue.tsx",
                  "@/app/genesis/components/WriteReport.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "next/navigation", "sonner",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/write-files",
                  "@/app/genesis/components/ScriptInput",
                  "@/app/genesis/components/ScriptQueue",
                  "@/app/genesis/components/WriteReport"]

exports:         ["CreateFilesPanel", "CreateFilesPanelProps"]

useBy:           ["@/app/genesis/create-files/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux coller plusieurs scripts et les écrire"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState, useTransition, router.refresh, toast.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ScriptEntry, WriteReport as WriteReportData } from "@/app/genesis/lib/types";
import { writeScriptsAction } from "@/app/genesis/actions/write-files";
import { ScriptInput } from "@/app/genesis/components/ScriptInput";
import { ScriptQueue } from "@/app/genesis/components/ScriptQueue";
import { WriteReport } from "@/app/genesis/components/WriteReport";

export interface CreateFilesPanelProps {
  /** Ensemble des paths existants dans le projet, pour le badge Créer/Écraser. */
  readonly existingPaths: readonly string[];
}

export function CreateFilesPanel({ existingPaths }: CreateFilesPanelProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<ScriptEntry[]>([]);
  const [report, setReport] = useState<WriteReportData | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Set mémoïsé côté client (les props ne changent qu'au refresh serveur).
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
        setReport(response.data);
        setReportOpen(true);
        setQueue([]);
        router.refresh();
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-6">
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

      <WriteReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        report={report}
      />
    </div>
  );
}