/*
path :           app/genesis/actions/read-files.ts
tag :            ["genesis", "action", "read-files", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'outil SelectFiles. Expose
                 listFilesTreeAction (arbre complet, exclusions appliquées),
                 readSelectedFilesAction (lit le contenu intégral des fichiers
                 sélectionnés, skippe les binaires) et saveSelectionAction
                 (écrit une sélection horodatée dans data/genesis-selections/).

flow:            listFilesTreeAction → readExclusionsFile → buildFileTree →
                 { ok, data: FileNode[] }.
                 readSelectedFilesAction(paths) → readFilesInputSchema.parse →
                 pour chaque path : readProjectFile → skip si binaire →
                 accumulation { files, fileCount, totalSize, skipped }.
                 saveSelectionAction(json) → JSON.parse (validation syntaxique)
                 → timestamp ISO sanitizé → writeSelectionFile → { ok, data: path }.

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

relatedFiles:    ["@/app/genesis/lib/tree.ts",
                  "@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/validations.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["@/app/genesis/lib/types",
                  "@/app/genesis/lib/validations",
                  "@/app/genesis/lib/tree",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/actions/exclusions"]

exports:         ["listFilesTreeAction", "readSelectedFilesAction",
                  "saveSelectionAction"]

useBy:           ["@/app/genesis/components/ReadFilesPanel.tsx",
                  "@/app/genesis/components/ResultDialog.tsx",
                  "@/app/genesis/read-files/page.tsx"]

userStories:     ["*en tant que développeur je veux lire les fichiers sélectionnés via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import type {
  FileContent,
  FileNode,
  ReadFilesResult,
  SkippedFile,
} from "@/app/genesis/lib/types";
import { readFilesInputSchema } from "@/app/genesis/lib/validations";
import { buildFileTree } from "@/app/genesis/lib/tree";
import {
  readExclusionsFile,
  readProjectFile,
  writeSelectionFile,
} from "@/app/genesis/lib/storage";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

/* ------------------------------------------------------------------ */
/*  Arbre                                                              */
/* ------------------------------------------------------------------ */

export async function listFilesTreeAction(): Promise<
  ActionResult<readonly FileNode[]>
> {
  try {
    const exclusions = await readExclusionsFile();
    const tree = await buildFileTree(exclusions);
    return { ok: true, data: tree };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Lecture des fichiers sélectionnés                                  */
/* ------------------------------------------------------------------ */

export async function readSelectedFilesAction(
  paths: readonly string[],
): Promise<ActionResult<ReadFilesResult>> {
  try {
    const validated = readFilesInputSchema.parse({ paths });

    const files: FileContent[] = [];
    const skipped: SkippedFile[] = [];
    let totalSize = 0;

    for (const path of validated.paths) {
      try {
        const result = await readProjectFile(path);
        if (result.isBinary) {
          skipped.push({ path, reason: "binary" });
          continue;
        }
        files.push({ path, content: result.content });
        totalSize += result.size;
      } catch {
        skipped.push({ path, reason: "unreadable" });
      }
    }

    return {
      ok: true,
      data: {
        files,
        fileCount: files.length,
        totalSize,
        skipped,
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
/*  Sauvegarde d'une sélection                                         */
/* ------------------------------------------------------------------ */

/**
 * Écrit le JSON fourni dans data/genesis-selections/{ISO-timestamp}.json.
 * Le payload est validé syntaxiquement (JSON.parse) mais pas structurellement :
 * c'est le résultat d'une sélection déjà validée côté serveur par
 * readSelectedFilesAction.
 */
export async function saveSelectionAction(
  json: string,
): Promise<ActionResult<string>> {
  try {
    if (typeof json !== "string" || json.length === 0) {
      throw new Error("Payload vide.");
    }
    JSON.parse(json); // validation syntaxique uniquement

    // Timestamp ISO compatible nom de fichier (Windows-safe) :
    // 2026-10-17T09:00:00.000Z → 2026-10-17T09-00-00-000Z
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = await writeSelectionFile(timestamp, json);

    return { ok: true, data: filePath };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}