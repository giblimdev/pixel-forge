/*
path :           components/ui/fonts/FontsGenesis.tsx
tag :            ["ui", "fonts", "typography", "gallery", "catalog", "client", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Galerie interactive des polices, classées par 4 catégories
                 typographiques colorées :
                 - Sans-serif (chart-1) — 5 polices
                 - Serif      (chart-2) — 3 polices
                 - Mono       (chart-3) — 3 polices
                 - Display    (chart-5) — 2 polices
                 Chaque police est présentée dans une carte colorée par la
                 teinte de sa catégorie (bande top, icône dégradée, badge
                 de catégorie, zone d'aperçu teintée, boutons Copier). Un
                 champ « Texte d'aperçu » éditable en haut met à jour en
                 direct l'aperçu à 3 tailles (xs / sm / lg) de CHAQUE
                 carte. Chaque carte expose 3 lignes copiables :
                 - CSS variable  (ex. "--font-inter")
                 - Font-family   (ex. "'Inter', ui-sans-serif, …")
                 - Import Next.js(ex. 'import { Inter } from "next/font/google";')
                 Cliquer sur l'icône Copier d'une ligne écrit la valeur dans
                 le presse-papier et déclenche un toast. Un bandeau légende
                 affiche le compteur de chaque catégorie (utile pour voir
                 d'un coup d'œil la répartition).

                 Les polices supplémentaires (au-delà des 3 chargées par
                 app/layout.tsx : Inter, Fraunces, JetBrains Mono) sont
                 chargées via CDN Google Fonts avec un <link precedence>
                 hoisté par React 19. Le composant est ainsi autonome :
                 il peut prévisualiser n'importe quelle police sans
                 modifier le layout ni installer de dépendance. Composant
                 CLIENT (state sample, lastCopied, clipboard, toast),
                 réutilisable hors Genesis. Aucune icône de marque n'est
                 utilisée (lucide-react >= 1.x ne les exporte plus).

flow:            useState(sample, defaultSample) + useState(lastCopied) →
                 rend : <link preconnect + stylesheet CDN> + titre + légende
                 catégories + input « Texte d'aperçu » + grille de
                 <FontCard /> (1 col mobile / 2 cols sm / 3 cols xl).
                 FontCard → bande top colorée + header (icône + nom + badge
                 catégorie) + zone d'aperçu (3 tailles teintées) + 3
                 <CopyRow />. handleCopy(key, text) → navigator.clipboard
                 .writeText(text) → toast + setLastCopied(key) → reset 1,5 s.
                 Si sample vide : fallback sur font.sample (texte propre à
                 chaque police).

ecosystem:       Fonts = [
                   "@/components/ui/fonts/FontsGenesis.tsx",
                 ]

relatedFiles:    ["@/lib/utils.ts",
                  "@/components/ui/sonner.tsx",
                  "@/app/layout.tsx",
                  "@/app/genesis/cmd/page.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/lib/utils"]

exports:         ["FontsGenesis", "FontsGenesisProps",
                  "FontEntry", "FontKind",
                  "FONTS_GENESIS_DEFAULT_CATALOG",
                  "FONT_KINDS"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux prévisualiser les polices du projet et copier leurs variables CSS"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (sample, lastCopied) + navigator.clipboard + toast.

import { useState } from "react";
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Sparkles,
  Type,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type FontKind = "sans" | "serif" | "mono" | "display";

export interface FontEntry {
  /** Identifiant stable (clé React + clé de copy). */
  readonly id: string;
  /** Nom affiché (avec espace, ex. "JetBrains Mono"). */
  readonly label: string;
  /** Usage de la police (ex. "Texte courant (sans-serif)"). */
  readonly tagline: string;
  /** Catégorie typographique (pilote l'accent + l'icône + le badge). */
  readonly kind: FontKind;
  /** Couleur d'accent Tailwind (ex. "chart-1"). */
  readonly accent: string;
  /** Nom de la CSS variable globale (ex. "--font-inter"). */
  readonly cssVariable: string;
  /** Nom JS exporté par next/font/google (ex. "JetBrains_Mono"). */
  readonly importName: string;
  /** Ligne d'import Next.js copiable. */
  readonly nextImport: string;
  /** Font-family CSS complète avec fallbacks. */
  readonly fontFamily: string;
  /** Texte d'aperçu propre à la police (fallback si sample vide). */
  readonly sample: string;
}

export interface FontsGenesisProps {
  /** Titre de la section (défaut : "Polices"). */
  readonly title?: string;
  /** Description optionnelle sous le titre. */
  readonly description?: string;
  /** Catalogue à utiliser. Défaut : FONTS_GENESIS_DEFAULT_CATALOG. */
  readonly catalog?: readonly FontEntry[];
  /** Texte d'aperçu initial (défaut : pangramme + chiffres). */
  readonly defaultSample?: string;
  /** Classes additionnelles sur le <section>. */
  readonly className?: string;
}

/* ------------------------------------------------------------------ */
/*  Config des catégories (icône + accent par kind)                   */
/* ------------------------------------------------------------------ */

interface KindConfig {
  readonly kind: FontKind;
  readonly label: string;
  readonly accent: string;
  readonly icon: LucideIcon;
}

export const FONT_KINDS: readonly KindConfig[] = [
  { kind: "sans", label: "Sans-serif", accent: "chart-1", icon: Type },
  { kind: "serif", label: "Serif", accent: "chart-2", icon: BookOpen },
  { kind: "mono", label: "Mono", accent: "chart-3", icon: Code2 },
  { kind: "display", label: "Display", accent: "chart-5", icon: Sparkles },
];

function kindConfig(kind: FontKind): KindConfig {
  return FONT_KINDS.find((entry) => entry.kind === kind)!;
}

/* ------------------------------------------------------------------ */
/*  CDN Google Fonts — chargement des polices supplémentaires         */
/* ------------------------------------------------------------------ */

const CDN_FAMILIES = [
  "Inter:wght@400;700",
  "DM+Sans:wght@400;700",
  "Manrope:wght@400;700",
  "Space+Grotesk:wght@400;700",
  "Outfit:wght@400;700",
  "Fraunces:wght@400;700",
  "Playfair+Display:wght@400;700",
  "Lora:wght@400;700",
  "JetBrains+Mono:wght@400;700",
  "Fira+Code:wght@400;700",
  "IBM+Plex+Mono:wght@400;700",
  "Bricolage+Grotesque:wght@400;700",
  "Anton",
] as const;

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  CDN_FAMILIES.map((family) => `family=${family}`).join("&") +
  "&display=swap";

/* ------------------------------------------------------------------ */
/*  Catalogue par défaut (13 polices, 4 catégories)                   */
/* ------------------------------------------------------------------ */

export const FONTS_GENESIS_DEFAULT_CATALOG: readonly FontEntry[] = [
  /* ---------------- Sans-serif — chart-1 ---------------- */
  {
    id: "inter",
    label: "Inter",
    tagline: "Texte courant (sans-serif)",
    kind: "sans",
    accent: "chart-1",
    cssVariable: "--font-inter",
    importName: "Inter",
    nextImport: 'import { Inter } from "next/font/google";',
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    sample: "L'atelier qui structure vos projets.",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    tagline: "Sans-serif géométrique",
    kind: "sans",
    accent: "chart-1",
    cssVariable: "--font-dm-sans",
    importName: "DM_Sans",
    nextImport: 'import { DM_Sans } from "next/font/google";',
    fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    sample: "Concevoir et développer votre produit.",
  },
  {
    id: "manrope",
    label: "Manrope",
    tagline: "Sans-serif moderne",
    kind: "sans",
    accent: "chart-1",
    cssVariable: "--font-manrope",
    importName: "Manrope",
    nextImport: 'import { Manrope } from "next/font/google";',
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    sample: "De l'idée au produit.",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    tagline: "Sans-serif technique",
    kind: "sans",
    accent: "chart-1",
    cssVariable: "--font-space-grotesk",
    importName: "Space_Grotesk",
    nextImport: 'import { Space_Grotesk } from "next/font/google";',
    fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    sample: "Structurer l'information.",
  },
  {
    id: "outfit",
    label: "Outfit",
    tagline: "Sans-serif géométrique",
    kind: "sans",
    accent: "chart-1",
    cssVariable: "--font-outfit",
    importName: "Outfit",
    nextImport: 'import { Outfit } from "next/font/google";',
    fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
    sample: "Une seule application.",
  },

  /* ---------------- Serif — chart-2 ---------------- */
  {
    id: "fraunces",
    label: "Fraunces",
    tagline: "Serif display",
    kind: "serif",
    accent: "chart-2",
    cssVariable: "--font-fraunces",
    importName: "Fraunces",
    nextImport: 'import { Fraunces } from "next/font/google";',
    fontFamily: "'Fraunces', ui-serif, Georgia, serif",
    sample: "Genesis",
  },
  {
    id: "playfair-display",
    label: "Playfair Display",
    tagline: "Serif éditorial",
    kind: "serif",
    accent: "chart-2",
    cssVariable: "--font-playfair",
    importName: "Playfair_Display",
    nextImport: 'import { Playfair_Display } from "next/font/google";',
    fontFamily: "'Playfair Display', ui-serif, Georgia, serif",
    sample: "Articles & tutoriels",
  },
  {
    id: "lora",
    label: "Lora",
    tagline: "Serif lisible",
    kind: "serif",
    accent: "chart-2",
    cssVariable: "--font-lora",
    importName: "Lora",
    nextImport: 'import { Lora } from "next/font/google";',
    fontFamily: "'Lora', ui-serif, Georgia, serif",
    sample: "Retours d'expérience.",
  },

  /* ---------------- Mono — chart-3 ---------------- */
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    tagline: "Mono pour le code",
    kind: "mono",
    accent: "chart-3",
    cssVariable: "--font-jetbrains-mono",
    importName: "JetBrains_Mono",
    nextImport: 'import { JetBrains_Mono } from "next/font/google";',
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    sample: "const answer = 42;",
  },
  {
    id: "fira-code",
    label: "Fira Code",
    tagline: "Mono avec ligatures",
    kind: "mono",
    accent: "chart-3",
    cssVariable: "--font-fira-code",
    importName: "Fira_Code",
    nextImport: 'import { Fira_Code } from "next/font/google";',
    fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, monospace",
    sample: "function* id() { yield 1; }",
  },
  {
    id: "ibm-plex-mono",
    label: "IBM Plex Mono",
    tagline: "Mono humaniste",
    kind: "mono",
    accent: "chart-3",
    cssVariable: "--font-ibm-plex-mono",
    importName: "IBM_Plex_Mono",
    nextImport: 'import { IBM_Plex_Mono } from "next/font/google";',
    fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
    sample: "SELECT * FROM users;",
  },

  /* ---------------- Display — chart-5 ---------------- */
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    tagline: "Display contemporain",
    kind: "display",
    accent: "chart-5",
    cssVariable: "--font-bricolage",
    importName: "Bricolage_Grotesque",
    nextImport: 'import { Bricolage_Grotesque } from "next/font/google";',
    fontFamily: "'Bricolage Grotesque', ui-sans-serif, sans-serif",
    sample: "Atelier",
  },
  {
    id: "anton",
    label: "Anton",
    tagline: "Display compact",
    kind: "display",
    accent: "chart-5",
    cssVariable: "--font-anton",
    importName: "Anton",
    nextImport: 'import { Anton } from "next/font/google";',
    fontFamily: "'Anton', ui-sans-serif, sans-serif",
    sample: "GENESIS",
  },
];

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export function FontsGenesis({
  title = "Polices",
  description,
  catalog = FONTS_GENESIS_DEFAULT_CATALOG,
  defaultSample = "Portez ce vieux whisky au juge blond qui fume. 0123456789",
  className,
}: FontsGenesisProps) {
  const [sample, setSample] = useState(defaultSample);
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  function handleCopy(key: string, text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setLastCopied(key);
        toast.success(
          text.length > 48 ? `Copié : ${text.slice(0, 48)}…` : `Copié : ${text}`,
        );
        window.setTimeout(
          () =>
            setLastCopied((current) => (current === key ? null : current)),
          1500,
        );
      })
      .catch(() => toast.error("Impossible de copier."));
  }

  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      {/* Chargement CDN des polices supplémentaires (React 19 : hoisté) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} precedence="default" />

      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <Type className="size-4 text-chart-2" aria-hidden />
          {title}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({catalog.length})
          </span>
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      {/* Légende par catégorie */}
      <div className="flex flex-wrap gap-2">
        {FONT_KINDS.map((config) => {
          const count = catalog.filter(
            (font) => font.kind === config.kind,
          ).length;
          return (
            <span
              key={config.kind}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/10 px-2.5 py-0.5 text-[11px]"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: `var(--${config.accent})` }}
              />
              <span className="font-medium text-foreground">
                {config.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                ({count})
              </span>
            </span>
          );
        })}
      </div>

      {/* Échantillon éditable */}
      <div className="space-y-1.5">
        <label
          htmlFor="font-sample"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Texte d&apos;aperçu
        </label>
        <input
          id="font-sample"
          type="text"
          value={sample}
          onChange={(event) => setSample(event.target.value)}
          placeholder="Tapez un texte pour prévisualiser…"
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/10 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {catalog.map((font) => (
          <FontCard
            key={font.id}
            font={font}
            sample={sample || font.sample}
            lastCopied={lastCopied}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Carte d'une police — colorée par catégorie                        */
/* ------------------------------------------------------------------ */

function FontCard({
  font,
  sample,
  lastCopied,
  onCopy,
}: {
  readonly font: FontEntry;
  readonly sample: string;
  readonly lastCopied: string | null;
  readonly onCopy: (key: string, text: string) => void;
}) {
  const config = kindConfig(font.kind);
  const Icon = config.icon;
  const accent = config.accent;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      {/* Bande colorée en haut */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      {/* Header : icône + nom + badge catégorie */}
      <header className="flex items-start gap-3 p-4 pb-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-lg text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="truncate text-sm font-bold text-foreground">
              {font.label}
            </h3>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `color-mix(in oklab, var(--${accent}) 15%, transparent)`,
                color: `var(--${accent})`,
              }}
            >
              {config.label}
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {font.tagline}
          </p>
        </div>
      </header>

      {/* Zone d'aperçu teintée — 3 tailles */}
      <div
        className="mx-4 mb-3 overflow-hidden rounded-lg border p-3"
        style={{
          background: `color-mix(in oklab, var(--${accent}) 5%, transparent)`,
          borderColor: `color-mix(in oklab, var(--${accent}) 20%, transparent)`,
        }}
      >
        <p
          className="truncate text-xs leading-snug text-muted-foreground"
          style={{ fontFamily: font.fontFamily }}
          title={sample}
        >
          {sample}
        </p>
        <p
          className="truncate text-sm text-foreground/90"
          style={{ fontFamily: font.fontFamily }}
          title={sample}
        >
          {sample}
        </p>
        <p
          className="truncate text-lg font-semibold leading-tight text-foreground"
          style={{ fontFamily: font.fontFamily }}
          title={sample}
        >
          {sample}
        </p>
      </div>

      {/* Lignes copiables */}
      <div className="space-y-1 px-4 pb-4">
        <CopyRow
          label="CSS var"
          value={font.cssVariable}
          copied={lastCopied === `var:${font.id}`}
          accent={accent}
          onCopy={() => onCopy(`var:${font.id}`, font.cssVariable)}
        />
        <CopyRow
          label="Family"
          value={font.fontFamily}
          copied={lastCopied === `family:${font.id}`}
          accent={accent}
          onCopy={() => onCopy(`family:${font.id}`, font.fontFamily)}
        />
        <CopyRow
          label="Import"
          value={font.nextImport}
          copied={lastCopied === `import:${font.id}`}
          accent={accent}
          onCopy={() => onCopy(`import:${font.id}`, font.nextImport)}
        />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne copiable                                                     */
/* ------------------------------------------------------------------ */

function CopyRow({
  label,
  value,
  copied,
  accent,
  onCopy,
}: {
  readonly label: string;
  readonly value: string;
  readonly copied: boolean;
  readonly accent: string;
  readonly onCopy: () => void;
}) {
  return (
    <div className="group/copy flex items-center gap-2 rounded-md bg-background/40 px-2 py-1 transition-colors hover:bg-background/70">
      <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <code
        className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/90"
        title={value}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copier ${label}`}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          copied && "text-chart-4",
        )}
        style={
          copied ? undefined : { ["--hover-accent" as string]: `var(--${accent})` }
        }
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy
            className="size-3.5 transition-colors group-hover/copy:text-[color:var(--hover-accent)]"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}