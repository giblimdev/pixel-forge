/*
path :           app/pixel/optimize/page.tsx
tag :            ["pixel", "pixel-forge", "optimize", "page", "hub", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page HUB de la famille "Optimiser". Liste les 4 outils
                 avec un lien vers leur sous-page respective :
                 - /pixel/optimize (cette page — Optimiseur intelligent)
                 - /pixel/optimize/compress (Compresseur JPEG/PNG)
                 - /pixel/optimize/resize (Redimensionnement par lot)
                 - /pixel/optimize/smart-crop (Recadrage intelligent)

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → grille 4 cartes outils.

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

relatedFiles:    ["@/app/pixel/optimize/compress/page.tsx",
                  "@/app/pixel/optimize/resize/page.tsx",
                  "@/app/pixel/optimize/smart-crop/page.tsx",
                  "@/app/pixel/layout.tsx"]

imports:         ["next", "next/link", "lucide-react"]

exports:         ["default PixelOptimizePage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux choisir un outil d'optimisation"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Scissors,
  Settings,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Optimiser",
  description:
    "Réduire le poids et adapter les dimensions de vos images.",
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
    href: "/pixel/optimize",
    number: "02",
    title: "Optimiseur intelligent",
    description:
      "Optimisation automatique selon un poids cible, une qualité souhaitée ou un niveau de compression.",
    icon: Settings,
  },
  {
    href: "/pixel/optimize/compress",
    number: "03",
    title: "Compresseur JPEG / PNG",
    description:
      "Compression sans changement de format, avec contrôle de qualité et de palette PNG.",
    icon: Shield,
  },
  {
    href: "/pixel/optimize/resize",
    number: "04",
    title: "Redimensionnement par lot",
    description:
      "Dimensions fixes, largeur/hauteur maximale, proportions et génération de plusieurs variantes.",
    icon: Layers,
  },
  {
    href: "/pixel/optimize/smart-crop",
    number: "05",
    title: "Recadrage intelligent",
    description:
      "Recadrage automatique selon un ratio avec détection du sujet (sharp.strategy.attention).",
    icon: Scissors,
  },
];

export default function PixelOptimizePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Wrench className="size-3.5" aria-hidden />
          Famille 02 · Optimiser
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          4 outils pour réduire le poids
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Chaque kilo-octet économisé améliore le SEO, le temps de
          chargement et l&apos;expérience mobile.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--pf-secondary)]/60 hover:shadow-[0_0_40px_var(--pf-secondary)]/20"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-secondary)] to-transparent opacity-70"
              />
              <header className="mb-3 flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--pf-secondary)] to-[var(--pf-primary)] text-white shadow-md transition-transform group-hover:scale-110">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
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