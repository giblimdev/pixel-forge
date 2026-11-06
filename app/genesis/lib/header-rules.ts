/*
path :           app/genesis/lib/header-rules.ts
tag :            ["genesis", "check-headers", "rules", "config"]
projectId:       new-genesis
type:            config
generic:         true

role:            Source unique des règles de conformité d'en-tête.
                 Aucun effet, aucune dépendance runtime hors TypeScript.

flow:            Module TypeScript pur → export des constantes readonly.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-types.ts"]

imports:         ["@/app/genesis/lib/header-types"]

exports:         ["HEADER_REQUIRED_FIELDS", "HEADER_WARNING_FIELDS",
                  "HEADER_STATUS_VALUES", "HEADER_TYPE_VALUES",
                  "HEADER_PROJECT_IDS", "CHECKED_PATTERN"]

useBy:           ["@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/header-check.ts"]

userStories:     ["*en tant que développeur je veux une source unique des règles d'en-tête"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export const HEADER_REQUIRED_FIELDS: readonly string[] = [
  "path",
  "projectId",
  "type",
  "role",
  "status",
  "pathChecked",
  "metaDataChecked",
  "scriptChecked",
];

export const HEADER_WARNING_FIELDS: readonly string[] = [
  "tag",
  "ecosystem",
  "relatedFiles",
  "userStories",
  "useBy",
];

export const HEADER_STATUS_VALUES: readonly string[] = [
  "planned",
  "wip",
  "done",
  "deprecated",
];

export const HEADER_TYPE_VALUES: readonly string[] = [
  "page",
  "layout",
  "component",
  "action",
  "route",
  "helper",
  "config",
];

export const HEADER_PROJECT_IDS: readonly string[] = [
  "new-genesis",
  "eval-biz",
  "miam-miam-listo",
];

export const CHECKED_PATTERN = /^(✔true|✘false)$/;