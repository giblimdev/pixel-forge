/*
path :           app/genesis/lib/header-validations.ts
tag :            ["genesis", "check-headers", "validation", "zod", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour les Server Actions de check-headers.
                 Réutilise exclusionsSchema et readFilesInputSchema de
                 lib/validations.ts existant (import pur, zéro modif).
                 Le schéma d'entrée du check est identique à celui de
                 read-files (liste de paths non vide).

flow:            Module TypeScript pur → ré-export des schémas existants
                 sous des noms propres à check-headers.

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

relatedFiles:    ["@/app/genesis/lib/validations.ts"]

imports:         ["@/app/genesis/lib/validations"]

exports:         ["headerCheckInputSchema",
                  "headerCheckExclusionsSchema",
                  "HeaderCheckInput",
                  "HeaderCheckExclusionsInput"]

useBy:           ["@/app/genesis/actions/header-check.ts"]

userStories:     ["*en tant que développeur je veux valider les entrées du check-headers avec Zod"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import {
  exclusionsSchema,
  readFilesInputSchema,
} from "@/app/genesis/lib/validations";

/* ------------------------------------------------------------------ */
/*  Schémas (ré-export sous noms propres à check-headers)              */
/* ------------------------------------------------------------------ */

/** Entrée du check : liste de paths non vide. Identique à read-files. */
export const headerCheckInputSchema = readFilesInputSchema;

/** Liste d'exclusions : { exclusions: string[] } non vide par entrée. */
export const headerCheckExclusionsSchema = exclusionsSchema;

/* ------------------------------------------------------------------ */
/*  Types inférés                                                      */
/* ------------------------------------------------------------------ */

export type HeaderCheckInput = typeof headerCheckInputSchema._input;
export type HeaderCheckExclusionsInput =
  typeof headerCheckExclusionsSchema._input;