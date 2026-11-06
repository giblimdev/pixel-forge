/*
path :           app/genesis/actions/reports.ts
tag :            ["genesis", "create-files", "reports", "action", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'historique des rapports d'écriture.
                 - saveReportAction(report) : appelée automatiquement après
                   writeScriptsAction (dans CreateFilesPanel).
                 - listReportsAction({limit?, offset?}) : liste paginée.
                 - getReportAction(id) : détail.
                 - deleteReportAction(id) : suppression.
                 - clearReportsAction() : vide tout.
                 Toutes revalident /genesis/create-files/reports.

flow:            Chaque action appelle le helper correspondant de
                 lib/reports.ts → { ok, data } ou { ok: false, error }.

ecosystem:       CreateFiles = [
                   "@/app/genesis/lib/report-types.ts",
                   "@/app/genesis/lib/reports.ts",
                   "@/app/genesis/actions/reports.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/reports.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/genesis/lib/report-types",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/reports",
                  "@/app/genesis/actions/exclusions"]

exports:         ["saveReportAction", "listReportsAction",
                  "getReportAction", "deleteReportAction",
                  "clearReportsAction"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx",
                  "@/app/genesis/components/ReportsList.tsx",
                  "@/app/genesis/create-files/reports/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer l'historique des rapports via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type {
  ReportsListResult,
  SavedReport,
} from "@/app/genesis/lib/report-types";
import type { WriteReport } from "@/app/genesis/lib/types";
import {
  clearReports,
  deleteReport,
  getReport,
  listReports,
  saveReport,
} from "@/app/genesis/lib/reports";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

/* ------------------------------------------------------------------ */
/*  Save                                                               */
/* ------------------------------------------------------------------ */

export async function saveReportAction(
  report: WriteReport,
): Promise<ActionResult<SavedReport>> {
  try {
    const saved = await saveReport(report);
    revalidatePath("/genesis/create-files/reports");
    return { ok: true, data: saved };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  List                                                               */
/* ------------------------------------------------------------------ */

export async function listReportsAction(options?: {
  readonly limit?: number;
  readonly offset?: number;
}): Promise<ActionResult<ReportsListResult>> {
  try {
    const result = await listReports(options);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Get                                                                */
/* ------------------------------------------------------------------ */

export async function getReportAction(
  id: string,
): Promise<ActionResult<SavedReport>> {
  try {
    const report = await getReport(id);
    if (!report) {
      return { ok: false, error: "Rapport introuvable." };
    }
    return { ok: true, data: report };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Delete                                                             */
/* ------------------------------------------------------------------ */

export async function deleteReportAction(
  id: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const deleted = await deleteReport(id);
    revalidatePath("/genesis/create-files/reports");
    return { ok: true, data: { deleted } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Clear                                                              */
/* ------------------------------------------------------------------ */

export async function clearReportsAction(): Promise<
  ActionResult<{ deleted: number }>
> {
  try {
    const deleted = await clearReports();
    revalidatePath("/genesis/create-files/reports");
    return { ok: true, data: { deleted } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}