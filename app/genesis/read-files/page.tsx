/*
path :           app/genesis/read-files/page.tsx
tag :            ["genesis", "read-files", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil SelectFiles. Sync page + Suspense ; lecture
                 de l'arbre et des exclusions dans un composant async pour
                 éviter de bloquer le premier rendu. Le skeleton reprend la
                 structure (toolbar + arbre).

flow:            Sync page → <Suspense fallback=<ReadFilesSkeleton />> →
                 <ReadFilesSection /> async → readExclusionsFile +
                 buildFileTree → <ReadFilesPanel tree exclusions />.

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

relatedFiles:    ["@/app/genesis/components/ReadFilesPanel.tsx",
                  "@/app/genesis/lib/tree.ts",
                  "@/app/genesis/lib/storage.ts"]

imports:         ["react",
                  "@/app/genesis/lib/tree",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/components/ReadFilesPanel",
                  "@/components/ui/skeleton"]

exports:         ["default ReadFilesPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir l'arbre du projet et générer un JSON"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";

import { buildFileTree } from "@/app/genesis/lib/tree";
import { readExclusionsFile } from "@/app/genesis/lib/storage";
import { ReadFilesPanel } from "@/app/genesis/components/ReadFilesPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReadFilesPage() {
  return (
    <Suspense fallback={<ReadFilesSkeleton />}>
      <ReadFilesSection />
    </Suspense>
  );
}

async function ReadFilesSection() {
  const exclusions = await readExclusionsFile();
  const tree = await buildFileTree(exclusions);

  return <ReadFilesPanel tree={tree} exclusions={exclusions} />;
}

function ReadFilesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="ml-auto h-4 w-40" />
      </div>
      <Skeleton className="h-[60vh] w-full rounded-2xl" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  );
}