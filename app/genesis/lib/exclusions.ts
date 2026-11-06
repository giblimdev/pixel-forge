/*
path :           app/genesis/lib/exclusions.ts
tag :            ["genesis", "exclusions", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Helpers purs pour la gestion des exclusions : détection
                 d'une entrée exclue (dossier ou fichier par nom/extension),
                 filtrage d'une liste. Aucune dépendance runtime, aucun effet.
                 Réutilisé par tree.ts (côté server) et par l'UI si besoin.

flow:            matchesExclusion(name, exclusions) → true si le nom/extension
                 match une entrée. filterExcluded(items, exclusions) → sous-liste
                 des items non exclus.

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

exports:         ["matchesExclusion", "filterExcluded"]

useBy:           ["@/app/genesis/lib/tree.ts"]

userStories:     ["*en tant que développeur je veux filtrer les entrées exclues de l'arbre"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { FileNode } from "@/app/genesis/lib/types";

/* ------------------------------------------------------------------ */
/*  Détection                                                          */
/* ------------------------------------------------------------------ */

/**
 * Une entrée est exclue si :
 * - son nom exact figure dans la liste (ex. "node_modules", ".git")
 * - son extension matche un pattern "*.ext" (ex. "*.png", "*.lock")
 *
 * Insensible à la casse.
 */
export function matchesExclusion(
  name: string,
  exclusions: readonly string[],
): boolean {
  const lower = name.toLowerCase();
  for (const pattern of exclusions) {
    const p = pattern.toLowerCase();
    if (p.startsWith("*.")) {
      if (lower.endsWith(p.slice(1))) return true;
    } else if (lower === p) {
      return true;
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  Filtrage                                                           */
/* ------------------------------------------------------------------ */

/**
 * Filtre récursivement une liste de FileNode : retire les entrées exclues
 * et élague les enfants d'un dossier. Ne modifie pas l'entrée reçue.
 *
 * Pour l'instant utilisé seulement côté tests, mais exporté pour
 * permettre une utilisation côté client si on veut filtrer localement
 * un arbre déjà chargé.
 */
export function filterExcluded(
  nodes: readonly FileNode[],
  exclusions: readonly string[],
): readonly FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (matchesExclusion(node.name, exclusions)) continue;
    if (node.isDir && node.children) {
      result.push({
        ...node,
        children: filterExcluded(node.children, exclusions),
      });
    } else {
      result.push(node);
    }
  }
  return result;
}