/*
path :           app/genesis/lib/header-parser.ts
tag :            ["genesis", "check-headers", "parser", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Extraction des champs depuis le bloc d'en-tête /* *\/
                 en début de fichier. Ne lève jamais : retourne
                 { hasHeader: false } si aucun bloc. Chaque ligne de la
                 forme "clé : valeur" est parsée ; les valeurs multi-lignes
                 (tableaux, objets) sont conservées brutes dans raw.

flow:            parseFileHeader(raw) → match du bloc /* ... *\/ initial
                 → découpage en lignes → pour chaque ligne "clé : valeur"
                 → accumulation dans un Record → mapping vers HeaderFields
                 → { hasHeader, headerRaw, fields }.

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
                  "@/app/genesis/lib/header-rules.ts"]

imports:         ["@/app/genesis/lib/header-types"]

exports:         ["ParsedHeader", "parseFileHeader"]

useBy:           ["@/app/genesis/lib/header-check.ts"]

userStories:     ["*en tant que développeur je veux parser un en-tête de fichier"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { HeaderFields } from "@/app/genesis/lib/header-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ParsedHeader {
  readonly hasHeader: boolean;
  readonly headerRaw: string | null;
  readonly fields: HeaderFields;
}

/* ------------------------------------------------------------------ */
/*  Constantes internes                                                */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Extrait le bloc d'en-tête /* ... *\/ situé au début du fichier
 * (espaces et retours ligne tolérés avant). Puis parse chaque ligne
 * "clé : valeur" du bloc.
 *
 * Ne lève jamais. Retourne hasHeader: false si aucun bloc.
 */
export function parseFileHeader(raw: string): ParsedHeader {
  const headerMatch = raw.match(/^\s*\/\*([\s\S]*?)\*\//);
  if (!headerMatch) {
    return { hasHeader: false, headerRaw: null, fields: EMPTY_FIELDS };
  }

  const headerRaw = headerMatch[0];
  const body = headerMatch[1];

  const record: Record<string, string> = {};
  // Une ligne de la forme "clé : valeur" (clé = [a-zA-Z][\w]*).
  const linePattern = /^\s*([a-zA-Z][\w]*)\s*:\s*(.*)$/;
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(linePattern);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    // Ne garde que la première occurrence (défense en profondeur).
    if (!(key in record)) {
      record[key] = value;
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

  return { hasHeader: true, headerRaw, fields };
}