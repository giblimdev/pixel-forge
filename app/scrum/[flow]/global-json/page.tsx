/*
path :           app/scrum/[flow]/global-json/page.tsx
tag :            ["global-json", "page", "scrum", "export"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'export Global JSON pour un flux Scrum. Sync page + Suspense ;
                 la validation du flow et la sérialisation sont isolées dans un
                 composant async.

flow:            Sync page → <Suspense fallback=<GlobalJsonSkeleton />> →
                 <GlobalJsonSection params /> async → await params → validation →
                 serializeGlobalJson(flow) → <GlobalJsonExport flow json />.

ecosystem:       Help = [
                   "@/app/scrum/[flow]/epic/page.tsx",
                   "@/app/scrum/[flow]/feature/page.tsx",
                   "@/app/scrum/[flow]/global-json/page.tsx",
                   "@/app/scrum/[flow]/idee/page.tsx",
                   "@/app/scrum/[flow]/layout.tsx",
                   "@/app/scrum/[flow]/page.tsx",
                   "@/app/scrum/[flow]/persona/page.tsx",
                   "@/app/scrum/[flow]/sprint/page.tsx",
                   "@/app/scrum/[flow]/user-story/page.tsx",
                   "@/app/scrum/layout.tsx",
                   "@/app/scrum/page.tsx",
                 ]

relatedFiles:    ["@/app/scrum/components/GlobalJsonExport.tsx",
                  "@/app/scrum/lib/services/global-json.ts",
                  "@/app/scrum/lib/types.ts"]

imports:         ["react", "next/navigation",
                  "@/app/scrum/lib/types",
                  "@/app/scrum/lib/services/global-json",
                  "@/app/scrum/components/GlobalJsonExport",
                  "@/components/ui/skeleton"]

exports:         ["default GlobalJsonPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux exporter le JSON complet d'un flux"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SCRUM_FLOWS, type ScrumFlow } from "@/app/scrum/lib/types";
import { serializeGlobalJson } from "@/app/scrum/lib/services/global-json";
import { GlobalJsonExport } from "@/app/scrum/components/GlobalJsonExport";
import { Skeleton } from "@/components/ui/skeleton";

type PageParams = Promise<{ flow: string }>;

function isScrumFlow(value: string): value is ScrumFlow {
  return (SCRUM_FLOWS as readonly string[]).includes(value);
}

export default function GlobalJsonPage({ params }: { params: PageParams }) {
  return (
    <Suspense fallback={<GlobalJsonSkeleton />}>
      <GlobalJsonSection params={params} />
    </Suspense>
  );
}

async function GlobalJsonSection({ params }: { readonly params: PageParams }) {
  const { flow } = await params;

  if (!isScrumFlow(flow)) {
    notFound();
  }

  const json = await serializeGlobalJson(flow);
  return <GlobalJsonExport flow={flow} json={json} />;
}

function GlobalJsonSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Skeleton className="h-[60vh] w-full rounded-2xl" />
    </div>
  );
}
