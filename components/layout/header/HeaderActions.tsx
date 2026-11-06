/*
path :           components/layout/header/HeaderActions.tsx
tag :            ["layout", "header", "actions", "search", "ui", "composition", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Zone droite du header (recherche + actions utilisateur).
                 Compose dans l'ordre :
                 1. <CommandKButton /> (barre de recherche large, ≥ md)
                 2. séparateur vertical subtil (≥ md)
                 3. `notificationSlot` (Server Component async, monté
                    sous Suspense par app/layout.tsx)
                 4. <UserMenu /> (avatar + dropdown, client)

                 ⚠️ ÉVOLUTION : la recherche est maintenant une VRAIE
                 zone large (min 200px → 320px) et n'est plus réduite
                 à un bouton étroit. Elle est placée AVANT le séparateur
                 et prend l'espace disponible (`flex-1`).

                 Composition pure : aucun state, aucun fetch.

flow:            Reçoit `notificationSlot?` → rend <div flex items-center
                 gap-2> → CommandKButton + séparateur + {notificationSlot}
                 + UserMenu.

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

userStories:     ["*en tant qu'utilisateur je veux une barre de recherche et mes actions"]

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
    <div className="flex flex-1 shrink-0 items-center gap-2 md:flex-initial">
      <div className="hidden min-w-0 flex-1 md:flex xl:max-w-md">
        <CommandKButton />
      </div>

      <span
        aria-hidden
        className="hidden h-6 w-px bg-border/60 md:block"
      />

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {notificationSlot}
        <UserMenu />
      </div>
    </div>
  );
}