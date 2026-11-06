/*
path :           app/genesis/check-headers/page.tsx
tag :            ["genesis", "check-headers", "page", "dynamic"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil check-headers. Sync page + Suspense ;
                 lecture des exclusions et de l'arbre dans un composant
                 async. `await connection()` force le rendu dynamique
                 (sinon Next.js 16 tente de pré-rendre la page au build
                 et bloque sur "rendering (cold cache)" à cause des I/O
                 FS de buildFileTree). L'arbre est filtré DEUX FOIS :
                 1. buildFileTree applique les exclusions simples.
                 2. filterByPathExclusion retire les exclusions par
                    chemin (components/ui, tous les .next, etc.).

flow:            Sync page → <Suspense fallback=<CheckHeadersSkeleton />>
                 → <CheckHeadersSection /> async → await connection()
                 (force dynamique) → getHeaderExclusionsAction →
                 buildFileTree(exclusions) → filterByPathExclusion →
                 <HeaderCheckPanel tree exclusions />.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/exclusions-path.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/exclusions-path.ts",
                  "@/app/genesis/lib/tree.ts",
                  "@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/HeaderCheckPanel.tsx"]

imports:         ["react", "next/server",
                  "@/app/genesis/lib/tree",
                  "@/app/genesis/lib/exclusions-path",
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
import { connection } from "next/server";

import { buildFileTree } from "@/app/genesis/lib/tree";
import { filterByPathExclusion } from "@/app/genesis/lib/exclusions-path";
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
  // Force le rendu dynamique : sans ça, Next.js 16 (Cache Components)
  // tente de pré-rendre la page au build et bloque sur les I/O FS de
  // buildFileTree ("rendering (cold cache)").
  await connection();

  const exclusionsResponse = await getHeaderExclusionsAction();
  const exclusions = exclusionsResponse.ok
    ? exclusionsResponse.data.exclusions
    : [];

  const rawTree: readonly FileNode[] = await buildFileTree(exclusions);
  const tree = filterByPathExclusion(rawTree, exclusions);

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
