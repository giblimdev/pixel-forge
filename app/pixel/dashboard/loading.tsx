/*
path:            app/pixel/dashboard/loading.tsx
tag:             ["pixel", "dashboard", "loading", "skeleton"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Ecran de chargement du tableau de bord. Affiche des
                 skeletons (header + historique + raccourcis) pendant
                 que Next.js streame la page. Server Component pur —
                 les animations Tailwind (animate-pulse) sont
                 compatibles SSR.

flow:            Rendu statique -> skeleton header + skeleton
                 historique + grille skeleton raccourcis.

ecosystem:       Pixel = [
                   "@/app/pixel/dashboard/loading.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/dashboard/page.tsx",
                  "@/components/ui/skeleton.tsx"]
imports:         ["@/components/ui/skeleton"]
exports:         ["default DashboardLoading"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un retour visuel pendant le chargement du dashboard"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>

      {/* Historique */}
      <section className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </section>

      {/* Raccourcis */}
      <section className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}