/*
path :           app/genesis/components/FileTree.tsx
tag :            ["genesis", "tree", "ui", "selection"]
projectId:       new-genesis
type:            component
generic:         false

role:            Arbre de fichiers complet. Gère l'expansion (Set de paths
                 ouverts) et la sélection (Set de paths cochés). La sélection
                 est propagée aux descendants lors du cochage d'un dossier ;
                 un fichier coché individuellement n'affecte pas son parent.
                 Expose la liste finale (fichiers uniquement) au parent via
                 onSelectionChange, recalculée à chaque changement du Set.

flow:            Reçoit tree → initialise expanded (dossiers racine) et checked
                 (vide) → rend les FileTreeRow récursivement → à chaque
                 changement de checked, recalcule selectedFilePaths (mémo) →
                 useEffect → onSelectionChange(selectedFilePaths).

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

relatedFiles:    ["@/app/genesis/components/FileTreeRow.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/components/FileTreeRow",
                  "@/components/ui/button"]

exports:         ["FileTree", "FileTreeProps"]

useBy:           ["@/app/genesis/components/ReadFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux parcourir et cocher l'arbre du projet"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (expanded/checked), useMemo, useEffect.

import { useEffect, useMemo, useState } from "react";
import { CheckCheck, X } from "lucide-react";

import type { FileNode } from "@/app/genesis/lib/types";
import { FileTreeRow } from "@/app/genesis/components/FileTreeRow";
import { Button } from "@/components/ui/button";

export interface FileTreeProps {
  readonly tree: readonly FileNode[];
  readonly onSelectionChange: (filePaths: readonly string[]) => void;
  readonly onOpenExclusions: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers purs                                                       */
/* ------------------------------------------------------------------ */

function collectAllPaths(node: FileNode): string[] {
  const paths = [node.path];
  if (node.isDir && node.children) {
    for (const child of node.children) {
      paths.push(...collectAllPaths(child));
    }
  }
  return paths;
}

function collectAllPathsFromList(nodes: readonly FileNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    paths.push(...collectAllPaths(node));
  }
  return paths;
}

function getFilePathsInChecked(
  nodes: readonly FileNode[],
  checked: ReadonlySet<string>,
): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.isDir && node.children) {
      result.push(...getFilePathsInChecked(node.children, checked));
    } else if (!node.isDir && checked.has(node.path)) {
      result.push(node.path);
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function FileTree({
  tree,
  onSelectionChange,
  onOpenExclusions,
}: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(tree.filter((n) => n.isDir).map((n) => n.path)),
  );
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  // Reset expansion et sélection si l'arbre change (ex. après modif des exclusions).
  useEffect(() => {
    setExpanded(new Set(tree.filter((n) => n.isDir).map((n) => n.path)));
    setChecked(new Set());
  }, [tree]);

  const selectedFilePaths = useMemo(
    () => getFilePathsInChecked(tree, checked),
    [tree, checked],
  );

  useEffect(() => {
    onSelectionChange(selectedFilePaths);
  }, [selectedFilePaths, onSelectionChange]);

  function handleToggleExpand(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function handleToggleCheck(node: FileNode) {
    const paths = collectAllPaths(node);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(node.path)) {
        for (const p of paths) next.delete(p);
      } else {
        for (const p of paths) next.add(p);
      }
      return next;
    });
  }

  function handleCheckAll() {
    setChecked(new Set(collectAllPathsFromList(tree)));
  }

  function handleUncheckAll() {
    setChecked(new Set());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCheckAll}>
          <CheckCheck className="size-4" aria-hidden />
          Tout cocher
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleUncheckAll}>
          <X className="size-4" aria-hidden />
          Tout décocher
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onOpenExclusions}>
          Exclusions
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {selectedFilePaths.length} fichier{selectedFilePaths.length > 1 ? "s" : ""} sélectionné{selectedFilePaths.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="max-h-[60vh] overflow-auto rounded-2xl border border-border/60 bg-muted/10 p-2">
        {tree.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun fichier trouvé (toutes les entrées sont peut-être exclues).
          </p>
        ) : (
          <ul className="space-y-0.5">
            <TreeBranch
              nodes={tree}
              depth={0}
              expanded={expanded}
              checked={checked}
              onToggleExpand={handleToggleExpand}
              onToggleCheck={handleToggleCheck}
            />
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Branche récursive                                                  */
/* ------------------------------------------------------------------ */

function TreeBranch({
  nodes,
  depth,
  expanded,
  checked,
  onToggleExpand,
  onToggleCheck,
}: {
  readonly nodes: readonly FileNode[];
  readonly depth: number;
  readonly expanded: ReadonlySet<string>;
  readonly checked: ReadonlySet<string>;
  readonly onToggleExpand: (path: string) => void;
  readonly onToggleCheck: (node: FileNode) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.path);
        const isChecked = checked.has(node.path);
        return (
          <div key={node.path}>
            <FileTreeRow
              node={node}
              depth={depth}
              expanded={isExpanded}
              checked={isChecked}
              onToggleExpand={onToggleExpand}
              onToggleCheck={onToggleCheck}
            />
            {node.isDir && isExpanded && node.children && node.children.length > 0 && (
              <ul className="space-y-0.5">
                <TreeBranch
                  nodes={node.children}
                  depth={depth + 1}
                  expanded={expanded}
                  checked={checked}
                  onToggleExpand={onToggleExpand}
                  onToggleCheck={onToggleCheck}
                />
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}