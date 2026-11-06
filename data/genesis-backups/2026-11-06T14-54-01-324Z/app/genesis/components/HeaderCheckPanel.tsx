/*
path :           app/genesis/components/HeaderCheckPanel.tsx
tag :            ["genesis", "check-headers", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil check-headers. Reprend le
                 pattern de ReadFilesPanel : arbre cochable via FileTree
                 (existant), dialog d'exclusions dédiée, bouton
                 « Vérifier les en-têtes » qui envoie UNIQUEMENT les
                 fichiers cochés à checkHeadersAction. Affiche le rapport
                 via HeaderCheckReportView. L'utilisateur choisit
                 précisément ce qu'il veut scanner.

flow:            Reçoit tree + exclusions → useState(exclusionsOpen,
                 selectedPaths, report) → FileTree + HeaderExclusionsDialog
                 + bouton Vérifier → à chaque changement de sélection,
                 bouton actif/désactivé → Vérifier → checkHeadersAction
                 (selectedPaths) → setReport → HeaderCheckReportView.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/FileTree.tsx",
                  "@/app/genesis/components/HeaderCheckReport.tsx",
                  "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/header-check",
                  "@/app/genesis/components/FileTree",
                  "@/app/genesis/components/HeaderCheckReport",
                  "@/app/genesis/components/HeaderExclusionsDialog",
                  "@/components/ui/button"]

exports:         ["HeaderCheckPanel", "HeaderCheckPanelProps"]

useBy:           ["@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux sélectionner les fichiers à scanner"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { toast } from "sonner";

import type { HeaderCheckReport } from "@/app/genesis/lib/header-types";
import type { FileNode } from "@/app/genesis/lib/types";
import { checkHeadersAction } from "@/app/genesis/actions/header-check";
import { FileTree } from "@/app/genesis/components/FileTree";
import { HeaderCheckReportView } from "@/app/genesis/components/HeaderCheckReport";
import { HeaderExclusionsDialog } from "@/app/genesis/components/HeaderExclusionsDialog";
import { Button } from "@/components/ui/button";

export interface HeaderCheckPanelProps {
  readonly tree: readonly FileNode[];
  readonly exclusions: readonly string[];
}

export function HeaderCheckPanel({ tree, exclusions }: HeaderCheckPanelProps) {
  const router = useRouter();
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<readonly string[]>([]);
  const [report, setReport] = useState<HeaderCheckReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheck() {
    if (selectedPaths.length === 0) return;
    startTransition(async () => {
      const response = await checkHeadersAction(selectedPaths);
      if (response.ok) {
        setReport(response.data);
        toast.success(
          `${response.data.counts.total} fichier${response.data.counts.total > 1 ? "s" : ""} analysé${response.data.counts.total > 1 ? "s" : ""}.`,
        );
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
            ? "Coche des fichiers ou dossiers pour lancer la vérification."
            : `${selectedPaths.length} fichier${selectedPaths.length > 1 ? "s" : ""} prêt${selectedPaths.length > 1 ? "s" : ""} à être vérifié${selectedPaths.length > 1 ? "s" : ""}.`}
        </p>
        <Button
          type="button"
          onClick={handleCheck}
          disabled={selectedPaths.length === 0 || isPending}
        >
          <FileCheck2 className="size-4" aria-hidden />
          {isPending ? "Vérification…" : "Vérifier les en-têtes"}
        </Button>
      </div>

      {report && <HeaderCheckReportView report={report} />}

      <HeaderExclusionsDialog
        open={exclusionsOpen}
        onOpenChange={setExclusionsOpen}
        exclusions={exclusions}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}