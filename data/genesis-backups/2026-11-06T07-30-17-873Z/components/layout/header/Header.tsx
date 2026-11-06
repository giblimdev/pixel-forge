/*
path :           components/layout/header/Header.tsx
tag :            ["layout", "header", "navigation", "sheet", "drawer", "ui", "platform-role", "recursive", "accordion", "production", "suspense"]
projectId:       miam-miam-listo
type :           component
generic:         false

role:            En-tête global niveau production. Composant CLIENT
                 (useState pour le drawer). Reçoit en props :
                 - `notificationSlot` : Server Component async (la
                   cloche) monté sous Suspense par app/layout.tsx.
                 - `platformRole` : rôle plateforme de l'utilisateur
                   courant (null = anonyme), calculé côté serveur.

                 ⚠️ CORRECTIF MENU — DRAWER ACCORDÉON :
                 Le drawer mobile utilisait une navigation RÉCURSIVE
                 qui affichait TOUJOURS les sous-menus (Admin, Scrum,
                 Genesis, Super-admin…). Résultat : un mur de liens
                 impossible à replier, aggravé par les 3 niveaux de
                 `frontWorkSpace.ts` (ex. Scrum → Dashboard → Roadmap).

                 Correction :
                 1. Chaque groupe avec enfants devient un ACCORDÉON :
                    un bouton header (label + chevron) qui toggle
                    l'état `open` LOCAL au groupe.
                 2. Les enfants ne sont rendus QUE si `open === true`.
                 3. Ouverture INITIALE intelligente : un groupe est
                    ouvert par défaut si son pathname courant ou
                    l'un de ses descendants correspond à la route
                    active (détection récursive via `containsActive`).
                 4. Le clic sur un lien appelle `onNavigate` (ferme
                    le drawer) — comportement conservé.
                 5. Le chevron pivote à 90° quand le groupe est
                    ouvert (feedback visuel).

                 Le MainNav desktop (hover) reste INCHANGÉ — seule
                 la navigation du drawer est affectée par ce correctif.

                 ISOLATION usePathname() : le Header lui-même N'APPELLE
                 PAS usePathname(). Il rend <DrawerNav> (feuille client)
                 enveloppé dans <Suspense>. Le hook est ainsi isolé sous
                 une frontière de suspense, compatible Cache Components.

flow:            Client Component → useState(drawerOpen) → rend
                 <header> sticky → zone gauche (burger + Logo) → zone
                 droite (notificationSlot + UserMenu) → <Sheet
                 open={drawerOpen}> avec SheetHeader + <Suspense>
                 <DrawerNav /> (le hook usePathname est isolé ici)
                 + SheetFooter.

                 DrawerNav → usePathname() → useMemo(sortedItems) →
                 rend la nav récursive avec AccordionGroup.
                 AccordionGroup → useState(open) initialisé via
                 containsActive(item, pathname) → bouton header
                 (toggle) + {open && <ul>children</ul>} → récursion.

ecosystem:       Layout = [
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/components/layout/footer/Footer.tsx",
                   "@/components/layout/header/Header.tsx",
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
                  "@/components/layout/header/UserMenu.tsx",
                  "@/components/layout/header/nav/frontWorkSpace.ts",
                  "@/components/layout/header/navTypes.ts",
                  "@/components/ui/sheet.tsx",
                  "@/app/layout.tsx",
                  "@/config/roles.ts"]

imports:         ["react", "next/link", "next/navigation", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/sheet",
                  "@/components/layout/header/Logo",
                  "@/components/layout/header/UserMenu",
                  "@/components/layout/header/nav/frontWorkSpace",
                  "@/components/layout/header/navTypes",
                  "@/config/roles"]

exports:         ["default Header", "HeaderProps"]

useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant que développeur je veux un header professionnel avec burger visible sur tous les écrans",
                  "*en tant qu'utilisateur je veux un drawer avec sous-menus repliables",
                  "*en tant que superAdmin je veux voir tous les items de navigation"]

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
import Logo from "@/components/layout/header/Logo";
import UserMenu from "@/components/layout/header/UserMenu";
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

/**
 * Vrai si le groupe `item` OU l'un de ses descendants correspond au
 * pathname courant. Sert à décider de l'ouverture initiale d'un
 * accordéon (pattern standard : on ouvre le groupe contenant la
 * page active pour ne pas perdre l'utilisateur).
 */
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

  /**
   * Ouverture initiale : si le groupe contient la route active,
   * on l'ouvre d'emblée. Sinon fermé. L'utilisateur peut ensuite
   * toggler librement — l'état n'est pas resynchronisé après.
   */
  const initiallyOpen = containsActive(item, pathname);
  const [open, setOpen] = useState(initiallyOpen);

  if (children.length === 0) return null;

  const indent = { paddingLeft: `${0.75 + depth * 0.75}rem` };

  return (
    <div className="flex flex-col">
      {/* Header cliquable — toggle l'accordéon */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group/accordion flex items-center justify-between gap-2 rounded-md py-2 pr-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={indent}
      >
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {/* Enfants — rendus SEULEMENT si open */}
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
                        ? "bg-chart-1/10 text-chart-1"
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

                {/* Récursion : sous-groupe = nouvel accordéon autonome */}
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
/*  Montée sous <Suspense> pour ne pas bloquer le prérendu.            */
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
      aria-label="Navigation principale"
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
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
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

              {/* Sous-menu en accordéon (au lieu d'un rendu inconditionnel) */}
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
/*  Fallback du DrawerNav (prérendu, sans usePathname)                 */
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
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
          {/* ===================== ZONE GAUCHE ===================== */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
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

            <div className="flex min-w-0 shrink-0 items-center">
              <Logo />
            </div>
          </div>

          {/* ===================== ZONE DROITE ===================== */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {notificationSlot}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ===================== DRAWER GAUCHE ==================== */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" id="main-drawer">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Miam-miam Listo · MVP</SheetDescription>
          </SheetHeader>

          <Suspense fallback={<DrawerNavFallback />}>
            <DrawerNav platformRole={platformRole} onNavigate={closeDrawer} />
          </Suspense>

          <SheetFooter>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Miam-miam Listo · MVP
              <br />
              Les mentions légales sont disponibles dans le pied de page.
            </p>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}