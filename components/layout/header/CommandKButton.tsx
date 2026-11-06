/*
path :           components/layout/header/CommandKButton.tsx
tag :            ["layout", "header", "search", "command-k", "ui", "generic", "wide", "pixel-forge-charte"]
projectId:       new-genesis
type:            component
generic:         true

role:            Barre de recherche du header, désormais FONCTIONNELLE.
                 Rendue comme un <button> cliquable qui ouvre la palette
                 <SearchDialog /> via le callback `onOpen` fourni par
                 HeaderActions. La barre ENTIÈRE est cliquable (UX
                 standard : GitHub, Linear, Notion).

                 Charte PixelForge :
                 - Fond : --pf-surface-hover
                 - Bordure : --pf-border
                 - Icône : --pf-muted → --pf-primary au hover
                 - Focus : ring --pf-primary/40
                 - kbd : fond --pf-background/60, bordure --pf-border,
                   police JetBrains Mono

                 ⚠️ CHANGEMENT : n'est plus `disabled`. Le prop `onOpen`
                 est requis. aria-keyshortcuts expose ⌘K/Ctrl+K aux
                 lecteurs d'écran.

flow:            Server Component (aucun state). Rend un <button
                 type="button" onClick={onOpen}> avec icône Search +
                 texte placeholder + kbd ⌘K.

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

relatedFiles:    ["@/components/layout/header/HeaderActions.tsx",
                  "@/components/layout/header/search/SearchDialog.tsx"]

imports:         ["lucide-react"]

exports:         ["CommandKButton", "CommandKButtonProps"]

useBy:           ["@/components/layout/header/HeaderActions.tsx"]

userStories:     ["*en tant qu'utilisateur je veux ouvrir la recherche depuis le header"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Search } from "lucide-react";

export interface CommandKButtonProps {
  readonly onOpen: () => void;
}

export function CommandKButton({ onOpen }: CommandKButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Rechercher (⌘K)"
      aria-label="Ouvrir la recherche"
      aria-keyshortcuts="Meta+K Control+K"
      className="group/search flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-[var(--pf-border)] bg-[var(--pf-surface-hover)] px-3 text-left text-sm text-[var(--pf-muted)] transition-colors hover:border-[var(--pf-primary)]/40 hover:bg-[var(--pf-surface)] focus-visible:border-[var(--pf-primary)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]/40 md:min-w-[220px] lg:min-w-[260px] xl:min-w-[320px] xl:max-w-md"
    >
      <Search
        className="size-4 shrink-0 text-[var(--pf-muted)] transition-colors group-hover/search:text-[var(--pf-primary)]"
        aria-hidden
      />
      <span className="flex-1 truncate text-left text-sm font-normal">
        Rechercher…
      </span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-[var(--pf-border)] bg-[var(--pf-background)]/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--pf-muted)]/80 xl:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}