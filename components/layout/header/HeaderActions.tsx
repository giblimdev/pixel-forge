/*
path :           components/layout/header/HeaderActions.tsx
tag :            ["layout", "header", "actions", "search", "ui", "composition", "generic", "pixel-forge-charte"]
projectId:       new-genesis
type:            component
generic:         true

role:            Zone droite du header (recherche + actions utilisateur).
                 Compose : CommandKButton + séparateur + notificationSlot
                 + UserMenu. Monte UNE SEULE instance de <SearchDialog />
                 pour éviter les doublons si HeaderActions est réutilisé.

                 ⚠️ RECHERCHE FONCTIONNELLE : le composant porte le state
                 `searchOpen` (useState) qui pilote à la fois :
                 - l'ouverture via <CommandKButton onOpen={...} />
                 - l'ouverture via ⌘K / Ctrl+K / "/" (écouté DANS
                   SearchDialog, pas ici).
                 - la fermeture via SearchDialog onOpenChange.

                 ⚠️ `platformRole` propagé à SearchDialog pour filtrer
                 les items par rôle (canSee partagé).

                 Aucun autre changement de comportement.

flow:            Client Component → useState(searchOpen) → rend
                 <div flex> → CommandKButton(onOpen=setSearchOpen(true))
                 + séparateur + {notificationSlot} + UserMenu →
                 <SearchDialog open={searchOpen}
                  onOpenChange={setSearchOpen}
                  platformRole={platformRole} />.

ecosystem:       Layout = [
                   "@/components/layout/header/search/SearchDialog.tsx",
                   "@/components/layout/header/search/search-items.ts",
                   "@/components/layout/header/CommandKButton.tsx",
                   "@/components/layout/header/HeaderActions.tsx",
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

relatedFiles:    ["@/components/layout/header/Header.tsx",
                  "@/components/layout/header/CommandKButton.tsx",
                  "@/components/layout/header/search/SearchDialog.tsx",
                  "@/components/layout/header/UserMenu.tsx",
                  "@/config/roles.ts"]

imports:         ["react",
                  "@/components/layout/header/CommandKButton",
                  "@/components/layout/header/search/SearchDialog",
                  "@/components/layout/header/UserMenu",
                  "@/config/roles"]

exports:         ["HeaderActions", "HeaderActionsProps"]

useBy:           ["@/components/layout/header/Header.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une barre de recherche fonctionnelle et mes actions"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState (searchOpen).

import { useState } from "react";

import { CommandKButton } from "@/components/layout/header/CommandKButton";
import { SearchDialog } from "@/components/layout/header/search/SearchDialog";
import UserMenu from "@/components/layout/header/UserMenu";
import type { PlatformRole } from "@/config/roles";

export interface HeaderActionsProps {
  readonly notificationSlot?: React.ReactNode;
  readonly platformRole: PlatformRole | null;
}

export function HeaderActions({
  notificationSlot,
  platformRole,
}: HeaderActionsProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex flex-1 shrink-0 items-center gap-2 md:flex-initial">
        <div className="hidden min-w-0 flex-1 md:flex xl:max-w-md">
          <CommandKButton onOpen={() => setSearchOpen(true)} />
        </div>

        <span
          aria-hidden
          className="hidden h-6 w-px bg-[var(--pf-border)] md:block"
        />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {notificationSlot}
          <UserMenu />
        </div>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        platformRole={platformRole}
      />
    </>
  );
}