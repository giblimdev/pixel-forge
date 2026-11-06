/*
path :           components/layout/header/CommandKButton.tsx
tag :            ["layout", "header", "command-k", "search", "placeholder", "ui", "generic"]
projectId:       miam-miam-listo
type:            component
generic:         true

role:            Bouton "⌘K" (raccourci recherche) affiché dans la zone
                 droite du header. Placeholder VISUEL uniquement : il
                 n'ouvre aucune palette de commande tant que la route
                 /search (ou /command) n'existe pas. Désactivé via
                 `disabled` + `title="Recherche (à venir)"`.
                 Icône Search + libellé "Rechercher" sur desktop large
                 (≥ xl), icône seule en dessous. Accessible : aria-label,
                 focus-visible ring, aria-disabled.

                 Pour l'activer plus tard : remplacer le <button> par
                 un <Link href="/search"> (ou un bouton qui ouvre un
                 <CommandDialog> shadcn) — la signature change, pas le
                 style.

flow:            Server Component pur (aucun state). Rend un <button>
                 disabled avec icône Search + libellé responsive
                 (caché < xl). Le style suit les tokens du design system
                 (chart-1 pour le focus, muted pour le repos).

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

imports:         ["lucide-react", "@/components/ui/button"]

exports:         ["CommandKButton"]

useBy:           ["@/components/layout/header/HeaderActions.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un raccourci visuel vers la recherche"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CommandKButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled
      title="Recherche (à venir)"
      aria-label="Recherche — bientôt disponible"
      className="hidden h-8 gap-2 rounded-lg border-border/60 bg-muted/30 px-2.5 text-muted-foreground/70 md:flex"
    >
      <Search className="size-3.5" aria-hidden />
      <span className="hidden text-xs font-medium xl:inline">Rechercher</span>
      <kbd className="hidden rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80 xl:inline">
        ⌘K
      </kbd>
    </Button>
  );
}