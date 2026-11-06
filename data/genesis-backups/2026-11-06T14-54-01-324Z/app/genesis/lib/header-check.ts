/*
path :           app/genesis/lib/header-check.ts
tag :            ["genesis", "check-headers", "check", "helper", "server-only"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Vérification d'un fichier : détecte binaire, extension
                 non autorisée, absence d'en-tête, champs obligatoires
                 manquants, valeurs invalides (status, type, projectId),
                 format des *Checked, cohérence status ↔ *Checked, et
                 correspondance path en-tête ↔ chemin réel. Retourne un
                 HeaderCheckResult. Importable UNIQUEMENT côté serveur.

flow:            checkOneFile(path, content) → extension check → en-tête
                 présent ? → parseFileHeader → champs obligatoires →
                 valeurs valides → cohérence → path match → compilation
                 des issues → statut final (ok / missing / incomplete /
                 invalid / skipped).

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

relatedFiles:    ["@/app/genesis/lib/header-types.ts",
                  "@/app/genesis/lib/header-rules.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/parse-script.ts"]

imports:         ["@/app/genesis/lib/header-types",
                  "@/app/genesis/lib/header-rules",
                  "@/app/genesis/lib/header-parser",
                  "@/app/genesis/lib/parse-script"]

exports:         ["checkOneFile"]

useBy:           ["@/app/genesis/actions/header-check.ts"]

userStories:     ["*en tant que développeur je veux vérifier la conformité d'un en-tête"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type {
  HeaderCheckIssue,
  HeaderCheckResult,
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
/*  Vérification d'un fichier                                          */
/* ------------------------------------------------------------------ */

export function checkOneFile(
  path: string,
  content: string,
): HeaderCheckResult {
  // 1. Extension autorisée ?
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
    };
  }

  // 2. En-tête présent ?
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
    };
  }

  const issues: HeaderCheckIssue[] = [];
  const f = parsed.fields;

  // 3. Champs obligatoires
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

  // 4. Champs en warning
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

  // 5. Valeurs valides (si présentes)
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

  // 6. Format des *Checked
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

  // 7. Cohérence status ↔ *Checked
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

  // 8. Correspondance path en-tête ↔ chemin réel
  if (f.path && f.path !== path) {
    issues.push({
      field: "path",
      severity: "error",
      message: `path de l'en-tête ("${f.path}") ≠ chemin réel ("${path}").`,
    });
  }

  // 9. Statut final
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarning = issues.some((i) => i.severity === "warning");

  let status: HeaderCheckResult["status"];
  if (hasError) {
    // Si un champ obligatoire manque → incomplete ; sinon invalid.
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
  };
}