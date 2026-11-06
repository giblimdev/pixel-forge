/*
path :           app/genesis/lib/header-types.ts
tag :            ["genesis", "check-headers", "types", "helper", "config", "reciprocity"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Types partagés pour l'outil check-headers + constante
                 DEFAULT_HEADER_EXCLUSIONS + types de réciprocité
                 (ReciprocityIssue, HeaderReciprocityReport, ParsedRelations).
                 Aucune dépendance runtime, aucun effet.

flow:            Module TypeScript pur → export des types et constantes.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderFileViewerDialog.tsx",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/header-check.ts"]

imports:         []

exports:         ["HeaderCheckStatus", "HeaderCheckSeverity",
                  "HeaderCheckIssue", "HeaderCheckResult",
                  "HeaderCheckCounts", "HeaderCheckReport",
                  "HeaderFields", "ParsedRelations",
                  "ReciprocityIssue", "HeaderReciprocityReport",
                  "DEFAULT_HEADER_EXCLUSIONS"]

useBy:           ["@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/header-check.ts",
                  "@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/HeaderCheckPanel.tsx",
                  "@/app/genesis/components/HeaderCheckReport.tsx",
                  "@/app/genesis/components/HeaderCheckRow.tsx",
                  "@/app/genesis/components/HeaderReciprocityReport.tsx",
                  "@/app/genesis/components/HeaderFileViewerDialog.tsx"]

userStories:     ["*en tant que développeur je veux des types partagés pour le check d'en-têtes et la réciprocité"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Statuts de vérification                                            */
/* ------------------------------------------------------------------ */

export type HeaderCheckStatus =
  | "ok"
  | "missing"
  | "incomplete"
  | "invalid"
  | "skipped";

export type HeaderCheckSeverity = "error" | "warning";

/* ------------------------------------------------------------------ */
/*  Issues (problèmes détectés sur un fichier)                         */
/* ------------------------------------------------------------------ */

export interface HeaderCheckIssue {
  readonly field: string;
  readonly severity: HeaderCheckSeverity;
  readonly message: string;
}

/* ------------------------------------------------------------------ */
/*  Résultat par fichier                                               */
/* ------------------------------------------------------------------ */

export interface HeaderCheckResult {
  readonly path: string;
  readonly status: HeaderCheckStatus;
  readonly issues: readonly HeaderCheckIssue[];
  readonly headerRaw: string | null;
  readonly content: string;
}

/* ------------------------------------------------------------------ */
/*  Compteurs + rapport global                                         */
/* ------------------------------------------------------------------ */

export interface HeaderCheckCounts {
  readonly ok: number;
  readonly missing: number;
  readonly incomplete: number;
  readonly invalid: number;
  readonly skipped: number;
  readonly total: number;
}

export interface HeaderCheckReport {
  readonly results: readonly HeaderCheckResult[];
  readonly counts: HeaderCheckCounts;
}

/* ------------------------------------------------------------------ */
/*  Champs extraits d'un en-tête                                       */
/* ------------------------------------------------------------------ */

export interface HeaderFields {
  readonly path: string | null;
  readonly projectId: string | null;
  readonly type: string | null;
  readonly role: string | null;
  readonly status: string | null;
  readonly pathChecked: string | null;
  readonly metaDataChecked: string | null;
  readonly scriptChecked: string | null;
  readonly raw: Readonly<Record<string, string>>;
}

/* ------------------------------------------------------------------ */
/*  Relations extraites (multi-lignes)                                 */
/* ------------------------------------------------------------------ */

export interface ParsedRelations {
  readonly ecosystem: readonly string[];
  readonly relatedFiles: readonly string[];
  readonly useBy: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Réciprocité                                                        */
/* ------------------------------------------------------------------ */

export type ReciprocityField = "ecosystem" | "relatedFiles" | "useBy";

export interface ReciprocityIssue {
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly sourceField: ReciprocityField;
  readonly expectedField: ReciprocityField;
  readonly severity: HeaderCheckSeverity;
  readonly message: string;
}

export interface HeaderReciprocityReport {
  readonly issues: readonly ReciprocityIssue[];
  readonly checkedPairs: number;
  readonly skippedPairs: number;
  readonly missingTargets: readonly {
    readonly sourcePath: string;
    readonly sourceField: ReciprocityField;
    readonly targetPath: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Exclusions par défaut                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_HEADER_EXCLUSIONS: readonly string[] = [
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  "data",
  "public",
  "build",
  "dist",
  "generated",
  "*.json",
  "*.md",
  "*.css",
  "*.yaml",
  "*.yml",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.svg",
  "*.ico",
  "*.lock",
  "*.log",
  "*.ttf",
  "*.woff",
  "*.woff2",
];