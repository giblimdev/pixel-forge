/*
path :           app/genesis/lib/exclusions-path.ts
tag :            ["genesis", "exclusions", "path", "helper", "pure"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Filtre les FileNode en gérant les exclusions par CHEMIN
                 (components/ui, lib/generated) en plus des exclusions par
                 nom ou extension. Complète matchesExclusion (qui ne gère
                 que les noms simples et *.ext) sans le modifier.
                 Utilisé par check-headers/page.tsx pour filtrer l'arbre
                 après buildFileTree.

                 Règles de matching :
                 - pattern "*.ext"      → exclut les fichiers par extension
                 - pattern avec "/"     → exclut un chemin et ses descendants
                 - pattern simple       → exclut un segment exact du chemin

flow:            matchesPathExclusion(path, exclusions) → normalise le
                 path (minuscules, slashes) → pour chaque pattern :
                 si *.ext → endsWith ; si contient / → startsWith ; sinon
                 → match un segment exact → retourne true/false.
                 filterByPathExclusion(nodes, exclusions) → parcourt
                 récursivement → retire les nœuds exclus → retourne les
                 nœuds restants.

ecosystem:       Genesis = [
                   "@/app/genesis/lib/exclusions-path.ts",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/types.ts",
                  "@/app/genesis/lib/tree.ts"]

imports:         ["@/app/genesis/lib/types"]

exports:         ["matchesPathExclusion", "filterByPathExclusion"]

useBy:           ["@/app/genesis/check-headers/page.tsx"]

userStories:     ["*en tant que développeur je veux exclure des fichiers par chemin dans l'arbre"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { FileNode } from "@/app/genesis/lib/types";

/* ------------------------------------------------------------------ */
/*  Matching                                                           */
/* ------------------------------------------------------------------ */

/**
 * Vrai si le chemin (relatif au projet) est exclu par l'un des patterns.
 *
 * @example
 *   matchesPathExclusion("app/genesis/components/ui/button.tsx",
 *     ["components/ui"]) → true
 *   matchesPathExclusion("app/genesis/components/ScriptInput.tsx",
 *     ["components/ui"]) → false
 *   matchesPathExclusion("package.json", ["*.json"]) → true
 */
export function matchesPathExclusion(
  path: string,
  exclusions: readonly string[],
): boolean {
  const normalized = path.toLowerCase().replace(/\\/g, "/");

  for (const pattern of exclusions) {
    const p = pattern.toLowerCase().trim();
    if (p.length === 0) continue;

    // Pattern *.ext → exclut par extension.
    if (p.startsWith("*.")) {
      if (normalized.endsWith(p.slice(1))) return true;
      continue;
    }

    // Pattern avec / → exclut un chemin et ses descendants.
    if (p.includes("/")) {
      if (normalized === p || normalized.startsWith(`${p}/`)) return true;
      continue;
    }

    // Pattern simple → exclut un segment exact du chemin.
    const segments = normalized.split("/");
    if (segments.includes(p)) return true;
  }

  return false;
}

/* ------------------------------------------------------------------ */
/*  Filtrage récursif                                                  */
/* ------------------------------------------------------------------ */

/**
 * Filtre récursivement une liste de FileNode en retirant les entrées
 * exclues (par chemin, nom ou extension). Ne modifie pas l'entrée reçue.
 */
export function filterByPathExclusion(
  nodes: readonly FileNode[],
  exclusions: readonly string[],
): readonly FileNode[] {
  const result: FileNode[] = [];

  for (const node of nodes) {
    if (matchesPathExclusion(node.path, exclusions)) continue;

    if (node.isDir && node.children) {
      result.push({
        ...node,
        children: filterByPathExclusion(node.children, exclusions),
      });
    } else {
      result.push(node);
    }
  }

  return result;
}
