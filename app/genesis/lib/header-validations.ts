/*
path :           app/genesis/lib/header-validations.ts
tag :            ["genesis", "check-headers", "validation", "zod", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schémas Zod pour les Server Actions de check-headers.
                 Réutilise exclusionsSchema et readFilesInputSchema de
                 lib/validations.ts existant (import pur, zéro modif).

flow:            Module TypeScript pur → ré-export des schémas existants.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/validations.ts"]

imports:         ["@/app/genesis/lib/validations"]

exports:         ["headerCheckInputSchema",
                  "headerCheckExclusionsSchema",
                  "getFileContentInputSchema",
                  "HeaderCheckInput",
                  "HeaderCheckExclusionsInput",
                  "GetFileContentInput"]

useBy:           ["@/app/genesis/actions/header-check.ts"]

userStories:     ["*en tant que développeur je veux valider les entrées du check-headers avec Zod"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { z } from "zod";

import {
  exclusionsSchema,
  readFilesInputSchema,
} from "@/app/genesis/lib/validations";

export const headerCheckInputSchema = readFilesInputSchema;
export const headerCheckExclusionsSchema = exclusionsSchema;

export const getFileContentInputSchema = z.object({
  path: z.string().min(1, "Path requis."),
});

export type HeaderCheckInput = typeof headerCheckInputSchema._input;
export type HeaderCheckExclusionsInput =
  typeof headerCheckExclusionsSchema._input;
export type GetFileContentInput = typeof getFileContentInputSchema._input;