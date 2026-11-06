/*
path :           app/pixel/optimize/smart-crop/page.tsx
tag :            ["pixel", "pixel-forge", "optimize", "smart-crop", "page", "outil-05", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil 05 (Recadrage intelligent).
                 Affiche header + SmartCropPanel + "Comment ça marche"
                 + "Ratios disponibles".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <SmartCropPanel /> →
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

relatedFiles:    ["@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                  "@/app/pixel/features/smart-crop/index.ts",
                  "@/app/pixel/optimize/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/smart-crop/components/smart-crop-panel"]

exports:         ["default PixelSmartCropPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux recadrer automatiquement une image vers un ratio"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Scissors, Sparkles } from "lucide-react";

import { SmartCropPanel } from "@/app/pixel/features/smart-crop/components/smart-crop-panel";

export const metadata: Metadata = {
  title: "Recadrage intelligent",
  description:
    "Recadrer automatiquement une image vers un ratio en gardant le sujet.",
};

const RATIOS: readonly { readonly label: string; readonly value: string }[] = [
  { label: "Carré", value: "1:1" },
  { label: "Paysage", value: "16:9" },
  { label: "Photo", value: "4:3" },
  { label: "Portrait", value: "3:4" },
  { label: "Cinéma", value: "21:9" },
  { label: "Bannière", value: "3:1" },
];

const HOW: readonly { readonly step: string; readonly detail: string }[] = [
  {
    step: "1",
    detail: "L'image est analysée par sharp.strategy.attention (entropie).",
  },
  {
    step: "2",
    detail: "Une fenêtre du ratio cible est positionnée sur la zone la plus dense.",
  },
  {
    step: "3",
    detail: "Le recadrage est effectué via sharp.extract() et exporté.",
  },
];

export default function PixelSmartCropPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Scissors className="size-3.5" aria-hidden />
          Outil 05 · Recadrage intelligent
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Recadrage automatique
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Recadrez automatiquement une image vers un ratio cible, en gardant
          le sujet au centre grâce à la détection d&apos;entropie.
        </p>
      </header>

      <SmartCropPanel />

      <section aria-labelledby="how-title">
        <h3
          id="how-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-secondary)]" aria-hidden />
          Comment ça marche
        </h3>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {HOW.map((h) => (
            <li
              key={h.step}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <span className="mb-2 grid size-8 place-items-center rounded-full bg-gradient-to-br from-[var(--pf-secondary)] to-[var(--pf-primary)] font-mono text-sm font-bold text-white shadow-md">
                {h.step}
              </span>
              <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
                {h.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ratios-title">
        <h3
          id="ratios-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Ratios disponibles
        </h3>
        <div className="flex flex-wrap gap-2">
          {RATIOS.map((r) => (
            <span
              key={r.value}
              className="inline-flex flex-col items-center gap-0.5 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 px-3 py-2 backdrop-blur-xl"
            >
              <code className="font-mono text-sm font-bold text-[var(--pf-secondary)]">
                {r.value}
              </code>
              <span className="text-[10px] text-[var(--pf-muted)]">
                {r.label}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}