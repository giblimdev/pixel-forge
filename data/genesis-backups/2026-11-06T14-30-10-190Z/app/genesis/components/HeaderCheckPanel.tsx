/*
path :           app/genesis/components/HeaderCheckPanel.tsx
tag :            ["genesis", "check-headers", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil check-headers. Reçoit l'arbre
                 et les exclusions du serveur, filtre l'arbre via
                 filterExcluded (existant), expose les boutons
                 « Vérifier » et « Exclusions », ouvre la dialog adaptée,
                 affiche le rapport via HeaderCheckReportView.

flow:            Reçoit tree + exclusions → useState(exclusionsOpen,
                 report, isPending) + useTransition → filtre l'arbre via
                 filterExcluded(exclusions) → collecte les paths
                 (fichiers uniquement) → bouton Vérifier → checkHeadersAction
                 → setReport → bouton Exclusions → HeaderExclusionsDialog
                 → onSaved → router.refresh().

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
                  "@/app/genesis/components/HeaderCheckReport.tsx",
                  "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                  "@/app/genesis/lib/exclusions.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/exclusions",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/header-check",
                  "@/app/genesis/components/HeaderCheckReport",
                  "@/app/genesis/components/HeaderExclusionsDialog",
                  "@/components/ui/button"]

exports:         ["HeaderCheckPanel", "HeaderCheckPanelProps"]

useBy:           ["@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lancer la vérification et gérer les exclusions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, Settings2 } from "lucide-react";
import { toast } from "sonner";

import type { HeaderCheckReport } from "@/app/genesis/lib/header-types";
import { filterExcluded } from "@/app/genesis/lib/exclusions";
import type { FileNode } from "@/app/genesis/lib/types";
import { checkHeadersAction } from "@/app/genesis/actions/header-check";
import { HeaderCheckReportView } from "@/app/genesis/components/HeaderCheckReport";
import { HeaderExclusionsDialog } from "@/app/genesis/components/HeaderExclusionsDialog";
import { Button } from "@/components/ui/button";

export interface HeaderCheckPanelProps {
  readonly tree: readonly FileNode[];
  readonly exclusions: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function collectFilePaths(nodes: readonly FileNode[]): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.isDir && node.children) {
      result.push(...collectFilePaths(node.children));
    } else if (!node.isDir) {
      result.push(node.path);
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function HeaderCheckPanel({ tree, exclusions }: HeaderCheckPanelProps) {
  const router = useRouter();
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [report, setReport] = useState<HeaderCheckReport | null>(null);
  const [isPending, startTransition] = useTransition();

  const candidatePaths = useMemo(
    () => collectFilePaths(filterExcluded(tree, exclusions)),
    [tree, exclusions],
  );

  function handleCheck() {
    if (candidatePaths.length === 0) return;
    startTransition(async () => {
      const response = await checkHeadersAction(candidatePaths);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {candidatePaths.length === 0
            ? "Aucun fichier à vérifier (toutes les entrées sont exclues)."
            : `${candidatePaths.length} fichier${candidatePaths.length > 1 ? "s" : ""} à vérifier.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExclusionsOpen(true)}
          >
            <Settings2 className="size-4" aria-hidden />
            Exclusions
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCheck}
            disabled={candidatePaths.length === 0 || isPending}
          >
            <FileCheck2 className="size-4" aria-hidden />
            {isPending ? "Vérification…" : "Vérifier les en-têtes"}
          </Button>
        </div>
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