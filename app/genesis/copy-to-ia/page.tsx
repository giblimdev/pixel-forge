/*
path :           app/genesis/copy-to-ia/page.tsx
tag :            ["genesis", "copy-to-ia", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil copy-to-ia. Sync page + Suspense ; lecture
                 des 3 fichiers de contexte (CONTRIBUTING.md, prisma/schema.prisma,
                 package.json) dans un composant async avec allowCritical:true.
                 Passe les ContextFile[] au panel. Le panel gère tout le reste
                 localement (sélection, prompt, édition, texte final).

flow:            Sync page → <Suspense fallback=<CopyToIaSkeleton />> →
                 <CopyToIaSection /> async → pour chaque CONTEXT_FILES :
                 fileExists + readProjectFile (allowCritical) → ContextFile[] →
                 <CopyToIaPanel initialFiles />.

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

relatedFiles:    ["@/app/genesis/components/CopyToIaPanel.tsx",
                  "@/app/genesis/lib/context-files.ts",
                  "@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/context-files",
                  "@/app/genesis/lib/storage",
                  "@/app/genesis/components/CopyToIaPanel",
                  "@/components/ui/skeleton"]

exports:         ["default CopyToIaPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux copier un contexte IA prêt à l'emploi"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";

import type { ContextFile } from "@/app/genesis/lib/types";
import { CONTEXT_FILES } from "@/app/genesis/lib/context-files";
import {
  fileExists,
  readProjectFile,
} from "@/app/genesis/lib/storage";
import { CopyToIaPanel } from "@/app/genesis/components/CopyToIaPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CopyToIaPage() {
  return (
    <Suspense fallback={<CopyToIaSkeleton />}>
      <CopyToIaSection />
    </Suspense>
  );
}

async function CopyToIaSection() {
  const files: ContextFile[] = [];
  for (const def of CONTEXT_FILES) {
    const exists = await fileExists(def.path, { allowCritical: true });
    let content = "";
    if (exists) {
      const read = await readProjectFile(def.path, { allowCritical: true });
      content = read.content;
    }
    files.push({
      id: def.id,
      path: def.path,
      label: def.label,
      content,
      exists,
    });
  }

  return <CopyToIaPanel initialFiles={files} />;
}

function CopyToIaSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}