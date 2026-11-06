/*
path :           app/core/help/page.tsx
tag :            ["help", "guide", "catalog", "files", "development"]
projectId:       new-genesis
type :           page
generic:         false

role:            Page-guide du module Help. Présente sous forme de cartes colorées
                 TOUS les fichiers à développer pour le module Scrum : types, validation,
                 stockage, services, server actions, composants UI, pages. Chaque carte
                 affiche le path exact, le rôle du fichier et son appartenance à une
                 couche. Sert de feuille de route de développement (humain ou IA).
                 Les entrées Task (service, action, 3 composants, page) sont intégrées
                 dans leurs groupes respectifs.

flow:            Server Component statique → rend des groupes de cartes → chaque
                 groupe = une couche (Types, Storage, Services, Actions, Composants,
                 Pages) avec sa couleur d'accent.

ecosystem:       Help = [
                   "@/app/core/help/page.tsx",
                 ]

relatedFiles:    []

imports:         ["lucide-react"]

exports:         ["default HelpPage"]

useBy:           []

userStories:     ["*en tant que développeur je veux visualiser les fichiers à créer",
                  "*en tant que développeur je veux connaître le rôle de chaque fichier"]

status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import {
  FileCode2,
  ShieldCheck,
  Database,
  Cpu,
  Workflow,
  Boxes,
  FolderTree,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FileEntry {
  readonly path: string;
  readonly role: string;
}

interface CatalogGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly accent: string;
  readonly files: readonly FileEntry[];
}

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */

const CATALOG: readonly CatalogGroup[] = [
  {
    id: "types",
    title: "Types & Validation",
    description:
      "Fondation du module : formes des données et schémas Zod. Aucune dépendance runtime.",
    icon: ShieldCheck,
    accent: "chart-1",
    files: [
      {
        path: "lib/scrum/types.ts",
        role: "Types partagés : ScrumFlow, ScrumDocument, Idee, Feature, Persona, Epic, UserStory, Sprint, Task, TaskStatus, TASK_STATUSES.",
      },
      {
        path: "lib/validations/scrum.ts",
        role: "Schémas Zod : ideeSchema, featureSchema, personaSchema, epicSchema, userStorySchema, sprintSchema, taskInputSchema, scrumDocumentSchema.",
      },
    ],
  },
  {
    id: "storage",
    title: "Stockage",
    description:
      "Seul point d'accès au système de fichiers. Importable uniquement côté serveur.",
    icon: Database,
    accent: "chart-2",
    files: [
      {
        path: "lib/scrum/storage.ts",
        role: "readScrumFile(flow), writeScrumFile(flow, doc), scrumFilePath(flow). Écriture atomique (temp + rename). Trie par `order` sur les 7 tableaux, dont task.",
      },
      {
        path: "data/scrum-app.json",
        role: "Persistance du flux ScrumApp (app métier). Structure : 7 tableaux + meta.",
      },
      {
        path: "data/scrum-genesis.json",
        role: "Persistance du flux Scrum-Genesis (l'outil lui-même).",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    description:
      "Logique métier par section. Reçoit un flow, un input validé, manipule le document.",
    icon: Cpu,
    accent: "chart-3",
    files: [
      {
        path: "lib/scrum/services/idee.ts",
        role: "listIdees, createIdee, updateIdee, deleteIdee.",
      },
      {
        path: "lib/scrum/services/feature.ts",
        role: "Idem pour les features.",
      },
      {
        path: "lib/scrum/services/persona.ts",
        role: "Idem pour les personas.",
      },
      {
        path: "lib/scrum/services/epic.ts",
        role: "Idem pour les epics.",
      },
      {
        path: "lib/scrum/services/user-story.ts",
        role: "Idem pour les user stories. deleteUserStory cascade delete les tasks rattachées.",
      },
      {
        path: "lib/scrum/services/sprint.ts",
        role: "Idem pour les sprints.",
      },
      {
        // ← AJOUT (bloc entier)
        path: "lib/scrum/services/task.ts",
        role: "listTasks, createTask (vérifie storyId), updateTask, deleteTask, reorderTasks.",
      },
      {
        path: "lib/scrum/services/global-json.ts",
        role: "getGlobalJson(flow) — sérialise le document complet pour export.",
      },
    ],
  },
  {
    id: "actions",
    title: "Server Actions",
    description:
      "Points d'entrée appelables depuis l'UI. Parse, valide, délègue, revalidatePath.",
    icon: Workflow,
    accent: "chart-4",
    files: [
      {
        path: "lib/actions/scrum/idee.ts",
        role: "createIdeeAction, updateIdeeAction, deleteIdeeAction + revalidatePath.",
      },
      {
        path: "lib/actions/scrum/feature.ts",
        role: "Idem features.",
      },
      {
        path: "lib/actions/scrum/persona.ts",
        role: "Idem personas.",
      },
      {
        path: "lib/actions/scrum/epic.ts",
        role: "Idem epics.",
      },
      {
        path: "lib/actions/scrum/user-story.ts",
        role: "Idem user stories.",
      },
      {
        path: "lib/actions/scrum/sprint.ts",
        role: "Idem sprints.",
      },
      {
        // ← AJOUT (bloc entier)
        path: "lib/actions/scrum/task.ts",
        role: "createTaskAction, updateTaskAction, deleteTaskAction, reorderTasksAction + revalidatePath.",
      },
      {
        path: "lib/actions/scrum/import-global-json.ts",
        role: "importGlobalJsonAction — restaure un flux depuis un JSON (optionnel).",
      },
    ],
  },
  {
    id: "components",
    title: "Composants UI",
    description:
      "Présentation uniquement. Pas de logique métier. Utilisent les Server Actions pour muter.",
    icon: Boxes,
    accent: "chart-5",
    files: [
      {
        path: "components/scrum/FlowSelector.tsx",
        role: "Sélecteur de flux (ScrumApp / Scrum-Genesis).",
      },
      {
        path: "components/scrum/ScrumNav.tsx",
        role: "Navigation à onglets entre les 8 sections d'un flux.",
      },
      {
        path: "components/scrum/IdeeForm.tsx",
        role: "Formulaire création/édition d'une idée.",
      },
      {
        path: "components/scrum/IdeeList.tsx",
        role: "Liste des idées pour un flux.",
      },
      {
        path: "components/scrum/IdeeCard.tsx",
        role: "Carte d'une idée dans la liste.",
      },
      {
        path: "components/scrum/GlobalJsonExport.tsx",
        role: "Boutons Copier / Télécharger + aperçu Shiki du JSON complet.",
      },
      {
        path: "components/scrum/*Form.tsx",
        role: "Idem pour feature, persona, epic, user-story, sprint, task.",
      },
      {
        path: "components/scrum/*List.tsx",
        role: "Idem pour feature, persona, epic, user-story, sprint, task.",
      },
      {
        path: "components/scrum/*Card.tsx",
        role: "Idem pour feature, persona, epic, user-story, sprint, task.",
      },
      {
        // ← AJOUT (bloc entier)
        path: "components/scrum/TaskForm.tsx",
        role: "Formulaire création/édition d'une task (statut, US parente, assignation, estimation).",
      },
      {
        // ← AJOUT (bloc entier)
        path: "components/scrum/TaskList.tsx",
        role: "Liste des tasks pour un flux + DnD. Bandeau d'aide si aucune UserStory.",
      },
      {
        // ← AJOUT (bloc entier)
        path: "components/scrum/TaskCard.tsx",
        role: "Carte d'une task avec badge de statut (todo / in_progress / done).",
      },
    ],
  },
  {
    id: "pages",
    title: "Pages",
    description:
      "Composition UI. Chaque page lit via service et rend des composants.",
    icon: FolderTree,
    accent: "chart-1",
    files: [
      {
        path: "app/core/help/layout.tsx",
        role: "Layout commun : header du module + breadcrumb.",
      },
      {
        path: "app/core/help/[flow]/layout.tsx",
        role: "Layout du flux : valide params.flow, monte ScrumNav.",
      },
      {
        path: "app/core/help/[flow]/page.tsx",
        role: "Vue d'ensemble : résumé des 7 sections + compteurs.",
      },
      {
        path: "app/core/help/[flow]/idee/page.tsx",
        role: "Liste + création des idées du flux.",
      },
      {
        path: "app/core/help/[flow]/feature/page.tsx",
        role: "Liste + création des features.",
      },
      {
        path: "app/core/help/[flow]/persona/page.tsx",
        role: "Liste + création des personas.",
      },
      {
        path: "app/core/help/[flow]/epic/page.tsx",
        role: "Liste + création des epics.",
      },
      {
        path: "app/core/help/[flow]/user-story/page.tsx",
        role: "Liste + création des user stories.",
      },
      {
        path: "app/core/help/[flow]/sprint/page.tsx",
        role: "Liste + création des sprints.",
      },
      {
        // ← AJOUT (bloc entier)
        path: "app/core/[flow]/task/page.tsx",
        role: "Liste + création des tasks (charge aussi les US pour le Select du formulaire).",
      },
      {
        path: "app/core/help/[flow]/global-json/page.tsx",
        role: "Export du JSON complet du flux.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Groupe de fichiers                                                 */
/* ------------------------------------------------------------------ */

function CatalogCard({ group }: { readonly group: CatalogGroup }) {
  const Icon = group.icon;
  const accent = group.accent;

  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={
        {
          "--accent": `var(--${accent})`,
        } as React.CSSProperties
      }
    >
      {/* Bande colorée en haut */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, var(--${accent}), transparent)`,
        }}
      />

      {/* En-tête */}
      <header className="mb-4 flex items-start gap-4">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, var(--${accent}), color-mix(in oklab, var(--${accent}) 60%, black))`,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {group.title}
          </h3>
          <p
            className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${accent})` }}
          >
            {group.files.length} fichier{group.files.length > 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {group.description}
      </p>

      {/* Liste des fichiers */}
      <ul className="space-y-4">
        {group.files.map((file) => (
          <li key={file.path} className="flex flex-col gap-1.5">
            <code
              className="break-all rounded-md px-2.5 py-1.5 font-mono text-xs font-semibold"
              style={{
                background: `color-mix(in oklab, var(--${accent}) 12%, transparent)`,
                color: `var(--${accent})`,
              }}
            >
              {file.path}
            </code>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {file.role}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HelpPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-chart-1/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 size-96 rounded-full bg-chart-3/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <FileCode2 className="size-3.5 text-chart-2" aria-hidden />
            Guide de développement · Module Scrum
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Fichiers à développer
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Tous les fichiers du module Scrum, groupés par couche, avec leur
            path exact et leur rôle. La feuille de route complète du
            développement.
          </p>
        </div>
      </section>

      {/* ---------------- Grille des groupes ---------------- */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {CATALOG.map((group) => (
            <CatalogCard key={group.id} group={group} />
          ))}
        </div>
      </section>
    </div>
  );
}