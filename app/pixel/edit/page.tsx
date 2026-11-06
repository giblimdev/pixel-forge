/*
path :           app/pixel/edit/page.tsx
tag :            ["pixel", "pixel-forge", "edit", "page", "hub", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page HUB de la famille "Éditer". Liste les 3 outils :
                 - /pixel/edit/crop (Éditeur de recadrage — outil 06)
                 - /pixel/edit/background (Suppression d'arrière-plan — outil 07)
                 - /pixel/edit/retouch (Retouche et filigrane — outil 08)

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).
                 Les pages sous-pages importent les composants via
                 `@/app/pixel/features/<x>/components/<panel>`.

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

relatedFiles:    ["@/app/pixel/edit/crop/page.tsx",
                  "@/app/pixel/edit/background/page.tsx",
                  "@/app/pixel/edit/retouch/page.tsx",
                  "@/app/pixel/layout.tsx"]

imports:         ["next", "next/link", "lucide-react"]

exports:         ["default PixelEditPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux choisir un outil d'édition"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Éditer",
  description: "Modifier l'apparence et la composition de vos images.",
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
    href: "/pixel/edit/crop",
    number: "06",
    title: "Éditeur de recadrage",
    description:
      "Recadrage manuel, rotation, retournement, ratios prédéfinis (16:9, 1:1, 4:3, 3:2).",
    icon: Scissors,
  },
  {
    href: "/pixel/edit/background",
    number: "07",
    title: "Suppression d'arrière-plan",
    description:
      "Détourage sur fond uni, pipette, tolérance, lissage des contours. Export PNG avec alpha.",
    icon: Scissors,
  },
  {
    href: "/pixel/edit/retouch",
    number: "08",
    title: "Retouche et filigrane",
    description:
      "Luminosité, contraste, saturation, teinte, netteté, flou, niveaux de gris, watermark.",
    icon: Palette,
  },
];

export default function PixelEditPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Palette className="size-3.5" aria-hidden />
          Famille 03 · Éditer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          3 outils pour éditer vos images
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Transformations géométriques (recadrage) et colorimétriques
          (luminosité, teinte, watermark).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--pf-info)]/60 hover:shadow-[0_0_40px_var(--pf-info)]/20"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-info)] to-transparent opacity-70"
              />
              <header className="mb-3 flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--pf-info)] to-[var(--pf-primary)] text-white shadow-md transition-transform group-hover:scale-110">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
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
