/*
path :           app/genesis/cmd/page.tsx
tag :            ["genesis", "cmd", "commands", "page", "stack", "syntax", "showcase"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de référence des commandes CLI utiles de la stack
                 (Next.js, Vercel, GitHub, Prisma) + Design System (couleurs)
                 + Galerie d'icônes Lucide + Galerie de polices. Chaque
                 outil est présenté dans une carte (<StackCard />) qui
                 affiche son icône, sa couleur d'accent et une liste de
                 commandes copiables (bouton Copier avec feedback toast).
                 Quatre sections complètent la page :
                 - <DesignShowcase />   → couleurs chart-1..5
                 - <FontsGenesis />     → 3 polices + aperçu éditable +
                                          copies CSS var / font-family /
                                          import Next.js
                 - <IconesLucid />      → ~74 icônes Lucide copiables
                 Aucune donnée asynchrone, aucune Server Action : page
                 entièrement statique. Les seules interactions sont
                 portées par les Client Components <CommandList />,
                 <FontsGenesis /> et <IconesLucid />. Mobile first : grille
                 1→2 colonnes pour les stacks, tuiles d'icônes en 4→10 cols,
                 zone code scrollable horizontalement.

                 ⚠️ lucide-react >= 1.x n'exporte plus les icônes de marque
                 (Github, X, LinkedIn, Figma…). Le logo GitHub est donc
                 rendu par un SVG inline <GithubIcon />, exactement comme
                 dans @/components/layout/footer/Footer.tsx.

flow:            Server Component → Hero → grille de 4 <StackCard />
                 (une par outil) → <DesignShowcase /> → <FontsGenesis /> →
                 <IconesLucid />. Le tableau STACKS (défini localement)
                 porte les icônes, accents et commandes de chaque outil ;
                 il n'est PAS exporté (config propre à la page).

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/cmd/page.tsx",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/components/cmd/CommandList.tsx",
                   "@/app/genesis/components/cmd/DesignShowcase.tsx",
                   "@/app/genesis/components/cmd/StackCard.tsx",
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/help/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/layout.tsx",
                  "@/app/genesis/components/GenesisNav.tsx",
                  "@/app/genesis/components/cmd/CommandList.tsx",
                  "@/app/genesis/components/cmd/DesignShowcase.tsx",
                  "@/app/genesis/components/cmd/StackCard.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/fonts/FontsGenesis.tsx",
                  "@/components/ui/lucid/IconesLucid.tsx",
                  "@/components/layout/footer/Footer.tsx",
                  "@/components/layout/header/nav/frontWorkSpace.ts"]

imports:         ["lucide-react",
                  "@/app/genesis/components/cmd/CommandList",
                  "@/app/genesis/components/cmd/DesignShowcase",
                  "@/app/genesis/components/cmd/StackCard",
                  "@/components/ui/fonts/FontsGenesis",
                  "@/components/ui/lucid/IconesLucid"]

exports:         ["default CmdPage"]

useBy:           []

userStories:     ["*en tant que développeur je veux copier les commandes CLI de la stack",
                  "*en tant que développeur je veux prévisualiser les polices et copier leurs variables CSS",
                  "*en tant que développeur je veux trouver et copier le nom d'une icône Lucide"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Database, Triangle, Zap } from "lucide-react";

import {
  CommandList,
  type Command,
} from "@/app/genesis/components/cmd/CommandList";
import { DesignShowcase } from "@/app/genesis/components/cmd/DesignShowcase";
import {
  StackCard,
  type StackHeader,
} from "@/app/genesis/components/cmd/StackCard";
import { FontsGenesis } from "@/components/ui/fonts/FontsGenesis";
import { IconesLucid } from "@/components/ui/lucid/IconesLucid";

/* ------------------------------------------------------------------ */
/*  GitHubIcon — SVG inline (lucide-react >= 1.x ne l'exporte plus)   */
/*  Source : copie conforme de @/components/layout/footer/Footer.tsx  */
/* ------------------------------------------------------------------ */

function GithubIcon({
  className,
  "aria-hidden": ariaHidden = true,
}: {
  readonly className?: string;
  readonly "aria-hidden"?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.79 0c2.21-1.5 3.18-1.19 3.18-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.26 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StackConfig extends StackHeader {
  readonly commands: readonly Command[];
}

/* ------------------------------------------------------------------ */
/*  Config — commandes par outil de la stack                          */
/* ------------------------------------------------------------------ */

const STACKS: readonly StackConfig[] = [
  {
    id: "next",
    label: "Next.js",
    tagline: "Le framework",
    description:
      "Créer un projet, lancer le serveur de dev, builder pour la production et linter le code.",
    icon: Zap,
    accent: "chart-1",
    commands: [
      {
        label: "Créer un projet",
        code: "npx create-next-app@latest mon-app",
        description: "Scaffold un nouveau projet Next.js (App Router).",
      },
      {
        label: "Serveur de développement",
        code: "npm run dev",
      },
      {
        label: "Build de production",
        code: "npm run build",
      },
      {
        label: "Démarrer en production",
        code: "npm start",
      },
      {
        label: "Linter",
        code: "npx next lint",
      },
    ],
  },
  {
    id: "vercel",
    label: "Vercel",
    tagline: "Le déploiement",
    description:
      "CLI Vercel : lier le projet, déployer en preview ou en production, récupérer les variables d'environnement.",
    icon: Triangle,
    accent: "chart-2",
    commands: [
      {
        label: "Installer la CLI",
        code: "npm i -g vercel",
      },
      {
        label: "Lier le projet",
        code: "vercel link",
        description: "Associe le dossier courant à un projet Vercel.",
      },
      {
        label: "Déploiement preview",
        code: "vercel",
      },
      {
        label: "Déploiement production",
        code: "vercel --prod",
      },
      {
        label: "Récupérer les env vars",
        code: "vercel env pull .env.local",
      },
      {
        label: "Voir les logs",
        code: "vercel logs <deployment-url>",
      },
    ],
  },
  {
    id: "github",
    label: "GitHub",
    tagline: "Le code",
    description:
      "GitHub CLI : s'authentifier, cloner un dépôt, créer ou checkout une pull request, publier une release.",
    icon: GithubIcon,
    accent: "chart-3",
    commands: [
      {
        label: "S'authentifier",
        code: "gh auth login",
      },
      {
        label: "Cloner un dépôt",
        code: "gh repo clone owner/repo",
      },
      {
        label: "Créer une pull request",
        code: 'gh pr create --title "feat: ma feature" --body "Description"',
      },
      {
        label: "Checkout une PR",
        code: "gh pr checkout 42",
      },
      {
        label: "Créer une release",
        code: "gh release create v1.0.0 --generate-notes",
      },
    ],
  },
  {
    id: "prisma",
    label: "Prisma",
    tagline: "L'ORM",
    description:
      "Initialiser Prisma, générer le client, piloter les migrations, inspecter la base via Prisma Studio.",
    icon: Database,
    accent: "chart-5",
    commands: [
      {
        label: "Initialiser Prisma",
        code: "npx prisma init",
      },
      {
        label: "Générer le client",
        code: "npx prisma generate",
      },
      {
        label: "Créer une migration (dev)",
        code: "npx prisma migrate dev --name add_users",
      },
      {
        label: "Appliquer les migrations (prod)",
        code: "npx prisma migrate deploy",
      },
      {
        label: "Ouvrir Prisma Studio",
        code: "npx prisma studio",
        description: "Interface visuelle pour explorer et éditer la base.",
      },
      {
        label: "Seeder la base",
        code: "npx prisma db seed",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CmdPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-5/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-chart-2/20 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Référence · Commandes
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Commandes CLI de la stack
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Copiez en un clic les commandes utiles pour Next.js, Vercel,
            GitHub et Prisma. Chaque commande est colorée selon le rôle de
            ses tokens (commande, flag, chaîne) avec la couleur d&apos;accent
            de l&apos;outil.
          </p>
        </div>
      </header>

      {/* Stacks — 1 col mobile, 2 cols md+ */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {STACKS.map((stack) => (
          <StackCard key={stack.id} stack={stack}>
            <CommandList commands={stack.commands} accent={stack.accent} />
          </StackCard>
        ))}
      </section>

      {/* Design system — couleurs */}
      <DesignShowcase />

      {/* Galerie de polices */}
      <FontsGenesis
        title="Polices du projet"
        description="Éditez le texte d'aperçu pour prévisualiser chaque police à 4 tailles. Cliquez sur l'icône Copier d'une ligne pour récupérer la CSS variable, la font-family ou la ligne d'import Next.js."
      />

      {/* Galerie d'icônes Lucide */}
      <IconesLucid
        title="Icônes Lucide"
        description="Recherchez une icône et cliquez dessus pour copier son nom PascalCase, prêt à importer (ex. message-square → MessageSquare)."
      />
    </div>
  );
}