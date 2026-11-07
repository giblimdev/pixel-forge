/*
path:            app/pixel/lib/validators/svg-sanitizer.ts
tag:             ["pixel", "validation", "svg", "sanitizer", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Neutralise les SVG dangereux AVANT toute rasterisation
                 via sharp. Retire les balises <script>, les attributs
                 d'evenement (onload, onclick, onerror, ...), les URLs
                 javascript:, les entites externes <!ENTITY>, et les
                 DOCTYPE permettant le XXE. Ne leve jamais : retourne un
                 ProcessingError structure en cas d'erreur de parsing.
                 Importable UNIQUEMENT cote serveur (server-only).

                 ⚠️ Ce n'est PAS un sanitizer complet type DOMPurify :
                 sharp rasterise le SVG avant qu'il n'atteigne le
                 navigateur, ce qui neutralise deja la majorite des
                 vecteurs XSS. Ce sanitizer est une defense en profondeur
                 pour les cas ou le SVG serait renvoye tel quel (outil
                 SVG -> SVG en V2, par exemple). Il rejette les
                 constructions dangereuses plutot que de les nettoyer
                 silencieusement.

flow:            sanitizeSvg(buffer) -> decode UTF-8 -> verifie absence
                 de balises/attrs interdits (regex) -> si trouve :
                 erreur INVALID_INPUT avec le motif fautif ; sinon :
                 retourne { ok: true, data: buffer } tel quel.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/mime-validator.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only",
                  "@/app/pixel/types/processing"]
exports:         ["FORBIDDEN_SVG_PATTERNS", "sanitizeSvg"]
useBy:           ["@/app/api/images/convert/route.ts",
                  "@/app/api/images/optimize/route.ts",
                  "@/app/api/images/compress/route.ts",
                  "@/app/api/images/resize/route.ts",
                  "@/app/api/images/favicon/route.ts",
                  "@/app/api/images/placeholder/route.ts"]

userStories:     ["*en tant que developpeur je veux neutraliser les SVG dangereux",
                  "*en tant qu'utilisateur je veux etre protege du XSS via SVG"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Motifs interdits
// ---------------------------------------------------------------------------

export const FORBIDDEN_SVG_PATTERNS: ReadonlyArray<{
  readonly id: string;
  readonly regex: RegExp;
  readonly reason: string;
}> = [
  {
    id: "script-tag",
    regex: /<\s*script\b/i,
    reason: "Balise <script> interdite dans un SVG.",
  },
  {
    id: "event-handler",
    regex: /\son[a-z]+\s*=/i,
    reason: "Attribut d'evenement (on*) interdit dans un SVG.",
  },
  {
    id: "javascript-url",
    regex: /(href|xlink:href|src)\s*=\s*["']\s*javascript:/i,
    reason: "URL javascript: interdite dans un SVG.",
  },
  {
    id: "external-entity",
    regex: /<!ENTITY\b/i,
    reason: "Entite externe (<!ENTITY>) interdite (XXE).",
  },
  {
    id: "doctype-with-entity",
    regex: /<!DOCTYPE[^>]*\[/i,
    reason: "DOCTYPE avec sous-ensemble interne interdit (XXE).",
  },
  {
    id: "foreign-object",
    regex: /<\s*foreignObject\b/i,
    reason: "Balise <foreignObject> interdite (injection HTML).",
  },
  {
    id: "data-html-url",
    regex: /(href|xlink:href)\s*=\s*["']\s*data:text\/html/i,
    reason: "URL data:text/html interdite dans un SVG.",
  },
];

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): ProcessingError {
  return details === undefined ? { code, message } : { code, message, details };
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

export function sanitizeSvg(
  buffer: Buffer,
):
  | { readonly ok: true; readonly data: Buffer }
  | { readonly ok: false; readonly error: ProcessingError } {
  if (buffer.length === 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Buffer SVG vide."),
    };
  }

  let text: string;
  try {
    text = buffer.toString("utf-8");
  } catch {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "SVG illisible en UTF-8."),
    };
  }

  for (const pattern of FORBIDDEN_SVG_PATTERNS) {
    if (pattern.regex.test(text)) {
      return {
        ok: false,
        error: errorOf(
          "INVALID_INPUT",
          `SVG rejete : ${pattern.reason}`,
          { pattern: pattern.id },
        ),
      };
    }
  }

  return { ok: true, data: buffer };
}