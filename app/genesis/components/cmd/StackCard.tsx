/*
path :           app/genesis/components/cmd/StackCard.tsx
tag :            ["genesis", "cmd", "stack", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte d'un outil de la stack (Next.js, Vercel, GitHub,
                 Prisma). Affiche une bande colorée en haut, une icône dans
                 un carré dégradé, la tagline, le titre et la description,
                 puis les children (typiquement une <CommandList />).
                 Server Component pur : aucune interaction, la couleur
                 d'accent est injectée via la variable CSS --accent pour
                 usage inline. Le composant est réutilisable pour toute
                 autre stack future (Postgres, Docker, …) — il n'est pas
                 lié aux 4 outils actuels.

                 ⚠️ Le type `icon` est élargi à
                 React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
                 (et non `LucideIcon`) pour accepter aussi bien les icônes
                 Lucide (Zap, Triangle, Database…) que les SVG inline
                 custom (ex. GithubIcon dans app/genesis/cmd/page.tsx),
                 puisque lucide-react >= 1.x n'exporte plus les icônes de
                 marque. Convention identique à GenesisNav (NavItem.icon)
                 et Footer (SocialIconComponent).

flow:            Reçoit { stack: StackHeader, children } → rend un
                 <article> avec --accent en CSS var → header (icône +
                 tagline + titre) → description → children.

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

relatedFiles:    ["@/app/genesis/cmd/page.tsx",
                  "@/components/layout/footer/Footer.tsx"]

imports:         []

exports:         ["StackCard", "StackCardProps", "StackHeader"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux une carte de présentation pour chaque outil de la stack"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Composant d'icône acceptant aussi bien une icône Lucide qu'un SVG
 * custom. Signature alignée sur GenesisNav.NavItem.icon — les icônes
 * Lucide y sont assignables par contravariance (leurs props sont un
 * sur-ensemble optionnel). Évite de dépendre de `LucideIcon` qui
 * n'est plus valide pour les SVG inline (GithubIcon, XIcon, etc.).
 */
type StackIconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

/**
 * En-tête d'une stack (sans les commandes) — la liste des commandes
 * est fournie séparément via les children (typiquement <CommandList />).
 * Ce découpage permet de réutiliser StackCard pour n'importe quel outil
 * sans dépendre du shape exact des commandes.
 */
export interface StackHeader {
  readonly id: string;
  readonly label: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: StackIconComponent;
  /** Couleur d'accent Tailwind (ex. "chart-1"). */
  readonly accent: string;
}

export interface StackCardProps {
  readonly stack: StackHeader;
  readonly children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function StackCard({ stack, children }: StackCardProps) {
  const Icon = stack.icon;

  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ "--accent": `var(--${stack.accent})` } as React.CSSProperties}
    >
      {/* Bande colorée en haut */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${stack.accent}), transparent)`,
        }}
      />

      {/* En-tête */}
      <header className="flex items-start gap-3 p-5 pb-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${stack.accent}), color-mix(in oklab, var(--${stack.accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${stack.accent})` }}
          >
            {stack.tagline}
          </p>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {stack.label}
          </h2>
        </div>
      </header>

      {/* Description */}
      <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
        {stack.description}
      </p>

      {/* Contenu (CommandList) */}
      <div className="flex-1 px-5 pb-5">{children}</div>
    </article>
  );
}