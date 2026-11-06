/*
path :           app/genesis/components/HeaderCheckPanel.tsx
tag :            ["genesis", "check-headers", "panel", "orchestrator", "reciprocity"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil check-headers. Reprend le
                 pattern de ReadFilesPanel : arbre cochable via FileTree,
                 dialog d'exclusions dédiée, bouton « Vérifier les
                 en-têtes » qui envoie UNIQUEMENT les fichiers cochés à
                 checkHeadersAction (qui retourne aussi la réciprocité
                 calculée globalement). Affiche le rapport de base puis
                 le rapport de réciprocité ACTIONNABLE (chaque anomalie
                 a 2 boutons : « Copier les deux fichiers » +
                 « Copier le message »). Le composant passe `report` ET
                 `reciprocity` à HeaderReciprocityReportView (les deux
                 sont requis pour accéder aux contenus des fichiers).

flow:            Reçoit tree + exclusions → useState(exclusionsOpen,
                 selectedPaths, report, reciprocity) → FileTree +
                 HeaderExclusionsDialog + bouton Vérifier → à chaque
                 changement de sélection → Vérifier → checkHeadersAction
                 (selectedPaths) → setReport + setReciprocity →
                 HeaderCheckReportView + HeaderReciprocityReportView
                 (reciprocity + report).

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/FileTree.tsx",
                  "@/app/genesis/components/HeaderCheckReport.tsx",
                  "@/app/genesis/components/HeaderReciprocityReport.tsx",
                  "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/header-check",
                  "@/app/genesis/components/FileTree",
                  "@/app/genesis/components/HeaderCheckReport",
                  "@/app/genesis/components/HeaderReciprocityReport",
                  "@/app/genesis/components/HeaderExclusionsDialog",
                  "@/components/ui/button"]

exports:         ["HeaderCheckPanel", "HeaderCheckPanelProps"]

useBy:           ["@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux sélectionner les fichiers à scanner et copier les fichiers incriminés"]

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

import type {
  HeaderCheckReport,
  HeaderReciprocityReport,
} from "@/app/genesis/lib/header-types";
import type { FileNode } from "@/app/genesis/lib/types";
import { checkHeadersAction } from "@/app/genesis/actions/header-check";
import { FileTree } from "@/app/genesis/components/FileTree";
import { HeaderCheckReportView } from "@/app/genesis/components/HeaderCheckReport";
import { HeaderReciprocityReportView } from "@/app/genesis/components/HeaderReciprocityReport";
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
  const [reciprocity, setReciprocity] =
    useState<HeaderReciprocityReport | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheck() {
    if (selectedPaths.length === 0) return;
    startTransition(async () => {
      const response = await checkHeadersAction(selectedPaths);
      if (response.ok) {
        setReport(response.data.report);
        setReciprocity(response.data.reciprocity);
        toast.success(
          `${response.data.report.counts.total} fichier(s) analysé(s).`,
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
            : `${selectedPaths.length} fichier(s) prêt(s) à être vérifié(s).`}
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
      {reciprocity && report && (
        <HeaderReciprocityReportView
          reciprocity={reciprocity}
          report={report}
        />
      )}

      <HeaderExclusionsDialog
        open={exclusionsOpen}
        onOpenChange={setExclusionsOpen}
        exclusions={exclusions}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}