/*
path :           app/genesis/lib/analyze-script.ts
tag :            ["genesis", "create-files", "analysis", "helper", "pure", "truncation", "tokenizer"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Analyse de complétude d'un script collé dans CreateFiles.
                 Utilise un TOKENIZER À ÉTATS (NORMAL, IN_STRING_*,
                 IN_TEMPLATE, IN_LINE_COMMENT, IN_BLOCK_COMMENT, IN_REGEX)
                 pour éviter les faux positifs sur les classes Tailwind
                 (bg-chart-1/50, size-11/20) et les multi-lignes. Détecte
                 les placeholders (TODO, FIXME, ...), l'équilibrage des
                 délimiteurs {} () [] avec pile, les chaînes/commentaires/
                 templates non fermés, les imports/exports suspendus
                 (multi-lignes géré), et l'absence d'export. Calcule un
                 score 0-100. Ne lève jamais.

                 ⚠️ On ne regarde PAS la dernière ligne. Un fichier qui
                 finit par ';', '"', '`' ou un commentaire est valide.
                 Le contrôle clé de troncature est l'équilibrage des
                 délimiteurs via le tokenizer.

flow:            analyzeScript(body) → tokenize(body) (retourne
                 { balanced, issues, braceBalance, parenBalance,
                 bracketBalance }) → findPlaceholders → findSuspended →
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
/*  Tokenizer à états                                                  */
/* ------------------------------------------------------------------ */

type TokenizerState =
  | "NORMAL"
  | "IN_STRING_DOUBLE"
  | "IN_STRING_SINGLE"
  | "IN_STRING_TEMPLATE"
  | "IN_LINE_COMMENT"
  | "IN_BLOCK_COMMENT"
  | "IN_REGEX";

interface TokenizeResult {
  readonly balanced: boolean;
  readonly issues: readonly string[];
  readonly braces: number;
  readonly parens: number;
  readonly brackets: number;
}

/**
 * Contexte regex autorisé : le `/` est traité comme regex seulement si
 * le caractère non-blanc précédent est un opérateur unaire/binaire ou
 * un mot-clé regex. On exclut explicitement les `/` de classes Tailwind
 * (précédés de chiffre ou lettre).
 */
function isRegexContext(body: string, pos: number): boolean {
  let j = pos - 1;
  while (j >= 0 && /\s/.test(body[j])) j--;
  if (j < 0) return true;
  const c = body[j];

  // Pas de regex si précédé d'un chiffre ou d'une lettre (chart-1/50).
  if (/[0-9a-zA-Z_]/.test(c)) return false;

  // Contexte opérateur unaire/binaire.
  if ("=(){}[],:;!&|?+-*%<>~^".includes(c)) return true;

  // Mots-clés regex.
  const before = body.slice(Math.max(0, j - 11), j + 1);
  if (/\b(return|typeof|case|in|of|delete|void|instanceof)$/.test(before)) {
    return true;
  }

  return false;
}

function tokenize(body: string): TokenizeResult {
  const stack: string[] = [];
  const issues: string[] = [];
  let braces = 0;
  let parens = 0;
  let brackets = 0;

  let state: TokenizerState = "NORMAL";
  let i = 0;
  const len = body.length;

  while (i < len) {
    const c = body[i];
    const next = i + 1 < len ? body[i + 1] : "";

    switch (state) {
      case "NORMAL": {
        // Commentaires
        if (c === "/" && next === "/") {
          state = "IN_LINE_COMMENT";
          i += 2;
          continue;
        }
        if (c === "/" && next === "*") {
          state = "IN_BLOCK_COMMENT";
          i += 2;
          continue;
        }
        // Regex
        if (c === "/" && isRegexContext(body, i)) {
          state = "IN_REGEX";
          i += 1;
          continue;
        }
        // Chaînes
        if (c === '"') { state = "IN_STRING_DOUBLE"; i += 1; continue; }
        if (c === "'") { state = "IN_STRING_SINGLE"; i += 1; continue; }
        if (c === "`") { state = "IN_STRING_TEMPLATE"; i += 1; continue; }
        // Délimiteurs
        if (c === "{" || c === "(" || c === "[") {
          stack.push(c);
          if (c === "{") braces++;
          else if (c === "(") parens++;
          else brackets++;
          i += 1;
          continue;
        }
        if (c === "}" || c === ")" || c === "]") {
          const expected = c === "}" ? "{" : c === ")" ? "(" : "[";
          const top = stack.pop();
          if (top !== expected) {
            issues.push(
              `Délimiteur "${c}" fermé sans "${expected}" ouvert correspondant.`,
            );
          }
          if (c === "}") braces--;
          else if (c === ")") parens--;
          else brackets--;
          i += 1;
          continue;
        }
        i += 1;
        continue;
      }

      case "IN_LINE_COMMENT": {
        if (c === "\n") {
          state = "NORMAL";
        }
        i += 1;
        continue;
      }

      case "IN_BLOCK_COMMENT": {
        if (c === "*" && next === "/") {
          state = "NORMAL";
          i += 2;
          continue;
        }
        i += 1;
        continue;
      }

      case "IN_STRING_DOUBLE":
      case "IN_STRING_SINGLE": {
        const quote = state === "IN_STRING_DOUBLE" ? '"' : "'";
        if (c === "\\") { i += 2; continue; }
        if (c === quote) { state = "NORMAL"; i += 1; continue; }
        i += 1;
        continue;
      }

      case "IN_STRING_TEMPLATE": {
        if (c === "\\") { i += 2; continue; }
        if (c === "`") { state = "NORMAL"; i += 1; continue; }
        // ${...} → on doit compter les { } à l'intérieur
        if (c === "$" && next === "{") {
          // On entre dans une expression : compte le {
          braces++;
          stack.push("{");
          i += 2;
          continue;
        }
        i += 1;
        continue;
      }

      case "IN_REGEX": {
        if (c === "\\") { i += 2; continue; }
        if (c === "[") {
          // classe de caractères : skip jusqu'à ]
          let j = i + 1;
          while (j < len) {
            if (body[j] === "\\") { j += 2; continue; }
            if (body[j] === "]") { j += 1; break; }
            j++;
          }
          i = j;
          continue;
        }
        if (c === "/") { state = "NORMAL"; i += 1; continue; }
        if (c === "\n") {
          // regex non fermée sur la même ligne → sortie défensive
          issues.push("Regex non fermée (fin de ligne prématurée).");
          state = "NORMAL";
          i += 1;
          continue;
        }
        i += 1;
        continue;
      }
    }
  }

  // Fermeture des états string/comment/regex en fin de fichier.
  if (state === "IN_STRING_DOUBLE") {
    issues.push("Chaîne non fermée (guillemet double).");
  } else if (state === "IN_STRING_SINGLE") {
    issues.push("Chaîne non fermée (guillemet simple).");
  } else if (state === "IN_STRING_TEMPLATE") {
    issues.push("Template literal non fermé (`).");
  } else if (state === "IN_BLOCK_COMMENT") {
    issues.push("Commentaire bloc non fermé (/* sans */).");
  } else if (state === "IN_REGEX") {
    issues.push("Regex non fermée (/ sans /).");
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
    balanced: issues.length === 0,
    issues,
    braces,
    parens,
    brackets,
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
  { regex: /\/\*\s*\.\.\.\s*\*\//, label: "/* ... */ vide" },
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
/*  Imports / exports suspendus (multi-lignes géré)                    */
/* ------------------------------------------------------------------ */

interface SuspendedHit {
  readonly message: string;
  readonly line: number;
}

/**
 * Un import suspendu = une ligne commençant par `import` qui n'a ni
 * `from`, ni `;`, ni fermeture `}` avant la fin du statement suivant.
 * On scanne jusqu'au prochain `;` pour tolérer les imports multi-lignes.
 */
function findSuspended(body: string): SuspendedHit[] {
  const hits: SuspendedHit[] = [];
  const lines = body.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line.startsWith("import ")) continue;

    // Cherche un `;` ou `from` sur cette ligne ou les suivantes.
    let found = false;
    let j = idx;
    while (j < lines.length) {
      const current = lines[j];
      if (/\bfrom\b/.test(current) || /;/.test(current)) {
        found = true;
        break;
      }
      if (j > idx && /^(import|export|function|const|let|var|class)\b/.test(current.trim())) {
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

  const tok = tokenize(body);
  for (const msg of tok.issues) {
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
    braceBalance: tok.braces,
    parenBalance: tok.parens,
    bracketBalance: tok.brackets,
    hasExport,
    lineCount,
    hasError,
  };
}