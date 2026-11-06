/*
path :           app/genesis/components/FileTreeRow.tsx
tag :            ["genesis", "tree", "row", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Ligne de l'arbre de fichiers. Ordre visuel : checkbox,
                 chevron (folders), icône, nom. Contrôlée par le parent
                 (FileTree) : aucune logique de propagation locale, les
                 callbacks remontent les événements. Accessible au clavier.

flow:            Reçoit node + depth + expanded + checked + 2 callbacks →
                 rend <li> avec indentation, checkbox, chevron si dossier,
                 icône, nom cliquable (toggle expand pour dossier).

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

relatedFiles:    ["@/app/genesis/components/FileTree.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["lucide-react",
                  "@/app/genesis/lib/types",
                  "@/components/ui/checkbox"]

exports:         ["FileTreeRow", "FileTreeRowProps"]

useBy:           ["@/app/genesis/components/FileTree.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une ligne d'arbre claire et accessible"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : interactions (clic chevron, checkbox).

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

import type { FileNode } from "@/app/genesis/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

export interface FileTreeRowProps {
  readonly node: FileNode;
  readonly depth: number;
  readonly expanded: boolean;
  readonly checked: boolean;
  readonly onToggleExpand: (path: string) => void;
  readonly onToggleCheck: (node: FileNode) => void;
}

export function FileTreeRow({
  node,
  depth,
  expanded,
  checked,
  onToggleExpand,
  onToggleCheck,
}: FileTreeRowProps) {
  const isFolder = node.isDir;

  return (
    <li
      className="flex items-center gap-2 rounded-md py-1 pr-2 hover:bg-muted/40 focus-within:bg-muted/40"
      style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
    >
      {/* 1. Checkbox — premier élément à gauche */}
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggleCheck(node)}
        aria-label={`Sélectionner ${node.path}`}
        className="shrink-0"
      />

      {/* 2. Chevron (dossiers uniquement) */}
      {isFolder ? (
        <button
          type="button"
          onClick={() => onToggleExpand(node.path)}
          aria-label={expanded ? `Replier ${node.name}` : `Déplier ${node.name}`}
          aria-expanded={expanded}
          className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? (
            <ChevronDown className="size-4" aria-hidden />
          ) : (
            <ChevronRight className="size-4" aria-hidden />
          )}
        </button>
      ) : (
        <span aria-hidden className="size-5 shrink-0" />
      )}

      {/* 3. Icône fichier / dossier */}
      <span aria-hidden className="shrink-0 text-muted-foreground">
        {isFolder ? (
          expanded ? (
            <FolderOpen className="size-4" />
          ) : (
            <Folder className="size-4" />
          )
        ) : (
          <FileText className="size-4" />
        )}
      </span>

      {/* 4. Nom */}
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          isFolder ? "font-medium text-foreground" : "text-foreground/80"
        }`}
        title={node.path}
      >
        {node.name}
      </span>
    </li>
  );
}