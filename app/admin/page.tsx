/*
path :           app/admin/page.tsx
tag :            ["miam", "admin", "page", "hub"]
projectId:       new-genesis
type:            page
generic:         false

role:            Hub d'administration de l'application métier. Affiche
                 4 cartes d'entrée (Commandes, Catalogue, Commerces,
                 Livreurs) avec icône, description et lien vers la
                 sous-section correspondante. Page statique (Server
                 Component pur). La protection est portée par le layout
                 admin parent (/miam/admin/layout.tsx).

                 Les liens pointent vers des routes qui seront créées
                 dans les itérations suivantes. Tant qu'elles n'existent
                 pas, elles renverront 404 — c'est attendu et documenté
                 dans chaque carte (« à venir »).

flow:            Server Component → header → grille de 4 cartes
                 cliquables (Link) → aucun état, aucun fetch.

ecosystem:       Miam = [
                   "@/app/miam/layout.tsx",
                   "@/app/miam/admin/layout.tsx",
                   "@/app/miam/admin/page.tsx",
                   "@/app/miam/components/MiamNav.tsx",
                 ]

relatedFiles:    ["@/app/miam/admin/layout.tsx"]

imports:         ["next", "next/link", "lucide-react"]

exports:         ["default MiamAdminPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'admin je veux un hub des sections métier"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Package,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Miam",
  description:
    "Administration de l'application métier Miam : commandes, catalogue, commerces, livreurs.",
};

interface AdminTile {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

const TILES: readonly AdminTile[] = [
  {
    href: "/miam/admin/orders",
    title: "Commandes",
    description:
      "Suivre les commandes en cours, gérer les annulations, exporter l'historique.",
    icon: ShoppingBag,
    accent: "chart-1",
  },
  {
    href: "/miam/admin/catalog",
    title: "Catalogue",
    description:
      "Types de commerçants, de produits et de cuisines. Visibilité et ordre.",
    icon: Package,
    accent: "chart-2",
  },
  {
    href: "/miam/admin/merchants",
    title: "Commerces",
    description:
      "Valider les inscriptions, suspendre un commerce, suivre les mises en ligne.",
    icon: Store,
    accent: "chart-3",
  },
  {
    href: "/miam/admin/couriers",
    title: "Livreurs",
    description:
      "Gérer les comptes livreurs, les zones actives et la rémunération.",
    icon: Bike,
    accent: "chart-5",
  },
];

export default function MiamAdminPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Administration
        </h2>
        <p className="text-sm text-muted-foreground">
          Accès réservé aux rôles <strong>admin</strong>, <strong>dev</strong> et{" "}
          <strong>superAdmin</strong>.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const accent = tile.accent;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 opacity-70"
                style={{
                  background: `linear-gradient(90deg, var(--${accent}), transparent)`,
                }}
              />
              <header className="mb-3 flex items-center gap-3">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
                  }}
                >
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  {tile.title}
                </h3>
              </header>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {tile.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-transform group-hover:translate-x-0.5">
                Ouvrir
                <ArrowRight className="size-4" aria-hidden />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}