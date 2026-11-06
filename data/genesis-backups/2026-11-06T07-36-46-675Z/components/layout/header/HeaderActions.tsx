/*
path :           components/layout/header/HeaderActions.tsx
tag :            ["layout", "header", "actions", "ui", "composition", "generic"]
projectId:       miam-miam-listo
type:            component
generic:         true

role:            Zone droite du header (actions utilisateur). Compose :
                 - <CommandKButton /> (placeholder recherche, ≥ md)
                 - séparateur vertical subtil (≥ md)
                 - `notificationSlot` (Server Component async passé par
                   app/layout.tsx, monté sous Suspense côté parent)
                 - <UserMenu /> (avatar + dropdown, client, déjà existant)
                 Extraite de Header.tsx pour alléger le composant principal
                 (règle "scripts ≤ 900 lignes") et permettre la réutilisation
                 (ex. dans une future Sidebar topbar).

                 Aucun state, aucun fetch : pure composition.
                 Les espacements sont mobile-first : gap-1.5 sous md,
                 gap-2 à partir de md.

flow:            Reçoit `notificationSlot?: React.ReactNode` →
                 rend <div className="flex items-center gap-1.5 sm:gap-2">
                 → CommandKButton + separator + {notificationSlot} +
                 UserMenu. Le séparateur est masqué < md (mobile).

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

relatedFiles:    ["@/components/layout/header/Header.tsx",
                  "@/components/layout/header/CommandKButton.tsx",
                  "@/components/layout/header/UserMenu.tsx"]

imports:         ["@/components/layout/header/CommandKButton",
                  "@/components/layout/header/UserMenu"]

exports:         ["HeaderActions", "HeaderActionsProps"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant qu'utilisateur je veux accéder à mes actions (profil, notifications, recherche)"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { CommandKButton } from "@/components/layout/header/CommandKButton";
import UserMenu from "@/components/layout/header/UserMenu";

export interface HeaderActionsProps {
  readonly notificationSlot?: React.ReactNode;
}

export function HeaderActions({ notificationSlot }: HeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <CommandKButton />

      <span
        aria-hidden
        className="hidden h-6 w-px bg-border/60 md:block"
      />

      {notificationSlot}
      <UserMenu />
    </div>
  );
}