/*
path :           app/genesis/components/HeaderCheckReport.tsx
tag :            ["genesis", "check-headers", "report", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Rapport de vérification : 5 compteurs en haut (ok,
                 missing, incomplete, invalid, skipped), boutons de
                 filtre par statut, liste scrollable de HeaderCheckRow,
                 bouton Copier (JSON du rapport). Contrôlé par le parent
                 via report (prop), aucun state métier local (seul le
                 filtre actif est local).

flow:            Reçoit report → useState(activeFilter: HeaderCheckStatus |
                 null) → compteurs → toggle filtres → liste filtrée →
                 bouton Copier → navigator.clipboard + toast.

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

relatedFiles:    ["@/app/genesis/components/HeaderCheckRow.tsx",
                  "@/app/genesis/lib/header-types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/components/HeaderCheckRow",
                  "@/components/ui/button"]

exports:         ["HeaderCheckReportView", "HeaderCheckReportViewProps"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux filtrer et exporter le rapport de conformité"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import type {
  HeaderCheckReport,
  HeaderCheckStatus,
} from "@/app/genesis/lib/header-types";
import { HeaderCheckRow } from "@/app/genesis/components/HeaderCheckRow";
import { Button } from "@/components/ui/button";

export interface HeaderCheckReportViewProps {
  readonly report: HeaderCheckReport;
}

const FILTERS: readonly {
  readonly status: HeaderCheckStatus;
  readonly label: string;
  readonly className: string;
}[] = [
  { status: "ok", label: "OK", className: "text-chart-4" },
  { status: "missing", label: "Manquants", className: "text-destructive" },
  { status: "incomplete", label: "Incomplets", className: "text-chart-3" },
  { status: "invalid", label: "Invalides", className: "text-chart-5" },
  { status: "skipped", label: "Ignorés", className: "text-muted-foreground" },
];

export function HeaderCheckReportView({ report }: HeaderCheckReportViewProps) {
  const [filter, setFilter] = useState<HeaderCheckStatus | null>(null);

  const filtered = useMemo(() => {
    if (!filter) return report.results;
    return report.results.filter((r) => r.status === filter);
  }, [report.results, filter]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      toast.success("Rapport copié dans le presse-papier.");
    } catch {
      toast.error("Impossible de copier le rapport.");
    }
  }

  return (
    <section className="space-y-4">
      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {FILTERS.map((f) => {
          const count = report.counts[f.status];
          const active = filter === f.status;
          return (
            <button
              key={f.status}
              type="button"
              onClick={() => setFilter(active ? null : f.status)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-foreground/40 bg-muted/40"
                  : "border-border/60 bg-card hover:bg-muted/20"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${f.className}`}>
                {f.label}
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {filter
            ? `${filtered.length} fichier${filtered.length > 1 ? "s" : ""} (filtre actif)`
            : `${report.counts.total} fichier${report.counts.total > 1 ? "s" : ""} analysé${report.counts.total > 1 ? "s" : ""}`}
        </p>
        <div className="flex gap-2">
          {filter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilter(null)}
            >
              Effacer le filtre
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="size-3.5" aria-hidden />
            Copier le rapport
          </Button>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Aucun fichier ne correspond à ce filtre.
        </p>
      ) : (
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {filtered.map((result) => (
            <HeaderCheckRow key={result.path} result={result} />
          ))}
        </ul>
      )}
    </section>
  );
}