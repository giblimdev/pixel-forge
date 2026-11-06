/*
path :           app/genesis/lib/exclusions-path.ts
tag :            ["genesis", "exclusions", "path", "helper", "pure", "glob"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Filtre les FileNode en gérant les exclusions par CHEMIN
                 avec support des syntaxes glob-like :
                 - "*.ext"      → extension (tous les .json, .md, etc.)
                 - "nom"        → nom exact (segment du chemin)
                 - "/chemin"    → ANC RÉ À LA RACINE (ex: /components/ui
                                   exclut components/ui/** à la racine
                                   uniquement)
                 - "*\/segment" → WILDCARD sur un segment (ex: *\/ui
                                   exclut TOUS les dossiers ui n'importe
                                   où dans le projet)
                 - "chemin/sous" → chemin exact n'importe où (ex:
                                   components/ui exclut tout
                                   components/ui/** où qu'il soit)
                 Complète matchesExclusion (qui ne gère que les noms
                 simples et *.ext) sans le modifier.

                 Exemples concrets :
                 - "/components/ui"  exclut components/ui/button.tsx
                                     mais PAS app/genesis/components/ui/button.tsx
                 - "*\/ui"           exclut app/genesis/components/ui/button.tsx
                                     ET components/ui/button.tsx ET lib/ui/foo.ts
                 - "components/ui"   exclut TOUS les components/ui du projet
                                     (comportement "n'importe où")

flow:            matchesPathExclusion(path, exclusions) → normalise le
                 path (minuscules, slashes) → pour chaque pattern :
                 si *.ext → endsWith ; si commence par / → match exact
                 racine ; si commence par *\/ → match le segment après *\/ ;
                 si contient / → match exact début OU sous-chemin ;
                 sinon → match un segment exact → retourne true/false.
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

userStories:     ["*en tant que développeur je veux exclure des fichiers par chemin avec syntaxe glob"]

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
 * Syntaxes supportées :
 * - `*.ext`      → extension (ex: `*.json`)
 * - `nom`        → segment exact (ex: `node_modules`)
 * - `/chemin`    → ancré à la racine (ex: `/components/ui`)
 * - `*\/segment` → wildcard sur le dernier segment (ex: `*\/ui`)
 * - `chemin/sous`→ chemin exact n'importe où (ex: `components/ui`)
 *
 * @example
 *   matchesPathExclusion("components/ui/button.tsx", ["/components/ui"]) → true
 *   matchesPathExclusion("app/genesis/components/ui/button.tsx", ["/components/ui"]) → false
 *   matchesPathExclusion("app/genesis/components/ui/button.tsx", ["*\/ui"]) → true
 *   matchesPathExclusion("components/ui/button.tsx", ["*\/ui"]) → true
 *   matchesPathExclusion("app/scrum/components/ui/button.tsx", ["*\/ui"]) → true
 */
export function matchesPathExclusion(
  path: string,
  exclusions: readonly string[],
): boolean {
  const normalized = path.toLowerCase().replace(/\\/g, "/");
  const segments = normalized.split("/");

  for (const rawPattern of exclusions) {
    const p = rawPattern.toLowerCase().trim();
    if (p.length === 0) continue;

    // ---- 1. Pattern *.ext → extension.
    if (p.startsWith("*.")) {
      if (normalized.endsWith(p.slice(1))) return true;
      continue;
    }

    // ---- 2. Pattern ancré à la racine /chemin.
    if (p.startsWith("/")) {
      const target = p.slice(1); // retire le / initial
      if (target.length === 0) continue;
      if (normalized === target || normalized.startsWith(`${target}/`)) {
        return true;
      }
      continue;
    }

    // ---- 3. Pattern wildcard *\/segment.
    if (p.startsWith("*/")) {
      const target = p.slice(2); // retire le */ initial
      if (target.length === 0) continue;

      // Match : le chemin contient un segment égal à target.
      if (segments.includes(target)) return true;

      // Match : le chemin contient "target/..." (target est un segment
      // suivi de sous-segments, ex: */components/ui).
      if (target.includes("/")) {
        for (let i = 0; i < segments.length; i++) {
          const candidate = segments.slice(i, i + target.split("/").length).join("/");
          if (candidate === target) return true;
        }
      }
      continue;
    }

    // ---- 4. Pattern chemin exact n'importe où (components/ui).
    if (p.includes("/")) {
      // Match exact en début de chemin.
      if (normalized === p || normalized.startsWith(`${p}/`)) return true;
      // Match sous-chemin n'importe où.
      if (normalized.includes(`/${p}/`) || normalized.endsWith(`/${p}`)) {
        return true;
      }
      continue;
    }

    // ---- 5. Pattern simple → segment exact.
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