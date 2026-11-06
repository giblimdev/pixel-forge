/*
path :           app/page.tsx
tag :            ["home", "page", "landing", "genesis", "scrum", "socle", "ready-for-business-app"]
projectId:       new-genesis
type :           page
generic:         false

role:            Landing publique de Genesis. Pose la promesse du projet :
                 un SOCLE applicatif prêt à recevoir une application métier,
                 équipé de deux ateliers complémentaires :
                 1. SCRUM — l'atelier de conception (flux scrum-business :
                    idées → features → personas → epics → user stories
                    → sprints → tasks).
                 2. GENESIS DEV — l'atelier de développement assisté par IA
                    (SelectFiles, CreateFiles, CopyToIA) avec garde-fous
                    (backups, whitelist d'extensions, refus des fichiers
                    critiques).

                 La page est statique (Server Component pur, aucune donnée
                 dynamique, aucun fetch). Aucune Server Action. Les CTA
                 pointent vers les routes réelles du projet :
                 - /genesis            (hub DEV)
                 - /scrum/scrum-business (conception)
                 - /auth/login         (connexion)
                 - /auth/register      (inscription)
                 - /super-admin/user-manager (si connecté, mais non conditionné
                   ici : la page reste publique et statique).

                 Design aligné sur le design system existant :
                 - palette chart-1..chart-5, dégradés, bandes colorées ;
                 - cartes rounded-2xl, shadows, hover -translate-y-0.5 ;
                 - icônes lucide-react (aucune icône de marque) ;
                 - typographie gradient text-transparent.

                 Remplace l'ancienne landing Miam-miam Listo (livraison,
                 commerces, courier) — supprimée avec le module Miam.

flow:            Server Component pur → rend un wrapper min-h-svh gradient
                 → Hero (badge, titre gradient, sous-titre, 2 CTA) →
                 section "Les deux ateliers" (2 grandes cartes : Scrum
                 et Genesis DEV) → section "Socle prêt" (4 piliers :
                 Auth, RBAC, UI, FS sécurisé) → section "Prochaines
                 étapes" (3 étapes : connecter une app métier, définir
                 les rôles métier, brancher la persistance) → CTA final.
                 Aucun état, aucun effet, aucun fetch.

ecosystem:       Home = [
                   "@/app/page.tsx",
                   "@/app/layout.tsx",
                   "@/components/ui/button.tsx",
                   "@/components/ui/card.tsx",
                   "@/config/roles.ts",
                 ]

relatedFiles:    ["@/app/layout.tsx",
                  "@/app/genesis/page.tsx",
                  "@/app/scrum/scrum-business/page.tsx",
                  "@/app/auth/login/page.tsx",
                  "@/app/auth/register/page.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/card.tsx"]

imports:         ["next", "next/link", "lucide-react",
                  "@/components/ui/button", "@/components/ui/card"]

exports:         ["default HomePage", "metadata"]

useBy:           []

userStories:     ["*en tant que visiteur je veux comprendre ce qu'est Genesis",
                  "*en tant que visiteur je veux savoir que le socle est prêt à recevoir une app métier",
                  "*en tant que visiteur je veux accéder à l'atelier Scrum et à l'atelier DEV",
                  "*en tant que visiteur je veux pouvoir me connecter ou m'inscrire"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ClipboardCopy,
  Database,
  FolderTree,
  KeyRound,
  Layers,
  Lock,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
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
  title: "Genesis — Le socle prêt pour votre application métier",
  description:
    "Genesis est un socle applicatif prêt à recevoir une application métier, équipé d'un atelier de conception Scrum et d'un atelier de développement assisté par IA.",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Pillar {
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly href: string;
  readonly ctaLabel: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly bullets: readonly string[];
}

interface Foundation {
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

interface NextStep {
  readonly step: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
}

/* ------------------------------------------------------------------ */
/*  Config — les deux ateliers                                         */
/* ------------------------------------------------------------------ */

const PILLARS: readonly Pillar[] = [
  {
    title: "Atelier Scrum",
    tagline: "Concevoir",
    description:
      "Structurer la conception d'un projet : idées, features, personas, epics, user stories, sprints et tasks. Un flux complet, du problème à l'incrément livrable.",
    href: "/scrum/scrum-business",
    ctaLabel: "Ouvrir l'atelier Scrum",
    icon: Layers,
    accent: "chart-1",
    bullets: [
      "Flux guidé : idée → feature → persona → epic → US → sprint → task",
      "Board DnD : Epic ↔ US, Task ↔ US, US ↔ Sprint",
      "Vue d'ensemble, Roadmap, Progress et export Global JSON",
    ],
  },
  {
    title: "Atelier Genesis DEV",
    tagline: "Développer",
    description:
      "Développer plus vite avec un assistant IA bien cadré : sélectionner du contexte, copier un prompt propre, injecter les scripts retournés avec garde-fous.",
    href: "/genesis",
    ctaLabel: "Ouvrir l'atelier DEV",
    icon: Wrench,
    accent: "chart-2",
    bullets: [
      "SelectFiles : générer le JSON d'un module à confier à l'IA",
      "CopyToIA : assembler conventions + stack + schéma BDD",
      "CreateFiles : écrire les scripts avec backup automatique",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Config — le socle prêt                                             */
/* ------------------------------------------------------------------ */

const FOUNDATIONS: readonly Foundation[] = [
  {
    title: "Authentification",
    description:
      "Better Auth intégré (email + mot de passe, sessions, routes catch-all). Pages login, register et welcome prêtes à l'emploi.",
    icon: KeyRound,
    accent: "chart-3",
  },
  {
    title: "RBAC plateforme",
    description:
      "Rôles hiérarchiques (visitor < user < admin < dev < superAdmin) avec gardes serveur et helpers partagés. Prêt à recevoir des rôles métier.",
    icon: ShieldCheck,
    accent: "chart-4",
  },
  {
    title: "Design system",
    description:
      "Composants UI (shadcn / Base UI), palette chart-1..chart-5, polices Inter / Fraunces / JetBrains Mono, thème clair / sombre.",
    icon: Palette,
    accent: "chart-5",
  },
  {
    title: "Accès fichiers sécurisé",
    description:
      "Lecture / écriture FS atomique, backups automatiques, whitelist d'extensions, refus des fichiers critiques (.env, next.config.*).",
    icon: Lock,
    accent: "chart-1",
  },
];

/* ------------------------------------------------------------------ */
/*  Config — prochaines étapes                                         */
/* ------------------------------------------------------------------ */

const NEXT_STEPS: readonly NextStep[] = [
  {
    step: "1",
    title: "Connecter votre application métier",
    description:
      "Le socle est prêt : il suffit d'ajouter vos routes, vos modèles de données et vos écrans sous un nouveau préfixe (ex. /app, /studio).",
    icon: Boxes,
    accent: "chart-1",
  },
  {
    step: "2",
    title: "Définir vos rôles métier",
    description:
      "En plus des rôles plateforme, Genesis est prêt à recevoir des rôles contextuels (par organisation, commerce, équipe) via Better Auth + Prisma.",
    icon: Users,
    accent: "chart-2",
  },
  {
    step: "3",
    title: "Brancher la persistance",
    description:
      "Prisma + PostgreSQL (ou SQLite en dev) est déjà câblé. Ajoutez vos modèles, générez les migrations, et vos entités métier sont prêtes.",
    icon: Database,
    accent: "chart-3",
  },
];

/* ------------------------------------------------------------------ */
/*  Composants locaux                                                  */
/* ------------------------------------------------------------------ */

function PillarCard({ pillar }: { readonly pillar: Pillar }) {
  const Icon = pillar.icon;
  const accent = pillar.accent;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      <header className="mb-4 flex items-start gap-3">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${accent})` }}
          >
            {pillar.tagline}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {pillar.title}
          </h3>
        </div>
      </header>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {pillar.description}
      </p>

      <ul className="mb-6 space-y-2 text-sm text-foreground/80">
        {pillar.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span
              aria-hidden
              className="mt-1 shrink-0"
              style={{ color: `var(--${accent})` }}
            >
              •
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <Link
        href={pillar.href}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
        })}
      >
        {pillar.ctaLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

function FoundationCard({ foundation }: { readonly foundation: Foundation }) {
  const Icon = foundation.icon;
  const accent = foundation.accent;

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-60"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />
      <header className="mb-2 flex items-center gap-2.5">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-lg text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {foundation.title}
        </h3>
      </header>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {foundation.description}
      </p>
    </article>
  );
}

function StepCard({ step }: { readonly step: NextStep }) {
  const Icon = step.icon;
  const accent = step.accent;

  return (
    <li
      className="relative flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          {step.step}
        </span>
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {step.title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
      <Icon
        aria-hidden
        className="absolute right-4 top-4 size-5 opacity-20"
        style={{ color: `var(--${accent})` }}
      />
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
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
            Socle applicatif · prêt à recevoir une application métier
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Genesis — le socle prêt pour votre application métier
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Genesis fournit l&apos;infrastructure commune (authentification,
            RBAC, design system, accès fichiers sécurisé) et deux ateliers
            complémentaires : <strong>Scrum</strong> pour concevoir,{" "}
            <strong>Genesis DEV</strong> pour développer plus vite avec
            l&apos;IA. Il ne reste plus qu&apos;à brancher votre métier.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/genesis"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 text-white shadow-lg shadow-chart-1/30 hover:brightness-110`}
            >
              <Wrench className="size-4" aria-hidden />
              Découvrir les ateliers
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "outline" })}
            >
              <KeyRound className="size-4" aria-hidden />
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className={buttonVariants({ variant: "ghost" })}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== LES DEUX ATELIERS ===================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Les deux ateliers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Concevoir avec Scrum, développer avec l&apos;IA. Deux outils
              qui s&apos;enchaînent naturellement.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PILLARS.map((pillar) => (
              <PillarCard key={pillar.title} pillar={pillar} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LE SOCLE PRÊT ========================= */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Un socle déjà prêt
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce qui est déjà en place et qui n&apos;a plus à être réinventé
              quand vous branchez votre métier.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FOUNDATIONS.map((foundation) => (
              <FoundationCard
                key={foundation.title}
                foundation={foundation}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PROCHAINES ÉTAPES ===================== */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Prochaines étapes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trois chantiers pour transformer le socle en application
              métier.
            </p>
          </header>

          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {NEXT_STEPS.map((step) => (
              <StepCard key={step.step} step={step} />
            ))}
          </ol>
        </div>
      </section>

      {/* ===================== CTA FINAL ============================= */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-5/10 p-8 text-center sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Rocket className="size-3.5 text-chart-3" aria-hidden />
            Prêt à démarrer
          </span>

          <h2 className="mt-4 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            Votre métier n&apos;a plus qu&apos;à se brancher
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Authentification, rôles, UI, FS sécurisé : le socle est prêt.
            Créez un compte, explorez les ateliers, puis commencez à ajouter
            vos entités métier.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/auth/register"
              className={`${buttonVariants()} gap-2 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 text-white shadow-lg shadow-chart-1/30 hover:brightness-110`}
            >
              Créer un compte
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/genesis/help"
              className={buttonVariants({ variant: "outline" })}
            >
              <ClipboardCopy className="size-4" aria-hidden />
              Mode d&apos;emploi Genesis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}