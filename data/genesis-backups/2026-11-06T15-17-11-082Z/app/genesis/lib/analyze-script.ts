/*
path :           app/genesis/lib/analyze-script.ts
tag :            ["genesis", "create-files", "analysis", "helper", "pure", "truncation"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Analyse de complétude d'un script collé dans CreateFiles.
                 Détecte les placeholders (TODO, FIXME, ...), l'équilibrage
                 des délimiteurs {} () [] (avec pile, en ignorant chaînes,
                 commentaires, template literals, regex approximatives),
                 les chaînes/commentaires/templates non fermés, les
                 imports/exports suspendus, et l'absence d'export.
                 Calcule un score 0-100. Ne lève jamais.

                 ⚠️ On ne regarde PAS la dernière ligne : un fichier qui
                 finit par ';', '"', '`' ou un commentaire est valide.
                 Le contrôle clé de troncature est l'équilibrage des
                 délimiteurs, pas le dernier caractère.

flow:            analyzeScript(body) → parseScriptHeader (existant) →
                 checkBalanced(body) → findPlaceholders → findSuspended →
                 calcul du score → ScriptAnalysis.

ecosystem:       CreateFiles = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ScriptAnalyzer.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/lib/analyze-script.ts",
                   "@/app/genesis/lib/parse-script.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/parse-script.ts"]

imports:         ["@/app/genesis/lib/parse-script"]

exports:         ["ScriptIssue", "ScriptAnalysis", "analyzeScript"]

useBy:           ["@/app/genesis/components/ScriptAnalyzer.tsx",
                  "@/app/genesis/components/ScriptInput.tsx"]

userStories:     ["*en tant qu'utilisateur je veux savoir si mon script est complet avant de l'ajouter"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

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
/*  Équilibrage des délimiteurs                                        */
/* ------------------------------------------------------------------ */

interface BalanceResult {
  readonly ok: boolean;
  readonly braces: number;
  readonly parens: number;
  readonly brackets: number;
  readonly issues: readonly string[];
}

/**
 * Parcourt le script caractère par caractère en gérant :
 * - chaînes "..." '...' `...` (avec échappements \")
 * - commentaires // ... et /* ... *\/
 * - regex approximatives : /.../ quand / est précédé de = ( , return : [ { ;
 * - délimiteurs {} () [] avec pile pour vérifier l'ordre
 *
 * Ignore le contenu des chaînes/commentaires/regex.
 */
function checkBalanced(body: string): BalanceResult {
  const stack: string[] = [];
  const issues: string[] = [];
  let braces = 0;
  let parens = 0;
  let brackets = 0;

  let i = 0;
  const len = body.length;

  const isRegexContext = (pos: number): boolean => {
    // Cherche le dernier caractère non-blanc avant pos
    let j = pos - 1;
    while (j >= 0 && /\s/.test(body[j])) j--;
    if (j < 0) return true;
    const c = body[j];
    return "=(,:[{;!&|?+-*%<>".includes(c) || body.slice(Math.max(0, j - 5), j + 1).endsWith("return");
  };

  while (i < len) {
    const c = body[i];

    // Commentaire ligne
    if (c === "/" && body[i + 1] === "/") {
      const nl = body.indexOf("\n", i);
      i = nl === -1 ? len : nl + 1;
      continue;
    }

    // Commentaire bloc
    if (c === "/" && body[i + 1] === "*") {
      const close = body.indexOf("*/", i + 2);
      if (close === -1) {
        issues.push("Commentaire bloc non fermé (/* sans */).");
        return { ok: false, braces, parens, brackets, issues };
      }
      i = close + 2;
      continue;
    }

    // Regex approximative
    if (c === "/" && isRegexContext(i)) {
      let j = i + 1;
      let inClass = false;
      while (j < len) {
        const rc = body[j];
        if (rc === "\\") { j += 2; continue; }
        if (rc === "[") inClass = true;
        else if (rc === "]") inClass = false;
        else if (rc === "/" && !inClass) break;
        j++;
      }
      if (j < len) { i = j + 1; continue; }
      // pas de fermeture → on continue normalement (traité comme division)
    }

    // Chaînes
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      let closed = false;
      while (j < len) {
        const sc = body[j];
        if (sc === "\\") { j += 2; continue; }
        if (sc === quote) { closed = true; j++; break; }
        j++;
      }
      if (!closed) {
        issues.push(`Chaîne non fermée (${quote} ouvert à l'index ${i}).`);
        return { ok: false, braces, parens, brackets, issues };
      }
      i = j;
      continue;
    }

    // Délimiteurs
    if (c === "{" || c === "(" || c === "[") {
      stack.push(c);
      if (c === "{") braces++;
      else if (c === "(") parens++;
      else brackets++;
    } else if (c === "}" || c === ")" || c === "]") {
      const expected = c === "}" ? "{" : c === ")" ? "(" : "[";
      if (c === "}") braces--;
      else if (c === ")") parens--;
      else brackets--;
      const top = stack.pop();
      if (top !== expected) {
        issues.push(
          `Délimiteur "${c}" fermé sans "${expected}" ouvert correspondant.`,
        );
      }
    }

    i++;
  }

  if (stack.length > 0) {
    const missing = stack
      .map((s) => (s === "{" ? "}" : s === "(" ? ")" : "]"))
      .join("");
    issues.push(
      `${stack.length} délimiteur(s) non fermé(s). Manque : ${missing}.`,
    );
  }

  return {
    ok: issues.length === 0,
    braces,
    parens,
    brackets,
    issues,
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
  readonly severity: ScriptIssueSeverity;
  readonly label: string;
}[] = [
  { regex: /\/\/\s*(TODO|FIXME|XXX|HACK)\b/i, severity: "error", label: "TODO/FIXME" },
  { regex: /\/\/\s*(à implémenter|à faire|implement|fixme)\b/i, severity: "error", label: "À implémenter" },
  { regex: /\/\/\s*\.\.\.\s*$/, severity: "error", label: "..." },
  { regex: /\/\/\s*rest of (the )?code\b/i, severity: "error", label: "rest of code" },
  { regex: /\/\*\s*\.\.\.\s*\*\//, severity: "error", label: "/* ... */ vide" },
  { regex: /^\s*\.\.\.\s*$/, severity: "error", label: "..." },
  { regex: /\/\/\s*etc\.?\s*$/i, severity: "warning", label: "etc." },
];

function findPlaceholders(body: string): PlaceholderHit[] {
  const hits: PlaceholderHit[] = [];
  const lines = body.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    for (const p of PLACEHOLDER_PATTERNS) {
      if (p.regex.test(line)) {
        hits.push({ message: `Placeholder "${p.label}" détecté.`, line: idx + 1 });
        break; // un seul hit par ligne
      }
    }
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/*  Imports / exports suspendus                                        */
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
    if (line.length === 0) continue;

    // import { ... } sans from ni ;
    if (/^import\s*\{[^}]*\}\s*$/.test(line)) {
      hits.push({ message: "Import suspendu (manque from).", line: idx + 1 });
      continue;
    }
    if (/^import\s*\{[^}]*$/.test(line)) {
      hits.push({ message: "Import suspendu (accolade non fermée).", line: idx + 1 });
      continue;
    }
    // export default function sans corps
    if (/^export\s+default\s+function\s*\(?[^)]*\)?\s*$/.test(line)) {
      hits.push({ message: "Fonction exportée sans corps.", line: idx + 1 });
      continue;
    }
    // export const x =   (rien après le =)
    if (/^export\s+(const|let|var)\s+\w+\s*=\s*$/.test(line)) {
      hits.push({ message: "Assignation suspendue (rien après =).", line: idx + 1 });
      continue;
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

  const balance = checkBalanced(body);
  for (const msg of balance.issues) {
    issues.push({ severity: "error", category: "truncation", message: msg });
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
    braceBalance: balance.braces,
    parenBalance: balance.parens,
    bracketBalance: balance.brackets,
    hasExport,
    lineCount,
    hasError,
  };
}