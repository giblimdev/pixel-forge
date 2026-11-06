/*
path :           app/genesis/actions/write-files.ts
tag :            ["genesis", "action", "write-files", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Action pour l'outil CreateFiles. Reçoit la file de
                 scripts, valide le payload via Zod, délègue à write-scripts.ts,
                 puis revalide la route /genesis/create-files. Le ActionResult
                 reste ok:true même si des scripts sont rejetés (les rejets sont
                 dans le rapport) ; ok:false est réservé aux échecs globaux
                 (validation Zod, exception inattendue).

flow:            writeScriptsAction(scripts) → writeFilesInputSchema.parse
                 → writeScripts(validated.scripts) → revalidatePath →
                 { ok: true, data: WriteReport }.

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

relatedFiles:    ["@/app/genesis/lib/write-scripts.ts",
                  "@/app/genesis/lib/validations.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/validations",
                  "@/app/genesis/lib/write-scripts",
                  "@/app/genesis/actions/exclusions"]

exports:         ["writeScriptsAction"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx"]

userStories:     ["*en tant que développeur je veux écrire les scripts collés via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { ScriptEntry, WriteReport } from "@/app/genesis/lib/types";
import { writeFilesInputSchema } from "@/app/genesis/lib/validations";
import { writeScripts } from "@/app/genesis/lib/write-scripts";
import type { ActionResult } from "@/app/genesis/actions/exclusions";

export async function writeScriptsAction(
  scripts: readonly Pick<ScriptEntry, "path" | "content">[],
): Promise<ActionResult<WriteReport>> {
  try {
    const validated = writeFilesInputSchema.parse({ scripts });
    const report = await writeScripts(validated.scripts);
    revalidatePath("/genesis/create-files");
    return { ok: true, data: report };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}