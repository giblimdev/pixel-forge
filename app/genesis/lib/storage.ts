/*
path :           app/genesis/lib/storage.ts
tag :            ["genesis", "storage", "fs", "server-only", "security"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Seul fichier autorisé à toucher node:fs pour le module Genesis.
                 Lit/écrit les fichiers de configuration (exclusions, sélections,
                 backups) et les fichiers du projet (lecture via readProjectFile,
                 écriture via writeProjectFile). Écriture atomique (tmp + rename).
                 Inclut le garde-fou assertUnderRoot() avec option allowCritical :
                 les fichiers critiques (.env*, next.config.*, package.json) sont
                 refusés par défaut, mais acceptés explicitement par copy-to-ia
                 pour ses trois fichiers cibles.

                 NOTE (Turbopack) : contrairement aux autres modules du projet
                 (blog, core) qui sont statiquement scoped à data/, Genesis doit
                 pouvoir lire/écrire n'importe où dans le projet (SelectFiles,
                 CreateFiles, CopyToIA). Le tracing complet du projet par
                 Turbopack est donc VOULU, pas un accident. On le déclare via
                 `resolve(/*turbopackIgnore: true*\/ …)` pour couper le warning
                 « Dynamic filesystem access causes tracing of the whole project ».

flow:            readExclusionsFile → défauts si absent/corrompu → retour.
                 writeExclusionsFile → écrit JSON. writeSelectionFile → horodaté.
                 writeBackupFile → data/genesis-backups/{ts}/{path}.
                 readProjectFile → assertUnderRoot(options) → readFile → détection
                 binaire. writeProjectFile → assertUnderRoot(options) → tmp +
                 rename. assertUnderRoot(path, options) → resolve(cwd, path)
                 (turbopackIgnore) → relative → refuse ".." et, sauf
                 allowCritical, les fichiers critiques.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
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
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
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

relatedFiles:    ["@/app/genesis/lib/types.ts",
                  "@/app/genesis/lib/validations.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/validations"]

exports:         ["DATA_DIR", "EXCLUSIONS_FILE", "SELECTIONS_DIR", "BACKUPS_DIR",
                  "assertUnderRoot", "readExclusionsFile", "writeExclusionsFile",
                  "writeSelectionFile", "writeBackupFile", "readProjectFile",
                  "writeProjectFile", "fileExists"]

useBy:           ["@/app/genesis/lib/tree.ts",
                  "@/app/genesis/lib/write-scripts.ts",
                  "@/app/genesis/actions/context-files.ts",
                  "@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/actions/write-files.ts"]

userStories:     ["*en tant que développeur je veux un accès FS sécurisé et atomique pour Genesis"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import "server-only";

import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { DEFAULT_EXCLUSIONS } from "@/app/genesis/lib/types";
import { exclusionsSchema } from "@/app/genesis/lib/validations";

/* ------------------------------------------------------------------ */
/*  Chemins                                                            */
/* ------------------------------------------------------------------ */

export const DATA_DIR = join(process.cwd(), "data");
export const EXCLUSIONS_FILE = join(DATA_DIR, "genesis-readFiles-exclusions.json");
export const SELECTIONS_DIR = join(DATA_DIR, "genesis-selections");
export const BACKUPS_DIR = join(DATA_DIR, "genesis-backups");

const ROOT = process.cwd();

/* ------------------------------------------------------------------ */
/*  Garde-fou runtime                                                  */
/* ------------------------------------------------------------------ */

const FORBIDDEN_PATHS = new Set(["package.json", "package-lock.json"]);
const FORBIDDEN_PREFIXES = [".env", "next.config."];

export interface AssertUnderRootOptions {
  /**
   * Si true, autorise les fichiers critiques (package.json, .env*, next.config.*).
   * Réservé aux actions copy-to-ia qui doivent lire/écrire ces fichiers
   * explicitement. NE PAS exposer côté client sans contrôle.
   */
  readonly allowCritical?: boolean;
}

export function assertUnderRoot(
  path: string,
  options: AssertUnderRootOptions = {},
): string {
  // `turbopackIgnore` : Genesis (SelectFiles / CreateFiles / CopyToIA) lit et
  // écrit LEGITIMEMENT n'importe où dans le projet — le tracing complet est
  // le comportement VOULU. On le déclare à Turbopack pour couper le warning
  // « Dynamic filesystem access causes tracing of the whole project ».
  // Ne PAS « corriger » en scopant à un sous-dossier : ça casserait Genesis.
  const resolved = resolve(/*turbopackIgnore: true*/ ROOT, path);
  const rel = relative(ROOT, resolved);

  if (rel === "" || rel.startsWith("..") || rel.includes("\0")) {
    throw new Error(`Path hors racine du projet : "${path}"`);
  }

  if (!options.allowCritical) {
    const lower = rel.toLowerCase().replace(/\\/g, "/");
    if (FORBIDDEN_PATHS.has(lower)) {
      throw new Error(`Path interdit : "${path}"`);
    }
    for (const prefix of FORBIDDEN_PREFIXES) {
      if (lower.startsWith(prefix)) {
        throw new Error(`Path interdit : "${path}"`);
      }
    }
  }

  return resolved;
}

/* ------------------------------------------------------------------ */
/*  Exclusions                                                         */
/* ------------------------------------------------------------------ */

export async function readExclusionsFile(): Promise<string[]> {
  try {
    const raw = await readFile(EXCLUSIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = exclusionsSchema.safeParse(parsed);

    if (!validated.success) {
      await writeExclusionsFile([...DEFAULT_EXCLUSIONS]);
      return [...DEFAULT_EXCLUSIONS];
    }

    return [...validated.data.exclusions];
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      await writeExclusionsFile([...DEFAULT_EXCLUSIONS]);
      return [...DEFAULT_EXCLUSIONS];
    }
    await writeExclusionsFile([...DEFAULT_EXCLUSIONS]);
    return [...DEFAULT_EXCLUSIONS];
  }
}

export async function writeExclusionsFile(
  exclusions: readonly string[],
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify({ exclusions: [...exclusions] }, null, 2);
  await writeFile(EXCLUSIONS_FILE, payload, "utf-8");
}

/* ------------------------------------------------------------------ */
/*  Sélections sauvegardées                                            */
/* ------------------------------------------------------------------ */

export async function writeSelectionFile(
  timestamp: string,
  content: string,
): Promise<string> {
  await mkdir(SELECTIONS_DIR, { recursive: true });
  const file = join(SELECTIONS_DIR, `${timestamp}.json`);
  await writeFile(file, content, "utf-8");
  return relative(ROOT, file);
}

/* ------------------------------------------------------------------ */
/*  Backups                                                            */
/* ------------------------------------------------------------------ */

export async function writeBackupFile(
  timestamp: string,
  pathRelatif: string,
  content: string,
): Promise<void> {
  const safeRel = pathRelatif.replace(/\\/g, "/").replace(/^\/+/, "");
  if (safeRel.includes("..")) {
    throw new Error(`Backup refusé, path invalide : "${pathRelatif}"`);
  }
  const backupPath = join(BACKUPS_DIR, timestamp, safeRel);
  await mkdir(dirname(backupPath), { recursive: true });
  await writeFile(backupPath, content, "utf-8");
}

/* ------------------------------------------------------------------ */
/*  Lecture de fichiers projet                                         */
/* ------------------------------------------------------------------ */

const BINARY_SAMPLE_SIZE = 512;

export interface ReadProjectFileResult {
  readonly content: string;
  readonly isBinary: boolean;
  readonly size: number;
}

export async function readProjectFile(
  pathRelatif: string,
  options: AssertUnderRootOptions = {},
): Promise<ReadProjectFileResult> {
  const abs = assertUnderRoot(pathRelatif, options);
  const buffer = await readFile(abs);
  const sample = buffer.subarray(0, Math.min(BINARY_SAMPLE_SIZE, buffer.length));
  const isBinary = sample.includes(0);
  return {
    content: isBinary ? "" : buffer.toString("utf-8"),
    isBinary,
    size: buffer.byteLength,
  };
}

/* ------------------------------------------------------------------ */
/*  Écriture de fichiers projet                                        */
/* ------------------------------------------------------------------ */

export async function writeProjectFile(
  pathRelatif: string,
  content: string,
  options: AssertUnderRootOptions = {},
): Promise<boolean> {
  const abs = assertUnderRoot(pathRelatif, options);
  const tmp = `${abs}.tmp-genesis`;

  let existed = false;
  try {
    await stat(abs);
    existed = true;
  } catch {
    existed = false;
  }

  await mkdir(dirname(abs), { recursive: true });
  await writeFile(tmp, content, "utf-8");
  await rename(tmp, abs);
  return existed;
}

/* ------------------------------------------------------------------ */
/*  Existence                                                          */
/* ------------------------------------------------------------------ */

export async function fileExists(
  pathRelatif: string,
  options: AssertUnderRootOptions = {},
): Promise<boolean> {
  try {
    await stat(assertUnderRoot(pathRelatif, options));
    return true;
  } catch {
    return false;
  }
}