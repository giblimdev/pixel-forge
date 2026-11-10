/*
path:            app/pixel/convert/loading.tsx
tag:             ["pixel", "convert", "loading", "skeleton"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Ecran de chargement de la page Convertir. Affiche
                 des skeletons (header + import + panel + sections
                 d'aide) pendant que Next.js streame la page.

flow:            Rendu statique -> skeletons.

ecosystem:       Pixel = [
                   "@/app/pixel/convert/loading.tsx",
                   "@/app/pixel/convert/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/convert/page.tsx",
                  "@/components/ui/skeleton.tsx"]
imports:         ["@/components/ui/skeleton"]
exports:         ["default ConvertLoading"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un retour visuel pendant le chargement de la page Convertir"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Skeleton } from "@/components/ui/skeleton";

export default function ConvertLoading() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-96 max-w-full" />
      </div>

      {/* Import + queue */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </section>

      {/* Panel */}
      <Skeleton className="h-56 w-full rounded-2xl" />

      {/* Sections d'aide */}
      <section className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}