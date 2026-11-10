/*
path:            app/pixel/analyze/loading.tsx
tag:             ["pixel", "analyze", "loading", "skeleton"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Ecran de chargement de la page Analyser. Affiche des
                 skeletons (header + panel + sections d'aide) pendant
                 que Next.js streame la page.

flow:            Rendu statique -> skeletons.

ecosystem:       Pixel = [
                   "@/app/pixel/analyze/loading.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/analyze/metadata/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/analyze/page.tsx",
                  "@/app/pixel/analyze/metadata/page.tsx",
                  "@/components/ui/skeleton.tsx"]
imports:         ["@/components/ui/skeleton"]
exports:         ["default AnalyzeLoading"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un retour visuel pendant le chargement de la page Analyser"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyzeLoading() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>

      {/* Panel metadata */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      {/* Sections d'aide */}
      <section className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </section>

      {/* Section vie privee */}
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}