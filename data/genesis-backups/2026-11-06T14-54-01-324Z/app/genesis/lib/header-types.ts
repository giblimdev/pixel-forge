/*
path :           app/genesis/lib/header-types.ts
tag :            ["genesis", "check-headers", "types", "helper", "config"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Types partagés pour l'outil check-headers + constante
                 DEFAULT_HEADER_EXCLUSIONS (liste par défaut des dossiers/
                 extensions exemptés de la vérification d'en-tête). Aucune
                 dépendance runtime, aucun effet.

flow:            Module TypeScript pur → export des types et de la constante.

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

relatedFiles:    ["@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/header-check.ts"]

imports:         []

exports:         ["HeaderCheckStatus", "HeaderCheckSeverity",
                  "HeaderCheckIssue", "HeaderCheckResult",
                  "HeaderCheckCounts", "HeaderCheckReport",
                  "HeaderFields", "DEFAULT_HEADER_EXCLUSIONS"]

useBy:           ["@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/header-check.ts",
                  "@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/HeaderCheckPanel.tsx",
                  "@/app/genesis/components/HeaderCheckReport.tsx",
                  "@/app/genesis/components/HeaderCheckRow.tsx"]

userStories:     ["*en tant que développeur je veux des types partagés pour le check d'en-têtes"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Statuts de vérification                                            */
/* ------------------------------------------------------------------ */

export type HeaderCheckStatus =
  | "ok"          // en-tête présent et conforme
  | "missing"     // pas d'en-tête /* ... */
  | "incomplete"  // en-tête présent mais champs obligatoires manquants
  | "invalid"     // en-tête présent mais incohérent (path ≠ réel, status ≠ *Checked)
  | "skipped";    // fichier exclu (binaire, extension non autorisée, etc.)

export type HeaderCheckSeverity = "error" | "warning";

/* ------------------------------------------------------------------ */
/*  Issues (problèmes détectés)                                        */
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
  /** Bloc d'en-tête extrait brut (null si absent). */
  readonly headerRaw: string | null;
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
  /** Tous les champs bruts (clé → valeur), pour extensibilité. */
  readonly raw: Readonly<Record<string, string>>;
}

/* ------------------------------------------------------------------ */
/*  Exclusions par défaut                                              */
/* ------------------------------------------------------------------ */

/**
 * Dossiers / extensions exemptés par défaut. Modifiable via la dialog
 * d'exclusions (persisté dans data/genesis-headerCheck-exclusions.json).
 */
export const DEFAULT_HEADER_EXCLUSIONS: readonly string[] = [
  // Dossiers techniques
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  "data",
  "public",
  "build",
  "dist",
  // Dossiers générés / shadcn
  "components/ui",
  "lib/generated",
  // Extensions non-TS (pas de code à en-têter)
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