/*
path :           app/genesis/actions/context-files.ts
tag :            ["genesis", "action", "copy-to-ia", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour l'outil copy-to-ia. readContextFilesAction
                 lit les 3 fichiers cibles (CONTRIBUTING.md, prisma/schema.prisma,
                 package.json) avec allowCritical:true. saveContextFileAction
                 valide le payload, backup le fichier existant, puis écrit
                 atomiquement. Pour package.json, valide que le JSON est
                 syntaxiquement correct avant écriture (sinon rejet).

flow:            readContextFilesAction → pour chaque CONTEXT_FILES : fileExists
                 (allowCritical) → readProjectFile (allowCritical) → ContextFile.
                 saveContextFileAction(id, content) → saveContextFileInputSchema.parse
                 → résolution path depuis id → si id === "package" : JSON.parse
                 (validation syntaxique) → backup si existe → writeProjectFile
                 (allowCritical) → revalidatePath("/genesis/copy-to-ia").

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

relatedFiles:    ["@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/validations.ts",
                  "@/app/genesis/lib/context-files.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/validations",
                  "@/app/genesis/lib/context-files",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/actions/exclusions"]

exports:         ["readContextFilesAction", "saveContextFileAction"]

useBy:           ["@/app/genesis/components/CopyToIaPanel.tsx",
                  "@/app/genesis/copy-to-ia/page.tsx"]

userStories:     ["*en tant que développeur je veux lire et sauvegarder les fichiers de contexte via Server Actions"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ContextFile, ContextFileId } from "@/app/genesis/lib/types";
import { saveContextFileInputSchema } from "@/app/genesis/lib/validations";
import { CONTEXT_FILES } from "@/app/genesis/lib/context-files";
import {
  fileExists,
  readProjectFile,
  writeBackupFile,
  writeProjectFile,
} from "@/app/genesis/lib/storage";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function readContextFilesAction(): Promise<
  ActionResult<readonly ContextFile[]>
> {
  try {
    const files: ContextFile[] = [];
    for (const def of CONTEXT_FILES) {
      const exists = await fileExists(def.path, { allowCritical: true });
      let content = "";
      if (exists) {
        const read = await readProjectFile(def.path, { allowCritical: true });
        content = read.content;
      }
      files.push({
        id: def.id,
        path: def.path,
        label: def.label,
        content,
        exists,
      });
    }
    return { ok: true, data: files };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Écriture                                                           */
/* ------------------------------------------------------------------ */

export async function saveContextFileAction(
  id: ContextFileId,
  content: string,
): Promise<ActionResult<{ path: string }>> {
  try {
    const validated = saveContextFileInputSchema.parse({ id, content });

    const def = CONTEXT_FILES.find((file) => file.id === validated.id);
    if (!def) {
      throw new Error(`Fichier de contexte inconnu : ${validated.id}`);
    }

    // Validation syntaxique pour package.json (sinon on écrit un JSON cassé).
    if (def.id === "package") {
      try {
        JSON.parse(validated.content);
      } catch {
        throw new Error("package.json : JSON invalide, non enregistré.");
      }
    }

    // Backup si le fichier existe déjà.
    const exists = await fileExists(def.path, { allowCritical: true });
    if (exists) {
      const current = await readProjectFile(def.path, { allowCritical: true });
      if (!current.isBinary) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        await writeBackupFile(timestamp, def.path, current.content);
      }
    }

    await writeProjectFile(def.path, validated.content, {
      allowCritical: true,
    });

    revalidatePath("/genesis/copy-to-ia");
    return { ok: true, data: { path: def.path } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}