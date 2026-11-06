/*
path :           components/layout/header/Header.tsx
tag :            ["layout", "header", "navigation", "sheet", "drawer", "ui", "platform-role", "recursive", "accordion", "production", "suspense", "wide", "responsive", "pixel-forge"]
projectId:       new-genesis
type :           component
generic:         false

role:            En-tête global niveau production, responsive 2 paliers
                 (mobile/tablette jusqu'à xl, desktop à partir de xl).

                 PALIERS :
                 - < xl (mobile + tablette) : [☰] [Logo] ... [recherche md+] ... [cloche] [avatar]
                   → burger visible, ouvre le drawer accordéon
                   → nav inline MASQUÉE
                   → barre de recherche visible ≥ md
                 - ≥ xl (desktop) : [Logo] [nav inline complète] ... [recherche large] [cloche] [avatar]
                   → burger MASQUÉ
                   → nav inline VISIBLE (MainNav)
                   → barre de recherche large

                 BASCULE UNIQUE `xl:` (≥ 1280px) — pas de palier
                 intermédiaire `md:` qui créait une confusion (burger
                 + nav inline en même temps).

                 ORDRE ZONE GAUCHE : burger AVANT logo (demande explicite
                 de l'utilisateur).

                 ⚠️ COULEUR : ajout d'une BANDE DÉGRADÉE de 2px en bas
                 du header (chart-1 → chart-2 → chart-3), identique aux
                 cartes Genesis/Pixel-Forge. Rend le header "coloré"
                 au lieu du monochrome actuel. Subtile, non intrusive,
                 cohérente avec le design system.

                 ⚠️ TEXTES "Pixel-Forge" : les mentions "Miam-miam Listo
                 · MVP" (ancienne app supprimée) sont remplacées par
                 "Pixel-Forge · Atelier d'images" dans le SheetHeader
                 et SheetFooter.

                 ⚠️ DRAWER ACCORDÉON : correctif conservé (AccordionGroup
                 repliable + ouverture initiale sur la route active).

                 Props INCHANGÉES (contrat app/layout.tsx préservé) :
                 - notificationSlot?: React.ReactNode
                 - platformRole: PlatformRole | null

flow:            Client Component → useState(drawerOpen) → rend
                 <header role="banner" sticky> → bande dégradée en bas
                 → zone gauche (burger < xl:, Logo) → zone centrale
                 (nav inline ≥ xl:) → zone droite (<HeaderActions />)
                 → <Sheet> (Pixel-Forge) avec <DrawerNav /> accordéon.

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
                  "*en tant qu'utilisateur je veux un header coloré cohérent avec Pixel-Forge"]

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
/*  Icônes par item racine (fallback : Sparkles)                       */
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
/*  AccordionGroup — groupe repliable récursif (drawer)                */
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
        className="group/accordion flex items-center justify-between gap-2 rounded-md py-2 pr-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-chart-1/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1/40"
        style={indent}
      >
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180 text-chart-1" : ""
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
                        ? "bg-chart-1/10 font-semibold text-chart-1"
                        : "hover:bg-muted"
                    }`}
                    style={childIndent}
                  >
                    <span className="font-medium">{child.label}</span>
                    {child.description && (
                      <span className="text-xs text-muted-foreground">
                        {child.description}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span
                    className="block py-2 pr-3 text-sm text-muted-foreground"
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
/*  DrawerNav — feuille client qui appelle usePathname()               */
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
                      ? "bg-chart-1/10 text-chart-1"
                      : "text-foreground hover:bg-chart-1/5"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      active ? "text-chart-1" : ""
                    }`}
                    aria-hidden
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-chart-1"
                    />
                  )}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground">
                  <Icon
                    className="size-4 shrink-0 text-muted-foreground"
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
/*  Fallback du DrawerNav                                              */
/* ------------------------------------------------------------------ */

function DrawerNavFallback() {
  return (
    <div className="flex-1 space-y-1 px-3 py-4" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-muted/40"
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
        className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      >
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:h-[68px] lg:px-8">
          {/* ===================== ZONE GAUCHE ===================== */}
          {/* Burger AVANT le logo (demande utilisateur). Visible < xl. */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-foreground hover:bg-chart-1/10 hover:text-chart-1 xl:hidden"
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

          {/* ===================== ZONE CENTRALE — NAV INLINE ===== */}
          {/* Nav inline visible ≥ xl uniquement. */}
          <div className="hidden min-w-0 flex-1 xl:flex xl:justify-start">
            <MainNav items={mainNavData} platformRole={platformRole} />
          </div>

          {/* ===================== ZONE DROITE ==================== */}
          {/* Espaceur < md pour pousser les actions à droite */}
          <div className="flex-1 md:hidden" aria-hidden />

          <HeaderActions notificationSlot={notificationSlot} />
        </div>

        {/* Bande dégradée Pixel-Forge (2px) — cohérence chart-1..chart-5 */}
        <div
          aria-hidden
          className="h-[2px] w-full bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 opacity-80"
        />
      </header>

      {/* ===================== DRAWER =========================== */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" id="main-drawer">
          <SheetHeader>
            <SheetTitle className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-transparent">
              Pixel-Forge
            </SheetTitle>
            <SheetDescription>
              Atelier d&apos;images · Navigation
            </SheetDescription>
          </SheetHeader>

          <Suspense fallback={<DrawerNavFallback />}>
            <DrawerNav platformRole={platformRole} onNavigate={closeDrawer} />
          </Suspense>

          <SheetFooter>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Pixel-Forge · Atelier d&apos;images
              <br />
              Les mentions légales sont disponibles dans le pied de page.
            </p>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}