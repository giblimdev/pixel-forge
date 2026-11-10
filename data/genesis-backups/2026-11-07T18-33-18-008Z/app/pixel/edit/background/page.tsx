/*
path :           app/pixel/edit/background/page.tsx
tag :            ["pixel", "pixel-forge", "edit", "background", "page", "outil-07", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page de l'outil 07 (Suppression d'arrière-plan).
                 Affiche header + BackgroundPanel + "Comment ça marche"
                 + "Paramètres".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <BackgroundPanel /> →
                 sections d'aide.

ecosystem:       Pixel = [
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/components/PixelNav.tsx",
                   "@/app/pixel/convert/page.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/generate/page.tsx",
                   "@/app/pixel/layout.tsx",
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/page.tsx",
                 ]

relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx",
                  "@/app/pixel/features/background-removal/index.ts",
                  "@/app/pixel/edit/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/background-removal/components/background-panel"]

exports:         ["default PixelBackgroundPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux supprimer un fond uni d'une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Scissors, Sparkles } from "lucide-react";

import { BackgroundPanel } from "@/app/pixel/features/background-removal/components/background-panel";

export const metadata: Metadata = {
  title: "Détourer",
  description:
    "Supprimer un fond uni d'une image et exporter un PNG transparent.",
};

const PARAMS: readonly { readonly label: string; readonly detail: string }[] = [
  {
    label: "Couleur cible",
    detail:
      "Pipette ou code hex. Blanc, noir, vert, n'importe quelle couleur unie.",
  },
  {
    label: "Tolérance",
    detail: "0-100. Plus haut = plus de pixels considérés comme fond.",
  },
  {
    label: "Lissage des contours",
    detail:
      "Anti-aliasing (flou gaussien sur le canal alpha) pour des bords propres.",
  },
  {
    label: "Gomme manuelle",
    detail:
      "Pinceau gomme pour corriger les pixels résiduels après détourage auto.",
  },
];

export default function PixelBackgroundPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Scissors className="size-3.5" aria-hidden />
          Outil 07 · Détourer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Suppression d&apos;arrière-plan
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Supprimez un fond uni (blanc, noir, vert, autre) et exportez un PNG
          avec canal alpha. Idéal pour les logos et les mockups.
        </p>
      </header>

      <BackgroundPanel />

      <section aria-labelledby="params-title">
        <h3
          id="params-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Paramètres disponibles
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PARAMS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {p.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {p.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
