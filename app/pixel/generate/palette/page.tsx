/*
path :           app/pixel/generate/palette/page.tsx
tag :            ["pixel", "pixel-forge", "generate", "palette", "page", "outil-11", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil 11 (Extracteur de palettes).
                 Affiche header + PalettePanel + "Formats d'export" +
                 "Comment ça marche".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <PalettePanel /> →
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

relatedFiles:    ["@/app/pixel/features/color-palette/components/palette-panel.tsx",
                  "@/app/pixel/features/color-palette/index.ts",
                  "@/app/pixel/generate/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/color-palette/components/palette-panel"]

exports:         ["default PixelPalettePage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux extraire les couleurs dominantes d'une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Palette, Sparkles } from "lucide-react";

import { PalettePanel } from "@/app/pixel/features/color-palette/components/palette-panel";

export const metadata: Metadata = {
  title: "Palettes",
  description:
    "Extraire les couleurs dominantes d'une image et les exporter.",
};

const EXPORTS: readonly { readonly name: string; readonly detail: string }[] = [
  {
    name: "CSS variables",
    detail: ":root { --color-1: #xxx; --color-2: #yyy; … }",
  },
  {
    name: "Tailwind config",
    detail: "colors: { brand: { 1: '#xxx', 2: '#yyy', … } }",
  },
  {
    name: "JSON",
    detail: '[{ "hex": "#xxx", "rgb": "…", "ratio": 0.42 }, …]',
  },
];

export default function PixelPalettePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-success)]">
          <Palette className="size-3.5" aria-hidden />
          Outil 11 · Palettes
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Extracteur de palettes
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Extrayez les 5 couleurs dominantes d&apos;une image et exportez-les
          en CSS variables, Tailwind config ou JSON.
        </p>
      </header>

      <PalettePanel />

      <section aria-labelledby="exports-title">
        <h3
          id="exports-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-success)]" aria-hidden />
          Formats d&apos;export
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {EXPORTS.map((e) => (
            <div
              key={e.name}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <code className="block font-mono text-sm font-bold text-[var(--pf-success)]">
                {e.name}
              </code>
              <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-[var(--pf-muted)]">
                {e.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}