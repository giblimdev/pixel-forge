/*
path :           app/genesis/check-headers/page.tsx
tag :            ["genesis", "check-headers", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil check-headers. Sync page + Suspense ;
                 lecture de l'arbre et des exclusions dédiées dans un
                 composant async pour éviter de bloquer le premier rendu.
                 Le skeleton reprend la structure (toolbar + zone rapport).

flow:            Sync page → <Suspense fallback=<CheckHeadersSkeleton />>
                 → <CheckHeadersSection /> async →
                 getHeaderExclusionsAction → buildFileTree(exclusions) →
                 <HeaderCheckPanel tree exclusions />.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/components/HeaderCheckPanel.tsx",
                  "@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/lib/tree.ts"]

imports:         ["react",
                  "@/app/genesis/lib/tree",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/actions/header-check",
                  "@/app/genesis/components/HeaderCheckPanel",
                  "@/components/ui/skeleton"]

exports:         ["default CheckHeadersPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux vérifier la conformité des en-têtes du projet"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";

import { buildFileTree } from "@/app/genesis/lib/tree";
import type { FileNode } from "@/app/genesis/lib/types";
import { getHeaderExclusionsAction } from "@/app/genesis/actions/header-check";
import { HeaderCheckPanel } from "@/app/genesis/components/HeaderCheckPanel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckHeadersPage() {
  return (
    <Suspense fallback={<CheckHeadersSkeleton />}>
      <CheckHeadersSection />
    </Suspense>
  );
}

async function CheckHeadersSection() {
  const exclusionsResponse = await getHeaderExclusionsAction();
  const exclusions = exclusionsResponse.ok ? exclusionsResponse.data.exclusions : [];
  const tree: readonly FileNode[] = await buildFileTree(exclusions);

  return <HeaderCheckPanel tree={tree} exclusions={exclusions} />;
}

function CheckHeadersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-44" />
        </div>
      </div>
      <Skeleton className="h-[60vh] w-full rounded-2xl" />
    </div>
  );
}