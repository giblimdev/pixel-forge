/*
path :           app/genesis/components/WriteReport.tsx
tag :            ["genesis", "create-files", "report", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Affichage du rapport d'écriture dans une Dialog. Compteurs
                 (créés / écrasés / backupés / rejetés) en Badges, listes
                 détaillées repliables. Bouton Fermer → onClose. Aucune
                 logique métier : purement présentationnel.

flow:            Reçoit report (nullable) + open + onOpenChange → si report
                 : rend Dialog avec 4 sections (créés, écrasés, backupés,
                 rejetés) → Bouton Fermer.

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

relatedFiles:    ["@/app/genesis/lib/types.ts"]

imports:         ["@/app/genesis/lib/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog"]

exports:         ["WriteReport", "WriteReportProps"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le bilan de l'écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : Dialog (interaction ouverture/fermeture).

import type { WriteReport as WriteReportData } from "@/app/genesis/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface WriteReportProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly report: WriteReportData | null;
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export function WriteReport({ open, onOpenChange, report }: WriteReportProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bilan de l&apos;écriture</DialogTitle>
          <DialogDescription>
            {report
              ? `Traitement terminé. ${report.rejected.length === 0 ? "Aucun rejet." : `${report.rejected.length} rejet${report.rejected.length > 1 ? "s" : ""}.`}`
              : "Aucun rapport."}
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Counter
                label="Créés"
                value={report.created.length}
                tone="border-chart-2/40 bg-chart-2/5 text-chart-2"
              />
              <Counter
                label="Écrasés"
                value={report.overwritten.length}
                tone="border-chart-4/40 bg-chart-4/5 text-chart-4"
              />
              <Counter
                label="Backupés"
                value={report.backedUp.length}
                tone="border-chart-1/40 bg-chart-1/5 text-chart-1"
              />
              <Counter
                label="Rejetés"
                value={report.rejected.length}
                tone="border-destructive/40 bg-destructive/5 text-destructive"
              />
            </div>

            {report.created.length > 0 && (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Créés
                </h3>
                <ul className="space-y-0.5 text-sm">
                  {report.created.map((path) => (
                    <li key={path} className="truncate font-mono text-xs">
                      {path}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.overwritten.length > 0 && (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Écrasés
                </h3>
                <ul className="space-y-0.5 text-sm">
                  {report.overwritten.map((path) => (
                    <li key={path} className="truncate font-mono text-xs">
                      {path}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.backedUp.length > 0 && (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Backupés
                </h3>
                <ul className="space-y-0.5 text-sm">
                  {report.backedUp.map((path) => (
                    <li key={path} className="truncate font-mono text-xs">
                      {path}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.rejected.length > 0 && (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">
                  Rejetés
                </h3>
                <ul className="space-y-1 text-sm">
                  {report.rejected.map((r) => (
                    <li key={r.path} className="rounded border border-destructive/30 bg-destructive/5 p-2 text-xs">
                      <p className="truncate font-mono font-medium">{r.path}</p>
                      <p className="text-destructive/80">{r.reason}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
