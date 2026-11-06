/*
path :           app/genesis/lib/parse-script.ts
tag :            ["genesis", "parse", "script", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Extraction du path depuis l'en-tête /* *\/ d'un script collé.
                 Ne lève jamais : retourne { path: null, error } en cas d'échec.
                 Valide aussi l'extension contre une liste blanche. Exporte
                 ALLOWED_EXTENSIONS réutilisé côté serveur pour la même règle.

flow:            parseScriptHeader(raw) → match du bloc /* ... *\/ initial →
                 extraction de la ligne 'path : ...' → trim → vérification
                 d'extension → { path } ou { path: null, error }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/types.ts"]

imports:         ["@/app/genesis/lib/types"]

exports:         ["ALLOWED_EXTENSIONS", "parseScriptHeader"]

useBy:           ["@/app/genesis/lib/write-scripts.ts",
                  "@/app/genesis/components/ScriptInput.tsx"]

userStories:     ["*en tant que développeur je veux extraire le path d'un script collé"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { ParsedScript } from "@/app/genesis/lib/types";

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

/**
 * Extensions autorisées pour l'écriture. Un script dont le path ne matche
 * pas l'une de ces extensions est rejeté côté client (parse-script) et
 * côté serveur (write-scripts) — défense en profondeur.
 */
export const ALLOWED_EXTENSIONS: ReadonlySet<string> = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "md",
  "css",
  "html",
  "yml",
  "yaml",
  "prisma",
]);

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Extrait le path depuis l'en-tête /* *\/ situé au début du script.
 * Ne lève jamais : retourne un objet { path: null, error } en cas d'échec.
 */
export function parseScriptHeader(raw: string): ParsedScript {
  // 1. L'en-tête doit commencer le script (espaces/retours ligne tolérés).
  const headerMatch = raw.match(/^\s*\/\*([\s\S]*?)\*\//);
  if (!headerMatch) {
    return {
      path: null,
      error: "En-tête /* */ introuvable au début du script.",
    };
  }

  // 2. Extraire la ligne 'path : ...' du bloc d'en-tête.
  const headerBody = headerMatch[1];
  const pathMatch = headerBody.match(/^\s*path\s*:\s*(.+?)\s*$/m);
  if (!pathMatch) {
    return {
      path: null,
      error: "Ligne 'path :' introuvable dans l'en-tête.",
    };
  }

  const extracted = pathMatch[1].trim();
  if (extracted.length === 0) {
    return {
      path: null,
      error: "Path vide dans l'en-tête.",
    };
  }

  // 3. Vérifier l'extension.
  const ext = extracted.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      path: null,
      error: `Extension non autorisée : .${ext || "(aucune)"}`,
    };
  }

  return { path: extracted };
}