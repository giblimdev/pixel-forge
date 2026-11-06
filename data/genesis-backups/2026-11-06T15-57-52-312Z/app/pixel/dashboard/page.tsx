/*
path :           app/pixel/dashboard/page.tsx
tag :            ["pixel", "pixel-forge", "dashboard", "page", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Tableau de bord PixelForge. Affiche l'historique
                 (localStorage, vide par défaut) et les raccourcis.

flow:            Server Component → header → historique → raccourcis.

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

relatedFiles:    ["@/app/pixel/page.tsx",
                  "@/components/ui/button.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button"]

exports:         ["default PixelDashboardPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir un résumé de mes traitements"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ListChecks } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Vue d'ensemble de PixelForge.",
};

export default function PixelDashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-primary)]">
          <ListChecks className="size-3.5" aria-hidden />
          Dashboard
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Vue d&apos;ensemble
        </h2>
        <p className="text-sm text-[var(--pf-muted)]">
          Accédez rapidement à vos outils et retrouvez vos derniers traitements.
        </p>
      </header>

      <section
        aria-labelledby="history-title"
        className="rounded-2xl border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-8 text-center backdrop-blur-xl"
      >
        <Clock
          className="mx-auto mb-3 size-8 text-[var(--pf-muted)]"
          aria-hidden
        />
        <h3
          id="history-title"
          className="text-base font-semibold text-[var(--pf-foreground)]"
        >
          Aucun traitement pour l&apos;instant
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--pf-muted)]">
          Vos derniers traitements apparaîtront ici. L&apos;historique est
          stocké localement (localStorage) et ne quitte jamais votre navigateur.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/pixel/convert"
            className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
          >
            Convertir une image
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/pixel/optimize"
            className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
          >
            Optimiser un lot
          </Link>
        </div>
      </section>

      <section aria-labelledby="shortcuts-title">
        <h3
          id="shortcuts-title"
          className="mb-3 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Raccourcis
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/pixel/convert", label: "Convertir" },
            { href: "/pixel/optimize", label: "Optimiser" },
            { href: "/pixel/edit", label: "Éditer" },
            { href: "/pixel/generate", label: "Générer" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 text-sm font-medium text-[var(--pf-foreground)] backdrop-blur-xl transition-colors hover:border-[var(--pf-primary)]/40 hover:bg-[var(--pf-surface)]"
            >
              {item.label}
              <ArrowRight
                className="size-4 text-[var(--pf-muted)] transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
