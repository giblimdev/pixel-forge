/*
path :           app/pixel/page.tsx
tag :            ["pixel", "pixel-forge", "page", "hub", "landing", "atlas", "roadmap-dev"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'entrée de l'application métier "Pixel-Forge" (préfixe
                 d'URL /pixel). Deux parties distinctes dans un même fichier :

                 [PARTIE A — PRÉSENTATION MÉTIER, PROD]
                 Présentation publique de l'application Pixel-Forge :
                 hero (badge, titre dégradé, tagline), 4 cartes outils
                 (Conversion WebP, Optimisation, Génération ICO, Détourage
                 PNG), une section "Pour qui ?" (3 personas), et un CTA.
                 C'est cette partie que voit l'utilisateur final.
                 Aucun accès DB, aucune Server Action, aucune dépendance
                 à une session. Server Component pur.
                 Les liens des 4 cartes pointent vers /pixel/tools/<slug>
                 (routes à créer dans l'itération suivante). Tant qu'elles
                 n'existent pas, elles renverront 404 — c'est attendu et
                 documenté dans le code (commentaire + flag "à venir").

                 [PARTIE B — FEUILLE DE ROUTE DEV, À SUPPRIMER EN PROD]
                 Section "Atelier de développement" (composant <DevRoadmap />)
                 listant TOUS les fichiers à créer pour Pixel-Forge, groupés
                 par couche (Types, Validation, Helpers FS, Services,
                 Server Actions, Composants UI, Pages, Tests). Chaque
                 fichier porte son path, son rôle, son épic/US parent,
                 son statut (planned / wip / done) et son estimation.
                 Cette section est délimitée par des marqueurs clairs
                 (voir <DevRoadmap />) pour être SUPPRIMÉE en prod —
                 il suffit de retirer le composant du rendu principal
                 et la constante DEV_ROADMAP.

                 Source de vérité de la feuille de route : le backlog
                 scrum-business.json (idea Pixel-Forge + 2 epics + 6 US +
                 13 tasks). Les données sont reprises littéralement dans
                 DEV_ROADMAP — aucune duplication avec le JSON, il s'agit
                 de la MÊME information mais rendue lisible en HTML.
                 Si le backlog évolue, cette constante doit être mise à jour
                 manuellement (ou remplacée plus tard par une lecture
                 dynamique du document Scrum via readScrumFile + service —
                 hors périmètre de cette page).

                 La page est statique : aucune donnée dynamique, aucun
                 fetch, aucun état. Le composant est compatible Server
                 Component pur, avec des sous-composants (ToolCard,
                 PersonaCard, DevRoadmapFile, DevRoadmapGroup) tous
                 synchrones.

                 Design : cohérent avec Genesis — cartes rounded-2xl,
                 bande colorée en haut, hover -translate-y-0.5, focus
                 visible, palette chart-1..chart-5, mobile first
                 (grilles 1/2/4 colonnes progressives).

flow:            Server Component sync → rend un wrapper min-h-svh
                 dégradé → Header (partie A) → Hero → grille 4 cartes
                 outils → section personas → section "Pour qui ?" →
                 CTA → <DevRoadmap /> (partie B). Aucun état, aucun
                 effet, aucun fetch.

ecosystem:       Pixel = [
                   "@/app/pixel/page.tsx",
                 ]

relatedFiles:    ["@/components/ui/button.tsx",
                  "@/components/ui/card.tsx",
                  "@/app/page.tsx",
                  "@/app/scrum/help/page.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button", "@/components/ui/card"]

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
  Building2,
  CheckCircle2,
  Code2,
  Database,
  Eye,
  FileCode2,
  FileImage,
  FileJson,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  ImagePlus,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListChecks,
  Package,
  Palette,
  Scissors,
  Shield,
  Sparkles,
  Terminal,
  Users,
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
  title: "Pixel-Forge — Atelier de traitement d'images",
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
/*  Config — 4 outils (miroir des 4 features du backlog)               */
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
    icon: FileImage,
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
/*  Config — 3 personas (miroir des 3 personas du backlog)             */
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
/*  Config — feuille de route (miroir du backlog scrum-business.json)  */
/*  ⚠️ PARTIE B — À SUPPRIMER EN PROD                                   */
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
      "Pipeline serveur : détection MIME, redimensionnement, ICO, chroma-key, optimisation, ZIP. Tous purs et testables unitairement.",
    icon: Wrench,
    accent: "chart-2",
    files: [
      {
        path: "app/pixel/lib/mime.ts",
        role: "detectMime(buffer) via file-type : lit les magic bytes, retourne le MIME réel ou null. Protection contre les .jpg déguisés.",
        estimate: "2h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/lib/ico.ts",
        role: "generateIco(buffer, sizes[]) : redimensionne chaque taille via sharp, assemble via to-ico, retourne un Buffer ICO. Rejette les tailles > dimensions source.",
        estimate: "4h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/lib/chroma-key.ts",
        role: "removeBackground(buffer, hexColor, tolerance) : sharp().raw() → parcours pixels → alpha = f(distance RGB, tolérance) → flou gaussien sur alpha → sharp().png().",
        estimate: "6h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Détourer un fond uni en PNG transparent",
      },
      {
        path: "app/pixel/lib/optimize.ts",
        role: "optimizeToTarget(buffer, targetBytes, minQuality=20) : boucle binaire sur la qualité, max 8 itérations, retourne { buffer, quality, achieved }.",
        estimate: "3h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
      {
        path: "app/pixel/lib/zip.ts",
        role: "createZip(files: { name, buffer }[]) : Buffer ZIP via archiver (deflate level 6), stream PassThrough → chunks concaténés. Limite 200 fichiers / 500 Mo.",
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
      "Points d'entrée HTTP : requireSession + Zod + détection MIME + appel sharp / to-ico / archiver. Retour ActionResult<T>. Concurrence limitée via p-limit(4).",
    icon: Workflow,
    accent: "chart-3",
    files: [
      {
        path: "app/pixel/actions/convert-to-webp.ts",
        role: "convertToWebpAction(buffer, options) : validation Zod, detectMime, sharp.toFormat('webp'), timeout 30s, retour buffer + meta (size, format, dimensions).",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/actions/optimize-batch.ts",
        role: "optimizeBatchAction(buffers, targetBytes) : p-limit(4) sur optimizeToTarget, retour liste résultats + statistiques.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Optimiser un lot d'images avec un seuil de poids",
      },
      {
        path: "app/pixel/actions/generate-ico.ts",
        role: "generateIcoAction(buffer, sizes) : validation tailles, generateIco, retour buffer + previews par résolution.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Générer un fichier .ico multi-résolutions",
      },
      {
        path: "app/pixel/actions/remove-background.ts",
        role: "removeBackgroundAction(buffer, hexColor, tolerance) : validation, removeBackground, retour buffer PNG + warning si fond non uni.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Détourer un fond uni en PNG transparent",
      },
      {
        path: "app/pixel/actions/create-zip.ts",
        role: "createZipAction(files) : validation, createZip, retour buffer ZIP + taille.",
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
      "Présentation pure. Client Components justifiés par le state (drag & drop, slider, file input). Utilisent les Server Actions pour muter.",
    icon: Layers,
    accent: "chart-4",
    files: [
      {
        path: "app/pixel/components/UploadZone.tsx",
        role: "Zone drag & drop + paste multi-fichiers. Validation côté client (extension, taille ≤ 25 Mo, MIME image/*). Ajout à la file via useImageQueue. Miniatures via URL.createObjectURL. Toast sonner pour les rejets.",
        estimate: "4h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Déposer plusieurs images par glisser-déposer",
      },
      {
        path: "app/pixel/components/QueueList.tsx",
        role: "Liste de la file avec miniature, poids, format, progression, actions retirer / vider. État vide. Accessible.",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/components/PreviewCompare.tsx",
        role: "Slider avant/après : deux <img> superposées, <input type=range> contrôle le clip-path. Poids initial/final, taux d'économie, SSIM. Damier pour PNG transparents. Clavier (flèches).",
        estimate: "3h",
        status: "planned",
        epic: "Interface de traitement par lot",
        us: "Comparer avant / après avec un slider",
      },
      {
        path: "app/pixel/components/PresetSelector.tsx",
        role: "Sélection de presets (Web / PNG / ICO) + formulaire d'options avancées (qualité, dimensions, fit). ZodResolver côté client.",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/components/ResultDialog.tsx",
        role: "Dialog plein écran : liste des résultats, téléchargement individuel, téléchargement ZIP global, récap (poids, économie, avertissements).",
        estimate: "2h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "app/pixel/hooks/useImageQueue.ts",
        role: "Hook React (contexte + reducer) : file d'attente, statuts (pending / processing / done / error), progression, reset. Consommé par UploadZone + QueueList + ResultDialog.",
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
      "Composition UI. Chaque page lit son contexte et rend des composants. Server Components, avec des Client Components pour les interactions.",
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
        role: "Page de détourage PNG : UploadZone + pipette couleur + tolérance + PreviewCompare sur damier.",
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
      "Configuration transverse : next.config, nav, dépendances. Non spécifique aux fichiers UI.",
    icon: Terminal,
    accent: "chart-1",
    files: [
      {
        path: "next.config.ts",
        role: "Ajouter experimental.serverActions.bodySizeLimit='25mb', serverExternalPackages=['sharp','to-ico','archiver'], maxDuration=60 pour les routes /pixel/tools/*.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
      },
      {
        path: "components/layout/header/nav/frontWorkSpace.ts",
        role: "Brancher /pixel dans la nav : nouvelle entrée 'Pixel-Forge' avec minPlatformRole='user' (ou 'dev'), displayOrder entre Scrum (70) et Genesis (80).",
        estimate: "0.5h",
        status: "planned",
        epic: "Interface de traitement par lot",
      },
      {
        path: "package.json",
        role: "Ajouter sharp, @types/sharp, to-ico, file-type, archiver, p-limit (prod), vitest (dev). Retirer @imgly/background-removal si reliquat.",
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
      "Tests unitaires vitest sur le pipeline serveur : conversion, ICO, chroma-key, optimisation, ZIP.",
    icon: ListChecks,
    accent: "chart-2",
    files: [
      {
        path: "app/pixel/lib/__tests__/convert.test.ts",
        role: "convertWebP produit un buffer avec magic bytes RIFF/WEBP. Test sur fixtures JPEG 800×600.",
        estimate: "1h",
        status: "planned",
        epic: "Pipeline de traitement d'images serveur",
        us: "Convertir une image en WebP",
      },
      {
        path: "app/pixel/lib/__tests__/ico.test.ts",
        role: "generateIco produit un buffer valide (header 00 00 01 00) et contient les tailles demandées.",
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
  const comingSoon = true; // routes non encore créées

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
        {comingSoon ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            À venir
          </span>
        ) : (
          <Link
            href={tool.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-transform group-hover:translate-x-0.5"
          >
            Ouvrir
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
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
/*  ⚠️ À SUPPRIMER EN PROD                                             */
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
          {