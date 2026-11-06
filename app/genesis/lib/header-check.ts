/*
path :           app/genesis/lib/header-check.ts
tag :            ["genesis", "check-headers", "check", "helper", "server-only", "reciprocity"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Vérification d'un fichier (checkOneFile) + vérification
                 de réciprocité entre tous les fichiers (checkReciprocity).
                 checkOneFile contrôle les 8 règles de base. checkReciprocity
                 croise les relations ecosystem/useBy et relatedFiles/
                 relatedFiles pour détecter les désynchronisations et les
                 références vers des fichiers inexistants. Importable
                 UNIQUEMENT côté serveur.

flow:            checkOneFile(path, content) → contrôles de base →
                 HeaderCheckResult.
                 checkReciprocity(headers: Map<path, ParsedRelations>) →
                 pour chaque paire (A, B) où A.field contient B → vérifie
                 que B.expectedField contient A → sinon issue.
                 Détecte aussi les chemins @/... qui ne sont pas dans la
                 map (fichier inexistant ou hors scope).

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

relatedFiles:    ["@/app/genesis/lib/header-types.ts",
                  "@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/parse-script.ts"]

imports:         ["@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/header-rules",
                  "@/app/genesis/lib/header-parser",
                  "@/app/genesis/lib/parse-script"]

exports:         ["checkOneFile", "checkReciprocity", "normalizeRelPath"]

useBy:           ["@/app/genesis/actions/header-check.ts"]

userStories:     ["*en tant que développeur je veux vérifier la conformité et la réciprocité des en-têtes"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type {
  HeaderCheckIssue,
  HeaderCheckResult,
  HeaderReciprocityReport,
  ParsedRelations,
  ReciprocityField,
  ReciprocityIssue,
} from "@/app/genesis/lib/header-types";
import {
  CHECKED_PATTERN,
  HEADER_PROJECT_IDS,
  HEADER_REQUIRED_FIELDS,
  HEADER_STATUS_VALUES,
  HEADER_TYPE_VALUES,
  HEADER_WARNING_FIELDS,
} from "@/app/genesis/lib/header-rules";
import { parseFileHeader } from "@/app/genesis/lib/header-parser";
import { ALLOWED_EXTENSIONS } from "@/app/genesis/lib/parse-script";

/* ------------------------------------------------------------------ */
/*  Normalisation des chemins                                          */
/* ------------------------------------------------------------------ */

/** "@\/app\/x.ts" → "app/x.ts" ; "app/x.ts" → "app/x.ts". */
export function normalizeRelPath(path: string): string {
  return path.replace(/^@\//, "").replace(/^\/+/, "");
}

/* ------------------------------------------------------------------ */
/*  checkOneFile                                                       */
/* ------------------------------------------------------------------ */

export function checkOneFile(
  path: string,
  content: string,
): HeaderCheckResult {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      path,
      status: "skipped",
      issues: [
        {
          field: "extension",
          severity: "warning",
          message: `Extension .${ext || "(aucune)"} non vérifiée.`,
        },
      ],
      headerRaw: null,
      content,
    };
  }

  const parsed = parseFileHeader(content);
  if (!parsed.hasHeader) {
    return {
      path,
      status: "missing",
      issues: [
        {
          field: "header",
          severity: "error",
          message: "Aucun bloc /* ... */ en début de fichier.",
        },
      ],
      headerRaw: null,
      content,
    };
  }

  const issues: HeaderCheckIssue[] = [];
  const f = parsed.fields;

  for (const field of HEADER_REQUIRED_FIELDS) {
    const value = f.raw[field];
    if (value === undefined || value.length === 0) {
      issues.push({
        field,
        severity: "error",
        message: `Champ obligatoire manquant : ${field}.`,
      });
    }
  }

  for (const field of HEADER_WARNING_FIELDS) {
    const value = f.raw[field];
    if (value === undefined || value.length === 0) {
      issues.push({
        field,
        severity: "warning",
        message: `Champ recommandé manquant : ${field}.`,
      });
    }
  }

  if (f.status && !HEADER_STATUS_VALUES.includes(f.status)) {
    issues.push({
      field: "status",
      severity: "error",
      message: `status invalide : "${f.status}" (attendu : ${HEADER_STATUS_VALUES.join(" | ")}).`,
    });
  }

  if (f.type && !HEADER_TYPE_VALUES.includes(f.type)) {
    issues.push({
      field: "type",
      severity: "error",
      message: `type invalide : "${f.type}" (attendu : ${HEADER_TYPE_VALUES.join(" | ")}).`,
    });
  }

  if (f.projectId && !HEADER_PROJECT_IDS.includes(f.projectId)) {
    issues.push({
      field: "projectId",
      severity: "warning",
      message: `projectId inconnu : "${f.projectId}" (connus : ${HEADER_PROJECT_IDS.join(", ")}).`,
    });
  }

  for (const field of ["pathChecked", "metaDataChecked", "scriptChecked"] as const) {
    const value = f.raw[field];
    if (value !== undefined && value.length > 0 && !CHECKED_PATTERN.test(value)) {
      issues.push({
        field,
        severity: "error",
        message: `${field} invalide : "${value}" (attendu ✔true ou ✘false).`,
      });
    }
  }

  if (f.status === "done") {
    for (const field of ["pathChecked", "metaDataChecked", "scriptChecked"] as const) {
      if (f.raw[field] === "✘false") {
        issues.push({
          field,
          severity: "warning",
          message: `Incohérence : status "done" mais ${field} = ✘false.`,
        });
      }
    }
  }
  if (f.status === "planned") {
    for (const field of ["pathChecked", "metaDataChecked", "scriptChecked"] as const) {
      if (f.raw[field] === "✔true") {
        issues.push({
          field,
          severity: "warning",
          message: `Incohérence : status "planned" mais ${field} = ✔true.`,
        });
      }
    }
  }

  if (f.path && f.path !== path) {
    issues.push({
      field: "path",
      severity: "error",
      message: `path de l'en-tête ("${f.path}") ≠ chemin réel ("${path}").`,
    });
  }

  const hasError = issues.some((i) => i.severity === "error");
  const hasWarning = issues.some((i) => i.severity === "warning");

  let status: HeaderCheckResult["status"];
  if (hasError) {
    const missingRequired = issues.some(
      (i) =>
        i.severity === "error" &&
        i.message.startsWith("Champ obligatoire manquant"),
    );
    status = missingRequired ? "incomplete" : "invalid";
  } else if (hasWarning) {
    status = "invalid";
  } else {
    status = "ok";
  }

  return {
    path,
    status,
    issues,
    headerRaw: parsed.headerRaw,
    content,
  };
}

/* ------------------------------------------------------------------ */
/*  checkReciprocity                                                   */
/* ------------------------------------------------------------------ */

/**
 * Vérifie la réciprocité des relations entre tous les en-têtes fournis.
 *
 * Matrice :
 *   A.ecosystem  ↔  B.useBy
 *   A.useBy      ↔  B.ecosystem
 *   A.relatedFiles  ↔  B.relatedFiles
 *
 * @param headers Map<path normalisé, ParsedRelations>
 * @param knownPaths Set des chemins connus (pour détecter les références
 *        vers des fichiers inexistants). Si null, on considère que tout
 *        ce qui n'est pas dans `headers` est inexistant.
 */
export function checkReciprocity(
  headers: ReadonlyMap<string, ParsedRelations>,
  knownPaths: ReadonlySet<string> | null,
): HeaderReciprocityReport {
  const issues: ReciprocityIssue[] = [];
  const missingTargets: {
    sourcePath: string;
    sourceField: ReciprocityField;
    targetPath: string;
  }[] = [];
  let checkedPairs = 0;
  let skippedPairs = 0;

  const inverseMap: Record<ReciprocityField, ReciprocityField> = {
    ecosystem: "useBy",
    useBy: "ecosystem",
    relatedFiles: "relatedFiles",
  };

  for (const [sourcePath, sourceRelations] of headers) {
    for (const sourceField of ["ecosystem", "useBy", "relatedFiles"] as const) {
      for (const rawTarget of sourceRelations[sourceField]) {
        const targetPath = normalizeRelPath(rawTarget);

        // Cible connue ? (dans headers ou dans knownPaths)
        const targetRelations = headers.get(targetPath);
        const targetExists = targetRelations !== undefined ||
          (knownPaths !== null && knownPaths.has(targetPath));

        if (!targetExists) {
          missingTargets.push({ sourcePath, sourceField, targetPath });
          continue;
        }

        if (targetRelations === undefined) {
          // Cible connue mais pas dans la sélection (mode local) → skip
          skippedPairs++;
          continue;
        }

        const expectedField = inverseMap[sourceField];
        const isReciprocal = targetRelations[expectedField].some(
          (r) => normalizeRelPath(r) === sourcePath,
        );

        checkedPairs++;
        if (!isReciprocal) {
          issues.push({
            sourcePath,
            targetPath,
            sourceField,
            expectedField,
            severity: "warning",
            message: `${sourcePath}.${sourceField} référence ${targetPath}, mais ${targetPath}.${expectedField} ne référence pas ${sourcePath}.`,
          });
        }
      }
    }
  }

  return {
    issues,
    checkedPairs,
    skippedPairs,
    missingTargets,
  };
}