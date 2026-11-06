/*
path :           app/pixel/generate/page.tsx
tag :            ["pixel", "pixel-forge", "generate", "page", "hub", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page HUB de la famille "Générer". Liste les 3 outils :
                 - /pixel/generate/favicon (Générateur de favicons — outil 09)
                 - /pixel/generate/placeholder (Générateur de placeholders — outil 10)
                 - /pixel/generate/palette (Extracteur de palettes — outil 11)

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).
                 Les sous-pages importent les composants via
                 `@/app/pixel/features/<module>/components/<panel>`.

flow:            Server Component → header → grille 3 cartes outils
                 (chacune vers sa sous-page) → CTA final.

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

relatedFiles:    ["@/app/pixel/generate/favicon/page.tsx",
                  "@/app/pixel/generate/placeholder/page.tsx",
                  "@/app/pixel/generate/palette/page.tsx",
                  "@/app/pixel/layout.tsx"]

imports:         ["next", "next/link", "lucide-react"]

exports:         ["default PixelGeneratePage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux choisir un outil de génération"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Générer",
  description:
    "Créer des ressources graphiques et techniques (favicons, placeholders, palettes).",
};

interface ToolCard {
  readonly href: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

const TOOLS: readonly ToolCard[] = [
  {
    href: "/pixel/generate/favicon",
    number: "09",
    title: "Générateur de favicons",
    description:
      "ICO multi-résolutions, Apple Touch Icon, Android Chrome, manifest.webmanifest.",
    icon: ImageIcon,
  },
  {
    href: "/pixel/generate/placeholder",
    number: "10",
    title: "Générateur de placeholders",
    description:
      "LQIP (data URL), BlurHash, SVG flouté, Base64 pour améliorer le LCP.",
    icon: ImageIcon,
  },
  {
    href: "/pixel/generate/palette",
    number: "11",
    title: "Extracteur de palettes",
    description:
      "5 couleurs dominantes, export CSS variables, Tailwind config et JSON.",
    icon: Palette,
  },
];

export default function PixelGeneratePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-success)]">
          <Sparkles className="size-3.5" aria-hidden />
          Famille 04 · Générer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          3 outils pour créer des ressources
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Produisez des assets prêts à intégrer dans une application web.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--pf-success)]/60 hover:shadow-[0_0_40px_var(--pf-success)]/20"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-success)] to-transparent opacity-70"
              />
              <header className="mb-3 flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--pf-success)] to-[var(--pf-primary)] text-white shadow-md transition-transform group-hover:scale-110">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-success)]">
                    Outil {tool.number}
                  </p>
                  <h3 className="text-base font-bold tracking-tight text-[var(--pf-foreground)]">
                    {tool.title}
                  </h3>
                </div>
              </header>
              <p className="flex-1 text-sm leading-relaxed text-[var(--pf-muted)]">
                {tool.description}
              </p>
              <footer className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--pf-foreground)]/80 transition-transform group-hover:translate-x-1">
                Ouvrir
                <ArrowRight className="size-4" aria-hidden />
              </footer>
            </Link>
          );
        })}
      </div>
    </div>
  );
}