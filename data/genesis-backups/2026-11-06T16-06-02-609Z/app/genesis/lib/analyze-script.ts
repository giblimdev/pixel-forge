/*
path :           app/genesis/lib/analyze-script.ts
tag :            ["genesis", "create-files", "analysis", "helper", "pure", "truncation", "typescript"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Analyse de complétude d'un script collé dans CreateFiles.
                 Utilise le PARSER TYPESCRIPT (déjà présent via Next.js) pour
                 détecter les erreurs de syntaxe réelles (troncature, accolades
                 non fermées, chaînes non fermées, etc.) au lieu d'un
                 tokenizer maison. Détecte aussi les placeholders (TODO,
                 FIXME, ...), les imports suspendus, et l'absence d'export.
                 Calcule un score 0-100. Ne lève jamais.

                 ⚠️ parseDiagnostics n'est pas dans les types publics de
                 TypeScript : on y accède via un cast `as unknown as
                 { parseDiagnostics: ts.Diagnostic[] }`. La propriété
                 existe bien à l'exécution.

                 ⚠️ Avantages vs tokenizer maison :
                 - Zéro faux positif sur JSX (`/>`, `</tag>`, attributs
                   multi-lignes, expressions `{{...}}`).
                 - Zéro faux positif sur les classes Tailwind (`chart-1/50`).
                 - Détecte les vraies erreurs de syntaxe (accolade manquante,
                   string non fermée, etc.).
                 - Robuste aux regex, templates, commentaires imbriqués.

flow:            analyzeScript(body) → parseScriptHeader (en-tête) →
                 ts.createSourceFile (parse) → si parseSucceeded : score
                 100 (moins placeholders + imports suspendus + pas d'export)
                 → si parseFailed : score réduit selon le nombre d'erreurs
                 → ScriptAnalysis.

ecosystem:       CreateFiles = [
                   "@/app/genesis/components/ScriptAnalyzer.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/lib/analyze-script.ts",
                   "@/app/genesis/lib/parse-script.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/parse-script.ts"]

imports:         ["typescript", "@/app/genesis/lib/parse-script"]

exports:         ["ScriptIssue", "ScriptAnalysis", "analyzeScript"]

useBy:           ["@/app/genesis/components/ScriptAnalyzer.tsx",
                  "@/app/genesis/components/ScriptInput.tsx"]

userStories:     ["*en tant qu'utilisateur je veux savoir si mon script est complet avant de l'ajouter"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import ts from "typescript";

import { parseScriptHeader } from "@/app/genesis/lib/parse-script";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ScriptIssueSeverity = "error" | "warning";
export type ScriptIssueCategory =
  | "structure"
  | "truncation"
  | "placeholder"
  | "content";

export interface ScriptIssue {
  readonly severity: ScriptIssueSeverity;
  readonly category: ScriptIssueCategory;
  readonly message: string;
  readonly line?: number;
}

export interface ScriptAnalysis {
  readonly score: number;
  readonly complete: boolean;
  readonly issues: readonly ScriptIssue[];
  readonly hasHeader: boolean;
  readonly headerPath: string | null;
  readonly braceBalance: number;
  readonly parenBalance: number;
  readonly bracketBalance: number;
  readonly hasExport: boolean;
  readonly lineCount: number;
  readonly hasError: boolean;
}

/* ------------------------------------------------------------------ */
/*  Parse TypeScript                                                   */
/* ------------------------------------------------------------------ */

interface TsParseResult {
  readonly ok: boolean;
  readonly errors: readonly { message: string; line: number }[];
  readonly braceBalance: number;
  readonly parenBalance: number;
  readonly bracketBalance: number;
}

/**
 * Type interne pour accéder à `parseDiagnostics` qui n'est pas exposé
 * dans les types publics de TypeScript mais existe à l'exécution.
 */
interface SourceFileWithDiagnostics extends ts.SourceFile {
  readonly parseDiagnostics: readonly ts.Diagnostic[];
}

/**
 * Parse le script avec TypeScript. Retourne les erreurs de syntaxe
 * réelles (pas d'heuristique) et un équilibrage approximatif des
 * délimiteurs (calculé sur l'AST, donc fiable).
 */
function parseWithTypeScript(body: string): TsParseResult {
  // Détermine le ScriptKind selon l'extension détectée dans l'en-tête.
  const parsed = parseScriptHeader(body);
  const ext = parsed.path?.split(".").pop()?.toLowerCase() ?? "ts";
  const scriptKind =
    ext === "tsx" ? ts.ScriptKind.TSX :
    ext === "jsx" ? ts.ScriptKind.JSX :
    ext === "js"  ? ts.ScriptKind.JS :
                    ts.ScriptKind.TS;

  const sourceFile = ts.createSourceFile(
    "script.tsx",
    body,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKind,
  );

  // parseDiagnostics existe à l'exécution mais n'est pas dans les types
  // publics de TypeScript. On y accède via un cast explicite.
  const diagnostics =
    (sourceFile as SourceFileWithDiagnostics).parseDiagnostics ?? [];

  const errors: { message: string; line: number }[] = diagnostics.map(
    (d: ts.Diagnostic) => {
      const pos = d.start ?? 0;
      const { line } = sourceFile.getLineAndCharacterOfPosition(pos);
      return {
        message: ts.flattenDiagnosticMessageText(d.messageText, " "),
        line: line + 1,
      };
    },
  );

  // Équilibrage fiable via l'AST : on compte les tokens réels.
  let braces = 0;
  let parens = 0;
  let brackets = 0;
  let ok = errors.length === 0;

  const visit = (node: ts.Node) => {
    if (
      node.kind === ts.SyntaxKind.OpenBraceToken ||
      node.kind === ts.SyntaxKind.CloseBraceToken
    ) {
      braces += node.kind === ts.SyntaxKind.OpenBraceToken ? 1 : -1;
    }
    if (
      node.kind === ts.SyntaxKind.OpenParenToken ||
      node.kind === ts.SyntaxKind.CloseParenToken
    ) {
      parens += node.kind === ts.SyntaxKind.OpenParenToken ? 1 : -1;
    }
    if (
      node.kind === ts.SyntaxKind.OpenBracketToken ||
      node.kind === ts.SyntaxKind.CloseBracketToken
    ) {
      brackets += node.kind === ts.SyntaxKind.OpenBracketToken ? 1 : -1;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  // Un déséquilibre dans l'AST est un signal fort.
  if (braces !== 0 || parens !== 0 || brackets !== 0) {
    ok = false;
    if (braces !== 0) {
      errors.push({
        message: `Accolades déséquilibrées (${braces > 0 ? "+" : ""}${braces}).`,
        line: 0,
      });
    }
    if (parens !== 0) {
      errors.push({
        message: `Parenthèses déséquilibrées (${parens > 0 ? "+" : ""}${parens}).`,
        line: 0,
      });
    }
    if (brackets !== 0) {
      errors.push({
        message: `Crochets déséquilibrés (${brackets > 0 ? "+" : ""}${brackets}).`,
        line: 0,
      });
    }
  }

  return {
    ok,
    errors,
    braceBalance: braces,
    parenBalance: parens,
    bracketBalance: brackets,
  };
}

/* ------------------------------------------------------------------ */
/*  Placeholders                                                       */
/* ------------------------------------------------------------------ */

interface PlaceholderHit {
  readonly message: string;
  readonly line: number;
}

const PLACEHOLDER_PATTERNS: readonly {
  readonly regex: RegExp;
  readonly label: string;
}[] = [
  { regex: /\/\/\s*(TODO|FIXME|XXX|HACK)\b/i, label: "TODO/FIXME" },
  { regex: /\/\/\s*(à implémenter|à faire|implement|fixme)\b/i, label: "À implémenter" },
  { regex: /\/\/\s*\.\.\.\s*$/, label: "..." },
  { regex: /\/\/\s*rest of (the )?code\b/i, label: "rest of code" },
  { regex: /^\s*\/\*\s*\.\.\.\s*\*\/\s*$/, label: "/* ... */ vide" },
  { regex: /^\s*\{\s*\/\*\s*\.\.\.\s*\*\/\s*\}\s*$/, label: "{/* ... */} vide" },
  { regex: /^\s*\.\.\.\s*$/, label: "..." },
  { regex: /\/\/\s*etc\.?\s*$/i, label: "etc." },
];

function findPlaceholders(body: string): PlaceholderHit[] {
  const hits: PlaceholderHit[] = [];
  const lines = body.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    for (const p of PLACEHOLDER_PATTERNS) {
      if (p.regex.test(line)) {
        hits.push({
          message: `Placeholder "${p.label}" détecté.`,
          line: idx + 1,
        });
        break;
      }
    }
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/*  Imports suspendus                                                  */
/* ------------------------------------------------------------------ */

interface SuspendedHit {
  readonly message: string;
  readonly line: number;
}

function findSuspended(body: string): SuspendedHit[] {
  const hits: SuspendedHit[] = [];
  const lines = body.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line.startsWith("import ")) continue;

    let found = false;
    let j = idx;
    while (j < lines.length) {
      const current = lines[j];
      if (/\bfrom\b/.test(current) || /;/.test(current)) {
        found = true;
        break;
      }
      if (
        j > idx &&
        /^(import|export|function|const|let|var|class)\b/.test(current.trim())
      ) {
        break;
      }
      j++;
    }

    if (!found) {
      hits.push({
        message: "Import suspendu (manque from ou ;).",
        line: idx + 1,
      });
    }
  }

  return hits;
}

/* ------------------------------------------------------------------ */
/*  API publique                                                       */
/* ------------------------------------------------------------------ */

export function analyzeScript(body: string): ScriptAnalysis {
  const issues: ScriptIssue[] = [];
  let score = 100;

  const parsed = parseScriptHeader(body);
  const hasHeader = parsed.path !== null;

  if (!hasHeader) {
    issues.push({
      severity: "error",
      category: "structure",
      message: parsed.error ?? "En-tête /* */ manquant ou invalide.",
    });
    score -= 40;
  }

  // Parse TypeScript : c'est LUI qui détecte les vraies erreurs de syntaxe.
  const tsResult = parseWithTypeScript(body);
  for (const err of tsResult.errors) {
    issues.push({
      severity: "error",
      category: "truncation",
      message: err.message,
      line: err.line > 0 ? err.line : undefined,
    });
    score -= 30;
  }

  for (const hit of findPlaceholders(body)) {
    issues.push({
      severity: "error",
      category: "placeholder",
      message: hit.message,
      line: hit.line,
    });
    score -= 15;
  }

  for (const hit of findSuspended(body)) {
    issues.push({
      severity: "error",
      category: "truncation",
      message: hit.message,
      line: hit.line,
    });
    score -= 20;
  }

  const hasExport = /\bexport\s/.test(body);
  if (!hasExport) {
    issues.push({
      severity: "warning",
      category: "content",
      message: "Aucun export trouvé — le fichier ne sera pas importable.",
    });
    score -= 10;
  }

  const lineCount = body.split(/\r?\n/).length;
  if (lineCount < 3) {
    issues.push({
      severity: "warning",
      category: "content",
      message: "Script très court (moins de 3 lignes) — probablement incomplet.",
    });
    score -= 10;
  }

  const clamped = Math.max(0, Math.min(100, score));
  const hasError = issues.some((i) => i.severity === "error");

  return {
    score: clamped,
    complete: clamped >= 80 && !hasError,
    issues,
    hasHeader,
    headerPath: parsed.path,
    braceBalance: tsResult.braceBalance,
    parenBalance: tsResult.parenBalance,
    bracketBalance: tsResult.bracketBalance,
    hasExport,
    lineCount,
    hasError,
  };
}