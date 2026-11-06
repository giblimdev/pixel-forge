/*
path :           app/pixel/layout.tsx
tag :            ["pixel", "pixel-forge", "layout", "pixel-forge-charte"]
projectId:       pixel
type:            layout
generic:         false

role:            Layout commun de l'espace PixelForge. Fournit :
                 - Un wrapper avec fond dégradé charte PixelForge.
                 - Un header interne avec le nom "PixelForge" en gradient.
                 - La navigation principale (PixelNav) : Dashboard,
                   Convertir, Optimiser, Éditer, Générer, Analyser.
                 - Le conteneur max-w-screen-2xl (cohérent Genesis).

                 Server Component pur. Le layout hérite du Header/Footer
                 globaux de app/layout.tsx (déjà en place). Il n'ajoute
                 qu'un contexte visuel et une nav interne à PixelForge.

flow:            Server Component → wrapper min-h-svh dégradé →
                 header interne (titre gradient + tagline) →
                 <PixelNav /> (Client Component pour l'état actif) →
                 <main> conteneur max-w-screen-2xl → {children}.

ecosystem:       Pixel = [
                   "@/app/pixel/analyze/metadata/page.tsx",      ⚠️ À CRÉER
                   "@/app/pixel/analyze/page.tsx",               ⚠️ À CRÉER
                   "@/app/pixel/components/PixelNav.tsx",
                   "@/app/pixel/convert/page.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/generate/page.tsx",
                   "@/app/pixel/layout.tsx",
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/page.tsx",
                 ]

                 ⚠️ NOTE : `analyze/page.tsx` et `analyze/metadata/page.tsx`
                 sont référencés (règle du CONTRIBUTING : tous les fichiers
                 du domaine portent le même tableau) mais les fichiers
                 n'existent pas encore. Ils seront créés dans l'itération
                 suivante.

relatedFiles:    ["@/app/pixel/components/PixelNav.tsx",
                  "@/app/pixel/page.tsx",
                  "@/app/layout.tsx"]

imports:         ["react", "next",
                  "@/app/pixel/components/PixelNav"]

exports:         ["default PixelLayout", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux naviguer dans PixelForge"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";

import { PixelNav } from "@/app/pixel/components/PixelNav";

export const metadata: Metadata = {
  title: {
    default: "PixelForge",
    template: "%s · PixelForge",
  },
  description:
    "Atelier d'images — convertir, optimiser, éditer, générer, analyser. Local, gratuit, open-source.",
};

export default function PixelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[var(--pf-background)] via-[var(--pf-background)] to-[var(--pf-surface)]/30">
      <div
        aria-hidden
        className="h-[2px] w-full bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] opacity-80"
      />
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-primary)]">
              Atelier d&apos;images
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-3xl font-black tracking-tight text-transparent">
                PixelForge
              </h1>
              <p className="max-w-md text-sm text-[var(--pf-muted)]">
                Convertir, optimiser, éditer, générer et analyser vos
                images — en local, gratuit, open-source.
              </p>
            </div>
          </header>
          <PixelNav />
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}