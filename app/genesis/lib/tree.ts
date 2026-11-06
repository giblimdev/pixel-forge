/*
path :           app/genesis/lib/tree.ts
tag :            ["genesis", "tree", "fs", "server-only", "path-exclusions"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Construction de l'arbre de fichiers du projet à partir du
                 système de fichiers. Utilise matchesPathExclusion (nouveau
                 helper) pour gérer TOUS les patterns : /node_modules,
                 wildcard .next, components/ui, *.json, etc. Ignore les
                 symlinks. Tri : dossiers d'abord, puis alphabétique.
                 Importable UNIQUEMENT côté serveur.

flow:            buildFileTree(exclusions) → walkDir("", exclusions, ROOT)
                 → readdir avecFileTypes → pour chaque entrée : si exclue
                 par matchesPathExclusion → skip ; si symlink → skip ; si
                 dossier → récursion ; si fichier → push. Sort final →
                 FileNode[].

ecosystem:       Genesis = [
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/exclusions-path.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/types.ts",
                  "@/app/genesis/lib/exclusions-path.ts"]

imports:         ["server-only", "node:fs/promises", "node:path",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/exclusions-path"]

exports:         ["buildFileTree"]

useBy:           ["@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/create-files/page.tsx",
                  "@/app/genesis/read-files/page.tsx",
                  "@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant que développeur je veux construire l'arbre du projet depuis le FS"]

status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import "server-only";

import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { FileNode } from "@/app/genesis/lib/types";
import { matchesPathExclusion } from "@/app/genesis/lib/exclusions-path";

const ROOT = process.cwd();

export async function buildFileTree(
  exclusions: readonly string[],
): Promise<readonly FileNode[]> {
  return walkDir("", exclusions, ROOT);
}

async function walkDir(
  relPath: string,
  exclusions: readonly string[],
  absPath: string,
): Promise<readonly FileNode[]> {
  let entries;
  try {
    entries = await readdir(absPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: FileNode[] = [];

  for (const entry of entries) {
    const name = entry.name;
    const entryRel = relPath ? `${relPath}/${name}` : name;

    if (matchesPathExclusion(entryRel, exclusions)) continue;
    if (entry.isSymbolicLink()) continue;

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