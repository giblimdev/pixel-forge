/*
path :           app/genesis/components/ReportsList.tsx
tag :            ["genesis", "create-files", "reports", "list", "ui", "client"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des rapports d'écriture avec pagination, détail
                 (Dialog WriteReport existant), suppression individuelle
                 et vidage complet. Charge les 10 derniers par défaut,
                 bouton « Voir tout » pour charger les 50. Boutons
                 « Voir » et « Supprimer » par ligne, bouton « Tout
                 vider » en haut (avec confirmation).

flow:            Client Component → useState(reports, total, hasMore,
                 loading, detail) → useEffect (charge listReportsAction
                 au mount) → rend compteurs + boutons + liste → clic
                 « Voir » → charge getReportAction(id) → ouvre Dialog
                 WriteReport → clic « Supprimer » → deleteReportAction
                 → retire de la liste → clic « Tout vider » → confirm
                 → clearReportsAction → vide la liste.

ecosystem:       CreateFiles = [
                   "@/app/genesis/components/ReportsList.tsx",
                   "@/app/genesis/actions/reports.ts",
                 ]

relatedFiles:    ["@/app/genesis/actions/reports.ts",
                  "@/app/genesis/lib/report-types.ts",
                  "@/app/genesis/components/WriteReport.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/reports",
                  "@/app/genesis/lib/report-types",
                  "@/app/genesis/components/WriteReport",
                  "@/components/ui/button",
                  "@/components/ui/skeleton"]

exports:         ["ReportsList"]

useBy:           ["@/app/genesis/create-files/reports/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister, voir et nettoyer les rapports d'écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  clearReportsAction,
  deleteReportAction,
  getReportAction,
  listReportsAction,
} from "@/app/genesis/actions/reports";
import type { SavedReport } from "@/app/genesis/lib/report-types";
import { WriteReport } from "@/app/genesis/components/WriteReport";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportsList() {
  const [reports, setReports] = useState<readonly SavedReport[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState<SavedReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  async function load(limit: number) {
    setLoading(true);
    const res = await listReportsAction({ limit, offset: 0 });
    setLoading(false);
    if (res.ok) {
      setReports(res.data.reports);
      setTotal(res.data.total);
      setHasMore(res.data.hasMore);
    } else {
      toast.error(res.error);
    }
  }

  useEffect(() => {
    void load(PAGE_SIZE);
  }, []);

  function handleShowAll() {
    setShowAll(true);
    void load(50);
  }

  async function handleView(report: SavedReport) {
    const res = await getReportAction(report.id);
    if (res.ok) {
      setDetail(res.data);
      setDetailOpen(true);
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete(report: SavedReport) {
    const res = await deleteReportAction(report.id);
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Rapport supprimé.");
    } else {
      toast.error(res.error);
    }
  }

  async function handleClearAll() {
    if (!confirm("Supprimer TOUS les rapports ? Cette action est irréversible.")) {
      return;
    }
    const res = await clearReportsAction();
    if (res.ok) {
      setReports([]);
      setTotal(0);
      setHasMore(false);
      toast.success(`${res.data.deleted} rapport(s) supprimé(s).`);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Rapports d&apos;écriture
          </h2>
          <p className="text-sm text-muted-foreground">
            {total} rapport{total > 1 ? "s" : ""} ·{" "}
            {showAll ? "tous affichés" : `${Math.min(reports.length, PAGE_SIZE)} derniers`}
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          disabled={total === 0}
        >
          <Trash2 className="size-3.5" aria-hidden />
          Tout vider
        </Button>
      </header>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Aucun rapport pour l&apos;instant. Les rapports sont créés après
          chaque écriture depuis CreateFiles.
        </p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {formatDate(r.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.scriptCount} script{r.scriptCount > 1 ? "s" : ""} ·{" "}
                  {r.createdCount} créé{r.createdCount > 1 ? "s" : ""} ·{" "}
                  {r.overwrittenCount} écrasé{r.overwrittenCount > 1 ? "s" : ""} ·{" "}
                  {r.backedUpCount} backupé{r.backedUpCount > 1 ? "s" : ""} ·{" "}
                  {r.rejectedCount} rejeté{r.rejectedCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleView(r)}
                  title="Voir le détail"
                  aria-label="Voir le détail"
                >
                  <Eye className="size-3.5" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(r)}
                  title="Supprimer ce rapport"
                  aria-label="Supprimer ce rapport"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showAll && hasMore && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={handleShowAll}>
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : null}
            Voir tout ({total})
          </Button>
        </div>
      )}

      <WriteReport
        open={detailOpen}
        onOpenChange={setDetailOpen}
        report={detail?.report ?? null}
      />
    </div>
  );
}