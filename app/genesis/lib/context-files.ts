/*
path :           app/genesis/lib/context-files.ts
tag :            ["genesis", "copy-to-ia", "context", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Constantes et helpers purs pour l'outil copy-to-ia.
                 CONTEXT_FILES liste les 3 fichiers cibles (CONTRIBUTING.md,
                 prisma/schema.prisma, package.json) avec leur label d'affichage.
                 assembleContext(files, prompt, includePrompt) produit le texte
                 Markdown final à copier dans une IA. Le prompt n'est inclus
                 que si includePrompt vaut true ET qu'il est non vide. Aucune
                 dépendance runtime, aucun effet.

flow:            CONTEXT_FILES constant. assembleContext(files, prompt,
                 includePrompt) → filtré sur content non vide → concatène en
                 sections Markdown (# Contexte projet, ## Prompt, ## <label>)
                 → retourne la string.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
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
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
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

exports:         ["CONTEXT_FILES", "assembleContext"]

useBy:           ["@/app/genesis/actions/context-files.ts",
                  "@/app/genesis/components/CopyToIaPanel.tsx",
                  "@/app/genesis/copy-to-ia/page.tsx"]

userStories:     ["*en tant que développeur je veux assembler un contexte IA en Markdown"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { ContextFile, ContextFileId } from "@/app/genesis/lib/types";

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

interface ContextFileDefinition {
  readonly id: ContextFileId;
  readonly path: string;
  readonly label: string;
}

export const CONTEXT_FILES: readonly ContextFileDefinition[] = [
  {
    id: "contributing",
    path: "CONTRIBUTING.md",
    label: "Règles de contribution (CONTRIBUTING.md)",
  },
  {
    id: "prisma",
    path: "prisma/schema.prisma",
    label: "Schéma Prisma (prisma/schema.prisma)",
  },
  {
    id: "package",
    path: "package.json",
    label: "Stack (package.json)",
  },
];

/* ------------------------------------------------------------------ */
/*  Assemblage du contexte                                             */
/* ------------------------------------------------------------------ */

/**
 * Assemble le texte Markdown final à copier dans une IA.
 * - Le prompt n'est inclus que si includePrompt === true ET non vide.
 * - Seuls les fichiers au contenu non vide sont inclus (sécurité : un fichier
 *   absent ou vidé ne pollue pas la sortie).
 * - Chaque fichier est précédé d'un titre de section et enveloppé
 *   d'un bloc de code adapté (json, prisma, markdown).
 */
export function assembleContext(
  files: readonly ContextFile[],
  prompt: string,
  includePrompt: boolean,
): string {
  const lines: string[] = ["# Contexte projet Genesis", ""];

  const trimmedPrompt = prompt.trim();
  if (includePrompt && trimmedPrompt.length > 0) {
    lines.push("## Prompt");
    lines.push("");
    lines.push(trimmedPrompt);
    lines.push("");
  }

  const included = files.filter((file) => file.content.trim().length > 0);
  for (const file of included) {
    lines.push(`## ${file.label}`);
    lines.push("");
    const lang = languageForFile(file.id);
    lines.push("```" + lang);
    lines.push(file.content.trimEnd());
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function languageForFile(id: ContextFileId): string {
  switch (id) {
    case "contributing":
      return "markdown";
    case "prisma":
      return "prisma";
    case "package":
      return "json";
  }
}