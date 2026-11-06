/*
path :           components/layout/header/search/SearchDialog.tsx
tag :            ["search", "command", "dialog", "cmdk", "client", "palette", "pixel-forge-charte", "wahoo"]
projectId:       new-genesis
type:            component
generic:         true

role:            Palette de commande (CommandDialog cmdk/shadcn) qui
                 rend la recherche du header fonctionnelle.

                 UX :
                 - S'ouvre via ⌘K / Ctrl+K (global), via "/" (si le
                   focus n'est pas dans un input/textarea/contenteditable),
                   ou via le clic sur <CommandKButton />.
                 - Recherche floue (cmdk natif via shouldFilter=true).
                 - Groupes : "Navigation" | "Actions" | "Récents".
                 - Récents : 5 derniers items ouverts, stockés en
                   localStorage[`pf.search.recent.v1`], réaffichés
                   en haut de la palette au prochain open.
                 - Navigation clavier : ↑ ↓ (cmdk), Entrée (sélection),
                   Échap (fermeture).
                 - Mobile : CommandDialog centré (top-1/3 par défaut
                   shadcn), UX correcte jusqu'à 360px.

                 ⚠️ RÔLE : ce composant ne dépend d'AUCUNE autre couche.
                 Il reçoit `platformRole` (pour construire les items
                 filtrés) et `open` / `onOpenChange` (contrôlé par le
                 parent HeaderActions pour éviter les doublons
                 d'instance).

                 ⚠️ ACTIONS : pour l'instant, seule "signOut" est
                 traitée. Les autres actions (href) passent par
                 router.push. Si demain on ajoute des actions DB
                 (ex. "Créer un projet"), il suffit d'étendre l'union
                 SearchItem.action et d'ajouter son handler ici.

                 ⚠️ CHARTE PIXELFORGE : tokens pf-*, font-mono pour les
                 raccourcis, glassmorphism léger sur l'input, glow
                 violet sur l'item actif.

flow:            Client Component → props open/onOpenChange/platformRole
                 → useEffect (raccourcis clavier globaux) → useMemo
                 (buildSearchItems + tri récents en tête) → rend
                 <CommandDialog> avec <CommandInput>, <CommandList>,
                 <CommandGroup> (Récents, Navigation, Actions),
                 <CommandItem> par item → sélection → router.push(href)
                 OU action(signOut) + toast → setOpen(false).

ecosystem:       Search = [
                   "@/components/layout/header/search/search-items.ts",
                   "@/components/layout/header/search/SearchDialog.tsx",
                   "@/components/layout/header/CommandKButton.tsx",
                   "@/components/layout/header/HeaderActions.tsx",
                 ]

relatedFiles:    ["@/components/layout/header/search/search-items.ts",
                  "@/components/layout/header/HeaderActions.tsx",
                  "@/components/ui/command.tsx",
                  "@/lib/auth/auth-client.ts",
                  "@/config/roles.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/components/layout/header/search/search-items",
                  "@/components/ui/command",
                  "@/lib/auth/auth-client",
                  "@/config/roles"]

exports:         ["SearchDialog", "SearchDialogProps"]

useBy:           ["@/components/layout/header/HeaderActions.tsx"]

userStories:     ["*en tant qu'utilisateur je veux rechercher une page ou une action",
                  "*en tant qu'utilisateur je veux voir mes dernières recherches"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState (récents), useEffect (clavier), useRouter, toast.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Search as SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  buildSearchItems,
  type SearchItem,
} from "@/components/layout/header/search/search-items";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { signOut } from "@/lib/auth/auth-client";
import type { PlatformRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface SearchDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly platformRole: PlatformRole | null;
}

/* ------------------------------------------------------------------ */
/*  Récents — localStorage                                             */
/* ------------------------------------------------------------------ */

const RECENT_KEY = "pf.search.recent.v1";
const RECENT_LIMIT = 5;

function readRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function pushRecentId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = readRecentIds().filter((v) => v !== id);
    const next = [id, ...current].slice(0, RECENT_LIMIT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Silencieux : le localStorage peut être bloqué (Safari privé…).
  }
}

/* ------------------------------------------------------------------ */
/*  Icônes par groupe                                                  */
/* ------------------------------------------------------------------ */

const GROUP_ICONS: Record<string, LucideIcon> = {
  Récents: Clock,
  Navigation: ArrowRight,
  Actions: SearchIcon,
};

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function SearchDialog({
  open,
  onOpenChange,
  platformRole,
}: SearchDialogProps) {
  const router = useRouter();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  /* ---- Source de vérité : items filtrés par rôle ---- */
  const allItems = useMemo(
    () => buildSearchItems(platformRole),
    [platformRole],
  );

  /* ---- Résolution des items récents en tête ---- */
  const recentItems = useMemo(() => {
    if (recentIds.length === 0) return [];
    const byId = new Map(allItems.map((item) => [item.id, item]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((item): item is SearchItem => item !== undefined);
  }, [recentIds, allItems]);

  /* ---- Groupes restants ---- */
  const navigationItems = useMemo(
    () => allItems.filter((item) => item.group === "Navigation"),
    [allItems],
  );
  const actionItems = useMemo(
    () => allItems.filter((item) => item.group === "Actions"),
    [allItems],
  );

  /* ---- Chargement des récents à l'ouverture ---- */
  useEffect(() => {
    if (open) {
      setRecentIds(readRecentIds());
    }
  }, [open]);

  /* ---- Raccourcis clavier globaux ---- */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      /* ⌘K / Ctrl+K → toggle */
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
        return;
      }

      /* "/" → ouvrir, sauf si focus dans un champ de saisie */
      if (event.key === "/" && !open) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase() ?? "";
        const isEditable =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          target?.isContentEditable === true;

        if (!isEditable) {
          event.preventDefault();
          onOpenChange(true);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  /* ---- Sélection d'un item ---- */
  const handleSelect = useCallback(
    async (item: SearchItem) => {
      pushRecentId(item.id);
      setRecentIds(readRecentIds());
      onOpenChange(false);

      if (item.action === "signOut") {
        try {
          await signOut();
          toast.success("À bientôt !");
          router.replace("/auth/login");
          router.refresh();
        } catch {
          toast.error("Impossible de se déconnecter. Réessayez.");
        }
        return;
      }

      if (item.href) {
        router.push(item.href);
        router.refresh();
      }
    },
    [onOpenChange, router],
  );

  /* ---- Rendu ---- */
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rechercher"
      description="Rechercher une page ou une action"
      className="border-[var(--pf-border)] bg-[var(--pf-surface)]/95 backdrop-blur-xl"
    >
      <CommandInput
        placeholder="Rechercher une page, une action…"
        className="text-[var(--pf-foreground)]"
      />

      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm text-[var(--pf-muted)]">
          Aucun résultat.
        </CommandEmpty>

        {/* ---- Récents ---- */}
        {recentItems.length > 0 && (
          <>
            <CommandGroup heading="Récents">
              {recentItems.map((item) => (
                <CommandItem
                  key={`recent-${item.id}`}
                  value={`recent-${item.label} ${item.hint ?? ""}`}
                  onSelect={() => void handleSelect(item)}
                  className="cursor-pointer data-[selected=true]:bg-[var(--pf-primary)]/15 data-[selected=true]:text-[var(--pf-primary)]"
                >
                  <Clock className="mr-2 size-4 text-[var(--pf-muted)]" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="ml-2 truncate font-mono text-[10px] text-[var(--pf-muted)]">
                      {item.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* ---- Navigation ---- */}
        {navigationItems.length > 0 && (
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.hint ?? ""}`}
                  onSelect={() => void handleSelect(item)}
                  className="cursor-pointer data-[selected=true]:bg-[var(--pf-primary)]/15 data-[selected=true]:text-[var(--pf-primary)]"
                >
                  <Icon className="mr-2 size-4 text-[var(--pf-muted)]" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="ml-2 truncate font-mono text-[10px] text-[var(--pf-muted)]">
                      {item.hint}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {actionItems.length > 0 && navigationItems.length > 0 && (
          <CommandSeparator />
        )}

        {/* ---- Actions ---- */}
        {actionItems.length > 0 && (
          <CommandGroup heading="Actions">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.hint ?? ""}`}
                  onSelect={() => void handleSelect(item)}
                  className="cursor-pointer data-[selected=true]:bg-[var(--pf-primary)]/15 data-[selected=true]:text-[var(--pf-primary)]"
                >
                  <Icon className="mr-2 size-4 text-[var(--pf-muted)]" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <CommandShortcut className="text-[10px] text-[var(--pf-muted)]">
                      {item.hint}
                    </CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      {/* Footer : rappel des raccourcis */}
      <div className="flex items-center justify-between border-t border-[var(--pf-border)] px-3 py-2 text-[10px] text-[var(--pf-muted)]">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-[var(--pf-border)] bg-[var(--pf-background)]/60 px-1.5 py-0.5 font-mono">
            ↑↓
          </kbd>
          naviguer
          <kbd className="ml-2 rounded border border-[var(--pf-border)] bg-[var(--pf-background)]/60 px-1.5 py-0.5 font-mono">
            ↵
          </kbd>
          sélectionner
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-[var(--pf-border)] bg-[var(--pf-background)]/60 px-1.5 py-0.5 font-mono">
            esc
          </kbd>
          fermer
        </span>
      </div>
    </CommandDialog>
  );
}