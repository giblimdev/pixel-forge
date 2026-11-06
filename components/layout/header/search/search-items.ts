/*
path :           components/layout/header/search/search-items.ts
tag :            ["search", "command", "navigation", "actions", "config", "pixel-forge-charte"]
projectId:       new-genesis
type:            config
generic:         true

role:            Source de vérité des items indexés par la recherche
                 (CommandDialog). Deux familles :
                 1. NAVIGATION — dérivée de mainNavData (frontWorkSpace.ts)
                    et filtrée par rôle via canSee. Aplatie sur 2 niveaux
                    (racine + enfants directs) pour rester lisible dans
                    la palette. Les hrefs sont résolus via resolveHrefString.
                 2. ACTIONS — statiques, indépendantes de la nav :
                    - "Mon profil"     → /user/profile
                    - "Se déconnecter" → action signOut (traitée côté
                                         SearchDialog)
                    - "Aide Genesis"   → /genesis/help
                    - "Commandes CLI"  → /genesis/cmd
                    - "Mode d'emploi PixelForge" → /pixel (cette page)
                 Chaque item porte un groupe ("Navigation" | "Actions")
                 + une icône Lucide + éventuellement un hint (description
                 courte ou raccourci).

                 ⚠️ Défensif : si un item a des enfants récursifs sur plus
                 de 2 niveaux (cas non présent aujourd'hui mais possible),
                 on ne descend PAS au-delà du niveau 2. Les sous-sous-menus
                 restent accessibles via la navigation normale. C'est un
                 choix UX : la palette doit rester rapide à parcourir.

                 ⚠️ Le tri respecte displayOrder à chaque niveau (comme
                 la nav). Le filtrage par rôle est délégué à canSee —
                 source unique partagée avec MainNav et le drawer.

flow:            Module TypeScript pur → export de SearchItem,
                 buildSearchItems(platformRole) → retourne SearchItem[]
                 filtré par rôle, ordonné par displayOrder. Aucun état,
                 aucun effet.

ecosystem:       Search = [
                   "@/components/layout/header/search/search-items.ts",
                   "@/components/layout/header/search/SearchDialog.tsx",
                   "@/components/layout/header/CommandKButton.tsx",
                   "@/components/layout/header/HeaderActions.tsx",
                 ]

relatedFiles:    ["@/components/layout/header/nav/frontWorkSpace.ts",
                  "@/components/layout/header/navTypes.ts",
                  "@/config/roles.ts"]

imports:         ["lucide-react",
                  "@/components/layout/header/nav/frontWorkSpace",
                  "@/components/layout/header/navTypes",
                  "@/config/roles"]

exports:         ["SearchItem", "SearchGroup", "buildSearchItems"]

useBy:           ["@/components/layout/header/search/SearchDialog.tsx"]

userStories:     ["*en tant qu'utilisateur je veux rechercher une page ou une action",
                  "*en tant qu'utilisateur je veux que la recherche respecte mon rôle"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import {
  BookOpen,
  CircleHelp,
  KeyRound,
  LogOut,
  Terminal,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

import { mainNavData } from "@/components/layout/header/nav/frontWorkSpace";
import {
  canSee,
  resolveHrefString,
  type NavItem,
  type RouteParams,
} from "@/components/layout/header/navTypes";
import type { PlatformRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SearchGroup = "Navigation" | "Actions";

export interface SearchItem {
  readonly id: string;
  readonly group: SearchGroup;
  readonly label: string;
  readonly hint?: string;
  /** Cible de navigation. Null si l'item est une action pure. */
  readonly href: string | null;
  /** Action à exécuter côté SearchDialog (ex. "signOut"). */
  readonly action?: "signOut";
  readonly icon: LucideIcon;
}

/* ------------------------------------------------------------------ */
/*  Constante : params vides (routes statiques)                        */
/* ------------------------------------------------------------------ */

const EMPTY_PARAMS: RouteParams = {};

/* ------------------------------------------------------------------ */
/*  Actions statiques (indépendantes de la nav)                        */
/* ------------------------------------------------------------------ */

const STATIC_ACTIONS: readonly SearchItem[] = [
  {
    id: "action-profile",
    group: "Actions",
    label: "Mon profil",
    hint: "Gérer mes informations",
    href: "/user/profile",
    icon: UserCircle2,
  },
  {
    id: "action-genesis-help",
    group: "Actions",
    label: "Aide Genesis",
    hint: "Mode d'emploi des outils DEV",
    href: "/genesis/help",
    icon: CircleHelp,
  },
  {
    id: "action-genesis-cmd",
    group: "Actions",
    label: "Commandes CLI",
    hint: "Référence Next.js, Vercel, Prisma",
    href: "/genesis/cmd",
    icon: Terminal,
  },
  {
    id: "action-pixel-help",
    group: "Actions",
    label: "Mode d'emploi PixelForge",
    hint: "Présentation de l'atelier d'images",
    href: "/pixel",
    icon: BookOpen,
  },
  {
    id: "action-sign-out",
    group: "Actions",
    label: "Se déconnecter",
    hint: "Fermer la session",
    href: null,
    action: "signOut",
    icon: LogOut,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Résout le href d'un NavItem, en retournant null si le href est
 * absent ou si la résolution a échoué (placeholder non résolu).
 */
function resolveNavHref(item: NavItem): string | null {
  if (!item.href) return null;
  const resolved = resolveHrefString(item.href, EMPTY_PARAMS);
  return resolved ?? null;
}

/**
 * Aplatit un NavItem en SearchItem, en ne descendant que sur 2 niveaux
 * (racine + enfants directs). Les petits-enfants sont ignorés (choix UX).
 */
function flattenNavItem(item: NavItem): SearchItem[] {
  const results: SearchItem[] = [];

  const rootHref = resolveNavHref(item);
  if (rootHref !== null) {
    results.push({
      id: `nav-${item.id}`,
      group: "Navigation",
      label: item.label,
      hint: item.description,
      href: rootHref,
      icon: BookOpen, // icône par défaut : remplacée côté SearchDialog par ROOT_ICONS si besoin
    });
  }

  // Enfants directs uniquement (niveau 2)
  for (const child of item.children ?? []) {
    const childHref = resolveNavHref(child);
    if (childHref === null) continue;
    results.push({
      id: `nav-${item.id}-${child.id}`,
      group: "Navigation",
      label: child.label,
      hint: child.description ?? item.label,
      href: childHref,
      icon: KeyRound, // icône neutre, cohérente pour les sous-items
    });
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  API publique                                                       */
/* ------------------------------------------------------------------ */

/**
 * Construit la liste complète des items recherchables, filtrés par
 * rôle plateforme et ordonnés par displayOrder à chaque niveau.
 *
 * - platformRole === null : anonyme → seuls les items minPlatformRole
 *   "user" sont visibles (comme dans MainNav).
 * - platformRole !== null : filtrage hiérarchique via canSee.
 *
 * Les actions statiques sont TOUJOURS incluses SAUF "Se déconnecter"
 * si l'utilisateur est anonyme (aucune session à fermer).
 */
export function buildSearchItems(
  platformRole: PlatformRole | null,
): readonly SearchItem[] {
  const navigationItems: SearchItem[] = [];

  const sortedRoots = [...mainNavData]
    .filter((item) => canSee(item, platformRole))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  for (const root of sortedRoots) {
    const flat = flattenNavItem(root);
    navigationItems.push(...flat);
  }

  const actions = STATIC_ACTIONS.filter((action) => {
    // Anonyme : pas de déconnexion proposée
    if (action.action === "signOut" && platformRole === null) return false;
    return true;
  });

  return [...navigationItems, ...actions];
}