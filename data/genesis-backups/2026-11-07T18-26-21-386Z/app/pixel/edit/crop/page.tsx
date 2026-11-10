/*
path :           app/pixel/edit/crop/page.tsx
tag :            ["pixel", "pixel-forge", "edit", "crop", "page", "outil-06", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page de l'outil 06 (Éditeur de recadrage).
                 Affiche header + CropEditorPanel + "Comment ça marche"
                 + "Ratios disponibles".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <CropEditorPanel /> →
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

relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                  "@/app/pixel/features/crop-editor/index.ts",
                  "@/app/pixel/edit/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/crop-editor/components/crop-editor-panel"]

exports:         ["default PixelCropPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Scissors, Sparkles } from "lucide-react";

import { CropEditorPanel } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";

export const metadata: Metadata = {
  title: "Recadrer",
  description: "Recadrer manuellement une image avec rotation et retournement.",
};

const RATIOS: readonly { readonly label: string; readonly value: string }[] = [
  { label: "Libre", value: "libre" },
  { label: "Carré", value: "1:1" },
  { label: "Paysage", value: "16:9" },
  { label: "Photo", value: "4:3" },
  { label: "Portrait", value: "3:4" },
  { label: "Story", value: "9:16" },
];

export default function PixelCropPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Scissors className="size-3.5" aria-hidden />
          Outil 06 · Recadrer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Éditeur de recadrage
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Recadrez manuellement une image, faites-la pivoter, retournez-la
          horizontalement ou verticalement, ou verrouillez un ratio prédéfini.
        </p>
      </header>

      <CropEditorPanel />

      <section aria-labelledby="how-title">
        <h3
          id="how-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Comment ça marche
        </h3>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              step: "1",
              detail:
                "Déposez une image. Un cadre interactif apparaît sur le canvas.",
            },
            {
              step: "2",
              detail:
                "Déplacez et redimensionnez le cadre. Activez la grille des tiers pour composer.",
            },
            {
              step: "3",
              detail:
                "Appliquez : sharp.extract() recadre, sharp.rotate() pivote, sharp.flip()/flop() retourne.",
            },
          ].map((h) => (
            <li
              key={h.step}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <span className="mb-2 grid size-8 place-items-center rounded-full bg-gradient-to-br from-[var(--pf-info)] to-[var(--pf-primary)] font-mono text-sm font-bold text-white shadow-md">
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
              <code className="font-mono text-sm font-bold text-[var(--pf-info)]">
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
