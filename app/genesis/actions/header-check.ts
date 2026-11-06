/*
path :           app/genesis/actions/header-check.ts
tag :            ["genesis", "check-headers", "action", "server-action", "reciprocity"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'outil check-headers.
                 - checkHeadersAction(paths) : lit les fichiers sélectionnés
                   ET tous les fichiers du projet (non exclus) pour
                   construire l'index de réciprocité. Retourne le rapport
                   de base + le rapport de réciprocité.
                 - getFileContentAction(path) : lit le contenu complet
                   d'un fichier signalé (pour la dialog viewer).
                 - getHeaderExclusionsAction / setHeaderExclusionsAction :
                   stockage séparé data/genesis-headerCheck-exclusions.json.

flow:            checkHeadersAction → parse → lire les sélectionnés →
                 checkOneFile → construire Map<path, ParsedRelations> à
                 partir de TOUS les fichiers non exclus → checkReciprocity
                 → rapport combiné.
                 getFileContentAction → readProjectFile → { path, content }.
                 getHeaderExclusionsAction → readHeaderExclusionsFile.
                 setHeaderExclusionsAction → validate → write → revalidate.

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
                  "@/app/genesis/lib/header-check.ts",
                  "@/app/genesis/lib/storage.ts",
                  "@/app/genesis/actions/exclusions.ts"]

imports:         ["next/cache", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/header-validations",
                  "@/app/genesis/lib/header-check",
                  "@/app/genesis/lib/header-parser",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/actions/exclusions"]

exports:         ["checkHeadersAction", "getFileContentAction",
                  "getHeaderExclusionsAction", "setHeaderExclusionsAction",
                  "CheckResult"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx",
                  "@/app/genesis/components/HeaderFileViewerDialog.tsx",
                  "@/app/genesis/components/HeaderReciprocityReport.tsx",
                  "@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant que développeur je veux vérifier les en-têtes et la réciprocité via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  HeaderCheckCounts,
  HeaderCheckReport,
  HeaderCheckResult,
  HeaderReciprocityReport,
  ParsedRelations,
} from "@/app/genesis/lib/header-types";
import { DEFAULT_HEADER_EXCLUSIONS } from "@/app/genesis/lib/header-types";
import {
  getFileContentInputSchema,
  headerCheckExclusionsSchema,
  headerCheckInputSchema,
} from "@/app/genesis/lib/header-validations";
import {
  checkOneFile,
  checkReciprocity,
} from "@/app/genesis/lib/header-check";
import { parseFileHeader } from "@/app/genesis/lib/header-parser";
import {
  DATA_DIR,
  readProjectFile,
} from "@/app/genesis/lib/storage";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CheckResult {
  readonly report: HeaderCheckReport;
  readonly reciprocity: HeaderReciprocityReport;
}

/* ------------------------------------------------------------------ */
/*  Stockage séparé des exclusions                                     */
/* ------------------------------------------------------------------ */

const HEADER_EXCLUSIONS_FILE = join(
  DATA_DIR,
  "genesis-headerCheck-exclusions.json",
);

async function readHeaderExclusionsFile(): Promise<string[]> {
  try {
    const raw = await readFile(HEADER_EXCLUSIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = headerCheckExclusionsSchema.safeParse(parsed);
    if (!validated.success) {
      await writeHeaderExclusionsFile([...DEFAULT_HEADER_EXCLUSIONS]);
      return [...DEFAULT_HEADER_EXCLUSIONS];
    }
    return [...validated.data.exclusions];
  } catch {
    await writeHeaderExclusionsFile([...DEFAULT_HEADER_EXCLUSIONS]);
    return [...DEFAULT_HEADER_EXCLUSIONS];
  }
}

async function writeHeaderExclusionsFile(
  exclusions: readonly string[],
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify({ exclusions: [...exclusions] }, null, 2);
  await writeFile(HEADER_EXCLUSIONS_FILE, payload, "utf-8");
}

/* ------------------------------------------------------------------ */
/*  checkHeadersAction                                                 */
/* ------------------------------------------------------------------ */

export async function checkHeadersAction(
  paths: readonly string[],
): Promise<ActionResult<CheckResult>> {
  try {
    const validated = headerCheckInputSchema.parse({ paths });

    // 1. Vérification de base sur les fichiers sélectionnés.
    const results: HeaderCheckResult[] = [];

    for (const path of validated.paths) {
      try {
        const read = await readProjectFile(path);
        if (read.isBinary) {
          results.push({
            path,
            status: "skipped",
            issues: [
              {
                field: "binary",
                severity: "warning",
                message: "Fichier binaire ignoré.",
              },
            ],
            headerRaw: null,
            content: "",
          });
          continue;
        }
        results.push(checkOneFile(path, read.content));
      } catch {
        results.push({
          path,
          status: "skipped",
          issues: [
            {
              field: "unreadable",
              severity: "warning",
              message: "Fichier illisible.",
            },
          ],
          headerRaw: null,
          content: "",
        });
      }
    }

    const counts: HeaderCheckCounts = {
      ok: results.filter((r) => r.status === "ok").length,
      missing: results.filter((r) => r.status === "missing").length,
      incomplete: results.filter((r) => r.status === "incomplete").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      total: results.length,
    };

    // 2. Construction de l'index global pour la réciprocité.
    const exclusions = await readHeaderExclusionsFile();
    const allPaths = await listAllProjectPaths(exclusions);

    const headers = new Map<string, ParsedRelations>();
    const knownPaths = new Set<string>();

    for (const path of allPaths) {
      knownPaths.add(path);
      try {
        const read = await readProjectFile(path);
        if (read.isBinary) continue;
        const parsed = parseFileHeader(read.content);
        if (!parsed.hasHeader) continue;
        headers.set(path, parsed.relations);
      } catch {
        // illisible → ignore pour la réciprocité
      }
    }

    const reciprocity = checkReciprocity(headers, knownPaths);

    return {
      ok: true,
      data: { report: { results, counts }, reciprocity },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  getFileContentAction                                               */
/* ------------------------------------------------------------------ */

export async function getFileContentAction(
  path: string,
): Promise<ActionResult<{ path: string; content: string; headerRaw: string | null }>> {
  try {
    const validated = getFileContentInputSchema.parse({ path });
    const read = await readProjectFile(validated.path);
    if (read.isBinary) {
      return { ok: false, error: "Fichier binaire : contenu non affichable." };
    }
    const parsed = parseFileHeader(read.content);
    return {
      ok: true,
      data: {
        path: validated.path,
        content: read.content,
        headerRaw: parsed.headerRaw,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Exclusions                                                         */
/* ------------------------------------------------------------------ */

export async function getHeaderExclusionsAction(): Promise<
  ActionResult<{ exclusions: readonly string[] }>
> {
  try {
    const exclusions = await readHeaderExclusionsFile();
    return { ok: true, data: { exclusions } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

export async function setHeaderExclusionsAction(
  exclusions: readonly string[],
): Promise<ActionResult<{ exclusions: readonly string[] }>> {
  try {
    const validated = headerCheckExclusionsSchema.parse({ exclusions });
    await writeHeaderExclusionsFile(validated.exclusions);
    revalidatePath("/genesis/check-headers");
    return { ok: true, data: { exclusions: validated.exclusions } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Helper interne : liste tous les paths du projet (non exclus)      */
/* ------------------------------------------------------------------ */

import { buildFileTree } from "@/app/genesis/lib/tree";
import type { FileNode } from "@/app/genesis/lib/types";

async function listAllProjectPaths(
  exclusions: readonly string[],
): Promise<string[]> {
  const tree = await buildFileTree(exclusions);
  const paths: string[] = [];
  const walk = (nodes: readonly FileNode[]) => {
    for (const node of nodes) {
      if (node.isDir && node.children) walk(node.children);
      else if (!node.isDir) paths.push(node.path);
    }
  };
  walk(tree);
  return paths;
}