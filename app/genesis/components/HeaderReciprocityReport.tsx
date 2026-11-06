/*
path :           app/genesis/components/HeaderReciprocityReport.tsx
tag :            ["genesis", "check-headers", "reciprocity", "report", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Rapport de réciprocité : compteurs, liste des paires
                 incohérentes avec bouton « Voir le fichier » (ouvre
                 HeaderFileViewerDialog sur la source ou la cible),
                 liste des fichiers référencés introuvables.

flow:            Reçoit reciprocity → useState(viewerPath) → affiche
                 compteurs → liste des issues → bouton Voir (source /
                 cible) → HeaderFileViewerDialog.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderFileViewerDialog.tsx",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-types.ts",
                  "@/app/genesis/components/HeaderFileViewerDialog.tsx"]

imports:         ["react", "lucide-react",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/components/HeaderFileViewerDialog",
                  "@/components/ui/button"]

exports:         ["HeaderReciprocityReportView", "HeaderReciprocityReportViewProps"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les relations non réciproques"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import type { HeaderReciprocityReport } from "@/app/genesis/lib/header-types";
import { HeaderFileViewerDialog } from "@/app/genesis/components/HeaderFileViewerDialog";
import { Button } from "@/components/ui/button";

export interface HeaderReciprocityReportViewProps {
  readonly reciprocity: HeaderReciprocityReport;
}

export function HeaderReciprocityReportView({
  reciprocity,
}: HeaderReciprocityReportViewProps) {
  const [viewerPath, setViewerPath] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  function openViewer(path: string) {
    setViewerPath(path);
    setViewerOpen(true);
  }

  const totalIssues =
    reciprocity.issues.length + reciprocity.missingTargets.length;

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Réciprocité des relations
        </h3>
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span>{reciprocity.checkedPairs} paire(s) vérifiée(s)</span>
          <span>·</span>
          <span>{reciprocity.skippedPairs} ignorée(s)</span>
          <span>·</span>
          <span className={totalIssues > 0 ? "text-chart-3" : "text-chart-4"}>
            {totalIssues} anomalie(s)
          </span>
        </div>
      </header>

      {totalIssues === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Aucune anomalie de réciprocité détectée.
        </p>
      ) : (
        <ul className="space-y-2">
          {reciprocity.issues.map((issue, index) => (
            <li
              key={`${issue.sourcePath}-${issue.targetPath}-${index}`}
              className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-3"
            >
              <p className="text-xs leading-relaxed text-foreground">
                <code className="font-mono">{issue.sourcePath}</code>
                {". "}
                <span className="font-mono">{issue.sourceField}</span>
                {" référence "}
                <code className="font-mono">{issue.targetPath}</code>
                {", mais "}
                <code className="font-mono">{issue.targetPath}</code>
                {"."}
                <span className="font-mono">{issue.expectedField}</span>
                {" ne référence pas "}
                <code className="font-mono">{issue.sourcePath}</code>.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openViewer(issue.sourcePath)}
                >
                  <Eye className="size-3.5" aria-hidden />
                  Voir {issue.sourcePath.split("/").pop()}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openViewer(issue.targetPath)}
                >
                  <Eye className="size-3.5" aria-hidden />
                  Voir {issue.targetPath.split("/").pop()}
                </Button>
              </div>
            </li>
          ))}

          {reciprocity.missingTargets.map((missing, index) => (
            <li
              key={`missing-${missing.sourcePath}-${missing.targetPath}-${index}`}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-3"
            >
              <p className="text-xs leading-relaxed text-destructive">
                <code className="font-mono">{missing.sourcePath}</code>
                {". "}
                <span className="font-mono">{missing.sourceField}</span>
                {" référence "}
                <code className="font-mono">{missing.targetPath}</code>
                {" — fichier introuvable."}
              </p>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openViewer(missing.sourcePath)}
                >
                  <Eye className="size-3.5" aria-hidden />
                  Voir {missing.sourcePath.split("/").pop()}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <HeaderFileViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        path={viewerPath}
      />
    </section>
  );
}