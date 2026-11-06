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
                 C'est cette partie que voit l'utilisateur final.
                 Aucun accès DB, aucune Server Action, aucune
                 dépendance à une session. Server Component pur.
                 Les liens des 4 cartes pointent vers /pixel/tools/<slug>
                 (routes à créer). Tant qu'elles n'existent pas, elles
                 renverront 404 — c'est attendu et documenté (badge
                 "À venir" affiché sur chaque carte).

                 [PARTIE B — FEUILLE DE ROUTE DEV, À SUPPRIMER EN PROD]
                 Section "Atelier de développement" listant TOUS les
                 fichiers à créer pour Pixel-Forge, groupés par couche
                 (Types, Helpers FS, Server Actions, Composants UI,
                 Pages, Infrastructure, Tests). Chaque fichier porte
                 son path, son rôle, son épic/US parent, son statut
                 (planned / wip / done) et son estimation.
                 Cette section est délimitée par des marqueurs clairs
                 pour être SUPPRIMÉE en prod : il suffit de retirer
                 <DevRoadmap /> du rendu principal et la constante
                 DEV_ROADMAP.

                 Source de vérité : le backlog scrum-business.json
                 (idea Pixel-Forge + 2 epics + 6 US + 13 tasks).
                 Les données sont reprises littéralement dans
                 DEV_ROADMAP — aucune duplication, il s'agit de la
                 MÊME information rendue lisible en HTML. Si le
                 backlog évolue, cette constante doit être mise à
                 jour manuellement (ou remplacée plus tard par une
                 lecture dynamique via readScrumFile + service —
                 hors périmètre de cette page).

                 Design : cohérent avec Genesis — cartes rounded-2xl,
                 bande colorée en haut, hover -translate-y-0.5, focus
                 visible, palette chart-1..chart-5, mobile first
                 (grilles 1/2/4 colonnes progressives).

flow:            Server Component sync → rend un wrapper min-h-svh
                 dégradé → Hero → grille 4 cartes outils → section
                 "Pour qui ?" (3 personas) → CTA → <DevRoadmap />
                 (partie B). Aucun état, aucun effet, aucun fetch.

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
  CheckCircle2,
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
      "Pipeline serveur : détection MIME, redimensionnement