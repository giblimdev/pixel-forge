/*
path:            app/pixel/dashboard/page.tsx
tag:             ["pixel", "pixel-forge", "dashboard", "page", "history"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Tableau de bord PixelForge. Affiche :
                 - header
                 - historique des traitements (localStorage via
                   <HistoryList />, qui gere lui-meme l'etat vide)
                 - raccourcis vers les outils.

                 Le composant HistoryList est Client (lit localStorage).
                 Le reste de la page reste Server Component : pas de
                 fetch, pas de Prisma, aucune session requise.

flow:            Server Component -> header -> <HistoryList /> ->
                 raccourcis (4 cartes).

ecosystem:       Pixel = [
                   "@/app/pixel/dashboard/page.tsx",
                   "@/app/pixel/components/history/history-list.tsx",
                   "@/app/pixel/components/history/history-empty.tsx",
                   "@/app/pixel/components/history/history-toolbar.tsx",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/page.tsx",
                  "@/components/ui/button.tsx",
                  "@/app/pixel/components/history/history-list.tsx"]
imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/app/pixel/components/history/history-list"]
exports:         ["default PixelDashboardPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir mes derniers traitements",
                  "*en tant qu'utilisateur je veux acceder rapidement aux outils"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { HistoryList } from "@/app/pixel/components/history/history-list";

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
          Accédez rapidement à vos outils et retrouvez vos derniers
          traitements.
        </p>
      </header>

      <section aria-labelledby="history-title" className="space-y-3">
        <h3
          id="history-title"
          className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Historique récent
        </h3>
        <HistoryList />
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

      <section className="rounded-2xl border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-5 text-center backdrop-blur-xl">
        <p className="text-sm text-[var(--pf-muted)]">
          Prêt à commencer ?{" "}
          <Link
            href="/pixel/convert"
            className={`${buttonVariants({ variant: "link" })} h-auto p-0 text-sm`}
          >
            Lancer une conversion
          </Link>
        </p>
      </section>
    </div>
  );
}