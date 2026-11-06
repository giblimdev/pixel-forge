/*
path :           app/page.tsx
tag :            ["pixel", "pixel-forge", "page", "hub", "landing", "roadmap-dev", "atlas", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'entrée de l'application métier "PixelForge"
                 (préfixe d'URL /pixel). Deux parties distinctes :

                 [PARTIE A — PRÉSENTATION MÉTIER, PROD]
                 Hero (badge, titre gradient, tagline, 2 CTA) →
                 4 cartes outils (WebP, Optimiser, ICO, PNG) →
                 section "Pour qui ?" (3 personas) → CTA final.
                 Server Component pur, aucune DB, aucune Server Action.
                 Les cartes outils pointent vers /pixel/tools/<slug>
                 (routes à créer) et affichent un badge "À venir".

                 [PARTIE B — FEUILLE DE ROUTE DEV, À SUPPRIMER EN PROD]
                 Section "Atelier de développement" listant les 33
                 fichiers à créer, groupés en 7 couches (Types,
                 Helpers, Actions, Composants, Pages, Infra, Tests).
                 Chaque fichier porte son path, rôle, épic/US, statut
                 et estimation. Marqueurs clairs pour suppression.

                 ⚠️ SUPPRESSION EN PROD (3 gestes) :
                 1. Retirer <DevRoadmap /> du rendu principal.
                 2. Supprimer la constante DEV_ROADMAP.
                 3. Supprimer DevFile, DevGroup, DevRoadmapFile,
                    DevRoadmapGroup, DevRoadmap + imports inutilisés
                    (Shield, Wrench, Workflow, Layers, FolderTree,
                    Terminal, ListChecks).

                 ⚠️ CHARTE PIXELFORGE :
                 - Tokens pf-* partout (var(--pf-primary), etc.).
                 - Bandes dégradées : pf-primary → pf-secondary → pf-info.
                 - Cartes : bg-[var(--pf-surface)], bordure pf-border.
                 - Valeurs techniques en JetBrains Mono (font-mono).
                 - Halos décoratifs violet/cyan dans le hero.
                 - Titre gradient : pf-primary → pf-primary-light → pf-secondary.

flow:            Server Component sync → wrapper min-h-svh dégradé
                 → Hero → 4 cartes outils → 3 personas → CTA final
                 → <DevRoadmap /> (partie B).
                 Aucun état, aucun effet, aucun fetch.

ecosystem:       Pixel = [
                   "@/app/pixel/page.tsx",
                 ]

relatedFiles:    ["@/components/ui/button.tsx",
                  "@/components/ui/card.tsx",
                  "@/app/page.tsx",
                  "@/app/scrum/help/page.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/card"]

exports:         ["default PixelPage", "metadata"]

useBy:           []

userStories:     ["*en tant que visiteur je veux découvrir PixelForge",
                  "*en tant que développeur je veux connaître les fichiers à créer pour PixelForge"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Palette,
  Scissors,
  Shield,
  Sparkles,
  Terminal,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "PixelForge",
  description:
    "Une suite professionnelle pour convertir, optimiser et transformer vos images — en local, gratuit, open-source.",
};

/* ------------------------------------------------------------------ */
/*  Types — Partie A                                                   */
/* ------------------------------------------------------------------ */

interface PixelTool {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

interface PixelPersona {
  readonly name: string;
  readonly kind: string;
  readonly need: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

/* ------------------------------------------------------------------ */
/*  Config — 4 outils                                                  */
/* ------------------------------------------------------------------ */

const TOOLS: readonly PixelTool[] = [
  {
    slug: "webp",
    href: "/pixel/tools/webp",
    title: "Conversion en WebP",
    tagline: "Rapide, léger, universel",
    description:
      "Convertir des images JPEG, PNG, GIF, AVIF, TIFF en WebP avec contrôle de la qualité, du mode (lossy / lossless / near-lossless) et des métadonnées.",
    icon: ImageIcon,
    accent: "var(--pf-primary)",
  },
  {
    slug: "optimize",
    href: "/pixel/tools/optimize",
    title: "Optimisation du poids",
    tagline: "Mesurable, pas une boîte noire",
    description:
      "Réduire le poids par compression intelligente et redimensionnement, avec seuil cible (ex. « ne pas dépasser 200 Ko ») et comparaison avant/après (poids, dimensions, SSIM).",
    icon: Gauge,
    accent: "var(--pf-secondary)",
  },
  {
    slug: "ico",
    href: "/pixel/tools/ico",
    title: "Génération .ico",
    tagline: "Favicons et icônes d'app",
    description:
      "Générer un fichier .ico multi-résolutions (16, 24, 32, 48, 64, 128, 256) à partir d'une image source, avec aperçu par résolution et validation de la transparence.",
    icon: ImageIcon,
    accent: "var(--pf-info)",
  },
  {
    slug: "png",
    href: "/pixel/tools/png",
    title: "PNG transparents",
    tagline: "Détourage propre, anti-aliasing",
    description:
      "Supprimer un fond uni (couleur pipette + tolérance réglable), lisser les contours, exporter un PNG avec canal alpha. Détection automatique des arrière-plans unis.",
    icon: Scissors,
    accent: "var(--pf-success)",
  },
];

/* ------------------------------------------------------------------ */
/*  Config — 3 personas                                                */
/* ------------------------------------------------------------------ */

const PERSONAS: readonly PixelPersona[] = [
  {
    name: "Développeur / Intégrateur",
    kind: "dev",
    need: "Outil local, scriptable et reproductible pour préparer des assets web (WebP, favicons) sans service en ligne. Apprécie les presets, le traitement par lot et l'intégration CI.",
    icon: Code2,
    accent: "var(--pf-primary)",
  },
  {
    name: "Designer",
    kind: "designer",
    need: "Contrôle qualité, comparaison avant/après, PNG transparents propres et jeux d'icônes cohérents. Attaché au rendu et à la fidélité des couleurs.",
    icon: Palette,
    accent: "var(--pf-secondary)",
  },
  {
    name: "Créateur de contenu",
    kind: "creator",
    need: "Optimiser des images pour un site, un blog ou une boutique sans comprendre la compression. Presets simples (Web/PNG/ICO), aperçu clair et téléchargement direct.",
    icon: Sparkles,
    accent: "var(--pf-info)",
  },
];

/* ------------------------------------------------------------------ */
/*  Types — Partie B                                                   */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

interface DevFile {
  readonly path: string;
  readonly role: string;
  readonly estimate: string;
  readonly status: "planned" | "wip" | "done";
  readonly epic: string;
  readonly us?: string;
}

interface DevGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly files: readonly DevFile[];
}

/* ------------------------------------------------------------------ */
/*  Config — feuille de route                                          */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const DEV_ROADMAP: readonly DevGroup[] = [
  {
    id: "types-validation",
    title: "Types & Validation",
    description:
      "Fondation : les types partagés et les schémas Zod. Aucune dépendance runtime hors zod.",
    icon: Shield,
    accent: "var(--pf-primary)",
    files: [
      {
        path: "app/pixel/lib/types.ts",
        role: "Types partagés : ImageOptions, ImageFormat, FitMode, IcoSize, ProcessResult, ZipInput, ActionResult.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/lib/validations.ts",
        role: "imageOptionsSchema (format, qualité 1-100, mode, dimensions, fit, seuil, tailles ICO, tolérance, couleur hex) + fileTypeSchema (MIME acceptés). Mode strict, types inférés.",
        estimate: "2h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
    ],
  },
  {
    id: "helpers-fs",
    title: "Helpers fichiers",
    description:
      "Pipeline serveur : détection MIME, ICO, chroma-key, optimisation, ZIP. Tous purs et testables unitairement.",
    icon: Wrench,
    accent: "var(--pf-secondary)",
    files: [
      {
        path: "app/pixel/lib/mime.ts",
        role: "detectMime(buffer) via file-type : lit les magic bytes, retourne le MIME réel ou null.",
        estimate: "2h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/lib/ico.ts",
        role: "generateIco(buffer, sizes[]) : redimensionne chaque taille via sharp, assemble via to-ico.",
        estimate: "4h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/lib/chroma-key.ts",
        role: "removeBackground(buffer, hexColor, tolerance) : sharp().raw() → parcours pixels → alpha → flou gaussien → sharp().png().",
        estimate: "6h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Détourer un fond uni en PNG transparent",
      },
      {
        path: "app/pixel/lib/optimize.ts",
        role: "optimizeToTarget(buffer, targetBytes, minQuality=20) : boucle binaire sur la qualité, max 8 itérations.",
        estimate: "3h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
      {
        path: "app/pixel/lib/zip.ts",
        role: "createZip(files) : Buffer ZIP via archiver (deflate level 6). Limite 200 fichiers / 500 Mo.",
        estimate: "3h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
    ],
  },
  {
    id: "actions",
    title: "Server Actions",
    description:
      "Points d'entrée HTTP : requireSession + Zod + détection MIME + sharp. Retour ActionResult<T>. Concurrence limitée via p-limit(4).",
    icon: Workflow,
    accent: "var(--pf-info)",
    files: [
      {
        path: "app/pixel/actions/convert-to-webp.ts",
        role: "convertToWebpAction(buffer, options) : validation Zod, detectMime, sharp.toFormat('webp'), timeout 30s.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/actions/optimize-batch.ts",
        role: "optimizeBatchAction(buffers, targetBytes) : p-limit(4) sur optimizeToTarget.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
      {
        path: "app/pixel/actions/generate-ico.ts",
        role: "generateIcoAction(buffer, sizes) : validation tailles, generateIco.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/actions/remove-background.ts",
        role: "removeBackgroundAction(buffer, hexColor, tolerance) : validation, removeBackground.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Détourer un fond uni en PNG transparent",
      },
      {
        path: "app/pixel/actions/create-zip.ts",
        role: "createZipAction(files) : validation, createZip.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
    ],
  },
  {
    id: "components-ui",
    title: "Composants UI",
    description:
      "Présentation pure. Client Components justifiés par le state (drag & drop, slider, file input).",
    icon: Layers,
    accent: "var(--pf-success)",
    files: [
      {
        path: "app/pixel/components/UploadZone.tsx",
        role: "Zone drag & drop + paste multi-fichiers. Validation côté client. Miniatures via URL.createObjectURL.",
        estimate: "4h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Déposer plusieurs images par glisser-déposer",
      },
      {
        path: "app/pixel/components/QueueList.tsx",
        role: "Liste de la file avec miniature, poids, format, progression, actions retirer / vider.",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/components/PreviewCompare.tsx",
        role: "Slider avant/après : deux <img> superposées, <input type=range>. Poids initial/final, SSIM. Damier pour PNG.",
        estimate: "3h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Comparer avant / après avec un slider",
      },
      {
        path: "app/pixel/components/PresetSelector.tsx",
        role: "Sélection de presets (Web / PNG / ICO) + formulaire d'options avancées.",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/components/ResultDialog.tsx",
        role: "Dialog plein écran : liste des résultats, téléchargement individuel, téléchargement ZIP global.",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/hooks/useImageQueue.ts",
        role: "Hook React (contexte + reducer) : file d'attente, statuts, progression, reset.",
        estimate: "3h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
    ],
  },
  {
    id: "pages",
    title: "Pages",
    description:
      "Composition UI. Chaque page lit son contexte et rend des composants. Server Components + Client Components.",
    icon: FolderTree,
    accent: "var(--pf-warning)",
    files: [
      {
        path: "app/pixel/page.tsx",
        role: "Page d'entrée PixelForge (cette page). Présentation métier + feuille de route dev (supprimable).",
        estimate: "2h",
        status: "wip",
        epic: "Interface de traitement par lot",
        us: "Déposer plusieurs images par glisser-déposer",
      },
      {
        path: "app/pixel/tools/webp/page.tsx",
        role: "Page de conversion WebP : UploadZone + PresetSelector + PreviewCompare + ResultDialog.",
        estimate: "1h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/tools/optimize/page.tsx",
        role: "Page d'optimisation par lot : UploadZone + seuil cible + ResultDialog.",
        estimate: "1h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
      {
        path: "app/pixel/tools/ico/page.tsx",
        role: "Page de génération ICO : UploadZone + sélection des tailles + aperçu multi-résolutions.",
        estimate: "1h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/tools/png/page.tsx",
        role: "Page de détourage PNG : UploadZone + pipette couleur + tolérance + PreviewCompare.",
        estimate: "1h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Détourer un fond uni en PNG transparent",
      },
    ],
  },
  {
    id: "infra",
    title: "Infrastructure",
    description: "Configuration transverse : next.config, nav, dépendances.",
    icon: Terminal,
    accent: "var(--pf-primary)",
    files: [
      {
        path: "next.config.ts",
        role: "serverActions.bodySizeLimit='25mb', serverExternalPackages=['sharp','to-ico','archiver'], maxDuration=60.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
      },
      {
        path: "components/layout/header/nav/frontWorkSpace.ts",
        role: "Brancher /pixel dans la nav : entrée 'PixelForge' avec minPlatformRole='user'.",
        estimate: "0.5h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "package.json",
        role: "Ajouter sharp, to-ico, file-type, archiver, p-limit (prod), vitest (dev).",
        estimate: "0.5h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
      },
    ],
  },
  {
    id: "tests",
    title: "Tests",
    description: "Tests unitaires vitest sur le pipeline serveur.",
    icon: ListChecks,
    accent: "var(--pf-secondary)",
    files: [
      {
        path: "app/pixel/lib/__tests__/convert.test.ts",
        role: "convertWebP produit un buffer avec magic bytes RIFF/WEBP.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/lib/__tests__/ico.test.ts",
        role: "generateIco produit un buffer valide (header 00 00 01 00).",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/lib/__tests__/chroma-key.test.ts",
        role: "removeBackground sur fond blanc : alpha=0 aux coins, alpha=255 au centre.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Détourer un fond uni en PNG transparent",
      },
      {
        path: "app/pixel/lib/__tests__/optimize.test.ts",
        role: "optimizeToTarget atteint le seuil pour une image donnée.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Sous-composants — Partie A                                         */
/* ------------------------------------------------------------------ */

function ToolCard({ tool }: { readonly tool: PixelTool }) {
  const Icon = tool.icon;
  const accent = tool.accent;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--pf-primary)]/40 hover:shadow-lg"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--accent), transparent)`,
        }}
      />
      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--accent)` }}
          >
            {tool.tagline}
          </p>
          <h3 className="text-base font-bold tracking-tight text-[var(--pf-foreground)]">
            {tool.title}
          </h3>
        </div>
      </header>
      <p className="flex-1 text-sm leading-relaxed text-[var(--pf-muted)]">
        {tool.description}
      </p>
      <footer className="mt-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-surface-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--pf-muted)]">
          À venir
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: `var(--accent)` }}
        >
          Ouvrir
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </footer>
    </article>
  );
}

function PersonaCard({ persona }: { readonly persona: PixelPersona }) {
  const Icon = persona.icon;
  const accent = persona.accent;

  return (
    <Card
      className="relative h-full overflow-hidden border-[var(--pf-border)] bg-[var(--pf-surface)]"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--accent), transparent)`,
        }}
      />
      <CardHeader className="flex flex-row items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base text-[var(--pf-foreground)]">
            {persona.name}
          </CardTitle>
          <CardDescription className="mt-0.5 font-mono text-xs text-[var(--pf-muted)]">
            {persona.kind}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-[var(--pf-foreground)]/80">
          {persona.need}
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composants — Partie B                                         */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<DevFile["status"], string> = {
  planned: "bg-[var(--pf-surface-hover)] text-[var(--pf-muted)]",
  wip: "bg-[var(--pf-info)]/15 text-[var(--pf-info)]",
  done: "bg-[var(--pf-success)]/15 text-[var(--pf-success)]",
};

const STATUS_LABEL: Record<DevFile["status"], string> = {
  planned: "planifié",
  wip: "en cours",
  done: "terminé",
};

function DevRoadmapFile({ file }: { readonly file: DevFile }) {
  return (
    <li className="space-y-1 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-[var(--pf-foreground)]">
          {file.path}
        </code>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[file.status]}`}
        >
          {STATUS_LABEL[file.status]}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--pf-muted)]">
          {file.estimate}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
        {file.role}
      </p>
      <p className="text-[10px] text-[var(--pf-muted)]/70">
        Epic : {file.epic}
        {file.us ? ` · US : ${file.us}` : ""}
      </p>
    </li>
  );
}

function DevRoadmapGroup({ group }: { readonly group: DevGroup }) {
  const Icon = group.icon;
  const accent = group.accent;

  return (
    <Card
      className="relative h-full overflow-hidden border-[var(--pf-border)] bg-[var(--pf-surface)]"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, var(--accent), transparent)`,
        }}
      />
      <CardHeader className="flex flex-row items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base text-[var(--pf-foreground)]">
            {group.title}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-[var(--pf-muted)]">
            {group.files.length} fichier{group.files.length > 1 ? "s" : ""}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
          {group.description}
        </p>
        <ul className="space-y-2">
          {group.files.map((file) => (
            <DevRoadmapFile key={file.path} file={file} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DevRoadmap() {
  const totalFiles = DEV_ROADMAP.reduce(
    (sum, group) => sum + group.files.length,
    0,
  );
  const totalEstimate = DEV_ROADMAP.reduce(
    (sum, group) =>
      sum +
      group.files.reduce((acc, f) => {
        const h = parseFloat(f.estimate.replace("h", ""));
        return acc + (Number.isFinite(h) ? h : 0);
      }, 0),
    0,
  );

  return (
    <section
      aria-labelledby="roadmap-title"
      className="rounded-2xl border border-dashed border-[var(--pf-info)]/40 bg-[var(--pf-info)]/5 p-5 sm:p-6"
    >
      <header className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-info)]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Wrench className="size-3" aria-hidden />
          Atelier de développement · supprimable en prod
        </span>
        <h2
          id="roadmap-title"
          className="text-xl font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Fichiers à développer pour PixelForge
        </h2>
        <p className="text-sm text-[var(--pf-muted)]">
          <span className="font-mono">{totalFiles}</span> fichiers ·{" "}
          <span className="font-mono">{totalEstimate.toFixed(1)} h</span>{" "}
          estimées · <span className="font-mono">{DEV_ROADMAP.length}</span>{" "}
          couches. Cette section est délimitée par des marqueurs clairs et peut
          être supprimée en production (retirer{" "}
          <code className="mx-1 rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs">
            &lt;DevRoadmap /&gt;
          </code>{" "}
          du rendu + la constante DEV_ROADMAP).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DEV_ROADMAP.map((group) => (
          <DevRoadmapGroup key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PixelPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-[var(--pf-background)] via-[var(--pf-background)] to-[var(--pf-surface)]/30">
      {/* ===================== HERO ================================== */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[var(--pf-primary)]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-[var(--pf-info)]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]/60 px-3 py-1 text-xs font-medium text-[var(--pf-muted)] backdrop-blur">
            <Sparkles
              className="size-3.5 text-[var(--pf-primary)]"
              aria-hidden
            />
            Atelier d&apos;images · local, gratuit, open-source
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
            PixelForge
          </h1>

          <div
            aria-hidden
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)]"
          />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--pf-muted)] sm:text-lg">
            Convertir en WebP, optimiser le poids, générer des{" "}
            <code className="rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs text-[var(--pf-foreground)]">
              .ico
            </code>{" "}
            multi-résolutions et produire des PNG transparents — sans passer par
            un service en ligne.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="#tools"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Découvrir les outils
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/genesis"
              className={buttonVariants({ variant: "outline" })}
            >
              <BookOpen className="size-4" aria-hidden />
              Atelier Genesis DEV
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== 4 OUTILS ============================== */}
      <section id="tools" className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              4 outils, un atelier
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              Chaque outil est autonome. Traitement par lot, aperçu avant/après,
              téléchargement direct ou ZIP.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PERSONAS ============================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              Pour qui ?
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              3 profils, 3 besoins, un même atelier.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PERSONAS.map((persona) => (
              <PersonaCard key={persona.name} persona={persona} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ============================= */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[var(--pf-border)] bg-gradient-to-br from-[var(--pf-primary)]/10 via-[var(--pf-secondary)]/10 to-[var(--pf-info)]/10 p-8 text-center sm:p-12">
          <h2 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            Prêt à forger vos images ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--pf-muted)]">
            Aucun compte requis pour les outils de base. Sélectionnez un outil
            ci-dessus, déposez vos images, récupérez-les optimisées.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="#tools"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Commencer
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/genesis/help"
              className={buttonVariants({ variant: "outline" })}
            >
              Mode d&apos;emploi Genesis
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== PARTIE B — DEV ROADMAP ================ */}
      {/* ⚠️ À SUPPRIMER EN PROD : retirer ce bloc + DEV_ROADMAP + sous-composants */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <DevRoadmap />
        </div>
      </section>
    </div>
  );
}
