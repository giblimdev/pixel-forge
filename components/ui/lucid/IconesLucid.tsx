/*
path :           components/ui/lucid/IconesLucid.tsx
tag :            ["ui", "lucide", "icons", "gallery", "catalog", "client", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Galerie interactive des icônes Lucide, classée par catégorie
                 (Navigation, Actions, Communication, Média, Fichiers,
                 Statut, Utilisateurs, Sécurité, Divers). Chaque icône est
                 rendue dans une tuile cliquable ; au clic, le nom
                 PASCALCASE (import-ready : "MessageSquare", "Trash2", …)
                 est copié dans le presse-papier et un toast confirme.
                 La tuile affiche le nom KEBAB-CASE canonique ("message-
                 square"), la forme montrée sur lucide.dev, pour permettre
                 la recherche. Une barre de recherche filtre en direct sur
                 le nom + le label de catégorie.

                 Le catalogue est CURÉ (~74 icônes utiles au projet) et non
                 l'exhaustif (1500+ icônes Lucide), pour éviter un bundle
                 monstrueux. Il est exposé sous LUCIDE_DEFAULT_CATALOG et
                 peut être remplacé via la prop `catalog`. Le composant ne
                 référence AUCUNE icône de marque (Github, X, LinkedIn…) :
                 lucide-react >= 1.x ne les exporte plus (cf. Footer.tsx).

                 Composant CLIENT (state recherche + clipboard + toast).
                 Réutilisable hors Genesis : il ne dépend ni du layout ni
                 de la nav du module.

flow:            useState(query) + useState(lastCopied) →
                 useMemo(filteredCatalog) filtre chaque catégorie sur
                 name.includes(query) OU label de catégorie match →
                 rend une barre de recherche, puis pour chaque catégorie
                 non vide : titre + grille 4/6/8/10 cols → chaque tuile =
                 <button> avec <Icon /> + name kebab → onClick →
                 toPascalCase(name) → navigator.clipboard.writeText →
                 toast.success → setLastCopied (reset 1,5 s). État vide
                 si la query ne matche rien.

ecosystem:       Lucide = [
                   "@/components/ui/lucid/IconesLucid.tsx",
                 ]

relatedFiles:    ["@/lib/utils.ts",
                  "@/components/ui/sonner.tsx",
                  "@/app/genesis/cmd/page.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/lib/utils"]

exports:         ["IconesLucid", "IconesLucidProps",
                  "LucideIconEntry", "LucideIconCategory",
                  "LUCIDE_DEFAULT_CATALOG"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux trouver et copier le nom d'une icône Lucide"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (query, lastCopied) + navigator.clipboard + toast.

import { useMemo, useState } from "react";
import {
  // Navigation
  Home,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  // Actions
  Plus,
  Minus,
  Check,
  Pencil,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  Search,
  // Communication
  Mail,
  MessageSquare,
  Send,
  Bell,
  Inbox,
  Reply,
  Phone,
  // Média
  Image as ImageIcon,
  Film,
  Music,
  Video,
  Play,
  Pause,
  // Fichiers
  File as FileIcon,
  FileText,
  Folder,
  FolderOpen,
  Paperclip,
  // Statut
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Clock,
  // Utilisateurs
  User,
  Users,
  UserCircle2,
  UserCheck,
  UserX,
  UserPlus,
  // Sécurité
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Key,
  // Divers
  Settings,
  Eye,
  EyeOff,
  Heart,
  Star,
  Bookmark,
  Sparkles,
  Zap,
  Palette,
  Type,
  Terminal,
  Layers,
  Database,
  Calendar,
  Tag,
  Hash,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LucideIconEntry {
  /** Nom kebab-case canonique (forme utilisée sur lucide.dev). */
  readonly name: string;
  readonly icon: LucideIcon;
}

export interface LucideIconCategory {
  readonly id: string;
  readonly label: string;
  readonly icons: readonly LucideIconEntry[];
}

export interface IconesLucidProps {
  /** Titre de la section (défaut : "Icônes Lucide"). */
  readonly title?: string;
  /** Description optionnelle sous le titre. */
  readonly description?: string;
  /** Catalogue à utiliser. Défaut : LUCIDE_DEFAULT_CATALOG. */
  readonly catalog?: readonly LucideIconCategory[];
  /** Classes additionnelles sur le <section>. */
  readonly className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Convertit un nom kebab-case en PascalCase.
 * Ex. "message-square" → "MessageSquare", "trash-2" → "Trash2".
 * Utilisé pour copier le nom « import-ready » (celui qu'on écrit après
 * `import { … } from "lucide-react"`).
 */
function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((part) =>
      part.length === 0
        ? ""
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

/* ------------------------------------------------------------------ */
/*  Catalogue par défaut (curé)                                       */
/* ------------------------------------------------------------------ */

export const LUCIDE_DEFAULT_CATALOG: readonly LucideIconCategory[] = [
  {
    id: "navigation",
    label: "Navigation",
    icons: [
      { name: "home", icon: Home },
      { name: "arrow-left", icon: ArrowLeft },
      { name: "arrow-right", icon: ArrowRight },
      { name: "arrow-up", icon: ArrowUp },
      { name: "arrow-down", icon: ArrowDown },
      { name: "chevron-left", icon: ChevronLeft },
      { name: "chevron-right", icon: ChevronRight },
      { name: "menu", icon: Menu },
      { name: "x", icon: X },
      { name: "external-link", icon: ExternalLink },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    icons: [
      { name: "plus", icon: Plus },
      { name: "minus", icon: Minus },
      { name: "check", icon: Check },
      { name: "pencil", icon: Pencil },
      { name: "trash-2", icon: Trash2 },
      { name: "copy", icon: Copy },
      { name: "save", icon: Save },
      { name: "download", icon: Download },
      { name: "upload", icon: Upload },
      { name: "refresh-cw", icon: RefreshCw },
      { name: "search", icon: Search },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icons: [
      { name: "mail", icon: Mail },
      { name: "message-square", icon: MessageSquare },
      { name: "send", icon: Send },
      { name: "bell", icon: Bell },
      { name: "inbox", icon: Inbox },
      { name: "reply", icon: Reply },
      { name: "phone", icon: Phone },
    ],
  },
  {
    id: "media",
    label: "Média",
    icons: [
      { name: "image", icon: ImageIcon },
      { name: "film", icon: Film },
      { name: "music", icon: Music },
      { name: "video", icon: Video },
      { name: "play", icon: Play },
      { name: "pause", icon: Pause },
    ],
  },
  {
    id: "files",
    label: "Fichiers",
    icons: [
      { name: "file", icon: FileIcon },
      { name: "file-text", icon: FileText },
      { name: "folder", icon: Folder },
      { name: "folder-open", icon: FolderOpen },
      { name: "paperclip", icon: Paperclip },
    ],
  },
  {
    id: "status",
    label: "Statut",
    icons: [
      { name: "check-circle-2", icon: CheckCircle2 },
      { name: "x-circle", icon: XCircle },
      { name: "alert-circle", icon: AlertCircle },
      { name: "alert-triangle", icon: AlertTriangle },
      { name: "info", icon: Info },
      { name: "loader-2", icon: Loader2 },
      { name: "clock", icon: Clock },
    ],
  },
  {
    id: "users",
    label: "Utilisateurs",
    icons: [
      { name: "user", icon: User },
      { name: "users", icon: Users },
      { name: "user-circle-2", icon: UserCircle2 },
      { name: "user-check", icon: UserCheck },
      { name: "user-x", icon: UserX },
      { name: "user-plus", icon: UserPlus },
    ],
  },
  {
    id: "security",
    label: "Sécurité",
    icons: [
      { name: "lock", icon: Lock },
      { name: "unlock", icon: Unlock },
      { name: "shield", icon: Shield },
      { name: "shield-check", icon: ShieldCheck },
      { name: "key", icon: Key },
    ],
  },
  {
    id: "misc",
    label: "Divers",
    icons: [
      { name: "settings", icon: Settings },
      { name: "eye", icon: Eye },
      { name: "eye-off", icon: EyeOff },
      { name: "heart", icon: Heart },
      { name: "star", icon: Star },
      { name: "bookmark", icon: Bookmark },
      { name: "sparkles", icon: Sparkles },
      { name: "zap", icon: Zap },
      { name: "palette", icon: Palette },
      { name: "type", icon: Type },
      { name: "terminal", icon: Terminal },
      { name: "layers", icon: Layers },
      { name: "database", icon: Database },
      { name: "calendar", icon: Calendar },
      { name: "tag", icon: Tag },
      { name: "hash", icon: Hash },
      { name: "globe", icon: Globe },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function IconesLucid({
  title = "Icônes Lucide",
  description,
  catalog = LUCIDE_DEFAULT_CATALOG,
  className,
}: IconesLucidProps) {
  const [query, setQuery] = useState("");
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCatalog = useMemo(() => {
    if (!normalizedQuery) return catalog;
    return catalog
      .map((category) => {
        const categoryMatches = category.label
          .toLowerCase()
          .includes(normalizedQuery);
        return {
          ...category,
          icons: categoryMatches
            ? category.icons
            : category.icons.filter((entry) =>
                entry.name.toLowerCase().includes(normalizedQuery),
              ),
        };
      })
      .filter((category) => category.icons.length > 0);
  }, [catalog, normalizedQuery]);

  const totalVisible = filteredCatalog.reduce(
    (sum, category) => sum + category.icons.length,
    0,
  );

  function handleCopy(name: string) {
    const pascal = toPascalCase(name);
    navigator.clipboard
      .writeText(pascal)
      .then(() => {
        setLastCopied(name);
        toast.success(`Copié : ${pascal}`);
        window.setTimeout(
          () => setLastCopied((current) => (current === name ? null : current)),
          1500,
        );
      })
      .catch(() => toast.error("Impossible de copier le nom de l'icône."));
  }

  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <header className="space-y-1">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      {/* Barre de recherche */}
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une icône (ex. arrow, user, mail)…"
          aria-label="Rechercher une icône Lucide"
          className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {totalVisible}
        </span>
      </div>

      {/* État vide */}
      {filteredCatalog.length === 0 && (
        <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Aucune icône ne correspond à « {query} ».
        </p>
      )}

      {/* Catégories */}
      {filteredCatalog.map((category) => (
        <div key={category.id} className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {category.label}{" "}
            <span className="text-muted-foreground/60">
              ({category.icons.length})
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {category.icons.map((entry) => {
              const Icon = entry.icon;
              const copied = lastCopied === entry.name;
              return (
                <button
                  key={entry.name}
                  type="button"
                  onClick={() => handleCopy(entry.name)}
                  aria-label={`Copier le nom de l'icône ${entry.name}`}
                  title={`${entry.name} → ${toPascalCase(entry.name)}`}
                  className={cn(
                    "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border border-border/60 bg-background p-1.5 transition-colors hover:border-chart-1/40 hover:bg-chart-1/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    copied && "border-chart-4/60 bg-chart-4/5",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      copied
                        ? "text-chart-4"
                        : "text-foreground group-hover:text-chart-1",
                    )}
                    aria-hidden
                  />
                  <span className="w-full truncate text-center font-mono text-[9px] leading-tight text-muted-foreground">
                    {copied ? "✓" : entry.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}