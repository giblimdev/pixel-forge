/*
path :           app/pixel/components/PixelNav.tsx
tag :            ["pixel", "pixel-forge", "nav", "ui", "client", "pixel-forge-charte"]
projectId:       pixel
type:            component
generic:         false

role:            Navigation interne PixelForge. 6 onglets : Dashboard,
                 Convertir, Optimiser, Éditer, Générer, Analyser.
                 L'onglet actif est déterminé via usePathname.

flow:            Client Component → usePathname → Link actif/inactif.

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

relatedFiles:    ["@/app/pixel/layout.tsx"]

imports:         ["next/link", "next/navigation", "lucide-react"]

exports:         ["PixelNav"]

useBy:           ["@/app/pixel/layout.tsx"]

userStories:     ["*en tant qu'utilisateur je veux naviguer entre les 5 familles d'outils"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : usePathname (état actif).

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ListChecks,
  Palette,
  Scissors,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/pixel/dashboard", label: "Dashboard", icon: ListChecks },
  { href: "/pixel/convert", label: "Convertir", icon: ArrowRight },
  { href: "/pixel/optimize", label: "Optimiser", icon: Wrench },
  { href: "/pixel/edit", label: "Éditer", icon: Palette },
  { href: "/pixel/generate", label: "Générer", icon: Sparkles },
  { href: "/pixel/analyze", label: "Analyser", icon: Scissors },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PixelNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation PixelForge"
      className="overflow-x-auto border-b border-[var(--pf-border)]/60 pb-px"
    >
      <ul className="flex min-w-max items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                    : "text-[var(--pf-muted)] hover:bg-[var(--pf-primary)]/5 hover:text-[var(--pf-foreground)]"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
