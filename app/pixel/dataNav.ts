/*
path :           app/pixel/dataNav.ts
tag :            ["pixelforge", "navigation", "data", "foundation", "nav"]
projectId:       <Pixel-fotgen>
type:            config
generic:         false

role:            Source unique de la navigation de l'espace PixelForge.
                 Déclare les 5 familles (Convertir, Optimiser, Éditer,
                 Générer, Analyser), leurs outils, et les entrées du
                 menu principal. Consommé par PixelNav.tsx et par les
                 hubs (/pixel/convert, /pixel/optimize, etc.) pour
                 afficher les cartes d'outils. `analyze` et
                 `analyze/metadata` sont marqués `available: false`
                 tant que leurs pages n'existent pas (Phase 18).

flow:            pixelDataNav (tableau racine) → familles → outils →
                 PixelNav.tsx map sur les familles pour construire le menu.
                 Les hubs map sur `family.tools` pour les cartes.
                 Aucune dépendance React : data pure consommable aussi
                 côté serveur pour générer un sitemap.

ecosystem:       PIXELFORGE_FOUNDATION
relatedFiles:    [
                   "app/pixel/components/PixelNav.tsx",
                   "app/pixel/lib/ecosystems.ts",
                   "app/pixel/page.tsx",
                 ]
imports:         []
exports:         [
                   "PixelForgeFamily",
                   "PixelForgeTool",
                   "pixelForgeNav",
                   "pixelForgeFamilies",
                 ]
useBy:           [
                   "app/pixel/components/PixelNav.tsx",
                 ]

userStories:     ["*en tant qu'utilisateur je veux naviguer entre les outils PixelForge"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export type PixelForgeTool = {
  /** Slug technique stable. */
  readonly id: string;
  /** Titre affiché (FR). */
  readonly label: string;
  /** Description courte (FR). */
  readonly description: string;
  /** Chemin de la page outil. */
  readonly href: string;
  /** Icône lucide-react (nom exporté, résolu dans PixelNav). */
  readonly icon:
    | "RefreshCw"
    | "Wand2"
    | "Minimize2"
    | "Maximize2"
    | "Crop"
    | "Scissors"
    | "SlidersHorizontal"
    | "Star"
    | "Image"
    | "Palette"
    | "Search"
    | "FileCode";
  /** Faux tant que la page n'existe pas (404 attendu). */
  readonly available: boolean;
};

export type PixelForgeFamily = {
  /** Slug de famille stable. */
  readonly id: "convert" | "optimize" | "edit" | "generate" | "analyze";
  /** Numéro affiché (01 à 05). */
  readonly index: string;
  /** Titre FR affiché. */
  readonly label: string;
  /** Description courte FR. */
  readonly description: string;
  /** Hub de la famille. */
  readonly href: string;
  /** Outils de la famille. */
  readonly tools: readonly PixelForgeTool[];
};

export const pixelForgeFamilies: readonly PixelForgeFamily[] = [
  {
    id: "convert",
    index: "01",
    label: "Convertir",
    description: "Changer le format des images.",
    href: "/pixel/convert",
    tools: [
      {
        id: "converter",
        label: "Convertisseur universel",
        description:
          "JPEG, PNG, WebP, AVIF, TIFF, GIF et SVG en entrée. Conversion vers les formats de sortie pris en charge par le moteur.",
        href: "/pixel/convert",
        icon: "RefreshCw",
        available: true,
      },
    ],
  },
  {
    id: "optimize",
    index: "02",
    label: "Optimiser",
    description: "Réduire le poids et adapter les dimensions.",
    href: "/pixel/optimize",
    tools: [
      {
        id: "optimizer",
        label: "Optimiseur intelligent",
        description:
          "Optimisation automatique selon un poids cible, une qualité souhaitée ou un niveau de compression.",
        href: "/pixel/optimize",
        icon: "Wand2",
        available: true,
      },
      {
        id: "compressor",
        label: "Compresseur JPEG / PNG",
        description:
          "Compression sans changement de format, avec contrôle de qualité et de palette PNG.",
        href: "/pixel/optimize/compress",
        icon: "Minimize2",
        available: true,
      },
      {
        id: "resize",
        label: "Redimensionnement par lot",
        description:
          "Dimensions fixes, largeur ou hauteur maximale, proportions et génération de plusieurs variantes.",
        href: "/pixel/optimize/resize",
        icon: "Maximize2",
        available: true,
      },
      {
        id: "smart-crop",
        label: "Recadrage intelligent",
        description:
          "Recadrage automatique selon un ratio avec détection d'entropie (heuristique, pas de reconnaissance sémantique).",
        href: "/pixel/optimize/smart-crop",
        icon: "Crop",
        available: true,
      },
    ],
  },
  {
    id: "edit",
    index: "03",
    label: "Éditer",
    description: "Modifier l'apparence et la composition.",
    href: "/pixel/edit",
    tools: [
      {
        id: "crop-editor",
        label: "Éditeur de recadrage",
        description:
          "Recadrage manuel, rotation, retournement, ratios prédéfinis et cadrage libre.",
        href: "/pixel/edit/crop",
        icon: "Crop",
        available: true,
      },
      {
        id: "background-removal",
        label: "Suppression d'arrière-plan",
        description:
          "Détourage sur fond uni, pipette, tolérance, lissage des contours et gomme manuelle.",
        href: "/pixel/edit/background",
        icon: "Scissors",
        available: true,
      },
      {
        id: "image-editor",
        label: "Retouche et filigrane",
        description:
          "Réglages colorimétriques, luminosité, contraste, saturation, teinte, netteté, flou, niveaux de gris et ajout de watermark.",
        href: "/pixel/edit/retouch",
        icon: "SlidersHorizontal",
        available: true,
      },
    ],
  },
  {
    id: "generate",
    index: "04",
    label: "Générer",
    description: "Créer des ressources graphiques et techniques.",
    href: "/pixel/generate",
    tools: [
      {
        id: "favicon-generator",
        label: "Générateur de favicons",
        description:
          "ICO multi-résolutions, PNG, Apple Touch Icon, Android Chrome et manifest.",
        href: "/pixel/generate/favicon",
        icon: "Star",
        available: true,
      },
      {
        id: "placeholder-generator",
        label: "Générateur de placeholders",
        description:
          "LQIP, BlurHash, SVG flouté et Base64 pour les applications web.",
        href: "/pixel/generate/placeholder",
        icon: "Image",
        available: true,
      },
      {
        id: "color-palette",
        label: "Extracteur de palettes",
        description:
          "Extraction des couleurs dominantes et export CSS, Tailwind et JSON.",
        href: "/pixel/generate/palette",
        icon: "Palette",
        available: true,
      },
    ],
  },
  {
    id: "analyze",
    index: "05",
    label: "Analyser",
    description:
      "Comprendre les propriétés et les informations d'une image.",
    href: "/pixel/analyze",
    tools: [
      {
        id: "analysis",
        label: "Analyse des images",
        description:
          "Dimensions, format, poids, résolution, transparence, espace colorimétrique.",
        href: "/pixel/analyze",
        icon: "Search",
        available: false,
      },
      {
        id: "metadata",
        label: "Métadonnées EXIF",
        description:
          "GPS, appareil, date, profils ICC. Suppression des métadonnées pour la vie privée.",
        href: "/pixel/analyze/metadata",
        icon: "FileCode",
        available: false,
      },
    ],
  },
] as const;

/**
 * Tableau racine consommé par PixelNav.
 * Alias stable de `pixelForgeFamilies` pour éviter un couplage sémantique
 * trop fort avec le nom du fichier.
 */
export const pixelForgeNav = pixelForgeFamilies;