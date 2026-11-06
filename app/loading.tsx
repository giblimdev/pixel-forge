/*
path :           app/loading.tsx
tag :            ["app", "loading", "suspense", "ui", "next-special"]
projectId:       new-genesis
type:            component
generic:         true

role:            Écran de chargement global de l'application. Affiché par
                 Next.js pendant le streaming d'une route dont le rendu
                 n'est pas encore prêt (Suspense boundary automatique au
                 niveau du root layout). Fichier spécial Next.js
                 (`loading.tsx`) : son export default est monté
                 automatiquement par le framework, pas par un parent React.
                 Design cohérent avec la marque : pastille dégradée
                 (chart-1 → chart-3) avec halo pulsant + message discret.
                 Server Component pur (les animations Tailwind
                 `animate-ping` / `animate-spin` sont compatibles SSR).

flow:            Rendu statique → aucune donnée, aucun état, aucun effet.
                 Composant purement présentationnel. Next.js le monte
                 automatiquement pendant le chargement de la route
                 correspondante (root = toutes les routes).

ecosystem:       AppShell = [
                   "@/app/layout.tsx",
                   "@/app/loading.tsx",
                   "@/app/error.tsx",
                   "@/app/not-found.tsx",
                   "@/app/global-error.tsx",
                   "@/app/template.tsx",
                   "@/app/default.tsx",
                 ]

relatedFiles:    ["@/app/layout.tsx"]

imports:         ["lucide-react"]

exports:         ["default Loading"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir un indicateur de chargement"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="flex flex-col items-center gap-5">
        {/* Pastille + halo */}
        <span className="relative grid size-16 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-2xl bg-chart-1/20 [animation-duration:1.6s]"
          />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3 text-white shadow-lg shadow-chart-1/30">
            <Loader2 className="size-7 animate-spin" aria-hidden />
          </span>
        </span>

        {/* Message */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-semibold text-foreground">
            Chargement…
          </p>
          <p className="text-xs text-muted-foreground">
            Préparation de l&apos;atelier
          </p>
        </div>
      </div>
    </div>
  );
}