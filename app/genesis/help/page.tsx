/*
path :           app/genesis/help/page.tsx
tag :            ["genesis", "help", "guide", "documentation", "mode-emploi"]
projectId:       new-genesis
type:            page
generic:         false

role:            Mode d'emploi du module Genesis. Documente les 3 outils
                 (SelectFiles, CreateFiles, CopyToIA) : rôle, prérequis,
                 étapes, format attendu, pièges courants. Sert de point
                 d'entrée pédagogique depuis la nav (lien "Genesis Help").
                 Server Component pur (aucune donnée dynamique, aucun
                 Suspense nécessaire). Le contenu est aligné sur le code
                 réel : ReadFilesPanel / CreateFilesPanel / CopyToIaPanel,
                 parse-script.ts, write-scripts.ts, storage.ts,
                 exclusions, backups, etc.

flow:            Server Component statique → rend hero + rappel du flux en
                 3 étapes + grille comparative des 3 outils + 3 sections
                 détaillées (une par outil) + format attendu par CreateFiles
                 + bonnes pratiques transverses. Chaque section pointe vers
                 l'outil réel via <Link href="/genesis/...">.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
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

relatedFiles:    ["@/app/genesis/page.tsx",
                  "@/app/genesis/read-files/page.tsx",
                  "@/app/genesis/create-files/page.tsx",
                  "@/app/genesis/copy-to-ia/page.tsx",
                  "@/app/genesis/layout.tsx"]

imports:         ["next/link", "lucide-react"]

exports:         ["default GenesisHelpPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux comprendre comment utiliser chaque outil Genesis"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  FilePlus2,
  FolderTree,
  Lightbulb,
  Shield,
  Sparkles,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Tool {
  readonly href: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly whenToUse: readonly string[];
  readonly whenNotToUse: readonly string[];
  readonly prerequisites: readonly string[];
  readonly steps: readonly string[];
  readonly outputs: readonly string[];
  readonly pitfalls: readonly string[];
}

/* ------------------------------------------------------------------ */
/*  Données — alignées sur le code réel                               */
/* ------------------------------------------------------------------ */

const TOOLS: readonly Tool[] = [
  {
    href: "/genesis/read-files",
    title: "SelectFiles",
    tagline: "Lire le projet",
    description:
      "Parcourir l'arborescence, exclure les dossiers techniques et générer un JSON complet du contenu sélectionné — la matière première pour donner du contexte à une IA.",
    icon: FolderTree,
    accent: "chart-2",
    whenToUse: [
      "Donner à une IA le contexte complet d'un module à refactorer",
      "Archiver l'état d'un sous-ensemble de fichiers avant une grosse modification",
      "Inspecter rapidement le contenu de plusieurs fichiers d'un coup",
    ],
    whenNotToUse: [
      "Le projet entier dépasse la fenêtre de contexte de l'IA (préférer une sélection ciblée)",
      "Vous cherchez uniquement les fichiers critiques (CONTRIBUTING, Prisma, package.json) → utiliser CopyToIA",
    ],
    prerequisites: [
      "Aucun. L'outil lit le FS en lecture seule.",
    ],
    steps: [
      "Ouvrir /genesis/read-files : l'arbre complet du projet s'affiche (dossiers repliés, tri dossiers d'abord puis alphabétique).",
      "Configurer les exclusions si besoin via le bouton « Exclusions » : une entrée par ligne, node_modules exclut un dossier, *.png exclut une extension. Les exclusions sont persistées dans data/genesis-readFiles-exclusions.json.",
      "Cocher les fichiers ou dossiers voulus. Cocher un dossier propage la sélection à tous ses descendants. Boutons « Tout cocher » / « Tout décocher » pour aller vite.",
      "Cliquer « Générer le JSON » : le serveur lit chaque fichier sélectionné, skippe les binaires, et ouvre un dialog de résultat.",
      "Dans le dialog, basculer entre vue JSON et vue Markdown, puis Copier (presse-papier) ou Sauvegarder (écrit dans data/genesis-selections/{ISO-timestamp}.json).",
    ],
    outputs: [
      "JSON : { files: [{ path, content }], fileCount, totalSize, skipped }",
      "Markdown : sections ## <path> avec code-block par fichier",
      "Sauvegarde : data/genesis-selections/{ISO}.json",
    ],
    pitfalls: [
      "Les fichiers binaires (image, PDF, .db) sont skippés automatiquement — ils apparaissent dans skipped avec reason:binary.",
      "Les symlinks sont ignorés (protection contre les boucles infinies).",
      "Sécurité : les fichiers .env*, next.config.*, package.json, package-lock.json sont refusés par défaut. Aucun moyen de les lire via cet outil — c'est voulu.",
      "Tout cocher sans exclusions sur un gros projet génère un JSON énorme : excluez node_modules, .next, dist avant.",
    ],
  },
  {
    href: "/genesis/copy-to-ia",
    title: "CopyToIA",
    tagline: "Contextualiser pour l'IA",
    description:
      "Éditer et sélectionner les 3 fichiers critiques du projet (CONTRIBUTING.md, prisma/schema.prisma, package.json), assembler un contexte Markdown prêt à coller dans une IA.",
    icon: ClipboardCopy,
    accent: "chart-5",
    whenToUse: [
      "Poser une question à une IA en respectant les conventions du projet",
      "Faire générer du code qui connaît la stack et le schéma BDD",
      "Rappeler les règles de contribution avant toute génération",
    ],
    whenNotToUse: [
      "Vous voulez donner le code source d'un module à l'IA → utiliser SelectFiles",
      "Vous voulez écrire dans le projet → utiliser CreateFiles",
    ],
    prerequisites: [
      "Aucun. Les 3 fichiers peuvent être absents (badge « absent ») — il suffit alors d'en créer un depuis l'éditeur.",
    ],
    steps: [
      "Ouvrir /genesis/copy-to-ia : les 3 fichiers s'affichent avec leur path et un badge existe/absent.",
      "Optionnel — Cocher « Prompt » et écrire une instruction libre (ex. « Ajoute une page de contact en respectant les conventions »).",
      "Cocher/décocher les fichiers à inclure. Les fichiers non cochés ne figurent pas dans le texte de sortie.",
      "Optionnel — Ouvrir l'accordion « Éditer le contenu » d'un fichier, modifier, cliquer Enregistrer. Un backup automatique du fichier original est créé dans data/genesis-backups/{ISO}/{path}.",
      "Vérifier le texte de sortie en bas. Il est régénéré en direct tant que vous n'avez pas édité manuellement le textarea.",
      "Cliquer Copier. Le Markdown est dans le presse-papier, prêt à coller dans l'IA.",
    ],
    outputs: [
      "Texte Markdown : ## Prompt + ## Règles de contribution + ## Schéma Prisma + ## Stack",
      "Backups : data/genesis-backups/{ISO}/{path} à chaque Enregistrer",
    ],
    pitfalls: [
      "package.json est validé syntaxiquement (JSON.parse) avant écriture : un JSON cassé est refusé.",
      "Le texte de sortie est régénéré à chaque changement de sélection SAUF si vous avez édité le textarea manuellement — dans ce cas un badge « édité manuellement » apparaît.",
      "Le bouton « Régénérer » annule l'édition manuelle et repart de la sélection courante.",
      "Les fichiers critiques sont lus/écrits via l'option allowCritical:true réservée à cet outil — ne pas exposer cette option ailleurs.",
    ],
  },
  {
    href: "/genesis/create-files",
    title: "CreateFiles",
    tagline: "Injecter les scripts",
    description:
      "Coller plusieurs scripts, éditer leur path, écrire dans le projet avec backup automatique avant écrasement et rapport détaillé en fin de traitement.",
    icon: FilePlus2,
    accent: "chart-4",
    whenToUse: [
      "Une IA vous a retourné 3 à 10 fichiers prêts (avec en-tête /* path : ... */)",
      "Vous voulez créer ou écraser plusieurs fichiers en une seule action",
      "Vous devez patcher un fichier existant en gardant une trace du contenu précédent",
    ],
    whenNotToUse: [
      "Vous voulez modifier un fichier déjà présent dans le projet de façon interactive → préférer votre éditeur habituel",
      "Vous voulez juste lire du code → utiliser SelectFiles",
    ],
    prerequisites: [
      "Chaque script doit commencer par un en-tête /* ... */ contenant une ligne `path : ...` (voir « Format attendu » ci-dessous).",
    ],
    steps: [
      "Ouvrir /genesis/create-files : l'interface présente une zone de collage, une file d'attente et la liste des paths existants (pour le badge Créer/Écraser).",
      "Coller UN script dans la zone de collage (l'en-tête doit commencer par /* path : ... */).",
      "Cliquer Ajouter : le script entre dans la file, le textarea se vide, un toast confirme le path extrait.",
      "Optionnel — Éditer le path directement dans la file (Input contrôlé), ajouter d'autres scripts, retirer un script (icône poubelle).",
      "Cliquer Écrire : le serveur traite la file séquentiellement. Chaque script est validé (extension, path traversal, path critique), backuppé si écrasement, puis écrit.",
      "Consulter le rapport : compteurs Créés / Écrasés / Backupés / Rejetés, avec la raison de chaque rejet.",
    ],
    outputs: [
      "Fichiers écrits dans le projet (écriture atomique via writeProjectFile : tmp + rename)",
      "Backups : data/genesis-backups/{ISO-batch}/{path} pour chaque fichier écrasé",
      "Rapport : { created[], overwritten[], backedUp[], rejected[] }",
    ],
    pitfalls: [
      "Extension whitelist stricte : .ts, .tsx, .js, .jsx, .json, .md, .css, .html, .yml, .yaml, .prisma. Toute autre extension est rejetée.",
      "Path traversal refusé (assertUnderRoot) : pas de `..`, pas de path absolu, pas de NUL byte.",
      "Fichiers critiques refusés par défaut : package.json, package-lock.json, .env*, next.config.*. Ces fichiers ne peuvent être écrits que via CopyToIA.",
      "Un backup échoué bloque l'écriture de ce fichier (pas de perte de données) — le rejet est signalé.",
      "Un échec n'interrompt PAS la file : chaque script est traité indépendamment, le rapport consolide le tout.",
      "Le rapport est ok:true même si des scripts sont rejetés — les rejets vivent dans report.rejected, pas dans un ok:false.",
      "Fichier binaire existant écrasé : pas de backup texte possible, signalé dans overwritten.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Format d'en-tête de script (rappelé car critique)                 */
/* ------------------------------------------------------------------ */

const SCRIPT_HEADER_EXAMPLE = `/*
path :           app/core/components/scrum/TaskCard.tsx
tag :            ["scrum", "task", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte de présentation d'une task…

ecosystem:       Scrum = [
                   "@/app/core/components/scrum/TaskCard.tsx",
                   // …
                 ]

userStories:     ["*en tant que développeur je veux afficher une task"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { ListTodo } from "lucide-react";
// … code complet, aucun placeholder
`;

/* ------------------------------------------------------------------ */
/*  Bonnes pratiques transverses                                       */
/* ------------------------------------------------------------------ */

const BEST_PRACTICES: readonly string[] = [
  "Toujours backuper avant d'écrire : le système le fait automatiquement (data/genesis-backups/), mais sachez où regarder en cas de besoin.",
  "Ne jamais coller de secrets dans CopyToIA ou CreateFiles : les .env, tokens et clés privées n'ont rien à faire dans un contexte IA.",
  "Exclure node_modules, .next, dist, build dans SelectFiles : sans ça, le JSON dépasse vite plusieurs Mo.",
  "Tester CreateFiles sur 1 script avant un batch de 10 : vérifiez le path et le rendu, puis passez en volume.",
  "Utiliser le Prompt dans CopyToIA pour donner la tâche exacte — l'IA produit un code bien plus pertinent quand elle connaît l'objectif.",
  "Sauvegarder les sélections SelectFiles (bouton Sauvegarder) pour tracer ce qui a été envoyé à l'IA et pouvoir reproduire une session.",
];

/* ------------------------------------------------------------------ */
/*  Carte résumé (hero)                                                */
/* ------------------------------------------------------------------ */

function ToolSummaryCard({ tool }: { readonly tool: Tool }) {
  const Icon = tool.icon;
  const accent = tool.accent;

  return (
    <Link
      href={tool.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      <header className="mb-3 flex items-center gap-3">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
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

      <span
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ color: `var(--${accent})` }}
      >
        Ouvrir l&apos;outil
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Section détaillée par outil                                        */
/* ------------------------------------------------------------------ */

function ToolSection({ tool }: { readonly tool: Tool }) {
  const Icon = tool.icon;
  const accent = tool.accent;

  return (
    <section
      id={tool.title.toLowerCase()}
      className="scroll-mt-24"
      aria-labelledby={`tool-${tool.title}`}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
        style={{ "--accent": `var(--${accent})` } as React.CSSProperties}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, var(--${accent}), transparent)`,
          }}
        />

        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-border/60 p-6 sm:flex-row sm:items-center">
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
              {tool.tagline}
            </p>
            <h2
              id={`tool-${tool.title}`}
              className="text-xl font-bold tracking-tight text-foreground"
            >
              {tool.title}
            </h2>
          </div>
          <Link
            href={tool.href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:shrink-0"
          >
            Ouvrir
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>

        <div className="space-y-6 p-6">
          {/* Quand l'utiliser / ne pas l'utiliser */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-chart-4/30 bg-chart-4/5 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-4">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Quand l&apos;utiliser
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {tool.whenToUse.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-1 shrink-0 text-chart-4">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-5">
                <TriangleAlert className="size-3.5" aria-hidden />
                Quand ne pas l&apos;utiliser
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {tool.whenNotToUse.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-1 shrink-0 text-chart-5">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prérequis */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="size-3.5" aria-hidden />
              Prérequis
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {tool.prerequisites.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-1 shrink-0 text-muted-foreground">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Étapes */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Workflow className="size-3.5" aria-hidden />
              Étapes
            </h3>
            <ol className="space-y-2 text-sm text-foreground/80">
              {tool.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Sorties */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              Ce que produit l&apos;outil
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {tool.outputs.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-1 shrink-0 text-muted-foreground">
                    →
                  </span>
                  <span className="font-mono text-xs leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pièges */}
          <div className="rounded-xl border border-chart-3/40 bg-chart-3/5 p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-chart-3">
              <TriangleAlert className="size-3.5" aria-hidden />
              Pièges courants
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {tool.pitfalls.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-1 shrink-0 text-chart-3">
                    !
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GenesisHelpPage() {
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
            <BookOpen className="size-3.5 text-chart-2" aria-hidden />
            Mode d&apos;emploi
          </span>

          <h1 className="mt-4 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Les 3 outils Genesis
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Lire le projet, contextualiser pour une IA, injecter les scripts
            qu&apos;elle vous retourne. Trois outils qui s&apos;enchaînent
            naturellement — chacun avec ses garde-fous (backup automatique,
            validation d&apos;extension, refus des fichiers critiques).
          </p>
        </div>
      </header>

      {/* Rappel du flux */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Workflow className="size-5 text-chart-2" aria-hidden />
          Le flux en 3 étapes
        </h2>

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <li className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-chart-2">
              Étape 1
            </p>
            <h3 className="text-base font-bold text-foreground">
              SelectFiles
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Générer le JSON du module à modifier.
            </p>
          </li>
          <li className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-chart-5">
              Étape 2
            </p>
            <h3 className="text-base font-bold text-foreground">
              CopyToIA
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajouter conventions + stack + schéma BDD, copier le contexte
              complet.
            </p>
          </li>
          <li className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-chart-4">
              Étape 3
            </p>
            <h3 className="text-base font-bold text-foreground">
              CreateFiles
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Coller les scripts retournés par l&apos;IA et les écrire avec
              backup automatique.
            </p>
          </li>
        </ol>

        <p className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          L&apos;IA reçoit le contexte à l&apos;étape 2, génère du code, et
          vous le réinjectez à l&apos;étape 3. Les étapes 1 et 3 sont
          symétriques : l&apos;une lit, l&apos;autre écrit.
        </p>
      </section>

      {/* Comparaison des 3 outils */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Lightbulb className="size-5 text-chart-1" aria-hidden />
          En un coup d&apos;œil
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolSummaryCard key={tool.title} tool={tool} />
          ))}
        </div>
      </section>

      {/* Détail par outil */}
      {TOOLS.map((tool) => (
        <ToolSection key={tool.title} tool={tool} />
      ))}

      {/* Format d'en-tête de script */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <FilePlus2 className="size-5 text-chart-4" aria-hidden />
          Format attendu par CreateFiles
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Chaque script doit commencer par un bloc{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            /* ... */
          </code>{" "}
          contenant une ligne{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            path : ...
          </code>
          . L&apos;extension doit être dans la whitelist. Le bloc est extrait
          par{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            parseScriptHeader
          </code>{" "}
          côté client, puis revalidé côté serveur.
        </p>

        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground/90">
          <code>{SCRIPT_HEADER_EXAMPLE}</code>
        </pre>
      </section>

      {/* Bonnes pratiques */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Shield className="size-5 text-chart-3" aria-hidden />
          Bonnes pratiques transverses
        </h2>

        <ul className="space-y-2 text-sm text-foreground/80">
          {BEST_PRACTICES.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-chart-4"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}