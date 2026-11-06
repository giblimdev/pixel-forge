/*
path :           app/genesis/components/ReadFilesPanel.tsx
tag :            ["genesis", "read-files", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil SelectFiles. Reçoit l'arbre et les
                 exclusions initiales du serveur, gère la sélection courante,
                 ouvre la dialog d'exclusions et celle de résultat. Au clic sur
                 "Générer le JSON", appelle readSelectedFilesAction puis ouvre
                 ResultDialog. Aucune logique métier : délègue tout aux actions
                 et aux sous-composants.

flow:            Reçoit tree + exclusions → useState (exclusionsOpen,
                 selectedPaths, result, resultOpen, isPending) →
                 FileTree + ExclusionsDialog + bouton Générer → à chaque
                 changement de sélection, bouton actif/désactivé → Générer →
                 readSelectedFilesAction → si ok : setResult + open dialog →
                 si erreur : toast.

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

relatedFiles:    ["@/app/genesis/components/FileTree.tsx",
                  "@/app/genesis/components/ExclusionsDialog.tsx",
                  "@/app/genesis/components/ResultDialog.tsx",
                  "@/app/genesis/actions/read-files.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/read-files",
                  "@/app/genesis/components/FileTree",
                  "@/app/genesis/components/ExclusionsDialog",
                  "@/app/genesis/components/ResultDialog",
                  "@/components/ui/button"]

exports:         ["ReadFilesPanel", "ReadFilesPanelProps"]

useBy:           ["@/app/genesis/read-files/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux sélectionner des fichiers et générer le JSON"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState, useTransition, router.refresh, toast.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileJson } from "lucide-react";
import { toast } from "sonner";

import type { FileNode, ReadFilesResult } from "@/app/genesis/lib/types";
import { readSelectedFilesAction } from "@/app/genesis/actions/read-files";
import { FileTree } from "@/app/genesis/components/FileTree";
import { ExclusionsDialog } from "@/app/genesis/components/ExclusionsDialog";
import { ResultDialog } from "@/app/genesis/components/ResultDialog";
import { Button } from "@/components/ui/button";

export interface ReadFilesPanelProps {
  readonly tree: readonly FileNode[];
  readonly exclusions: readonly string[];
}

export function ReadFilesPanel({ tree, exclusions }: ReadFilesPanelProps) {
  const router = useRouter();
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<readonly string[]>([]);
  const [result, setResult] = useState<ReadFilesResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (selectedPaths.length === 0) return;
    startTransition(async () => {
      const response = await readSelectedFilesAction(selectedPaths);
      if (response.ok) {
        setResult(response.data);
        setResultOpen(true);
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <FileTree
        tree={tree}
        onSelectionChange={setSelectedPaths}
        onOpenExclusions={() => setExclusionsOpen(true)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selectedPaths.length === 0
            ? "Coche des fichiers ou dossiers pour générer un JSON."
            : `${selectedPaths.length} fichier${selectedPaths.length > 1 ? "s" : ""} prêt${selectedPaths.length > 1 ? "s" : ""} à être lu${selectedPaths.length > 1 ? "s" : ""}.`}
        </p>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={selectedPaths.length === 0 || isPending}
        >
          <FileJson className="size-4" aria-hidden />
          {isPending ? "Lecture…" : "Générer le JSON"}
        </Button>
      </div>

      <ExclusionsDialog
        open={exclusionsOpen}
        onOpenChange={setExclusionsOpen}
        exclusions={exclusions}
        onSaved={() => {
          // La page est revalidée côté serveur (setExclusionsAction) :
          // router.refresh() force le re-render pour récupérer le nouvel arbre.
          router.refresh();
        }}
      />

      <ResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        result={result}
      />
    </div>
  );
}