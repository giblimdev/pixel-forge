/*
path :           app/genesis/actions/header-check.ts
tag :            ["genesis", "check-headers", "action", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'outil check-headers.
                 - checkHeadersAction(paths) : lit chaque fichier via
                   readProjectFile (skip binaire), appelle checkOneFile,
                   consolide le rapport.
                 - getHeaderExclusionsAction() : lit les exclusions
                   (fichier séparé data/genesis-headerCheck-exclusions.json).
                 - setHeaderExclusionsAction(exclusions) : valide + écrit +
                   revalide la page check-headers.
                 Stockage SÉPARÉ de celui de read-files : aucune interférence.

flow:            checkHeadersAction → headerCheckInputSchema.parse →
                 boucle readProjectFile → checkOneFile → counts → rapport.
                 getHeaderExclusionsAction → readHeaderExclusionsFile →
                 { ok, data }.
                 setHeaderExclusionsAction → headerCheckExclusionsSchema.parse
                 → writeHeaderExclusionsFile → revalidatePath → { ok, data }.

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

relatedFiles:    ["@/app/genesis/lib/header-types.ts",
                  "@/app/genesis/lib/header-check.ts",
                  "@/app/genesis/lib/storage.ts",
                  "@/app/genesis/actions/exclusions.ts"]

imports:         ["next/cache", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/header-validations",
                  "@/app/genesis/lib/header-check",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/actions/exclusions"]

exports:         ["checkHeadersAction", "getHeaderExclusionsAction",
                  "setHeaderExclusionsAction"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx",
                  "@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant que développeur je veux vérifier les en-têtes via une Server Action"]

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
} from "@/app/genesis/lib/header-types";
import { DEFAULT_HEADER_EXCLUSIONS } from "@/app/genesis/lib/header-types";
import {
  headerCheckExclusionsSchema,
  headerCheckInputSchema,
} from "@/app/genesis/lib/header-validations";
import { checkOneFile } from "@/app/genesis/lib/header-check";
import {
  DATA_DIR,
  readProjectFile,
} from "@/app/genesis/lib/storage";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

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
): Promise<ActionResult<HeaderCheckReport>> {
  try {
    const validated = headerCheckInputSchema.parse({ paths });

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

    return { ok: true, data: { results, counts } };
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