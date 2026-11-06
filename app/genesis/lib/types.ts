/*
path :           app/genesis/lib/types.ts
tag :            ["genesis", "types", "helper", "config"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Types partagés pour le module Genesis (outils de développement
                 indépendants de Core). Définit les structures de l'arbre de
                 fichiers, du résultat de lecture, de la file de scripts, du
                 rapport d'écriture et des fichiers de contexte copy-to-ia.
                 Aucune dépendance runtime, aucun effet.

flow:            Module TypeScript pur → export des types + constantes de config.

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

relatedFiles:    ["@/app/genesis/lib/validations.ts",
                  "@/app/genesis/lib/storage.ts"]

imports:         []

exports:         ["GenesisExclusions", "FileNode", "FileContent", "SkippedFile",
                  "ReadFilesResult", "ParsedScript", "ScriptEntry", "WriteReport",
                  "ContextFileId", "ContextFile", "ContextSelection",
                  "DEFAULT_EXCLUSIONS"]

useBy:           ["@/app/genesis/lib/exclusions.ts",
                  "@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/tree.ts",
                  "@/app/genesis/lib/parse-script.ts",
                  "@/app/genesis/lib/context-files.ts",
                  "@/app/genesis/lib/write-scripts.ts",
                  "@/app/genesis/actions/context-files.ts",
                  "@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/read-files.ts",
                  "@/app/genesis/actions/write-files.ts",
                  "@/app/genesis/components/FileTree.tsx",
                  "@/app/genesis/components/ScriptQueue.tsx",
                  "@/app/genesis/components/ContextFileEditor.tsx",
                  "@/app/genesis/components/ContextOutput.tsx",
                  "@/app/genesis/components/CopyToIaPanel.tsx"]

userStories:     ["*en tant que développeur je veux des types partagés pour les outils Genesis"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Exclusions                                                         */
/* ------------------------------------------------------------------ */

export interface GenesisExclusions {
  readonly exclusions: readonly string[];
}

export const DEFAULT_EXCLUSIONS: readonly string[] = [
  ".git",
  ".next",
  ".turbo",
  "build",
  "dist",
  "node_modules",
  "*.gif",
  "*.ico",
  "*.jpeg",
  "*.jpg",
  "*.lock",
  "*.log",
  "*.png",
  "*.svg",
  "*.ttf",
  "*.woff",
  "*.woff2",
];

/* ------------------------------------------------------------------ */
/*  Arbre de fichiers                                                  */
/* ------------------------------------------------------------------ */

export interface FileNode {
  readonly path: string;
  readonly name: string;
  readonly isDir: boolean;
  readonly children?: readonly FileNode[];
}

/* ------------------------------------------------------------------ */
/*  Lecture de fichiers                                                */
/* ------------------------------------------------------------------ */

export interface FileContent {
  readonly path: string;
  readonly content: string;
}

export interface SkippedFile {
  readonly path: string;
  readonly reason: "binary" | "excluded" | "unreadable";
}

export interface ReadFilesResult {
  readonly files: readonly FileContent[];
  readonly fileCount: number;
  readonly totalSize: number;
  readonly skipped: readonly SkippedFile[];
}

/* ------------------------------------------------------------------ */
/*  Scripts                                                            */
/* ------------------------------------------------------------------ */

export interface ParsedScript {
  readonly path: string | null;
  readonly error?: string;
}

export interface ScriptEntry {
  readonly id: string;
  readonly path: string;
  readonly content: string;
}

/* ------------------------------------------------------------------ */
/*  Rapport d'écriture                                                 */
/* ------------------------------------------------------------------ */

export interface WriteReport {
  readonly created: readonly string[];
  readonly overwritten: readonly string[];
  readonly backedUp: readonly string[];
  readonly rejected: readonly { readonly path: string; readonly reason: string }[];
}

/* ------------------------------------------------------------------ */
/*  Fichiers de contexte (copy-to-ia)                                  */
/* ------------------------------------------------------------------ */

export type ContextFileId = "contributing" | "prisma" | "package";

export interface ContextFile {
  readonly id: ContextFileId;
  readonly path: string;
  readonly label: string;
  readonly content: string;
  readonly exists: boolean;
}

export interface ContextSelection {
  readonly id: ContextFileId;
  readonly checked: boolean;
}