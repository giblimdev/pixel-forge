/*
path :           app/pixel/page.tsx
tag :            ["pixel", "pixel-forge", "page", "hub", "landing", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'accueil PixelForge (racine /pixel). Hub marketing
                 + navigation rapide vers les 6 familles / pages d'entrée.

flow:            Server Component sync → hero → grille 6 cartes familles
                 → CTA final.

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

relatedFiles:    ["@/app/pixel/layout.tsx",
                  "@/components/ui/button.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button"]

exports:         ["default PixelHomePage", "metadata"]

useBy:           []

userStories:     ["*en tant que visiteur je veux découvrir les 5 familles d'outils"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ListChecks,
  Palette,
  Scissors,
  Sparkles,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "PixelForge",
  description:
    "11 outils pour convertir, optimiser, éditer, générer et analyser vos images.",
};

interface FamilyCard {
  readonly href: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly count: number;
}

const FAMILIES: readonly FamilyCard[] = [
  {
    href: "/pixel/dashboard",
    title: "Dashboard",
    tagline: "Vue d'ensemble",
    description:
      "Historique des traitements récents, raccourcis vers les outils, statistiques d'usage.",
    icon: ListChecks,
    accent: "var(--pf-primary)",
    count: 0,
  },
  {
    href: "/pixel/convert",
    title: "Convertir",
    tagline: "Changer le format",
    description:
      "JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG. Contrôle de la qualité, du mode et des métadonnées.",
    icon: ArrowRight,
    accent: "var(--pf-primary)",
    count: 1,
  },
  {
    href: "/pixel/optimize",
    title: "Optimiser",
    tagline: "Réduire le poids",
    description:
      "Optimisation intelligente, compression JPEG/PNG, redimensionnement par lot, recadrage auto.",
    icon: Wrench,
    accent: "var(--pf-secondary)",
    count: 4,
  },
  {
    href: "/pixel/edit",
    title: "Éditer",
    tagline: "Modifier l'apparence",
    description:
      "Recadrage manuel, détourage, retouche colorimétrique, watermark.",
    icon: Palette,
    accent: "var(--pf-info)",
    count: 3,
  },
  {
    href: "/pixel/generate",
    title: "Générer",
    tagline: "Créer des ressources",
    description:
      "Favicons complets, placeholders LQIP/BlurHash, palettes de couleurs exportables.",
    icon: Sparkles,
    accent: "var(--pf-success)",
    count: 3,
  },
  {
    href: "/pixel/analyze",
    title: "Analyser",
    tagline: "Comprendre une image",
    description:
      "Dimensions, format, EXIF, GPS, ICC. Fonction intégrée à tous les outils.",
    icon: Scissors,
    accent: "var(--pf-warning)",
    count: 1,
  },
];

export default function PixelHomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-gradient-to-br from-[var(--pf-primary)]/10 via-[var(--pf-secondary)]/5 to-[var(--pf-info)]/5 p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--pf-primary)]/20 blur-3xl"
        />
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/60 px-3 py-1 text-xs font-medium text-[var(--pf-muted)] backdrop-blur">
            <Sparkles className="size-3.5 text-[var(--pf-primary)]" aria-hidden />
            Atelier d&apos;images · local, gratuit, open-source
          </span>
          <h2 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
            11 outils, 5 familles
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--pf-muted)] sm:text-base">
            Convertir, optimiser, éditer, générer et analyser vos images.
            Traitement par lot, aperçu avant/après, téléchargement ZIP.
            Aucune donnée ne quitte votre machine.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/pixel/convert"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Démarrer une conversion
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/dev"
              className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
            >
              <Terminal className="size-4" aria-hidden />
              Dépendances
            </Link>
          </div>
        </div>
      </section>

      <section>
        <header className="mb-6">
          <h2 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
            Explorer par famille
          </h2>
          <p className="mt-1 text-sm text-[var(--pf-muted)]">
            Chaque famille regroupe les outils qui répondent au même besoin.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FAMILIES.map((family) => {
            const Icon = family.icon;
            const accent = family.accent;
            return (
              <Link
                key={family.href}
                href={family.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--pf-primary)]/60 hover:shadow-[0_0_40px_var(--pf-primary)]/20"
                style={{ "--accent": accent } as React.CSSProperties}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 opacity-70"
                  style={{
                    background: `linear-gradient(90deg, var(--accent), transparent)`,
                  }}
                />
                <header className="mb-3 flex items-start gap-3">
                  <div
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md transition-transform group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
                    }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: `var(--accent)` }}
                    >
                      {family.tagline}
                    </p>
                    <h3 className="text-base font-bold tracking-tight text-[var(--pf-foreground)]">
                      {family.title}
                    </h3>
                  </div>
                  {family.count > 0 && (
                    <span className="shrink-0 rounded-full bg-[var(--pf-surface-hover)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--pf-muted)]">
                      {family.count}
                    </span>
                  )}
                </header>
                <p className="flex-1 text-sm leading-relaxed text-[var(--pf-muted)]">
                  {family.description}
                </p>
                <footer className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--pf-foreground)]/80 transition-transform group-hover:translate-x-1">
                  Ouvrir
                  <ArrowRight className="size-4" aria-hidden />
                </footer>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--pf-border)]/60 bg-gradient-to-br from-[var(--pf-primary)]/10 via-[var(--pf-secondary)]/10 to-[var(--pf-info)]/10 p-8 text-center backdrop-blur-xl">
        <h2 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-info)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Prêt à forger vos images ?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--pf-muted)]">
          11 outils autonomes. Sélectionnez un outil, déposez vos images,
          récupérez-les optimisées.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/pixel/convert"
            className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
          >
            Commencer
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}