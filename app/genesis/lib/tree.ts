/*
path :           app/genesis/lib/tree.ts
tag :            ["genesis", "tree", "fs", "server-only"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Construction de l'arbre de fichiers du projet à partir du
                 système de fichiers. Parcourt récursivement process.cwd(),
                 applique les exclusions, ignore les symlinks (pour éviter
                 les boucles). Tri : dossiers d'abord, puis alphabétique
                 insensible à la casse. Importable UNIQUEMENT côté serveur.

flow:            buildFileTree(exclusions) → walkDir("", exclusions, ROOT) →
                 readdir avecFileTypes → pour chaque entrée : si exclue → skip ;
                 si symlink → skip ; si dossier → récursion ; si fichier →
                 push. Sort final → FileNode[].

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

relatedFiles:    ["@/app/genesis/lib/types.ts",
                  "@/app/genesis/lib/exclusions.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/exclusions"]

exports:         ["buildFileTree"]

useBy:           ["@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/create-files/page.tsx",
                  "@/app/genesis/read-files/page.tsx"]

userStories:     ["*en tant que développeur je veux construire l'arbre du projet depuis le FS"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import "server-only";

import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { FileNode } from "@/app/genesis/lib/types";
import { matchesExclusion } from "@/app/genesis/lib/exclusions";

const ROOT = process.cwd();

/* ------------------------------------------------------------------ */
/*  API publique                                                       */
/* ------------------------------------------------------------------ */

/**
 * Construit l'arbre complet du projet, exclusions appliquées.
 * - Les symlinks sont ignorés (évite les boucles infinies).
 * - Les entrées sont triées : dossiers d'abord, puis alphabétique insensible
 *   à la casse.
 */
export async function buildFileTree(
  exclusions: readonly string[],
): Promise<readonly FileNode[]> {
  return walkDir("", exclusions, ROOT);
}

/* ------------------------------------------------------------------ */
/*  Implémentation                                                     */
/* ------------------------------------------------------------------ */

async function walkDir(
  relPath: string,
  exclusions: readonly string[],
  absPath: string,
): Promise<readonly FileNode[]> {
  let entries;
  try {
    entries = await readdir(absPath, { withFileTypes: true });
  } catch {
    // Dossier illisible (permissions) : on rend une liste vide plutôt que
    // de casser tout l'arbre.
    return [];
  }

  const nodes: FileNode[] = [];

  for (const entry of entries) {
    const name = entry.name;
    if (matchesExclusion(name, exclusions)) continue;
    if (entry.isSymbolicLink()) continue;

    const entryRel = relPath ? `${relPath}/${name}` : name;
    const entryAbs = join(absPath, name);

    if (entry.isDirectory()) {
      const children = await walkDir(entryRel, exclusions, entryAbs);
      nodes.push({
        path: entryRel,
        name,
        isDir: true,
        children,
      });
    } else if (entry.isFile()) {
      nodes.push({
        path: entryRel,
        name,
        isDir: false,
      });
    }
  }

  nodes.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return nodes;
}