/*
path :           app/pixel/page.tsx
tag :            ["pixel", "pixel-forge", "page", "hub", "landing", "roadmap-dev", "atlas"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'entrée de l'application métier "Pixel-Forge"
                 (préfixe d'URL /pixel). Deux parties distinctes dans
                 un même fichier :

                 [PARTIE A — PRÉSENTATION MÉTIER, PROD]
                 Présentation publique de Pixel-Forge : hero (badge,
                 titre dégradé, tagline), 4 cartes outils (Conversion
                 WebP, Optimisation, Génération ICO, Détourage PNG),
                 une section "Pour qui ?" (3 personas), et un CTA.
                 Aucun accès DB, aucune Server Action, aucune
                 dépendance à une session. Server Component pur.
                 Les liens des 4 cartes pointent vers /pixel/tools/<slug>
                 (routes à créer). Tant qu'elles n'existent pas, elles
                 renverront 404 — c'est attendu et documenté (badge
                 "À venir" affiché sur chaque carte).

                 [PARTIE B — FEUILLE DE ROUTE DEV, À SUPPRIMER EN PROD]
                 Section "Atelier de développement" listant TOUS les
                 fichiers à créer pour Pixel-Forge, groupés par couche
                 (Types, Helpers, Actions, Composants, Pages,
                 Infrastructure, Tests). Chaque fichier porte son path,
                 son rôle, son épic/US parent, son statut et son
                 estimation.

                 ⚠️ Cette section est SUPPRIMABLE EN PROD en 3 gestes :
                 1. Retirer <DevRoadmap /> du rendu principal (dernier
                    bloc avant </div>).
                 2. Supprimer la constante DEV_ROADMAP.
                 3. Supprimer les sous-composants <DevRoadmapGroup>,
                    <DevRoadmapFile>, <DevRoadmap /> et les types
                    DevFile / DevGroup + les imports inutilisés
                    (Terminal, Wrench, Shield, FolderTree, Workflow,
                    BookOpen, ListChecks).

                 Design : cohérent avec Genesis/Pixel-Forge — cartes
                 rounded-2xl, bande colorée en haut, hover
                 -translate-y-0.5, focus visible, palette
                 chart-1..chart-5, mobile first, bande dégradée sous
                 le titre pour le côté "graphique".

flow:            Server Component sync → wrapper min-h-svh dégradé →
                 Hero (badge + titre gradient + tagline + 2 CTA) →
                 section 4 cartes outils → section 3 personas →
                 CTA final → <DevRoadmap /> (partie B).
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

userStories:     ["*en tant que visiteur je veux découvrir Pixel-Forge",
                  "*en tant que développeur je veux connaître les fichiers à créer pour Pixel-Forge"]

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
  title: "Pixel-Forge",
  description:
    "Convertir en WebP, optimiser le poids, générer des .ico multi-résolutions et produire des PNG transparents — en local, gratuit, open-source.",
};

/* ------------------------------------------------------------------ */
/*  Types — Partie A (présentation métier)                             */
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
    accent: "chart-1",
  },
  {
    slug: "optimize",
    href: "/pixel/tools/optimize",
    title: "Optimisation du poids",
    tagline: "Mesurable, pas une boîte noire",
    description:
      "Réduire le poids par compression intelligente et redimensionnement, avec seuil cible (ex. « ne pas dépasser 200 Ko ») et comparaison avant/après (poids, dimensions, SSIM).",
    icon: Gauge,
    accent: "chart-2",
  },
  {
    slug: "ico",
    href: "/pixel/tools/ico",
    title: "Génération .ico",
    tagline: "Favicons et icônes d'app",
    description:
      "Générer un fichier .ico multi-résolutions (16, 24, 32, 48, 64, 128, 256) à partir d'une image source, avec aperçu par résolution et validation de la transparence.",
    icon: ImageIcon,
    accent: "chart-3",
  },
  {
    slug: "png",
    href: "/pixel/tools/png",
    title: "PNG transparents",
    tagline: "Détourage propre, anti-aliasing",
    description:
      "Supprimer un fond uni (couleur pipette + tolérance réglable), lisser les contours, exporter un PNG avec canal alpha. Détection automatique des arrière-plans unis.",
    icon: Scissors,
    accent: "chart-5",
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
    accent: "chart-1",
  },
  {
    name: "Designer",
    kind: "designer",
    need: "Contrôle qualité, comparaison avant/après, PNG transparents propres et jeux d'icônes cohérents. Attaché au rendu et à la fidélité des couleurs.",
    icon: Palette,
    accent: "chart-2",
  },
  {
    name: "Créateur de contenu",
    kind: "creator",
    need: "Optimiser des images pour un site, un blog ou une boutique sans comprendre la compression. Presets simples (Web/PNG/ICO), aperçu clair et téléchargement direct.",
    icon: Sparkles,
    accent: "chart-3",
  },
];

/* ------------------------------------------------------------------ */
/*  Types — Partie B (feuille de route dev)                            */
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
/*  Config — feuille de route (miroir du backlog)                      */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const DEV_ROADMAP: readonly DevGroup[] = [
  {
    id: "types-validation",
    title: "Types & Validation",
    description:
      "Fondation : les types partagés et les schémas Zod. Aucune dépendance runtime hors zod.",
    icon: Shield,
    accent: "chart-1",
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
    accent: "chart-2",
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
    accent: "chart-3",
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
    accent: "chart-4",
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
    accent: "chart-5",
    files: [
      {
        path: "app/pixel/page.tsx",
        role: "Page d'entrée Pixel-Forge (cette page). Présentation métier + feuille de route dev (supprimable).",
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
    description:
      "Configuration transverse : next.config, nav, dépendances.",
    icon: Terminal,
    accent: "chart-1",
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
        role: "Brancher /pixel dans la nav : entrée 'Pixel-Forge' avec minPlatformRole='user'.",
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
    description:
      "Tests unitaires vitest sur le pipeline serveur.",
    icon: ListChecks,
    accent: "chart-2",
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
/*  Sous-composants — Partie A (métier)                                */
/* ------------------------------------------------------------------ */

function ToolCard({ tool }: { readonly tool: PixelTool }) {
  const Icon = tool.icon;
  const accent = tool.accent;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />
      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${accent})` }}
          >
            {tool.tagline}
          </p>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {tool.title}
          </h3>
        </div>
      </header>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
      <footer className="mt-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          À venir
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: `var(--${accent})` }}
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
      className="relative h-full overflow-hidden border-border/60"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />
      <CardHeader className="flex flex-row items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{persona.name}</CardTitle>
          <CardDescription className="mt-0.5 font-mono text-xs">
            {persona.kind}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/80">
          {persona.need}
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composants — Partie B (feuille de route)                      */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const STATUS_BADGE: Record<DevFile["status"], string> = {
  planned: "bg-muted/60 text-muted-foreground",
  wip: "bg-chart-3/15 text-chart-3",
  done: "bg-chart-4/15 text-chart-4",
};

const STATUS_LABEL: Record<DevFile["status"], string> = {
  planned: "planifié",
  wip: "en cours",
  done: "terminé",
};

function DevRoadmapFile({ file }: { readonly file: DevFile }) {
  return (
    <li className="space-y-1 rounded-lg border border-border/40 bg-background/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-foreground">
          {file.path}
        </code>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[file.status]}`}
        >
          {STATUS_LABEL[file.status]}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {file.estimate}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {file.role}
      </p>
      <p className="text-[10px] text-muted-foreground/70">
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
      className="relative h-full overflow-hidden border-border/60"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />
      <CardHeader className="flex flex-row items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{group.title}</CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            {group.files.length} fichier{group.files.length > 1 ? "s" : ""}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
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
      className="rounded-2xl border border-dashed border-chart-3/40 bg-chart-3/5 p-5 sm:p-6"
    >
      <header className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-3/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-chart-3">
          <Wrench className="size-3" aria-hidden />
          Atelier de développement · supprimable en prod
        </span>
        <h2
          id="roadmap-title"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Fichiers à développer pour Pixel-Forge
        </h2>
        <p className="text-sm text-muted-foreground">
          {totalFiles} fichiers · {totalEstimate.toFixed(1)} h estimées ·{" "}
          {DEV_ROADMAP.length} couches. Cette section est délimitée par des
          marqueurs clairs et peut être supprimée en production (retirer
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            &lt;DevRoadmap /&gt;
          </code>
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
/*  Page (sync)                                                        */
/* ------------------------------------------------------------------ */

export default function PixelPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/20">
      {/* ===================== HERO ================================== */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-chart-1/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-chart-5/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-chart-2" aria-hidden />
            Atelier d&apos;images · local, gratuit, open-source
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Pixel-Forge
          </h1>

          {/* Bande dégradée sous le titre (côté graphique) */}
          <div
            aria-hidden
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5"
          />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Convertir en WebP, optimiser le poids, générer des{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              .ico
            </code>{" "}
            multi-résolutions et produire des PNG transparents — sans passer
            par un service en ligne.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="#tools"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 text-white shadow-lg shadow-chart-1/30 hover:brightness-110`}
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              4 outils, un atelier
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pour qui ?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-5/10 p-8 text-center sm:p-12">
          <h2 className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            Prêt à forger vos images ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Aucun compte requis pour les outils de base. Sélectionnez un outil
            ci-dessus, déposez vos images, récupérez-les optimisées.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="#tools"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 text-white shadow-lg shadow-chart-1/30 hover:brightness-110`}
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