/*
path :           app/pixel/dev/page.tsx
tag :            ["dev", "dependencies", "packages", "installation", "pixel-forge", "guide", "audit"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de référence des bibliothèques à installer pour
                 PixelForge. Liste exhaustive et groupée :
                 - Groupe A — Pipeline de traitement (sharp, file-type,
                   png-to-ico, archiver, p-limit) : INDISPENSABLES.
                 - Groupe B — Validation (zod) : déjà présent.
                 - Groupe C — UI (Base UI, dnd-kit, lucide, sonner, RHF,
                   motion) : déjà présent.
                 - Groupe D — Configuration Next.js (bodySizeLimit,
                   serverExternalPackages, maxDuration).

                 ⚠️ VITEST SUPPRIMÉ : la section Tests (dev uniquement)
                 a été retirée. Décision produit : PixelForge est livré
                 sans suite de tests unitaires dans cette itération.
                 Le plan d'installation passe de 4 à 3 étapes.

                 ⚠️ to-ico → png-to-ico : to-ico (2017, obsolète) a été
                 remplacé par png-to-ico (maintenu, 0 vulnérabilité
                 connue, 341k téléchargements/semaine). L'API est
                 légèrement différente (prend des Buffers PNG, pas des
                 chemins), mais le résultat est identique.
                 Voir la note de remplacement dans la carte du package.

                 Pour chaque package : nom, version, poids, feature(s)
                 débloquée(s), task parent (backlog scrum-business.json).
                 Un tableau croisé "Features × Dépendances" permet de
                 voir en un coup d'œil quelles US sont bloquées par
                 quels packages. Un plan d'installation ordonné en 3
                 étapes donne les commandes npm i prêtes à copier.

                 ⚠️ PAGE PUBLIQUE, comme /genesis/cmd. Aucune session
                 requise, aucun accès DB. Server Component pur.
                 Pour la rendre privée plus tard : ajouter une garde
                 requirePlatformRole(["dev", "superAdmin"]) dans un
                 composant async wrappé sous Suspense (pattern
                 app/super-admin/user-manager/page.tsx).

                 ⚠️ SUPPRIMABLE EN PROD : cette page n'est référencée
                 par aucune nav par défaut. Si PixelForge entre en
                 production et que tu veux la retirer, supprime le
                 fichier app/dev/page.tsx et le dossier app/dev/.
                 Aucune autre dépendance du projet n'y fait référence.

                 ⚠️ NOTE FINALE — PACKAGES ORPHELINS : la page liste
                 discrètement en fin de contenu les packages présents
                 dans package.json mais non utilisés par PixelForge
                 ni par aucun autre module du projet (ex.
                 @imgly/background-removal). Sert d'audit léger sans
                 encombrer l'essentiel.

                 ⚠️ CHARTE PIXELFORGE : tokens pf-*, font-mono pour
                 les versions et commandes, bandes dégradées par
                 groupe, glassmorphism sur les cartes, glow subtils.
                 Boutons Copier via <CodeBlockCopyButton />.

flow:            Server Component sync → wrapper min-h-svh →
                 Hero (badge, titre gradient, tagline, 2 compteurs)
                 → section "Installation rapide" (CodeBlock avec
                 séquence npm i complète)
                 → 4 sections "Groupe A..D" (cartes + tableaux)
                 → section "Features × Dépendances" (tableau croisé)
                 → section "Configuration Next.js" (CodeBlock)
                 → section "Plan d'installation" (3 étapes numérotées)
                 → note finale packages orphelins.
                 Aucun état, aucun effet, aucun fetch.

ecosystem:       Dev = [
                   "@/app/dev/page.tsx",
                 ]

relatedFiles:    ["@/components/ui/card.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/code-block.tsx",
                  "@/app/pixel/page.tsx",
                  "@/app/genesis/cmd/page.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/card",
                  "@/components/ui/code-block"]

exports:         ["default DevPage", "metadata"]

useBy:           []

userStories:     ["*en tant que développeur je veux savoir quels packages installer pour PixelForge",
                  "*en tant que développeur je veux voir quelles features sont bloquées par quels packages",
                  "*en tant que développeur je veux un audit des packages orphelins"]

status:          wip
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
  title: "Dépendances PixelForge — Guide d'installation",
  description:
    "Liste exhaustive des bibliothèques à installer pour PixelForge, groupées par criticité, avec features débloquées et plan d'installation ordonné.",
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
      "Le noyau de PixelForge. Sans ces packages, aucune conversion, optimisation, génération ICO ou détourage n'est possible. sharp embarque libvips (binaire natif précompilé ~30 Mo).",
    icon: Zap,
    accent: "var(--pf-primary)",
    packages: [
      {
        name: "sharp",
        version: "^0.34.0",
        weight: "~30 Mo (binaire libvips)",
        status: "to-install",
        features: [
          "US1 · Convertir en WebP",
          "US2 · Optimiser un lot",
          "US4 · Détourer un fond uni",
          "US6 · SSIM (slider avant/après)",
        ],
        tasks: ["T1", "T6", "T7", "T11"],
      },
      {
        name: "file-type",
        version: "^21.0.0",
        weight: "~80 Ko (pure JS)",
        status: "to-install",
        features: [
          "US1 · Sécurité MIME",
          "US3 · Validation ICO",
          "US4 · Validation détourage",
        ],
        tasks: ["T4"],
      },
      {
        name: "png-to-ico",
        version: "^3.0.2",
        weight: "~50 Ko (pure JS)",
        status: "to-install",
        features: ["US3 · Générer un .ico"],
        tasks: ["T5"],
        note: "Remplace to-ico (2017, obsolète, 24 vulnérabilités dont 5 critiques). png-to-ico : 0 vulnérabilité connue, 341k téléchargements/semaine, API moderne (prend des Buffers PNG).",
      },
      {
        name: "archiver",
        version: "^7.0.1",
        weight: "~90 Ko",
        status: "to-install",
        features: ["US2 · Téléchargement ZIP"],
        tasks: ["T8"],
      },
      {
        name: "p-limit",
        version: "^6.2.0",
        weight: "~3 Ko",
        status: "to-install",
        features: ["US2 · Concurrence 4 workers"],
        tasks: ["T9"],
      },
    ],
  },
  {
    id: "validation",
    title: "B · Validation & types",
    description: "Déjà présent dans package.json. Aucune installation requise.",
    icon: Shield,
    accent: "var(--pf-secondary)",
    packages: [
      {
        name: "zod",
        version: "^4.6.7",
        weight: "déjà installé",
        status: "installed",
        features: ["US1 à US6 · Validation des options et schémas"],
        tasks: ["T3"],
      },
    ],
  },
  {
    id: "ui",
    title: "C · UI et composants",
    description:
      "Déjà présents dans package.json. Tous les composants dont PixelForge a besoin existent.",
    icon: Palette,
    accent: "var(--pf-info)",
    packages: [
      {
        name: "@base-ui/react",
        version: "^1.9.0",
        weight: "déjà installé",
        status: "installed",
        features: ["Slider, Dialog, Select, Progress"],
        tasks: ["T11"],
      },
      {
        name: "@dnd-kit/core + sortable + utilities",
        version: "^6.3.1",
        weight: "déjà installé",
        status: "installed",
        features: ["US5 · Drag & drop multi-fichiers"],
        tasks: ["T10"],
      },
      {
        name: "lucide-react",
        version: "^1.58.0",
        weight: "déjà installé",
        status: "installed",
        features: ["Toutes les icônes"],
        tasks: ["T10", "T11", "T12"],
      },
      {
        name: "sonner",
        version: "^2.0.8",
        weight: "déjà installé",
        status: "installed",
        features: ["Toasts d'erreur / succès"],
        tasks: ["T10"],
      },
      {
        name: "react-hook-form + @hookform/resolvers",
        version: "^7.90.0",
        weight: "déjà installé",
        status: "installed",
        features: ["Formulaire des options (PresetSelector)"],
        tasks: ["—"],
      },
      {
        name: "motion",
        version: "^14.3.0",
        weight: "déjà installé",
        status: "installed",
        features: ["Animations de progression"],
        tasks: ["—"],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config — Features × Dépendances                                    */
/* ------------------------------------------------------------------ */

const FEATURE_ROWS: readonly FeatureRow[] = [
  {
    usId: "US1",
    title: "Convertir en WebP",
    packages: [
      { name: "sharp", installed: false },
      { name: "file-type", installed: false },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "US2",
    title: "Optimiser un lot avec seuil",
    packages: [
      { name: "sharp", installed: false },
      { name: "p-limit", installed: false },
      { name: "archiver", installed: false },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "US3",
    title: "Générer un .ico multi-résolutions",
    packages: [
      { name: "sharp", installed: false },
      { name: "png-to-ico", installed: false },
      { name: "file-type", installed: false },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "US4",
    title: "Détourer un fond uni en PNG",
    packages: [
      { name: "sharp", installed: false },
      { name: "file-type", installed: false },
      { name: "zod", installed: true },
    ],
  },
  {
    usId: "US5",
    title: "Déposer plusieurs images (DnD)",
    packages: [
      { name: "@dnd-kit/core", installed: true },
      { name: "@dnd-kit/sortable", installed: true },
      { name: "sonner", installed: true },
    ],
  },
  {
    usId: "US6",
    title: "Comparer avant / après (slider)",
    packages: [
      { name: "sharp", installed: false },
      { name: "@base-ui/react", installed: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config — Plan d'installation (3 étapes, plus de vitest)            */
/* ------------------------------------------------------------------ */

const INSTALL_STEPS: readonly InstallStep[] = [
  {
    step: "1",
    title: "Noyau de traitement",
    command: "npm i sharp file-type && npm i -D @types/sharp",
    description:
      "Le strict minimum pour que US1 et US4 fonctionnent. sharp embarque libvips (~30 Mo).",
  },
  {
    step: "2",
    title: "Traitement par lot",
    command: "npm i archiver p-limit",
    description:
      "Débloque US2 (optimisation par lot + ZIP). p-limit limite à 4 workers simultanés.",
  },
  {
    step: "3",
    title: "Génération ICO",
    command: "npm i png-to-ico",
    description:
      "Débloque US3 (favicons multi-résolutions). png-to-ico assemble les PNG redimensionnés par sharp.",
  },
];

/* ------------------------------------------------------------------ */
/*  Constantes de contenu (blocs de code)                              */
/* ------------------------------------------------------------------ */

const FULL_INSTALL_COMMAND = `# Installation complète (production + types)
npm i sharp file-type png-to-ico archiver p-limit
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
  // libvips (binaire) à l'exécution, png-to-ico et archiver utilisent
  // des modules Node.js purs qui ne doivent pas être bundlés non plus.
  serverExternalPackages: ["sharp", "png-to-ico", "archiver"],
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
    label: "Déjà présent",
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
  const toInstall = group.packages.filter(
    (p) => p.status === "to-install",
  ).length;

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
            {group.packages.length} package
            {group.packages.length > 1 ? "s" : ""}
            {toInstall > 0 && ` · ${toInstall} à installer`}
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
                <p className="rounded-md bg-[var(--pf-warning)]/10 p-2 text-[10px] leading-relaxed text-[var(--pf-warning)]">
                  ⚠️ {pkg.note}
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
  const totalToInstall = PACKAGE_GROUPS.flatMap((g) => g.packages).filter(
    (p) => p.status === "to-install",
  ).length;
  const totalInstalled = PACKAGE_GROUPS.flatMap((g) => g.packages).filter(
    (p) => p.status === "installed",
  ).length;

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
            <Cog className="size-3.5 text-[var(--pf-primary)]" aria-hidden />
            Atelier de développement · Dépendances
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-info)] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Dépendances PixelForge
          </h1>

          <div
            aria-hidden
            className="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)]"
          />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--pf-muted)] sm:text-lg">
            Liste exhaustive des packages à installer pour faire fonctionner les
            6 user stories de PixelForge. Chaque package est rattaché à sa
            feature et à sa task du backlog.
          </p>

          {/* Compteurs */}
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--pf-warning)]/30 bg-[var(--pf-warning)]/5 p-4 text-center backdrop-blur">
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--pf-warning)]">
                {totalToInstall}
              </p>
              <p className="text-[11px] text-[var(--pf-muted)]">
                packages à installer
              </p>
            </div>
            <div className="rounded-xl border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-4 text-center backdrop-blur">
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--pf-success)]">
                {totalInstalled}
              </p>
              <p className="text-[11px] text-[var(--pf-muted)]">
                déjà présents
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
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)]"
            />
            <CardHeader className="flex flex-row items-center gap-3">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pf-primary), color-mix(in oklab, var(--pf-primary) 60%, black))",
                }}
              >
                <Terminal className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base text-[var(--pf-foreground)]">
                  Installation en 2 commandes
                </CardTitle>
                <CardDescription className="text-xs text-[var(--pf-muted)]">
                  Copie-colle dans ton terminal, à la racine du projet.
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
              3 groupes, du plus critique au moins critique.
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
              Features × Dépendances
            </h2>
            <p className="mt-2 text-sm text-[var(--pf-muted)]">
              Pour chaque user story, les packages requis et leur statut.
            </p>
          </header>

          <div className="overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--pf-border)]/60 bg-[var(--pf-surface-hover)]/40">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[var(--pf-foreground)]">
                      US
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--pf-foreground)]">
                      Feature
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
                app/pixel/tools/*/page.tsx (en haut de chaque page outil)
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
              3 étapes, du noyau aux features avancées. Chaque étape débloque un
              sous-ensemble de features.
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
                        "linear-gradient(135deg, var(--pf-primary), var(--pf-secondary))",
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

      {/* ===================== NOTE PACKAGES ORPHELINS =============== */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[var(--pf-info)]/30 bg-[var(--pf-info)]/5 p-5 backdrop-blur-xl">
            <header className="mb-2 flex items-center gap-2">
              <Info className="size-4 text-[var(--pf-info)]" aria-hidden />
              <h2 className="text-sm font-bold text-[var(--pf-foreground)]">
                Audit — packages orphelins
              </h2>
            </header>
            <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
              Les packages suivants sont présents dans{" "}
              <code className="rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs">
                package.json
              </code>{" "}
              mais ne sont utilisés par aucun module du projet (ni PixelForge,
              ni Genesis, ni Scrum). Ils peuvent être retirés pour réduire la
              surface d'attaque et le poids du{" "}
              <code className="rounded bg-[var(--pf-surface-hover)] px-1.5 py-0.5 font-mono text-xs">
                node_modules
              </code>
              .
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-center gap-2 rounded-md bg-[var(--pf-warning)]/10 px-3 py-1.5 text-xs">
                <AlertCircle
                  className="size-3.5 shrink-0 text-[var(--pf-warning)]"
                  aria-hidden
                />
                <code className="font-mono font-semibold text-[var(--pf-foreground)]">
                  @imgly/background-removal
                </code>
                <span className="text-[var(--pf-muted)]">
                  — supprimable (détourage IA non implémenté, chroma-key pur
                  sharp suffit)
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[10px] text-[var(--pf-muted)]/80">
              Commande de nettoyage :{" "}
              <code className="rounded bg-[var(--pf-background)]/60 px-1.5 py-0.5 font-mono">
                npm uninstall @imgly/background-removal
              </code>
            </p>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ============================= */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--pf-border)]/60 bg-gradient-to-br from-[var(--pf-primary)]/10 via-[var(--pf-secondary)]/10 to-[var(--pf-info)]/10 p-8 text-center backdrop-blur-xl">
          <h2 className="bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-info)] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            Prêt à coder PixelForge ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--pf-muted)]">
            Une fois les packages installés et next.config.ts mis à jour, tu
            peux démarrer la task T1 (sharp) puis T3 (validations Zod).
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/pixel"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white shadow-lg shadow-[var(--pf-primary)]/30 hover:brightness-110`}
            >
              Voir PixelForge
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/genesis/cmd"
              className={`${buttonVariants({ variant: "outline" })} border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 backdrop-blur-xl`}
            >
              Commandes CLI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
