/*
path :           app/genesis/lib/reports.ts
tag :            ["genesis", "create-files", "reports", "storage", "server-only"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Stockage persistant des rapports d'écriture. Un fichier
                 JSON par rapport dans data/genesis-write-reports/. Limite
                 à 50 rapports (auto-nettoyage des plus anciens à chaque
                 sauvegarde). Importable UNIQUEMENT côté serveur.

flow:            saveReport(report) → calcule id/createdAt/compteurs →
                 écrit data/genesis-write-reports/{id}.json → purge les
                 plus anciens si > 50.
                 listReports({limit, offset}) → lit le dossier → trie
                 par date desc → retourne la tranche + total.
                 getReport(id) → lit un fichier.
                 deleteReport(id) → supprime un fichier.
                 clearReports() → vide le dossier.

ecosystem:       CreateFiles = [
                   "@/app/genesis/lib/report-types.ts",
                   "@/app/genesis/lib/reports.ts",
                   "@/app/genesis/actions/reports.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/report-types.ts",
                  "@/app/genesis/lib/types.ts",
                  "@/app/genesis/lib/storage.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/report-types",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/storage"]

exports:         ["saveReport", "listReports", "getReport",
                  "deleteReport", "clearReports"]

useBy:           ["@/app/genesis/actions/reports.ts"]

userStories:     ["*en tant que développeur je veux persister les rapports d'écriture"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import "server-only";

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  ReportsListResult,
  SavedReport,
} from "@/app/genesis/lib/report-types";
import type { WriteReport } from "@/app/genesis/lib/types";
import { DATA_DIR } from "@/app/genesis/lib/storage";

/* ------------------------------------------------------------------ */
/*  Chemins                                                            */
/* ------------------------------------------------------------------ */

const REPORTS_DIR = join(DATA_DIR, "genesis-write-reports");
const MAX_REPORTS = 50;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timestampId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function ensureDir(): Promise<void> {
  await mkdir(REPORTS_DIR, { recursive: true });
}

async function readReportFile(path: string): Promise<SavedReport | null> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as SavedReport;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Save                                                               */
/* ------------------------------------------------------------------ */

export async function saveReport(report: WriteReport): Promise<SavedReport> {
  await ensureDir();

  const id = timestampId();
  const saved: SavedReport = {
    id,
    createdAt: new Date().toISOString(),
    scriptCount:
      report.created.length +
      report.overwritten.length +
      report.rejected.length,
    createdCount: report.created.length,
    overwrittenCount: report.overwritten.length,
    backedUpCount: report.backedUp.length,
    rejectedCount: report.rejected.length,
    report,
  };

  const filePath = join(REPORTS_DIR, `${id}.json`);
  await writeFile(filePath, JSON.stringify(saved, null, 2), "utf-8");

  // Purge les plus anciens si > MAX_REPORTS.
  const all = await listReports({ limit: Number.MAX_SAFE_INTEGER, offset: 0 });
  if (all.total > MAX_REPORTS) {
    const toDelete = all.reports.slice(MAX_REPORTS);
    for (const r of toDelete) {
      try {
        await unlink(join(REPORTS_DIR, `${r.id}.json`));
      } catch {
        // ignore
      }
    }
  }

  return saved;
}

/* ------------------------------------------------------------------ */
/*  List                                                               */
/* ------------------------------------------------------------------ */

export async function listReports(options?: {
  readonly limit?: number;
  readonly offset?: number;
}): Promise<ReportsListResult> {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  await ensureDir();

  let files: string[] = [];
  try {
    files = await readdir(REPORTS_DIR);
  } catch {
    return { reports: [], total: 0, hasMore: false };
  }

  // Ne garde que les .json, trie par nom desc (= date desc).
  const jsonFiles = files
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => b.localeCompare(a));

  const total = jsonFiles.length;
  const slice = jsonFiles.slice(offset, offset + limit);

  const reports: SavedReport[] = [];
  for (const file of slice) {
    const r = await readReportFile(join(REPORTS_DIR, file));
    if (r) reports.push(r);
  }

  return {
    reports,
    total,
    hasMore: offset + limit < total,
  };
}

/* ------------------------------------------------------------------ */
/*  Get / Delete / Clear                                               */
/* ------------------------------------------------------------------ */

export async function getReport(id: string): Promise<SavedReport | null> {
  if (!/^[\w.-]+$/.test(id)) return null;
  return readReportFile(join(REPORTS_DIR, `${id}.json`));
}

export async function deleteReport(id: string): Promise<boolean> {
  if (!/^[\w.-]+$/.test(id)) return false;
  try {
    await unlink(join(REPORTS_DIR, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}

export async function clearReports(): Promise<number> {
  await ensureDir();
  let files: string[] = [];
  try {
    files = await readdir(REPORTS_DIR);
  } catch {
    return 0;
  }
  let count = 0;
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      await unlink(join(REPORTS_DIR, file));
      count++;
    } catch {
      // ignore
    }
  }
  return count;
}