/*
path :           components/layout/header/NavActiveLink.tsx
projectId:       new-genesis
type:            component
generic:         true

role:            Lien de navigation qui lit usePathname() pour calculer
                 son état actif. Isolé dans une FEUILLE pour que
                 usePathname() ne soit pas évalué au niveau de MainNav
                 (qui reste prérendu). Le parent DOIT l'envelopper dans
                 <Suspense fallback={...}> — sinon Cache Components
                 bloque le prérendu sur les routes dynamiques
                 (/core/[flow]/*, /blog/[slug], etc.).

                 Réutilisable desktop (MainNav) et autres navigations.
                 Gère : href interne, href externe (target _blank +
                 rel), aria-current, classes active/inactive fournies
                 par le parent. Accepte un children ReactNode pour
                 permettre badge / icône / description.

flow:            usePathname() → isHrefActive(pathname, href) →
                 className = active ? classNameActive : classNameInactive
                 → rend <Link> avec aria-current si actif + children.

ecosystem:       Layout = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/components/layout/footer/Footer.tsx",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/NavActiveLink.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                 ]

relatedFiles:    ["@/utils/path.ts",
                  "@/components/layout/header/MainNav.tsx"]

imports:         ["react", "next/link", "next/navigation",
                  "@/utils/path"]

exports:         ["NavActiveLink", "NavActiveLinkProps"]

useBy:           ["@/components/layout/header/MainNav.tsx"]

userStories:     ["*en tant que développeur je veux un lien de navigation qui connaît son état actif"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : usePathname pour détecter l'état actif.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isHrefActive } from "@/utils/path";

export interface NavActiveLinkProps {
  /** URL cible. */
  readonly href: string;
  /** Ouvrir dans un nouvel onglet (ajoute target + rel). */
  readonly external?: boolean;
  /** Classes appliquées quand le lien est actif. */
  readonly classNameActive: string;
  /** Classes appliquées quand le lien est inactif. */
  readonly classNameInactive: string;
  /** Contenu du lien (label, icône, description…). */
  readonly children: React.ReactNode;
  /** Attribut role optionnel (menuitem pour les sous-menus). */
  readonly role?: string;
}

export function NavActiveLink({
  href,
  external = false,
  classNameActive,
  classNameInactive,
  children,
  role,
}: NavActiveLinkProps) {
  const pathname = usePathname();
  const active = isHrefActive(pathname, href);

  return (
    <Link
      href={href}
      role={role}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={active ? classNameActive : classNameInactive}
    >
      {children}
    </Link>
  );
}