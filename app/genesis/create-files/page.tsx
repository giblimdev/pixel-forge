/*
path :           app/genesis/create-files/page.tsx
tag :            ["genesis", "create-files", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil CreateFiles. Sync page + Suspense ; lecture
                 du tree (avec exclusions appliquées) dans un composant async
                 pour fournir la liste des paths existants au panel. Le panel
                 utilise cette liste pour afficher le badge Créer/Écraser.

flow:            Sync page → <Suspense fallback=<CreateFilesSkeleton />> →
                 <CreateFilesSection /> async → readExclusionsFile +
                 buildFileTree → extraction des paths de fichiers (feuilles)
                 → <CreateFilesPanel existingPaths />.

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

relatedFiles:    ["@/app/genesis/components/CreateFilesPanel.tsx",
                  "@/app/genesis/lib/tree.ts",
                  "@/app/genesis/lib/storage.ts"]

imports:         ["react",
                  "@/app/genesis/lib/tree",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/components/CreateFilesPanel",
                  "@/components/ui/skeleton"]

exports:         ["default CreateFilesPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux injecter des scripts dans le projet"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";

import { buildFileTree } from "@/app/genesis/lib/tree";
import { readExclusionsFile } from "@/app/genesis/lib/storage";
import type { FileNode } from "@/app/genesis/lib/types";
import { CreateFilesPanel } from "@/app/genesis/components/CreateFilesPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateFilesPage() {
  return (
    <Suspense fallback={<CreateFilesSkeleton />}>
      <CreateFilesSection />
    </Suspense>
  );
}

async function CreateFilesSection() {
  const exclusions = await readExclusionsFile();
  const tree = await buildFileTree(exclusions);
  const existingPaths = collectFilePaths(tree);

  return <CreateFilesPanel existingPaths={existingPaths} />;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function collectFilePaths(nodes: readonly FileNode[]): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.isDir && node.children) {
      result.push(...collectFilePaths(node.children));
    } else if (!node.isDir) {
      result.push(node.path);
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function CreateFilesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
