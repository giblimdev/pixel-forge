/*
path :           app/genesis/lib/validations.ts
tag :            ["genesis", "validation", "zod", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour valider les entrées du module Genesis.
                 Couvre : exclusions, lecture de fichiers, écriture de scripts,
                 sauvegarde d'un fichier de contexte (copy-to-ia). Mode strict
                 partout : les clés inconnues sont rejetées avec un message
                 clair, indispensable pour les payloads Server Action.

flow:            Module TypeScript pur → export des schémas Zod et des types
                 inférés. Aucun effet, aucune dépendance runtime autre que zod.

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

relatedFiles:    ["@/app/genesis/lib/types.ts"]

imports:         ["zod",
                  "@/app/genesis/lib/types"]

exports:         ["exclusionsSchema", "readFilesInputSchema",
                  "writeFilesInputSchema", "saveContextFileInputSchema",
                  "ExclusionsInput", "ReadFilesInput", "WriteFilesInput",
                  "SaveContextFileInput"]

useBy:           ["@/app/genesis/lib/storage.ts",
                  "@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/actions/write-files.ts",
                  "@/app/genesis/actions/context-files.ts"]

userStories:     ["*en tant que développeur je veux valider les entrées Genesis avec Zod"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Exclusions                                                         */
/* ------------------------------------------------------------------ */

export const exclusionsSchema = z
  .object({
    exclusions: z.array(z.string().trim().min(1, "Entrée vide.")),
  })
  .strict();

export type ExclusionsInput = z.input<typeof exclusionsSchema>;

/* ------------------------------------------------------------------ */
/*  Lecture de fichiers                                                */
/* ------------------------------------------------------------------ */

export const readFilesInputSchema = z
  .object({
    paths: z.array(z.string().min(1)).min(1, "Au moins un fichier requis."),
  })
  .strict();

export type ReadFilesInput = z.input<typeof readFilesInputSchema>;

/* ------------------------------------------------------------------ */
/*  Écriture de scripts                                                */
/* ------------------------------------------------------------------ */

export const writeFilesInputSchema = z
  .object({
    scripts: z
      .array(
        z
          .object({
            path: z.string().trim().min(1, "Path requis."),
            content: z.string(),
          })
          .strict(),
      )
      .min(1, "Au moins un script requis."),
  })
  .strict();

export type WriteFilesInput = z.input<typeof writeFilesInputSchema>;

/* ------------------------------------------------------------------ */
/*  Fichiers de contexte (copy-to-ia)                                  */
/* ------------------------------------------------------------------ */

export const saveContextFileInputSchema = z
  .object({
    id: z.enum(["contributing", "prisma", "package"]),
    content: z.string(),
  })
  .strict();

export type SaveContextFileInput = z.input<typeof saveContextFileInputSchema>;