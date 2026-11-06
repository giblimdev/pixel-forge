/*
path :           app/genesis/page.tsx
tag :            ["genesis", "page", "hub"]
projectId:       new-genesis
type:            page
generic:         false

role:            Hub du module Genesis. Affiche trois cards (SelectFiles,
                 CreateFiles, CopyToIA) avec icône, titre, description et CTA
                 vers la route correspondante. Server Component pur, aucune
                 donnée dynamique.

flow:            Server Component → rend un grid responsive 1 / 2 / 3 colonnes
                 avec 3 cards cliquables.

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

relatedFiles:    []

imports:         ["next/link", "lucide-react"]

exports:         ["default GenesisPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux accéder aux trois outils Genesis"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import { ArrowRight, ClipboardCopy, FilePlus2, FolderTree } from "lucide-react";

interface ToolCard {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  readonly accent: string;
}

const TOOLS: readonly ToolCard[] = [
  {
    href: "/genesis/read-files",
    title: "SelectFiles",
    description:
      "Parcourir l'arborescence, exclure les dossiers/fichiers techniques et générer un JSON complet du contenu sélectionné pour fournir à l'IA le contexte du projet.",
    icon: FolderTree,
    accent: "var(--chart-2)",
  },
  {
    href: "/genesis/create-files",
    title: "CreateFiles",
    description:
      "Coller plusieurs scripts, éditer leur path, écrire dans le projet avec backup automatique avant écrasement et rapport détaillé en fin de traitement.",
    icon: FilePlus2,
    accent: "var(--chart-4)",
  },
  {
    href: "/genesis/copy-to-ia",
    title: "CopyToIA",
    description:
      "Éditer et sélectionner les fichiers clés du projet (CONTRIBUTING.md, schéma Prisma, package.json), assembler un contexte Markdown prêt à coller dans une IA.",
    icon: ClipboardCopy,
    accent: "var(--chart-5)",
  },
];

export default function GenesisPage() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ "--accent": tool.accent } as React.CSSProperties}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 opacity-70"
              style={{
                background: `linear-gradient(90deg, ${tool.accent}, transparent)`,
              }}
            />

            <header className="mb-4 flex items-center gap-3">
              <div
                className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${tool.accent}, color-mix(in oklab, ${tool.accent} 60%, black))`,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {tool.title}
              </h2>
            </header>

            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-transform group-hover:translate-x-1">
              Ouvrir
              <ArrowRight className="size-4" aria-hidden />
            </div>
          </Link>
        );
      })}
    </div>
  );
}