/*
path :           components/layout/header/CommandKButton.tsx
tag :            ["layout", "header", "search", "command-k", "ui", "generic", "wide"]
projectId:       new-genesis
type:            component
generic:         true

role:            Barre de recherche placeholder "Pixel-Forge". Large et
                 visible (≠ ancien bouton étroit). Rendue comme un
                 <button> (placeholder visuel, prêt à devenir <Link>
                 ou à ouvrir un <CommandDialog>) avec :
                 - Icône Search à gauche
                 - Texte placeholder "Rechercher…" sur ≥ md
                 - Raccourci ⌘K à droite sur ≥ xl
                 - Largeur : min-w-[200px] sur md, min-w-[280px] et
                   flex-grow sur xl (prend l'espace disponible)
                 - Couleur : bg-muted/40, bordure border-border/60,
                   hover bg-muted/60 + focus ring-chart-1/40
                 Désactivée (disabled) tant que /search n'existe pas,
                 avec title="Recherche (à venir)". aria-label présent
                 pour l'accessibilité.

                 ⚠️ Ce composant remplace l'ancien bouton ⌘K étroit.
                 Son rôle est d'occuper une vraie zone de recherche
                 dans le header, pas d'être un simple raccourci discret.

flow:            Server Component pur. Rend un <button> disabled
                 avec icône + texte placeholder + kbd ⌘K.

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

relatedFiles:    ["@/components/layout/header/HeaderActions.tsx",
                  "@/components/layout/header/Header.tsx"]

imports:         ["lucide-react"]

exports:         ["CommandKButton"]

useBy:           ["@/components/layout/header/HeaderActions.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une barre de recherche visible dans le header"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Search } from "lucide-react";

export function CommandKButton() {
  return (
    <button
      type="button"
      disabled
      title="Recherche (à venir)"
      aria-label="Recherche — bientôt disponible"
      className="group/search flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:border-chart-1/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1/40 disabled:cursor-not-allowed disabled:opacity-70 md:min-w-[220px] lg:min-w-[260px] xl:min-w-[320px] xl:max-w-md"
    >
      <Search
        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/search:text-chart-1"
        aria-hidden
      />
      <span className="flex-1 truncate text-left text-sm font-normal">
        Rechercher…
      </span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80 xl:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}