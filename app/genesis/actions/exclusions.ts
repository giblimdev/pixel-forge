/*
path :           app/genesis/actions/exclusions.ts
tag :            ["genesis", "action", "exclusions", "server-action"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Actions pour la gestion des exclusions du module Genesis.
                 Expose getExclusionsAction (lit les exclusions courantes) et
                 setExclusionsAction (valide + écrit + revalide la page read-files).
                 Exporte le type ActionResult<T> utilisé par toutes les actions
                 du module Genesis.

flow:            getExclusionsAction → readExclusionsFile → { ok, data }.
                 setExclusionsAction(exclusions) → exclusionsSchema.parse →
                 writeExclusionsFile → revalidatePath("/genesis/read-files") →
                 { ok, data }.

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

relatedFiles:    ["@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/validations.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["next/cache",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/validations",
                  "@/app/genesis/lib/storage"]

exports:         ["ActionResult", "getExclusionsAction", "setExclusionsAction"]

useBy:           ["@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/actions/write-files.ts",
                  "@/app/genesis/components/ExclusionsDialog.tsx",
                  "@/app/genesis/components/ReadFilesPanel.tsx"]

userStories:     ["*en tant que développeur je veux gérer les exclusions via une Server Action"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import type { GenesisExclusions } from "@/app/genesis/lib/types";
import { exclusionsSchema } from "@/app/genesis/lib/validations";
import {
  readExclusionsFile,
  writeExclusionsFile,
} from "@/app/genesis/lib/storage";

/* ------------------------------------------------------------------ */
/*  Résultat typé                                                      */
/* ------------------------------------------------------------------ */

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

/* ------------------------------------------------------------------ */
/*  Lecture                                                            */
/* ------------------------------------------------------------------ */

export async function getExclusionsAction(): Promise<
  ActionResult<GenesisExclusions>
> {
  try {
    const exclusions = await readExclusionsFile();
    return { ok: true, data: { exclusions } };
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

export async function setExclusionsAction(
  exclusions: readonly string[],
): Promise<ActionResult<GenesisExclusions>> {
  try {
    const validated = exclusionsSchema.parse({ exclusions });
    await writeExclusionsFile(validated.exclusions);
    revalidatePath("/genesis/read-files");
    return { ok: true, data: { exclusions: validated.exclusions } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    };
  }
}