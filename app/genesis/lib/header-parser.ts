/*
path :           app/genesis/lib/header-parser.ts
tag :            ["genesis", "check-headers", "parser", "helper", "pure", "multiline"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Extraction des champs depuis le bloc d'en-tête /* *\/
                 en début de fichier, AVEC support des blocs multi-lignes
                 pour ecosystem, relatedFiles, useBy. Ne lève jamais.
                 Extrait les chemins via regex "@/..." dans ces blocs.

flow:            parseFileHeader(raw) → match bloc → découpage lignes →
                 pour chaque ligne "clé : valeur" : si clé ∈ {ecosystem,
                 relatedFiles, useBy} → accumule les lignes suivantes
                 jusqu'à fermeture ] ou ) → extrait les chemins @/...
                 → sinon stocke la valeur simple → { hasHeader, headerRaw,
                 fields, relations }.

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
                  "@/app/genesis/lib/header-rules.ts"]

imports:         ["@/app/genesis/lib/header-types"]

exports:         ["ParsedHeader", "parseFileHeader", "RELATION_FIELDS"]

useBy:           ["@/app/genesis/lib/header-check.ts"]

userStories:     ["*en tant que développeur je veux parser un en-tête multi-lignes"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type {
  HeaderFields,
  ParsedRelations,
  ReciprocityField,
} from "@/app/genesis/lib/header-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ParsedHeader {
  readonly hasHeader: boolean;
  readonly headerRaw: string | null;
  readonly fields: HeaderFields;
  readonly relations: ParsedRelations;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

/** Champs dont le contenu est un bloc multi-lignes de chemins. */
export const RELATION_FIELDS: readonly ReciprocityField[] = [
  "ecosystem",
  "relatedFiles",
  "useBy",
];

const EMPTY_FIELDS: HeaderFields = {
  path: null,
  projectId: null,
  type: null,
  role: null,
  status: null,
  pathChecked: null,
  metaDataChecked: null,
  scriptChecked: null,
  raw: {},
};

const EMPTY_RELATIONS: ParsedRelations = {
  ecosystem: [],
  relatedFiles: [],
  useBy: [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Extrait tous les chemins entre guillemets commençant par @/. */
function extractPaths(text: string): string[] {
  const matches = text.match(/"(@\/[^"]+)"/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

export function parseFileHeader(raw: string): ParsedHeader {
  const headerMatch = raw.match(/^\s*\/\*([\s\S]*?)\*\//);
  if (!headerMatch) {
    return {
      hasHeader: false,
      headerRaw: null,
      fields: EMPTY_FIELDS,
      relations: EMPTY_RELATIONS,
    };
  }

  const headerRaw = headerMatch[0];
  const body = headerMatch[1];
  const lines = body.split(/\r?\n/);

  const record: Record<string, string> = {};
  const relations: Record<ReciprocityField, string[]> = {
    ecosystem: [],
    relatedFiles: [],
    useBy: [],
  };

  const linePattern = /^\s*([a-zA-Z][\w]*)\s*:\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(linePattern);
    if (!match) continue;

    const key = match[1];
    const firstValue = match[2];

    // Champ relationnel ? Accumule tant que le bloc n'est pas fermé.
    if ((RELATION_FIELDS as readonly string[]).includes(key)) {
      const block: string[] = [firstValue];
      let closed = /[\]\)]/.test(firstValue);
      let j = i + 1;
      while (!closed && j < lines.length) {
        block.push(lines[j]);
        if (/[\]\)]/.test(lines[j])) closed = true;
        j++;
      }
      i = j - 1; // reprend après le bloc
      const field = key as ReciprocityField;
      const paths = extractPaths(block.join("\n"));
      relations[field].push(...paths);
      record[key] = block.join("\n").trim();
      continue;
    }

    // Champ simple.
    if (!(key in record)) {
      record[key] = firstValue.trim();
    }
  }

  const fields: HeaderFields = {
    path: record.path ?? null,
    projectId: record.projectId ?? null,
    type: record.type ?? null,
    role: record.role ?? null,
    status: record.status ?? null,
    pathChecked: record.pathChecked ?? null,
    metaDataChecked: record.metaDataChecked ?? null,
    scriptChecked: record.scriptChecked ?? null,
    raw: record,
  };

  return {
    hasHeader: true,
    headerRaw,
    fields,
    relations,
  };
}