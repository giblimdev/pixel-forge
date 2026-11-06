/*
path :           app/pixel/page.tsx
tag :            ["pixel", "pixel-forge", "page", "hub", "landing", "roadmap-dev", "atlas", "pixel-forge-charte", "architecture"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page d'entrée de PixelForge (préfixe /pixel).
                 Deux parties distinctes :

                 [PARTIE A — PRÉSENTATION MÉTIER, PROD]
                 Hero (badge, titre gradient, tagline, 2 CTA) →
                 5 familles d'outils (Convertir, Optimiser, Éditer,
                 Générer, Analyser) avec leurs 11 outils détaillés →
                 3 fonctionnalités transversales (Image Queue,
                 Image Comparison, Export Manager) → CTA final.
                 Server Component pur, aucune DB, aucune Server Action.

                 [PARTIE B — DÉVELOPPEUR, À SUPPRIMER EN PROD]
                 Architecture COMPLÈTE de PixelForge, fidèle à la
                 synthèse de l'utilisateur :
                 - Arborescence exacte : app/pixel/ (dashboard,
                   convert, optimize, edit, generate, analyze),
                   features/ (12 dossiers), components/ (6 dossiers),
                   lib/ (image-engine, validators, archive),
                   types/ (4 fichiers).
                 - Explication fichier par fichier.
                 - Note : lib/image-engine/sharp/ détaillé en 12
                   fichiers (convert, optimize, resize, crop, rotate,
                   chroma-key, tint, blur, metadata, favicon,
                   placeholder, palette).
                 - Plan d'implémentation en 5 phases.
                 - Checklist sécurité (7 règles).

                 ⚠️ ARCHITECTURE FIDÈLE : la structure proposée par
                 l'utilisateur est REPRISE TELLE QUELLE, à la racine
                 du projet (features/, components/, lib/, types/).
                 Aucun déplacement vers app/pixel/. Le seul ajout
                 explicatif concerne lib/image-engine/sharp/ (détail
                 des 12 adaptateurs) et lib/image-engine/limits.ts
                 (limites de sécurité).

                 ⚠️ SUPPRESSION EN PROD (3 gestes) :
                 1. Retirer <DevArchitecture /> du rendu principal.
                 2. Supprimer les constantes ARCHITECTURE_TREE,
                    ARCHITECTURE_GROUPS, IMPLEMENTATION_PHASES,
                    SECURITY_CHECKLIST.
                 3. Supprimer les sous-composants DevArchitecture,
                    ArchitectureGroupCard, PhaseCard, SecurityCard
                    + imports inutilisés.

                 ⚠️ CHARTE PIXELFORGE :
                 - Tokens pf-* partout.
                 - Bandes dégradées : pf-primary → pf-secondary → pf-info.
                 - Cartes : bg-[var(--pf-surface)]/40 + backdrop-blur-xl.
                 - Valeurs techniques en JetBrains Mono (font-mono).
                 - 5 familles avec accent distinct :
                   Convertir (primary), Optimiser (secondary),
                   Éditer (info), Générer (success), Analyser (warning).
                 - 3 transverses avec accent primary-light.

flow:            Server Component sync → wrapper min-h-svh dégradé
                 → Hero → 5 sections familles (avec cartes outils)
                 → section transverses → CTA final → <DevArchitecture />
                 (partie B). Aucun état, aucun effet, aucun fetch.

ecosystem:       Pixel = [
                   "@/app/pixel/page.tsx",
                 ]

relatedFiles:    ["@/components/ui/button.tsx",
                  "@/components/ui/card.tsx",
                  "@/app/page.tsx",
                  "@/app/dev/page.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/card"]

exports:         ["default PixelPage", "metadata"]

useBy:           []

userStories:     ["*en tant que visiteur je veux comprendre les 5 familles d'outils",
                  "*en tant que visiteur je veux voir les 11 outils détaillés",
                  "*en tant que développeur je veux connaître l'architecture de PixelForge"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FileCode2,
  FolderTree,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Palette,
  Scissors,
  Settings,
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
    "11 outils pour convertir, optimiser, éditer, générer et analyser vos images — en local, gratuit, open-source.",
};

/* ------------------------------------------------------------------ */
/*  TYPES — Partie A                                                   */
/* ------------------------------------------------------------------ */

interface Tool {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

interface Family {
  readonly number: string;
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly tools: readonly Tool[];
  readonly special?: boolean;
}

interface TransversalFeature {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly details: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  CONFIG — 5 familles + 11 outils                                    */
/* ------------------------------------------------------------------ */

const FAMILIES: readonly Family[] = [
  {
    number: "01",
    slug: "convert",
    title: "Convertir",
    tagline: "Changer le format",
    description:
      "Changer le format des images. Le point d'entrée le plus utilisé : transformer un JPEG en WebP pour gagner du poids, ou un PNG en AVIF pour le SEO.",
    icon: ArrowRight,
    accent: "var(--pf-primary)",
    tools: [
      {
        number: "01",
        title: "Convertisseur universel",
        description:
          "JPEG, PNG, WebP, AVIF, TIFF, GIF et SVG en entrée selon les capacités du moteur. Conversion vers les formats de sortie pris en charge, avec contrôle de la qualité, du mode (lossy / lossless) et des métadonnées.",
        icon: ImageIcon,
      },
    ],
  },
  {
    number: "02",
    slug: "optimize",
    title: "Optimiser",
    tagline: "Réduire le poids, adapter les dimensions",
    description:
      "Réduire le poids et adapter les dimensions. Chaque kilo-octet économisé améliore le SEO, le temps de chargement et l'expérience mobile.",
    icon: Wrench,
    accent: "var(--pf-secondary)",
    tools: [
      {
        number: "02",
        title: "Optimiseur intelligent",
        description:
          "Optimisation automatique selon un poids cible, une qualité souhaitée ou un niveau de compression. Ajustement itératif jusqu'à atteindre le seuil ou la qualité minimale.",
        icon: Settings,
      },
      {
        number: "03",
        title: "Compresseur JPEG / PNG",
        description:
          "Compression sans changement de format, avec contrôle de qualité et de palette PNG. Utile pour les assets qui doivent rester en PNG (transparence) ou JPEG (compatibilité).",
        icon: Shield,
      },
      {
        number: "04",
        title: "Redimensionnement par lot",
        description:
          "Dimensions fixes, largeur maximale, hauteur maximale, proportions et génération de plusieurs variantes (320/640/1280 pour le responsive).",
        icon: Layers,
      },
      {
        number: "05",
        title: "Recadrage intelligent",
        description:
          "Recadrage automatique selon un ratio avec détection du sujet et positionnement pertinent (sharp.strategy.attention). Idéal pour les vignettes et avatars.",
        icon: Scissors,
      },
    ],
  },
  {
    number: "03",
    slug: "edit",
    title: "Éditer",
    tagline: "Modifier l'apparence et la composition",
    description:
      "Modifier l'apparence et la composition. C'est ici que les transformations géométriques et colorimétriques entrent en jeu.",
    icon: Palette,
    accent: "var(--pf-info)",
    tools: [
      {
        number: "06",
        title: "Éditeur de recadrage",
        description:
          "Recadrage manuel, rotation, retournement, ratios prédéfinis (16:9, 1:1, 4:3, 3:2) et cadrage libre. Zone draggable avec grille des tiers.",
        icon: Scissors,
      },
      {
        number: "07",
        title: "Suppression d'arrière-plan",
        description:
          "Détourage sur fond uni, pipette, tolérance, lissage des contours (anti-aliasing) et gomme manuelle. Export PNG avec canal alpha.",
        icon: Scissors,
      },
      {
        number: "08",
        title: "Retouche et filigrane",
        description:
          "Réglages colorimétriques (luminosité, contraste, saturation, teinte), netteté, flou, niveaux de gris et ajout de watermark (logo ou texte, 9 positions, opacité).",
        icon: Palette,
      },
    ],
  },
  {
    number: "04",
    slug: "generate",
    title: "Générer",
    tagline: "Créer des ressources graphiques et techniques",
    description:
      "Créer des ressources graphiques et techniques. C'est ici qu'on produit des assets prêts à intégrer dans une application web.",
    icon: Sparkles,
    accent: "var(--pf-success)",
    tools: [
      {
        number: "09",
        title: "Générateur de favicons",
        description:
          "ICO multi-résolutions (16/24/32/48/64/128/256), PNG, Apple Touch Icon (180×180), Android Chrome (192/512) et manifest.webmanifest. ZIP téléchargeable.",
        icon: ImageIcon,
      },
      {
        number: "10",
        title: "Générateur de placeholders",
        description:
          "LQIP (data URL base64 20×20), BlurHash (chaîne courte), SVG flouté et Base64 pour les applications web. Améliore la perception de performance (LCP, CLS).",
        icon: ImageIcon,
      },
      {
        number: "11",
        title: "Extracteur de palettes",
        description:
          "Extraction des couleurs dominantes (5 max) et export CSS variables, Tailwind config et JSON. Aperçu hex/RGB.",
        icon: Palette,
      },
    ],
  },
  {
    number: "05",
    slug: "analyze",
    title: "Analyser",
    tagline: "Fonction intégrée, pas un outil isolé",
    description:
      "Comprendre les propriétés et les informations d'une image. Fonction INTÉGRÉE à tous les outils — pas une carte séparée.",
    icon: ListChecks,
    accent: "var(--pf-warning)",
    special: true,
    tools: [
      {
        number: "—",
        title: "Analyse des images et métadonnées",
        description:
          "Dimensions, format, poids, résolution, transparence, EXIF, GPS, appareil, date, profils ICC et suppression des métadonnées. Accessible depuis tous les autres outils.",
        icon: ListChecks,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  CONFIG — 3 fonctionnalités transversales                           */
/* ------------------------------------------------------------------ */

const TRANSVERSAL_FEATURES: readonly TransversalFeature[] = [
  {
    id: "queue",
    title: "Image Queue",
    subtitle: "Gestionnaire de fichiers et file d'attente",
    description:
      "Le point d'entrée commun de PixelForge. Chaque outil consomme la même file d'attente, ce qui garantit une UX homogène.",
    icon: ListChecks,
    details: [
      "Glisser-déposer multiple (onDrop, onDragOver)",
      "Coller depuis le presse-papiers (Ctrl+V)",
      "Miniatures et informations des fichiers",
      "Validation MIME, extension et taille (25 Mo)",
      "Suppression individuelle ou globale",
      "Statut : en attente, en cours, terminé, erreur",
    ],
  },
  {
    id: "comparison",
    title: "Image Comparison",
    subtitle: "Comparateur avant / après",
    description:
      "Un composant réutilisable dans le convertisseur, l'optimiseur et l'éditeur. Affiche côte à côte l'original et le résultat.",
    icon: ArrowRight,
    details: [
      "Slider de comparaison (accessible clavier)",
      "Affichage côte à côte",
      "Poids initial et final",
      "Dimensions initiales et finales",
      "Économie en Ko et en pourcentage",
      "Fond damier pour la transparence",
    ],
  },
  {
    id: "export",
    title: "Export Manager",
    subtitle: "Exportation et téléchargement",
    description:
      "Centralise toute la logique de téléchargement (individuel ou groupé ZIP). Un seul composant gère le nommage et l'organisation des fichiers.",
    icon: Database,
    details: [
      "Téléchargement individuel",
      "Téléchargement groupé ZIP",
      "Conservation des noms de fichiers",
      "Gestion des noms et suffixes",
      "Organisation par format ou résolution",
      "Limite 200 fichiers / ZIP · 500 Mo max",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  TYPES — Partie B (développeur)                                     */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

interface ArchitectureFile {
  readonly name: string;
  readonly role: string;
}

interface ArchitectureGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly files: readonly ArchitectureFile[];
}

interface ImplementationPhase {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly files: readonly string[];
  readonly estimate: string;
}

interface SecurityRule {
  readonly title: string;
  readonly description: string;
}

/* ------------------------------------------------------------------ */
/*  CONFIG — Partie B                                                  */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const ARCHITECTURE_TREE = `app/
├── /pixel
│   ├── dashboard/
│   ├── convert/
│   ├── optimize/
│   ├── edit/
│   ├── generate/
│   └── analyze/
│
├── features/
│   ├── converter/
│   ├── optimizer/
│   ├── compressor/
│   ├── resize/
│   ├── smart-crop/
│   ├── crop-editor/
│   ├── background-removal/
│   ├── image-editor/
│   ├── favicon-generator/
│   ├── placeholder-generator/
│   ├── color-palette/
│   └── metadata/
│
├── components/
│   ├── image-queue/
│   ├── image-upload/
│   ├── image-comparison/
│   ├── image-preview/
│   ├── image-properties/
│   └── export-manager/
│
├── lib/
│   ├── image-engine/
│   │   ├── sharp/
│   │   ├── formats/
│   │   ├── transformations/
│   │   ├── metadata/
│   │   └── optimization/
│   ├── validators/
│   └── archive/
│
└── types/
    ├── image.ts
    ├── conversion.ts
    ├── optimization.ts
    └── processing.ts`;

const ARCHITECTURE_GROUPS: readonly ArchitectureGroup[] = [
  {
    id: "app-pixel",
    title: "app/pixel/ — Routes publiques",
    description:
      "6 pages (1 par famille + le dashboard). Chaque page monte les features correspondantes et le composant ImageQueue.",
    icon: FolderTree,
    accent: "var(--pf-primary)",
    files: [
      {
        name: "dashboard/",
        role: "Tableau de bord — vue d'ensemble des outils, historique des traitements récents (localStorage), raccourcis.",
      },
      {
        name: "convert/",
        role: "Outil 01 — Convertisseur universel.",
      },
      {
        name: "optimize/",
        role: "Outils 02, 03, 04, 05 — Optimiseur, Compresseur, Redimensionnement, Recadrage intelligent.",
      },
      {
        name: "edit/",
        role: "Outils 06, 07, 08 — Éditeur de recadrage, Détourage, Retouche + watermark.",
      },
      {
        name: "generate/",
        role: "Outils 09, 10, 11 — Favicons, Placeholders, Palettes.",
      },
      {
        name: "analyze/",
        role: "Fonction 05 — Analyse (intégrée, accessible via les autres outils).",
      },
    ],
  },
  {
    id: "features",
    title: "features/ — Logique métier",
    description:
      "12 dossiers, 1 par outil. Chacun contient sa Server Action, ses composants spécifiques, et ses helpers. Aucun dossier ne dépasse 900 lignes.",
    icon: Boxes,
    accent: "var(--pf-secondary)",
    files: [
      {
        name: "converter/",
        role: "01. Convertisseur universel — Server Action + UI (select format, qualité).",
      },
      {
        name: "optimizer/",
        role: "02. Optimiseur intelligent — Server Action (boucle binaire sur la qualité).",
      },
      {
        name: "compressor/",
        role: "03. Compresseur JPEG/PNG — Server Action (sans changement de format).",
      },
      {
        name: "resize/",
        role: "04. Redimensionnement par lot — Server Action (multi-tailles responsive).",
      },
      {
        name: "smart-crop/",
        role: "05. Recadrage intelligent — Server Action (sharp.strategy.attention).",
      },
      {
        name: "crop-editor/",
        role: "06. Éditeur de recadrage — UI (react-easy-crop) + Server Action (extract/rotate/flip).",
      },
      {
        name: "background-removal/",
        role: "07. Détourage — UI (pipette, tolérance) + Server Action (chroma-key).",
      },
      {
        name: "image-editor/",
        role: "08. Retouche + watermark — UI (sliders) + Server Action (modulate, blur, watermark).",
      },
      {
        name: "favicon-generator/",
        role: "09. Favicons — Server Action (sharp multi-tailles + png-to-ico + manifest).",
      },
      {
        name: "placeholder-generator/",
        role: "10. Placeholders — Server Action (LQIP, blurhash).",
      },
      {
        name: "color-palette/",
        role: "11. Palettes — Server Action (sharp.stats + clustering).",
      },
      {
        name: "metadata/",
        role: "05. Analyse — Server Action (EXIF via sharp.metadata), intégrée partout.",
      },
    ],
  },
  {
    id: "components",
    title: "components/ — UI transverse",
    description:
      "6 dossiers réutilisables par tous les outils. Ces composants NE doivent JAMAIS être dupliqués dans les features.",
    icon: Layers,
    accent: "var(--pf-info)",
    files: [
      {
        name: "image-queue/",
        role: "Transverse A — File d'attente (drag & drop, paste, miniatures, statuts). Consommé par tous les outils.",
      },
      {
        name: "image-upload/",
        role: "Zone de dépôt réutilisable (onDrop, onPaste, validation client).",
      },
      {
        name: "image-comparison/",
        role: "Transverse B — Slider avant/après + poids/SSIM. Consommé par Convert, Optimize, Edit.",
      },
      {
        name: "image-preview/",
        role: "Aperçu d'une image (dimensions, poids, format détecté).",
      },
      {
        name: "image-properties/",
        role: "Affichage EXIF (lecture seule) — consommé par Analyze.",
      },
      {
        name: "export-manager/",
        role: "Transverse C — Téléchargement individuel ou ZIP (archiver). Consommé par tous.",
      },
    ],
  },
  {
    id: "image-engine",
    title: "lib/image-engine/ — Cœur bas niveau",
    description:
      "Le seul dossier réellement réutilisable par d'autres apps métier. Contient tous les adaptateurs sharp, les helpers de formats, et les limites de sécurité.",
    icon: Cpu,
    accent: "var(--pf-success)",
    files: [
      {
        name: "sharp/",
        role: "12 adaptateurs : convert.ts, optimize.ts, resize.ts, crop.ts, rotate.ts, chroma-key.ts, tint.ts, blur.ts, metadata.ts, favicon.ts, placeholder.ts, palette.ts.",
      },
      {
        name: "formats/",
        role: "Mapping MIME ↔ extension ↔ format sharp (source unique pour file-type et sharp).",
      },
      {
        name: "transformations/",
        role: "Helpers purs : ratios (16:9, 1:1…), fit modes, calculs de redimensionnement.",
      },
      {
        name: "metadata/",
        role: "Lecture EXIF, ICC, GPS. Parcours des tags via sharp.metadata().",
      },
      {
        name: "optimization/",
        role: "Helpers de calcul : seuils de poids, boucle binaire de qualité.",
      },
      {
        name: "limits.ts",
        role: "Constantes de sécurité : 25 Mo / image, 200 fichiers / lot, 500 Mo / ZIP, 30 s / image. Ajout par rapport à la synthèse d'origine.",
      },
    ],
  },
  {
    id: "types-validators",
    title: "types/ & lib/ — Contrats et validations",
    description:
      "Contrats partagés (types) et schémas Zod (validators). Centralisés pour éviter la duplication entre features.",
    icon: FileCode2,
    accent: "var(--pf-warning)",
    files: [
      {
        name: "types/image.ts",
        role: "ImageOptions, ImageFormat, FitMode, IcoSize.",
      },
      {
        name: "types/conversion.ts",
        role: "ConvertOptions, ConvertResult.",
      },
      {
        name: "types/optimization.ts",
        role: "OptimizeOptions, OptimizeResult (avec achieved: boolean).",
      },
      {
        name: "types/processing.ts",
        role: "ProcessingStatus, ProcessingResult<T> (génériques).",
      },
      {
        name: "lib/validators/",
        role: "Schémas Zod : imageOptionsSchema (strict), fileTypeSchema (MIME acceptés).",
      },
      {
        name: "lib/archive/",
        role: "createZip(files) via archiver (limite 200 fichiers / 500 Mo).",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  CONFIG — Plan d'implémentation                                     */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const IMPLEMENTATION_PHASES: readonly ImplementationPhase[] = [
  {
    number: "1",
    title: "Fondations",
    description:
      "Types partagés, validation Zod, limites de sécurité. Aucune feature ne peut démarrer sans ça.",
    files: [
      "types/image.ts, types/conversion.ts, types/optimization.ts, types/processing.ts",
      "lib/validators/ (Zod strict)",
      "lib/image-engine/limits.ts (25 Mo / 200 fichiers / 500 Mo / 30s)",
      "lib/image-engine/formats/ (mapping MIME ↔ ext)",
    ],
    estimate: "6h",
  },
  {
    number: "2",
    title: "Pipeline sharp",
    description:
      "Tous les adaptateurs sharp. Chacun est testable unitairement, sans UI.",
    files: [
      "lib/image-engine/sharp/convert.ts, optimize.ts, resize.ts",
      "lib/image-engine/sharp/crop.ts, rotate.ts, chroma-key.ts",
      "lib/image-engine/sharp/tint.ts, blur.ts, metadata.ts",
      "lib/image-engine/sharp/favicon.ts, placeholder.ts, palette.ts",
    ],
    estimate: "20h",
  },
  {
    number: "3",
    title: "Server Actions",
    description:
      "12 Server Actions (1 par feature). RequireSession + Zod + détection MIME + appel sharp + ActionResult.",
    files: [
      "features/converter/actions.ts",
      "features/optimizer/actions.ts (× 4 : optimizer, compressor, resize, smart-crop)",
      "features/crop-editor/actions.ts, background-removal/actions.ts, image-editor/actions.ts",
      "features/favicon-generator/actions.ts, placeholder-generator/actions.ts, color-palette/actions.ts",
      "features/metadata/actions.ts",
    ],
    estimate: "12h",
  },
  {
    number: "4",
    title: "UI transverse",
    description:
      "Composants réutilisables : file d'attente, comparaison avant/après, export.",
    files: [
      "components/image-upload/ (drop zone + paste)",
      "components/image-queue/ (liste + statuts + suppression)",
      "components/image-comparison/ (slider + SSIM)",
      "components/export-manager/ (individuel + ZIP)",
      "components/image-properties/ (EXIF)",
    ],
    estimate: "14h",
  },
  {
    number: "5",
    title: "UI par famille",
    description:
      "6 pages (1 par famille + dashboard) + ajustements spécifiques. Chaque page consomme les transverses et branche les features.",
    files: [
      "app/pixel/dashboard/page.tsx",
      "app/pixel/convert/page.tsx",
      "app/pixel/optimize/page.tsx",
      "app/pixel/edit/page.tsx",
      "app/pixel/generate/page.tsx",
      "app/pixel/analyze/page.tsx",
    ],
    estimate: "15h",
  },
];

/* ------------------------------------------------------------------ */
/*  CONFIG — Checklist sécurité                                        */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

const SECURITY_CHECKLIST: readonly SecurityRule[] = [
  {
    title: "Limite de taille par image",
    description:
      "25 Mo max. Renvoyer 413 (Payload Too Large) si dépassé. Configuré dans next.config.ts via experimental.serverActions.bodySizeLimit.",
  },
  {
    title: "Limite de fichiers par lot",
    description:
      "200 fichiers max par ZIP. Au-delà, rejeter avec un message clair. Évite la saturation mémoire.",
  },
  {
    title: "Limite de taille totale",
    description:
      "500 Mo max par lot. Empêche les OOM (Out Of Memory) sur les fonctions Vercel (limite mémoire).",
  },
  {
    title: "Timeout par image",
    description:
      "30 s max par traitement (via Promise.race). Évite qu'une image corrompue ne bloque toute la file.",
  },
  {
    title: "Détection MIME réelle",
    description:
      "file-type lit les magic bytes. Ne JAMAIS se fier à l'extension ni au Content-Type déclaré. Renvoyer 415 (Unsupported Media Type) si le MIME réel ne correspond pas.",
  },
  {
    title: "Validation Zod stricte",
    description:
      "Toutes les options de traitement validées via Zod en mode strict. Renvoyer 422 (Unprocessable Entity) si invalide. Aucune option non typée ne doit atteindre sharp.",
  },
  {
    title: "Rate-limiting",
    description:
      "p-limit(4) côté serveur pour limiter la concurrence. Ajouter un compteur par IP pour éviter qu'un utilisateur sature le CPU.",
  },
];

/* ------------------------------------------------------------------ */
/*  SOUS-COMPOSANTS — Partie A                                         */
/* ------------------------------------------------------------------ */

function ToolCard({ tool, accent }: { readonly tool: Tool; readonly accent: string }) {
  const Icon = tool.icon;
  return (
    <article
      className="group relative flex h-full flex-col gap-3 rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl transition-all hover:border-[var(--pf-primary)]/40 hover:shadow-[0_0_30px_var(--pf-primary)]/15"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <header className="flex items-start gap-3">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
          }}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Outil {tool.number}
          </p>
          <h4 className="text-sm font-bold tracking-tight text-[var(--pf-foreground)]">
            {tool.title}
          </h4>
        </div>
      </header>
      <p className="flex-1 text-xs leading-relaxed text-[var(--pf-muted)]">
        {tool.description}
      </p>
    </article>
  );
}

function FamilySection({ family }: { readonly family: Family }) {
  const Icon = family.icon;
  const accent = family.accent;

  return (
    <section
      id={family.slug}
      className="rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-5 backdrop-blur-xl sm:p-6"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <header className="mb-5 flex items-start gap-4">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))`,
          }}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="font-mono text-xs font-semibold tabular-nums"
              style={{ color: `var(--accent)` }}
            >
              {family.number}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-2xl">
              {family.title}
            </h3>
            {family.special && (
              <span className="inline-flex rounded-full bg-[var(--pf-warning)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-warning)]">
                Intégrée
              </span>
            )}
          </div>
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--accent)` }}
          >
            {family.tagline}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-[var(--pf-surface-hover)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--pf-muted)] sm:inline-flex">
          {family.tools.length} outil{family.tools.length > 1 ? "s" : ""}
        </span>
      </header>
      <p className="mb-4 text-sm leading-relaxed text-[var(--pf-muted)]">
        {family.description}
      </p>
      <div
        className={`grid grid-cols-1 gap-3 ${
          family.tools.length > 1 ? "md:grid-cols-2" : ""
        }`}
      >
        {family.tools.map((tool) => (
          <ToolCard key={tool.number} tool={tool} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function TransversalCard({
  feature,
}: {
  readonly feature: TransversalFeature;
}) {
  const Icon = feature.icon;
  return (
    <article className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-primary-light)] via-[var(--pf-primary)] to-[var(--pf-secondary)] opacity-70"
      />
      <header className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--pf-primary-light)] to-[var(--pf-primary)] text-white shadow-md">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold tracking-tight text-[var(--pf-foreground)]">
            {feature.title}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-primary-light)]">
            {feature.subtitle}
          </p>
        </div>
      </header>
      <p className="text-sm leading-relaxed text-[var(--pf-muted)]">
        {feature.description}
      </p>
      <ul className="space-y-1.5 text-xs text-[var(--pf-foreground)]/80">
        {feature.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 size-3.5 shrink-0 text-[var(--pf-primary-light)]"
              aria-hidden
            />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  SOUS-COMPOSANTS — Partie B (dev)                                   */
/*  ⚠️ À SUPPRIMER EN PROD                                              */
/* ------------------------------------------------------------------ */

function ArchitectureGroupCard({
  group,
}: {
  readonly group: ArchitectureGroup;
}) {
  const Icon = group.icon;
  const accent = group.accent;
  return (
    <Card
      className="relative h-full overflow-hidden border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl"
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
            {group.files.length} élément{group.files.length > 1 ? "s" : ""}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
          {group.description}
        </p>
        <ul className="space-y-2">
          {group.files.map((file) => (
            <li
              key={file.name}
              className="space-y-1 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 p-3 backdrop-blur"
            >
              <code className="block break-all font-mono text-xs font-semibold text-[var(--pf-foreground)]">
                {file.name}
              </code>
              <p className="text-[11px] leading-relaxed text-[var(--pf-muted)]">
                {file.role}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function PhaseCard({ phase }: { readonly phase: ImplementationPhase }) {
  return (
    <li className="rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--pf-primary), var(--pf-secondary))",
          }}
        >
          {phase.number}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-base font-bold text-[var(--pf-foreground)]">
              {phase.title}
            </h3>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--pf-primary)]">
              {phase.estimate}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--pf-muted)]">
            {phase.description}
          </p>
          <ul className="space-y-1">
            {phase.files.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-xs text-[var(--pf-foreground)]/80"
              >
                <Code2
                  className="mt-0.5 size-3.5 shrink-0 text-[var(--pf-muted)]"
                  aria-hidden
                />
                <code className="break-all font-mono text-[11px]">{f}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function SecurityCard({ rule }: { readonly rule: SecurityRule }) {
  return (
    <li className="rounded-xl border border-[var(--pf-danger)]/30 bg-[var(--pf-danger)]/5 p-4 backdrop-blur">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-[var(--pf-danger)]"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
            {rule.title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
            {rule.description}
          </p>
        </div>
      </div>
    </li>
  );
}

function DevArchitecture() {
  return (
    <section className="space-y-10 rounded-2xl border border-dashed border-[var(--pf-info)]/40 bg-[var(--pf-info)]/5 p-5 backdrop-blur-xl sm:p-6">
      {/* Header */}
      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-info)]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Wrench className="size-3" aria-hidden />
          Atelier de développement · supprimable en prod
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
          Architecture de PixelForge
        </h2>
        <p className="text-sm text-[var(--pf-muted)]">
          5 familles d'outils · 12 features · 3 transverses · 1 cœur
          réutilisable. Chaque dossier respecte la règle "scripts ≤ 900
          lignes" du CONTRIBUTING.
        </p>
      </header>

      {/* Arborescence */}
      <div className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 p-4 backdrop-blur">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--pf-foreground)]">
          <FolderTree
            className="size-4 text-[var(--pf-info)]"
            aria-hidden
          />
          Arborescence cible
        </h3>
        <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-[var(--pf-foreground)]/90">
          <code>{ARCHITECTURE_TREE}</code>
        </pre>
      </div>

      {/* Groupes */}
      <div>
        <h3 className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Détail par couche
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ARCHITECTURE_GROUPS.map((group) => (
            <ArchitectureGroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>

      {/* Plan d'implémentation */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          <Workflow
            className="size-5 text-[var(--pf-primary)]"
            aria-hidden
          />
          Plan d'implémentation (5 phases)
        </h3>
        <ol className="space-y-3">
          {IMPLEMENTATION_PHASES.map((phase) => (
            <PhaseCard key={phase.number} phase={phase} />
          ))}
        </ol>
        <p className="mt-3 text-xs text-[var(--pf-muted)]">
          Total estimé :{" "}
          <span className="font-mono font-semibold text-[var(--pf-primary)]">
            67h
          </span>{" "}
          (hors tests unitaires, hors UI avancée comme le slider).
        </p>
      </div>

      {/* Checklist sécurité */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          <Shield
            className="size-5 text-[var(--pf-danger)]"
            aria-hidden
          />
          Checklist sécurité
        </h3>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SECURITY_CHECKLIST.map((rule) => (
            <SecurityCard key={rule.title} rule={rule} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
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
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 px-3 py-1 text-xs font-medium text-[var(--pf-muted)] backdrop-blur-xl">
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
            className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)]"
          />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--pf-muted)] sm:text-lg">
            <strong className="text-[var(--pf-foreground)]">11 outils</strong>{" "}
            pour convertir, optimiser, éditer, générer et analyser vos images.{" "}
            <strong className="text-[var(--pf-foreground)]">
              3 fonctionnalités transversales
            </strong>{" "}
            qui garantissent une UX homogène.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="#families"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Découvrir les familles
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/dev"
              className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
            >
              <Terminal className="size-4" aria-hidden />
              Dépendances à installer
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== 5 FAMILLES ============================ */}
      <section
        id="families"
        className="space-y-6 px-4 pb-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              5 familles, 11 outils
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              Chaque famille regroupe les outils qui répondent au même
              besoin. Un outil = une tâche précise, pas un workflow complexe.
            </p>
          </header>

          {FAMILIES.map((family) => (
            <FamilySection key={family.number} family={family} />
          ))}
        </div>
      </section>

      {/* ===================== TRANSVERSES =========================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              3 fonctionnalités transversales
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              Ces composants ne sont PAS des outils isolés. Ils sont
              réutilisés par 3 à 9 outils chacun, et garantissent la
              cohérence de l&apos;expérience.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TRANSVERSAL_FEATURES.map((feature) => (
              <TransversalCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ============================= */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[var(--pf-border)]/60 bg-gradient-to-br from-[var(--pf-primary)]/15 via-[var(--pf-secondary)]/10 to-[var(--pf-info)]/10 p-8 text-center backdrop-blur-xl sm:p-12">
          <h2 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-info)] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            Prêt à forger vos images ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--pf-muted)]">
            11 outils autonomes, 3 transverses partagés, une architecture
            claire. Sélectionnez un outil, déposez vos images, récupérez-les
            optimisées.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="#families"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Explorer les outils
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/dev"
              className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
            >
              Voir les dépendances
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== PARTIE B — DEV ======================== */}
      {/* ⚠️ À SUPPRIMER EN PROD : retirer ce bloc + toutes les constantes
          et sous-composants marqués "À SUPPRIMER EN PROD" */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <DevArchitecture />
        </div>
      </section>
    </div>
  );
}