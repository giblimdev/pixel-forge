/*
path :           components/layout/header/MainNav.tsx
tag :            ["layout", "header", "nav", "platform-role", "rbac", "recursive", "hover", "responsive", "pixel-forge-charte"]
projectId:       new-genesis
type :           component
generic:         true

role:            Navigation principale desktop. Reçoit les items (déjà
                 filtrés par Header) + le rôle plateforme. Filtre les
                 items ET leurs enfants (récursif) selon `visible` ET
                 `minPlatformRole` via canSee (source unique).

                 ⚠️ CHARTE PIXELFORGE : tous les états visuels utilisent
                 les tokens pf-* (violet électrique) au lieu de chart-*
                 ou primary. Le rendu est identique (mêmes valeurs), mais
                 l'intention est explicite.
                 - Lien actif : bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]
                 - Hover : hover:bg-[var(--pf-primary)]/5
                 - Focus ring : focus-visible:ring-[var(--pf-primary)]/40
                 - Chevron ouvert : text-[var(--pf-primary)]
                 - Sous-menu : ring-1 ring-[var(--pf-primary)]/5

                 ⚠️ RESPONSIVE : pas de `hidden md:block` sur <nav>.
                 C'est Header.tsx qui contrôle la visibilité (≥ xl:).
                 ⚠️ ESPACEMENT : gap-1 (au lieu de gap-0.5).
                 ⚠️ COMPORTEMENT : hover desktop (mouseenter/leave avec
                 delay 120ms), chaque item a son state `open`.

flow:            Client Component → useMemo(filtre canSee + tri) →
                 NavItemRow (state open) → hover/focus → ChildrenList
                 conditionnel → ChildrenListItem (récursif).

ecosystem:       Layout = [
                   "@/components/layout/header/CommandKButton.tsx",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/HeaderActions.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/NavActiveLink.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/UserMenuInner.tsx",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/ui/sheet.tsx",
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/config/navigation.ts",
                   "@/config/roles.ts",
                 ]

relatedFiles:    ["@/components/layout/header/navTypes.ts",
                  "@/components/layout/header/NavActiveLink.tsx",
                  "@/components/layout/header/Header.tsx",
                  "@/components/layout/header/nav/frontWorkSpace.ts",
                  "@/config/navigation.ts",
                  "@/config/roles.ts"]

imports:         ["react", "next/link", "lucide-react",
                  "@/components/layout/header/navTypes",
                  "@/components/layout/header/NavActiveLink",
                  "@/config/roles"]

exports:         ["default MainNav", "MainNavProps"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant que développeur je veux une nav desktop paramétrable par rôle plateforme",
                  "*en tant que superAdmin je veux voir tous les items de navigation"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState (open par item), useRef (timers), useMemo, interactions.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

import {
  canSee,
  resolveHrefString,
  type NavItem,
  type RouteParams,
} from "@/components/layout/header/navTypes";
import { NavActiveLink } from "@/components/layout/header/NavActiveLink";
import type { PlatformRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/*  Constante : params vides (routes statiques)                        */
/* ------------------------------------------------------------------ */

const EMPTY_PARAMS: RouteParams = {};

/* ------------------------------------------------------------------ */
/*  Helpers de style — palette pf-* (PixelForge)                       */
/* ------------------------------------------------------------------ */

const LINK_BASE =
  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const LINK_INACTIVE = `${LINK_BASE} text-[var(--pf-muted)] hover:bg-[var(--pf-primary)]/5 hover:text-[var(--pf-foreground)]`;

const LINK_ACTIVE = `${LINK_BASE} bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]`;

const SUB_LINK_BASE =
  "flex items-start gap-2 rounded-md px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]/40";

const SUB_LINK_INACTIVE = `${SUB_LINK_BASE} text-[var(--pf-foreground)] hover:bg-[var(--pf-primary)]/5`;

const SUB_LINK_ACTIVE = `${SUB_LINK_BASE} bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]`;

/* ------------------------------------------------------------------ */
/*  Fallback : lien neutre (prérendu, sans usePathname)                */
/* ------------------------------------------------------------------ */

function NeutralLink({ item }: { readonly item: NavItem }) {
  if (!item.href) {
    return (
      <button type="button" className={LINK_INACTIVE} disabled={item.disabled}>
        {item.label}
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={LINK_INACTIVE}
    >
      {item.label}
      {item.external && (
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
      )}
    </Link>
  );
}

function NeutralSubLink({ child }: { readonly child: NavItem }) {
  if (!child.href) {
    return (
      <span className="flex items-start gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--pf-muted)]">
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-medium">{child.label}</span>
          {child.description && (
            <span className="text-xs text-[var(--pf-muted)]">
              {child.description}
            </span>
          )}
        </span>
      </span>
    );
  }
  return (
    <Link
      href={child.href}
      target={child.external ? "_blank" : undefined}
      rel={child.external ? "noopener noreferrer" : undefined}
      className={SUB_LINK_INACTIVE}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{child.label}</span>
        {child.description && (
          <span className="text-xs text-[var(--pf-muted)]">
            {child.description}
          </span>
        )}
      </span>
      {child.external && (
        <ExternalLink
          className="mt-0.5 h-3 w-3 shrink-0 opacity-60"
          aria-hidden
        />
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-menu récursif (N niveaux)                                     */
/* ------------------------------------------------------------------ */

interface ChildrenListProps {
  readonly children: readonly NavItem[];
  readonly platformRole: PlatformRole | null;
  readonly depth: number;
}

function ChildrenList({ children, platformRole, depth }: ChildrenListProps) {
  const sorted = useMemo(
    () =>
      [...children]
        .filter((child) => canSee(child, platformRole))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [children, platformRole],
  );

  if (sorted.length === 0) return null;

  const positionClass =
    depth === 0 ? "left-0 top-full mt-1" : "left-full top-0 ml-1";

  return (
    <ul
      role="menu"
      className={`absolute z-50 min-w-[220px] rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] p-1.5 shadow-lg ring-1 ring-[var(--pf-primary)]/10 ${positionClass}`}
    >
      {sorted.map((child) => (
        <li key={child.id} role="none">
          <ChildrenListItem
            child={child}
            platformRole={platformRole}
            depth={depth}
          />
        </li>
      ))}
    </ul>
  );
}

interface ChildrenListItemProps {
  readonly child: NavItem;
  readonly platformRole: PlatformRole | null;
  readonly depth: number;
}

function ChildrenListItem({
  child,
  platformRole,
  depth,
}: ChildrenListItemProps) {
  const hasChildren = (child.children?.length ?? 0) > 0;
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  const resolvedHref = child.href
    ? (resolveHrefString(child.href, EMPTY_PARAMS) ?? child.href)
    : undefined;

  const content = (
    <>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{child.label}</span>
        {child.description && (
          <span className="text-xs text-[var(--pf-muted)]">
            {child.description}
          </span>
        )}
      </span>
      {child.external && (
        <ExternalLink
          className="mt-0.5 h-3 w-3 shrink-0 opacity-60"
          aria-hidden
        />
      )}
      {hasChildren && (
        <ChevronRight
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors ${
            open ? "text-[var(--pf-primary)]" : "opacity-60"
          }`}
          aria-hidden
        />
      )}
    </>
  );

  return (
    <div
      className="relative"
      onMouseEnter={hasChildren ? cancelClose : undefined}
      onMouseLeave={hasChildren ? scheduleClose : undefined}
      onFocus={hasChildren ? cancelClose : undefined}
      onBlur={hasChildren ? scheduleClose : undefined}
    >
      {resolvedHref ? (
        <Suspense fallback={<NeutralSubLink child={child} />}>
          <NavActiveLink
            href={resolvedHref}
            external={child.external}
            classNameInactive={SUB_LINK_INACTIVE}
            classNameActive={SUB_LINK_ACTIVE}
            role="menuitem"
          >
            {content}
          </NavActiveLink>
        </Suspense>
      ) : (
        <span className="flex items-start gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--pf-muted)]">
          {content}
        </span>
      )}

      {hasChildren && open && child.children && (
        <ChildrenList
          children={child.children}
          platformRole={platformRole}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne d'item (state open par item racine)                          */
/* ------------------------------------------------------------------ */

interface NavItemRowProps {
  readonly item: NavItem;
  readonly platformRole: PlatformRole | null;
}

function NavItemRow({ item, platformRole }: NavItemRowProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedChildren = useMemo(() => {
    if (!item.children) return [];
    return [...item.children]
      .filter((child) => canSee(child, platformRole))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [item.children, platformRole]);

  const hasChildren = sortedChildren.length > 0;

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  const resolvedHref = item.href
    ? (resolveHrefString(item.href, EMPTY_PARAMS) ?? item.href)
    : undefined;

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? cancelClose : undefined}
      onMouseLeave={hasChildren ? scheduleClose : undefined}
      onFocus={hasChildren ? cancelClose : undefined}
      onBlur={hasChildren ? scheduleClose : undefined}
    >
      {resolvedHref ? (
        <Suspense fallback={<NeutralLink item={item} />}>
          <NavActiveLink
            href={resolvedHref}
            external={item.external}
            classNameInactive={LINK_INACTIVE}
            classNameActive={LINK_ACTIVE}
          >
            {item.label}
            {item.external && (
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
            )}
            {hasChildren && (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  open ? "rotate-180 text-[var(--pf-primary)]" : "opacity-60"
                }`}
                aria-hidden
              />
            )}
          </NavActiveLink>
        </Suspense>
      ) : (
        <button
          type="button"
          className={LINK_INACTIVE}
          disabled={item.disabled}
          aria-haspopup={hasChildren ? "menu" : undefined}
          aria-expanded={hasChildren ? open : undefined}
        >
          {item.label}
          {hasChildren && (
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                open ? "rotate-180 text-[var(--pf-primary)]" : "opacity-60"
              }`}
              aria-hidden
            />
          )}
        </button>
      )}

      {hasChildren && open && (
        <ChildrenList
          children={sortedChildren}
          platformRole={platformRole}
          depth={0}
        />
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export type MainNavProps = {
  readonly items: readonly NavItem[];
  readonly platformRole?: PlatformRole | null;
};

export default function MainNav({ items, platformRole }: MainNavProps) {
  const sortedItems = useMemo(
    () =>
      [...items]
        .filter((item) => canSee(item, platformRole ?? null))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [items, platformRole],
  );

  return (
    <nav aria-label="Navigation principale" className="w-full">
      <ul className="flex items-center gap-1">
        {sortedItems.map((item) => (
          <NavItemRow
            key={item.id}
            item={item}
            platformRole={platformRole ?? null}
          />
        ))}
      </ul>
    </nav>
  );
}