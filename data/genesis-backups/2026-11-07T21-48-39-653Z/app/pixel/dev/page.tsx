/*
path:            app/pixel/dev/page.tsx
tag:             ["dev", "dependencies", "packages", "installation",
                  "pixel-forge", "guide", "audit", "status"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de reference des dependances PixelForge — version
                 consolidee 3.0 (post-Phase 20). Toutes les dependances
                 sont installees, toutes les phases (0-19) sont livrees.
                 La page liste les packages par groupe, l'etat
                 d'installation, les features qui en dependent, et la
                 configuration Next.js.

                 ⚠️ Etat actuel (Phase 20 terminee) :
                 - Groupe A (pipeline) : INSTALLE
                 - Groupe B (validation) : INSTALLE
                 - Groupe C (UI) : INSTALLE
                 - Groupe D (edition interactive) : INSTALLE
                 - Groupe E (stockage temporaire) : INSTALLE
                 - Groupe F (placeholder) : INSTALLE
                 - Groupe G (config Next.js) : APPLIQUE

                 ⚠️ Audit orphelins : aucun. @imgly/background-removal
                 a ete retire (detourage IA non implemente, chroma-key
                 pur sharp suffit).

                 Page publique (comme /genesis/cmd). Aucune session,
                 aucun acces DB. Server Component pur.

flow:            Server Component sync -> wrapper min-h-svh ->
                 Hero (badge "Complet", titre gradient, compteurs)
                 -> section "Installation rapide" (CodeBlock)
                 -> sections "Groupe A..G" (cartes)
                 -> section "Features x Dependances"
                 -> section "Configuration Next.js"
                 -> section "Plan d'installation" (4 etapes)
                 -> note finale (aucun orphelin)
                 -> CTA final.

ecosystem:       Dev = [
                   "@/app/pixel/dev/page.tsx",
                 ]
relatedFiles:    ["@/components/ui/card.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/code-block.tsx",
                  "@/app/pixel/page.tsx",
                  "@/app/genesis/cmd/page.tsx",
                  "@/next.config.ts"]
imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/card",
                  "@/components/ui/code-block"]
exports:         ["default DevPage", "metadata"]
useBy:           []

userStories:     ["*en tant que developpeur je veux voir l'etat des dependances PixelForge",
                  "*en tant que developpeur je veux voir quelles features sont disponibles",
                  "*en tant que developpeur je veux verifier que tout est installe"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cog,
  Download,
  Info,
  Palette,
  Shield,
  Terminal,
  XCircle,
  Zap,
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
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Dépendances PixelForge — État final (v3)",
  description:
    "État final des dépendances PixelForge : tous les packages installés, toutes les phases livrées. Audit complet, configuration Next.js et plan d'installation.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PackageEntry {
  readonly name: string;
  readonly version: string;
  readonly weight: string;
  readonly status: "to-install" | "installed";
  readonly features: readonly string[];
  readonly tasks: readonly string[];
  readonly note?: string;
}

interface PackageGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly packages: readonly PackageEntry[];
}

interface FeatureRow {
  readonly usId: string;
  readonly title: string;
  readonly packages: readonly {
    readonly name: string;
    readonly installed: boolean;
  }[];
}

interface InstallStep {
  readonly step: string;
  readonly title: string;
  readonly command: string;
  readonly description: string;
}

/* ------------------------------------------------------------------ */
/*  Config — Groupes de packages                                       */
/* ------------------------------------------------------------------ */

const PACKAGE_GROUPS: readonly PackageGroup[] = [
  {
    id: "pipeline",
    title: "A · Pipeline de traitement",
    description:
      "Le noyau de PixelForge. Sans ces packages, aucune conversion, optimisation, génération ICO ou détourage n'est possible. sharp embarque libvips (~30 Mo).",
    icon: Zap,
    accent: "var(--pf-primary)",
    packages: [
      {
        name: "sharp",
        version: "^0.34.0",
        weight: "~30 Mo (binaire libvips)",
        status: "installed",
        features: [
          "Outil 01 · Convertir",
          "Outil 02 · Optimiser",
          "Outil 03 · Compresser",
          "Outil 04 · Resize",
          "Outil 05 · Smart crop",
          "Outil 06 · Recadrer",
          "Outil 07 · Détourer",
          "Outil 08 · Retoucher",
          "Outil 09 · Favicons",
          "Outil 10 · Placeholders (LQIP/SVG)",
          "Outil 11 · Palette (stats)",
          "Outil 12 · Métadonnées",
        ],
        tasks: ["T1", "T6", "T7", "T11", "T13"],
      },
      {
        name: "file-type",
        version: "^21.0.0",
        weight: "~80 Ko (pure JS)",
        status: "installed",
        features: [
          "Sécurité MIME (tous les outils)",
          "Validation ICO",
          "Validation détourage",
        ],
        tasks: ["T4"],
      },
      {
        name: "png-to-ico",
        version: "^3.0.2",
        weight: "~50 Ko (pure JS)",
        status: "installed",
        features: ["Outil 09 · Générer un .ico"],
        tasks: ["T5"],
        note: "Remplace to-ico (2017, obsolète). 0 vulnérabilité connue, 341k téléchargements/semaine, API moderne.",
      },
      {
        name: "archiver",
        version: "^7.0.1",
        weight: "~90 Ko",
        status: "installed",
        features: ["Export ZIP (tous les outils batch)"],
        tasks: ["T8"],
      },
      {
        name: "p-limit",
        version: "^6.2.0",
        weight: "~3 Ko",
        status: "installed",
        features: ["Concurrence 4 workers max"],
        tasks: ["T9"],
      },
    ],
  },
  {
    id: "validation",
    title: "B · Validation & types",
    description: "Tous installés. Schémas Zod + types TypeScript partagés.",
    icon: Shield,
    accent: "var(--pf-secondary)",
    packages: [
      {
        name: "zod",
        version: "^4.6.7",
        weight: "installé",
        status: "installed",
        features: ["Validation des options et schémas (tous les outils)"],
        tasks: ["T3"],
      },
    ],
  },
  {
    id: "ui",
    title: "C · UI et composants",
    description:
      "Tous installés. Tous les composants dont PixelForge a besoin existent.",
    icon: Palette,
    accent: "var(--pf-info)",
    packages: [
      {
        name: "@base-ui/react",
        version: "^1.9.0",
        weight: "installé",
        status: "installed",
        features: ["Slider, Dialog, Select, Progress"],
        tasks: ["T11"],
      },
      {
        name: "@dnd-kit/core + sortable + utilities",
        version: "^6.3.1",
        weight: "installé",
        status: "installed",
        features: ["Drag & drop multi-fichiers"],
        tasks: ["T10"],
      },
      {
        name: "lucide-react",
        version: "^1.58.0",
        weight: "installé",
        status: "installed",
        features: ["Toutes les icônes"],
        tasks: ["T10", "T11", "T12"],
      },
      {
        name: "sonner",
        version: "^2.0.8",
        weight: "installé",
        status: "installed",
        features: ["Toasts d'erreur / succès"],
        tasks: ["T10"],
      },
      {
        name: "react-hook-form + @hookform/resolvers",
        version: "^7.90.0",
        weight: "installé",
        status: "installed",
        features: ["Formulaires d'options"],
        tasks: ["—"],
      },
      {
        name: "motion",
        version: "^14.3.0",
        weight: "installé",
        status: "installed",
        features: ["Animations de progression"],
        tasks: ["—"],
      },
    ],
  },
  {
    id: "edit-interactive",
    title: "D · Édition interactive",
    description: "Installé. Bibliothèque canvas pour l'éditeur de recadrage manuel (outil 06).",
    icon: Palette,
    accent: "var(--pf-warning)",
    packages: [
      {
        name: "react-easy-crop",
        version: "^5.5.0",
        weight: "~30 Ko",
        status: "installed",
        features: ["Outil 06 · Recadrer manuellement"],
        tasks: ["T14"],
        note: "Choisi à la place de Konva (~180 Ko) : le périmètre est le recadrage (pas la peinture pixel). Fournit drag, zoom, rotation, ratios prédéfinis et accessibilité clavier.",
      },
    ],
  },
  {
    id: "storage-temp",
    title: "E · Stockage temporaire",
    description:
      "Installé. Obligatoire sur Vercel serverless pour les traitements par lot (> 1 fichier).",
    icon: Download,
    accent: "var(--pf-success)",
    packages: [
      {
        name: "@vercel/blob",
        version: "^2.0.0",
        weight: "~40 Ko",
        status: "installed",
        features: [
          "Traitement par lot > 1 fichier",
          "Retour URL temporaire (TTL 1h)",
          "Nettoyage lazy à chaque requête",
        ],
        tasks: ["T15"],
        note: "Requiert la variable d'env BLOB_READ_WRITE_TOKEN (voir lib/env.ts). Quotas Hobby : 1 Go stockage / 100 Go bande passante.",
      },
    ],
  },
  {
    id: "placeholder",
    title: "F · Placeholder (blurhash)",
    description: "Installé. Génération de placeholders BlurHash (outil 10).",
    icon: Palette,
    accent: "var(--pf-secondary)",
    packages: [
      {
        name: "blurhash",
        version: "^2.0.5",
        weight: "~8 Ko",
        status: "installed",
        features: ["Outil 10 · BlurHash"],
        tasks: ["T16"],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config — Features × Dépendances                                    */
/* ------------------------------------------------------------------ */

const FEATURE_ROWS: readonly FeatureRow[] = [
  {
    usId: "Outil 01",
    title: "Convertir un format",
    packages: [
      { name: "sharp", installed: true },
      { name: "file-type", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 02",
    title: "Optimiser un lot avec seuil",
    packages: [
      { name: "sharp", installed: true },
      { name: "p-limit", installed: true },
      { name: "archiver", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 03",
    title: "Compresser JPEG/PNG",
    packages: [
      { name: "sharp", installed: true },
      { name: "file-type", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 04",
    title: "Redimensionner un lot",
    packages: [
      { name: "sharp", installed: true },
      { name: "p-limit", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 05",
    title: "Smart crop (attention/entropy)",
    packages: [
      { name: "sharp", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 06",
    title: "Recadrer manuellement",
    packages: [
      { name: "sharp", installed: true },
      { name: "react-easy-crop", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 07",
    title: "Détourer un fond uni",
    packages: [
      { name: "sharp", installed: true },
      { name: "file-type", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 08",
    title: "Retoucher + filigrane",
    packages: [
      { name: "sharp", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 09",
    title: "Générer des favicons",
    packages: [
      { name: "sharp", installed: true },
      { name: "png-to-ico", installed: true },
      { name: "archiver", installed: true },
      { name: "file-type", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 10",
    title: "Générer des placeholders",
    packages: [
      { name: "sharp", installed: true },
      { name: "blurhash", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 11",
    title: "Extraire des palettes",
    packages: [
      { name: "sharp", installed: true },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "Outil 12",
    title: "Analyser les métadonnées",
    packages: [
      { name: "sharp", installed: true },
      { name: "zod", installed: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config — Plan d'installation (4 étapes)                            */
/* ------------------------------------------------------------------ */

const INSTALL_STEPS: readonly InstallStep[] = [
  {
    step: "1",
    title: "Noyau de traitement",
    command: "npm i sharp file-type && npm i -D @types/sharp",
    description:
      "Le strict minimum pour que les outils 01, 03, 05, 07, 08, 11, 12 fonctionnent. sharp embarque libvips (~30 Mo).",
  },
  {
    step: "2",
    title: "Traitement par lot + ICO",
    command: "npm i archiver p-limit png-to-ico",
    description:
      "Débloque les outils 02, 04, 09 (batch + ZIP + ICO). p-limit borne à 4 workers.",
  },
  {
    step: "3",
    title: "Édition interactive + placeholders",
    command: "npm i react-easy-crop blurhash",
    description:
      "Débloque l'outil 06 (recadrage manuel via react-easy-crop) et l'outil 10 (BlurHash).",
  },
  {
    step: "4",
    title: "Stockage temporaire (Vercel)",
    command: "npm i @vercel/blob",
    description:
      "Obligatoire sur Vercel serverless pour les traitements batch > 1 fichier. Configurer BLOB_READ_WRITE_TOKEN dans .env.local et Vercel.",
  },
];

/* ------------------------------------------------------------------ */
/*  Constantes de contenu (blocs de code)                              */
/* ------------------------------------------------------------------ */

const FULL_INSTALL_COMMAND = `# Installation complète (production + types)
npm i sharp file-type png-to-ico archiver p-limit react-easy-crop blurhash @vercel/blob
npm i -D @types/sharp`;

const NEXT_CONFIG_SNIPPET = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Augmente la limite de body des Server Actions de 1 Mo à 25 Mo
  // (nécessaire pour les uploads d'images PixelForge).
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },

  // Empêche Turbopack de bundler les modules natifs. sharp charge
  // libvips (binaire) à l'exécution ; png-to-ico et archiver utilisent
  // des modules Node.js purs qui ne doivent pas être bundlés non plus.
  serverExternalPackages: [
    "sharp",
    "png-to-ico",
    "archiver",
    "blurhash",
  ],
};

export default nextConfig;`;

const MAX_DURATION_SNIPPET = `// À ajouter en haut de chaque page /pixel/tools/*/page.tsx
// pour autoriser les traitements longs sur Vercel.
export const maxDuration = 60; // secondes`;

/* ------------------------------------------------------------------ */
/*  Sous-composants                                                    */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG = {
  "to-install": {
    label: "À installer",
    icon: Download,
    className: "bg-[var(--pf-warning)]/15 text-[var(--pf-warning)]",
  },
  installed: {
    label: "Installé",
    icon: CheckCircle2,
    className: "bg-[var(--pf-success)]/15 text-[var(--pf-success)]",
  },
} as const;

function StatusBadge({ status }: { readonly status: PackageEntry["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      <Icon className="size-3" aria-hidden />
      {config.label}
    </span>
  );
}

function PackageGroupCard({ group }: { readonly group: PackageGroup }) {
  const Icon = group.icon;
  const accent = group.accent;
  const installed = group.packages.filter(
    (p) => p.status === "installed",
  ).length;
  const total = group.packages.length;
  const allInstalled = installed === total;

  return (
    <Card
      className="relative h-full overflow-hidden border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl"
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
            {group.title}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-[var(--pf-muted)]">
            {total} package{total > 1 ? "s" : ""}
            {allInstalled ? (
              <span className="ml-1 inline-flex items-center gap-1 text-[var(--pf-success)]">
                <CheckCircle2 className="size-3" aria-hidden />
                tous installés
              </span>
            ) : (
              <span className="ml-1 inline-flex items-center gap-1 text-[var(--pf-warning)]">
                <AlertCircle className="size-3" aria-hidden />
                {installed}/{total} installés
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
          {group.description}
        </p>
        <ul className="space-y-2">
          {group.packages.map((pkg) => (
            <li
              key={pkg.name}
              className="space-y-1 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 p-3 backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-[var(--pf-foreground)]">
                  {pkg.name}
                </code>
                <span className="font-mono text-[10px] tabular-nums text-[var(--pf-muted)]">
                  {pkg.version}
                </span>
                <StatusBadge status={pkg.status} />
              </div>
              <p className="font-mono text-[10px] text-[var(--pf-muted)]/80">
                Poids : {pkg.weight}
              </p>
              <div className="flex flex-wrap gap-1">
                {pkg.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex rounded-full bg-[var(--pf-primary)]/10 px-1.5 py-0.5 text-[10px] text-[var(--pf-primary)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
              {pkg.note && (
                <p className="rounded-md bg-[var(--pf-info)]/10 p-2 text-[10px] leading-relaxed text-[var(--pf-info)]">
                  ℹ️ {pkg.note}
                </p>
              )}
              <p className="text-[10px] text-[var(--pf-muted)]/70">
                Task(s) : {pkg.tasks.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DevPage() {
  const allPackages = PACKAGE_GROUPS.flatMap((g) => g.packages);
  const totalInstalled = allPackages.filter(
    (p) => p.status === "installed",
  ).length;
  const totalToInstall = allPackages.filter(
    (p) => p.status === "to-install",
  ).length;

  return (
    <div className="min-h-svh bg-gradient-to-b from-[var(--pf-background)] via-[var(--pf-background)] to-[var(--pf-surface)]/30">
      {/* ===================== HERO ================================== */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[var(--pf-success)]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-16 size-96 rounded-full bg-[var(--pf-info)]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--pf-success)]/40 bg-[var(--pf-success)]/10 px-3 py-1 text-xs font-medium text-[var(--pf-success)] backdrop-blur-xl">
            <CheckCircle2 className="size-3.5" aria-hidden />
            État final · Phase 20 terminée
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-[var(--pf-success)] via-[var(--pf-primary)] to-[var(--pf-info)] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Dépendances PixelForge
          </h1>

          <div
            aria-hidden
            className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--pf-success)] via-[var(--pf-primary)] to-[var(--pf-info)]"
          />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--pf-muted)] sm:text-lg">
            <strong className="text-[var(--pf-foreground)]">
              Tous les packages sont installés.
            </strong>{" "}
            Toutes les phases (0-19) sont livrées. PixelForge est prêt à être
            déployé en production.
          </p>

          {/* Compteurs */}
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-4 text-center backdrop-blur">
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--pf-success)]">
                {totalInstalled}
              </p>
              <p className="text-[11px] text-[var(--pf-muted)]">
                packages installés
              </p>
            </div>
            <div className="rounded-xl border border-[var(--pf-info)]/30 bg-[var(--pf-info)]/5 p-4 text-center backdrop-blur">
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--pf-info)]">
                {totalToInstall}
              </p>
              <p className="text-[11px] text-[var(--pf-muted)]">
                packages restants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INSTALLATION RAPIDE =================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-success)] via-[var(--pf-primary)] to-[var(--pf-info)]"
            />
            <CardHeader className="flex flex-row items-center gap-3">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pf-success), color-mix(in oklab, var(--pf-success) 60%, black))",
                }}
              >
                <Terminal className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base text-[var(--pf-foreground)]">
                  Installation complète (déjà appliquée)
                </CardTitle>
                <CardDescription className="text-xs text-[var(--pf-muted)]">
                  Séquence npm i complète. Toutes les dépendances sont déjà
                  installées dans ton projet.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock>
                <CodeBlockHeader>
                  <CodeBlockTitle>terminal</CodeBlockTitle>
                  <CodeBlockActions>
                    <CodeBlockCopyButton value={FULL_INSTALL_COMMAND} />
                  </CodeBlockActions>
                </CodeBlockHeader>
                <CodeBlockContent>{FULL_INSTALL_COMMAND}</CodeBlockContent>
              </CodeBlock>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================== GROUPES DE PACKAGES =================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              Détail par groupe
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              6 groupes, tous installés. Aucune dépendance manquante.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PACKAGE_GROUPS.map((group) => (
              <PackageGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES × DÉPENDANCES ================ */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              Outils × Dépendances
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              12 outils, tous opérationnels. Statut des packages par outil.
            </p>
          </header>

          <div className="overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--pf-border)]/60 bg-[var(--pf-surface-hover)]/40">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[var(--pf-foreground)]">
                      Outil
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--pf-foreground)]">
                      Fonction
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--pf-foreground)]">
                      Dépendances
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row) => {
                    const blocked = row.packages.some((p) => !p.installed);
                    return (
                      <tr
                        key={row.usId}
                        className="border-b border-[var(--pf-border)]/40 last:border-0"
                      >
                        <td className="px-4 py-3 align-top font-mono text-xs font-semibold text-[var(--pf-primary)]">
                          {row.usId}
                        </td>
                        <td className="px-4 py-3 align-top text-[var(--pf-foreground)]">
                          {row.title}
                          {!blocked && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--pf-success)]/15 px-1.5 py-0.5 text-[10px] text-[var(--pf-success)]">
                              <CheckCircle2 className="size-3" aria-hidden />
                              prêt
                            </span>
                          )}
                          {blocked && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--pf-warning)]/15 px-1.5 py-0.5 text-[10px] text-[var(--pf-warning)]">
                              <AlertCircle className="size-3" aria-hidden />
                              bloquée
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {row.packages.map((pkg) => (
                              <span
                                key={pkg.name}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                                  pkg.installed
                                    ? "bg-[var(--pf-success)]/15 text-[var(--pf-success)]"
                                    : "bg-[var(--pf-warning)]/15 text-[var(--pf-warning)]"
                                }`}
                              >
                                {pkg.installed ? (
                                  <CheckCircle2
                                    className="size-3"
                                    aria-hidden
                                  />
                                ) : (
                                  <XCircle className="size-3" aria-hidden />
                                )}
                                {pkg.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONFIG NEXT.JS ======================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <header className="mb-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              Configuration Next.js
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              À ajouter dans{" "}
              <code className="rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs">
                next.config.ts
              </code>{" "}
              — sinon les uploads échouent et les modules natifs cassent le
              build.
            </p>
          </header>

          <CodeBlock>
            <CodeBlockHeader>
              <CodeBlockTitle>next.config.ts</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={NEXT_CONFIG_SNIPPET} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent>{NEXT_CONFIG_SNIPPET}</CodeBlockContent>
          </CodeBlock>

          <CodeBlock>
            <CodeBlockHeader>
              <CodeBlockTitle>
                app/pixel/*/page.tsx (en haut de chaque page outil)
              </CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={MAX_DURATION_SNIPPET} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent>{MAX_DURATION_SNIPPET}</CodeBlockContent>
          </CodeBlock>
        </div>
      </section>

      {/* ===================== PLAN D'INSTALLATION =================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)] sm:text-3xl">
              Plan d&apos;installation ordonné
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              4 étapes, du noyau aux features avancées. Toutes déjà appliquées.
            </p>
          </header>

          <ol className="space-y-4">
            {INSTALL_STEPS.map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pf-success), var(--pf-primary))",
                    }}
                  >
                    {s.step}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-base font-bold text-[var(--pf-foreground)]">
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--pf-muted)]">
                      {s.description}
                    </p>
                    <CodeBlock size="sm">
                      <CodeBlockHeader>
                        <CodeBlockTitle>terminal</CodeBlockTitle>
                        <CodeBlockActions>
                          <CodeBlockCopyButton value={s.command} />
                        </CodeBlockActions>
                      </CodeBlockHeader>
                      <CodeBlockContent>{s.command}</CodeBlockContent>
                    </CodeBlock>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===================== AUDIT PACKAGES ORPHELINS =============== */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-5 backdrop-blur-xl">
            <header className="mb-2 flex items-center gap-2">
              <CheckCircle2
                className="size-4 text-[var(--pf-success)]"
                aria-hidden
              />
              <h2 className="text-sm font-bold text-[var(--pf-foreground)]">
                Audit — aucun package orphelin
              </h2>
            </header>
            <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
              Tous les packages listés dans{" "}
              <code className="rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs">
                package.json
              </code>{" "}
              sont utilisés par au moins un module du projet. Aucun package
              orphelin à retirer.
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-center gap-2 rounded-md bg-[var(--pf-success)]/10 px-3 py-1.5 text-xs">
                <CheckCircle2
                  className="size-3.5 shrink-0 text-[var(--pf-success)]"
                  aria-hidden
                />
                <code className="font-mono font-semibold text-[var(--pf-foreground)]">
                  @imgly/background-removal
                </code>
                <span className="text-[var(--pf-muted)]">
                  — retiré (détourage IA non implémenté, chroma-key pur sharp
                  suffit)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ============================= */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--pf-border)]/60 bg-gradient-to-br from-[var(--pf-success)]/10 via-[var(--pf-primary)]/10 to-[var(--pf-info)]/10 p-8 text-center backdrop-blur-xl">
          <h2 className="bg-gradient-to-r from-[var(--pf-success)] via-[var(--pf-primary)] to-[var(--pf-info)] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            PixelForge est prêt
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--pf-muted)]">
            12 outils fonctionnels, toutes les phases livrées, aucun package
            orphelin. Le projet est prêt à être déployé en production.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/pixel"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-success)] via-[var(--pf-primary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-success)]/30 hover:brightness-110`}
            >
              Ouvrir PixelForge
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/pixel/help"
              className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
            >
              Guide utilisateur
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}