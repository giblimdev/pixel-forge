/*
path :           app/genesis/lib/report-types.ts
tag :            ["genesis", "create-files", "reports", "types", "helper"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Types partagés pour l'historique des rapports d'écriture.
                 SavedReport = un WriteReport persisté sur disque avec
                 métadonnées (id, createdAt, compteurs). Aucune dépendance
                 runtime, aucun effet.

flow:            Module TypeScript pur → export des types.

ecosystem:       CreateFiles = [
                   "@/app/genesis/lib/report-types.ts",
                   "@/app/genesis/lib/reports.ts",
                   "@/app/genesis/actions/reports.ts",
                   "@/app/genesis/components/ReportsList.tsx",
                   "@/app/genesis/create-files/reports/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/types.ts"]

imports:         ["@/app/genesis/lib/types"]

exports:         ["SavedReport", "ReportsListResult"]

useBy:           ["@/app/genesis/lib/reports.ts",
                  "@/app/genesis/actions/reports.ts",
                  "@/app/genesis/components/ReportsList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux consulter l'historique des rapports d'écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { WriteReport } from "@/app/genesis/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SavedReport {
  /** Timestamp ISO sanitizé (id du fichier). */
  readonly id: string;
  /** Date ISO 8601 de l'écriture. */
  readonly createdAt: string;
  /** Nombre total de scripts traités. */
  readonly scriptCount: number;
  /** Compteurs dérivés du rapport. */
  readonly createdCount: number;
  readonly overwrittenCount: number;
  readonly backedUpCount: number;
  readonly rejectedCount: number;
  /** Le rapport complet (créés / écrasés / backupés / rejetés). */
  readonly report: WriteReport;
}

export interface ReportsListResult {
  readonly reports: readonly SavedReport[];
  readonly total: number;
  readonly hasMore: boolean;
}