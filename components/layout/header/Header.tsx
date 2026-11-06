/*
path :           components/layout/header/Header.tsx
tag :            ["layout", "header", "navigation", "sheet", "drawer", "ui", "platform-role", "recursive", "accordion", "production", "suspense", "wide", "responsive", "pixel-forge", "pixel-forge-charte", "search"]
projectId:       new-genesis
type :           component
generic:         false

role:            En-tête global niveau production, responsive 2 paliers
                 (mobile/tablette jusqu'à xl, desktop à partir de xl).

                 PALIERS :
                 - < xl (mobile + tablette) :
                     [☰] [Logo] ... [recherche md+] ... [cloche] [avatar]
                   → burger visible, ouvre le drawer accordéon
                   → nav inline MASQUÉE
                   → barre de recherche visible ≥ md
                 - ≥ xl (desktop) :
                     [Logo] [nav inline complète] ... [recherche large] [cloche] [avatar]
                   → burger MASQUÉ
                   → nav inline VISIBLE (MainNav)
                   → barre de recherche large

                 BASCULE UNIQUE `xl:` (≥ 1280px) — pas de palier
                 intermédiaire `md:` qui créait une confusion (burger
                 + nav inline en même temps).

                 ORDRE ZONE GAUCHE : burger AVANT logo (demande
                 utilisateur explicite).

                 ⚠️ CHARTE PIXELFORGE :
                 - Fond : var(--pf-background) à 85% + backdrop-blur-xl
                 - Bande dégradée 2px en bas :
                   --pf-primary → --pf-secondary → --pf-info
                   (violet → indigo → cyan) — signature PixelForge
                 - Burger hover : bg --pf-primary/10 + text --pf-primary
                 - Drawer : fond --pf-surface, titre gradient
                   pf-primary → pf-primary-light → pf-secondary
                 - Textes "PixelForge · Atelier d'images"
                 - Accordéon : hover --pf-primary/5, chevron ouvert
                   --pf-primary, lien actif --pf-primary/10

                 ⚠️ DRAWER ACCORDÉON : correctif conservé (AccordionGroup
                 repliable + ouverture initiale sur la route active).

                 ⚠️ RECHERCHE FONCTIONNELLE :
                 <HeaderActions> reçoit désormais `platformRole` (prop
                 obligatoire) pour filtrer les items de la palette
                 <SearchDialog /> par rôle (canSee partagé). C'est la
                 SEULE modification apportée à ce fichier par rapport
                 à la version précédente — tout le reste (burger,
                 nav, accordéon, bande dégradée) est inchangé.

                 Props INCHANGÉES (contrat app/layout.tsx préservé) :
                 - notificationSlot?: React.ReactNode
                 - platformRole: PlatformRole | null

flow:            Client Component → useState(drawerOpen) → rend
                 <header role="banner" sticky> → bande dégradée en bas
                 → zone gauche (burger < xl:, Logo) → zone centrale
                 (nav inline ≥ xl:) → zone droite (<HeaderActions />
                 avec notificationSlot + platformRole) → <Sheet> avec
                 <DrawerNav /> accordéon.

ecosystem:       Layout = [
                   "@/components/layout/header/search/SearchDialog.tsx",
                   "@/components/layout/header/search/search-items.ts",
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

relatedFiles:    ["@/components/layout/header/Logo.tsx",
                  "@/components/layout/header/HeaderActions.tsx",
                  "@/components/layout/header/MainNav.tsx",
                  "@/components/layout/header/UserMenu.tsx",
                  "@/components/layout/header/nav/frontWorkSpace.ts",
                  "@/components/layout/header/navTypes.ts",
                  "@/components/ui/sheet.tsx",
                  "@/app/layout.tsx",
                  "@/config/roles.ts"]

imports:         ["react", "next/link", "next/navigation", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/sheet",
                  "@/components/layout/header/HeaderActions",
                  "@/components/layout/header/Logo",
                  "@/components/layout/header/MainNav",
                  "@/components/layout/header/nav/frontWorkSpace",
                  "@/components/layout/header/navTypes",
                  "@/config/roles"]

exports:         ["default Header", "HeaderProps"]

useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant que développeur je veux un header professionnel responsive 2 paliers",
                  "*en tant qu'utilisateur je veux une nav inline sur grand écran",
                  "*en tant qu'utilisateur je veux un drawer avec sous-menus repliables",
                  "*en tant qu'utilisateur je veux un header coloré cohérent avec PixelForge",
                  "*en tant qu'utilisateur je veux une recherche fonctionnelle depuis le header"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState (drawer + accordéons), interactions.

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  CircleHelp,
  Home,
  Menu,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { HeaderActions } from "@/components/layout/header/HeaderActions";
import Logo from "@/components/layout/header/Logo";
import MainNav from "@/components/layout/header/MainNav";
import { mainNavData } from "@/components/layout/header/nav/frontWorkSpace";
import { canSee, type NavItem } from "@/components/layout/header/navTypes";
import type { PlatformRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface HeaderProps {
  readonly notificationSlot?: React.ReactNode;
  readonly platformRole: PlatformRole | null;
}

/* ------------------------------------------------------------------ */
/*  Icônes par item racine                                             */
/* ------------------------------------------------------------------ */

const ROOT_ICONS: Record<string, LucideIcon> = {
  "nav-home": Home,
  "nav-client": Store,
  "nav-admin": ShieldCheck,
  "nav-super-admin": Users,
  "nav-scrum": Sparkles,
  "nav-genesis": Wrench,
  "nav-help": CircleHelp,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isActivePath(pathname: string, href: string | undefined): boolean {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function containsActive(item: NavItem, pathname: string): boolean {
  if (isActivePath(pathname, item.href)) return true;
  return (item.children ?? []).some((child) => containsActive(child, pathname));
}

/* ------------------------------------------------------------------ */
/*  AccordionGroup                                                     */
/* ------------------------------------------------------------------ */

interface AccordionGroupProps {
  readonly item: NavItem;
  readonly platformRole: PlatformRole | null;
  readonly onNavigate: () => void;
  readonly depth: number;
  readonly pathname: string;
}

function AccordionGroup({
  item,
  platformRole,
  onNavigate,
  depth,
  pathname,
}: AccordionGroupProps) {
  const children = (item.children ?? [])
    .filter((child) => canSee(child, platformRole))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const initiallyOpen = containsActive(item, pathname);
  const [open, setOpen] = useState(initiallyOpen);

  if (children.length === 0) return null;

  const indent = { paddingLeft: `${0.75 + depth * 0.75}rem` };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group/accordion flex items-center justify-between gap-2 rounded-md py-2 pr-3 text-left text-sm font-semibold text-[var(--pf-foreground)] transition-colors hover:bg-[var(--pf-primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]/40"
        style={indent}
      >
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-200 ${
            open
              ? "rotate-180 text-[var(--pf-primary)]"
              : "text-[var(--pf-muted)]"
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="flex flex-col gap-0.5">
          {children.map((child) => {
            const hasChildren = (child.children?.length ?? 0) > 0;
            const active = isActivePath(pathname, child.href);
            const childIndent = {
              paddingLeft: `${0.75 + (depth + 1) * 0.75}rem`,
            };

            return (
              <li key={child.id}>
                {child.href ? (
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    target={child.external ? "_blank" : undefined}
                    rel={child.external ? "noopener noreferrer" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col gap-0.5 rounded-md py-2 pr-3 text-sm transition-colors ${
                      active
                        ? "bg-[var(--pf-primary)]/10 font-semibold text-[var(--pf-primary)]"
                        : "text-[var(--pf-foreground)] hover:bg-[var(--pf-primary)]/5"
                    }`}
                    style={childIndent}
                  >
                    <span className="font-medium">{child.label}</span>
                    {child.description && (
                      <span className="text-xs text-[var(--pf-muted)]">
                        {child.description}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span
                    className="block py-2 pr-3 text-sm text-[var(--pf-muted)]"
                    style={childIndent}
                  >
                    {child.label}
                  </span>
                )}

                {hasChildren && (
                  <AccordionGroup
                    item={child}
                    platformRole={platformRole}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                    pathname={pathname}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DrawerNav                                                          */
/* ------------------------------------------------------------------ */

interface DrawerNavProps {
  readonly platformRole: PlatformRole | null;
  readonly onNavigate: () => void;
}

function DrawerNav({ platformRole, onNavigate }: DrawerNavProps) {
  const pathname = usePathname();

  const sortedItems = useMemo(
    () =>
      [...mainNavData]
        .filter((item) => canSee(item, platformRole))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [platformRole],
  );

  return (
    <nav
      aria-label="Navigation principale (drawer)"
      className="flex-1 overflow-y-auto px-3 py-4"
    >
      <ul className="flex flex-col gap-1">
        {sortedItems.map((item) => {
          const Icon = ROOT_ICONS[item.id] ?? Sparkles;
          const active = isActivePath(pathname, item.href);
          const hasChildren = (item.children?.length ?? 0) > 0;

          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                      : "text-[var(--pf-foreground)] hover:bg-[var(--pf-primary)]/5"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      active ? "text-[var(--pf-primary)]" : ""
                    }`}
                    aria-hidden
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-[var(--pf-primary)]"
                    />
                  )}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--pf-foreground)]">
                  <Icon
                    className="size-4 shrink-0 text-[var(--pf-muted)]"
                    aria-hidden
                  />
                  <span className="flex-1">{item.label}</span>
                </div>
              )}

              {hasChildren && (
                <AccordionGroup
                  item={item}
                  platformRole={platformRole}
                  onNavigate={onNavigate}
                  depth={0}
                  pathname={pathname}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Fallback                                                           */
/* ------------------------------------------------------------------ */

function DrawerNavFallback() {
  return (
    <div className="flex-1 space-y-1 px-3 py-4" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-[var(--pf-surface-hover)]"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export default function Header({
  notificationSlot,
  platformRole,
}: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header
        role="banner"
        aria-label="En-tête principal"
        className="sticky top-0 z-40 w-full border-b border-[var(--pf-border)] bg-[var(--pf-background)]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--pf-background)]/70"
      >
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:h-[68px] lg:px-8">
          {/* ZONE GAUCHE — burger AVANT logo, visible < xl */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-[var(--pf-foreground)] hover:bg-[var(--pf-primary)]/10 hover:text-[var(--pf-primary)] xl:hidden"
              aria-label={drawerOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={drawerOpen}
              aria-controls="main-drawer"
              onClick={toggleDrawer}
            >
              {drawerOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </Button>

            <Logo />
          </div>

          {/* ZONE CENTRALE — nav inline visible ≥ xl */}
          <div className="hidden min-w-0 flex-1 xl:flex xl:justify-start">
            <MainNav items={mainNavData} platformRole={platformRole} />
          </div>

          {/* Espaceur < md */}
          <div className="flex-1 md:hidden" aria-hidden />

          {/* ZONE DROITE — recherche fonctionnelle + actions */}
          <HeaderActions
            notificationSlot={notificationSlot}
            platformRole={platformRole}
          />
        </div>

        {/* Bande dégradée PixelForge (signature visuelle) */}
        <div
          aria-hidden
          className="h-[2px] w-full bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] opacity-80"
        />
      </header>

      {/* DRAWER */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" id="main-drawer">
          <SheetHeader>
            <SheetTitle className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-transparent">
              PixelForge
            </SheetTitle>
            <SheetDescription>
              Atelier d&apos;images · Navigation
            </SheetDescription>
          </SheetHeader>

          <Suspense fallback={<DrawerNavFallback />}>
            <DrawerNav platformRole={platformRole} onNavigate={closeDrawer} />
          </Suspense>

          <SheetFooter>
            <p className="text-center text-[11px] leading-relaxed text-[var(--pf-muted)]">
              PixelForge · Atelier d&apos;images
              <br />
              Les mentions légales sont disponibles dans le pied de page.
            </p>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}