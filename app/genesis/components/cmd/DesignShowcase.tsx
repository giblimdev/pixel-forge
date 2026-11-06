/*
path :           app/genesis/components/cmd/DesignShowcase.tsx
tag :            ["genesis", "cmd", "design", "colors", "showcase"]
projectId:       new-genesis
type:            component
generic:         false

role:            Section "Couleurs" de la page /genesis/cmd. Présente les 5
                 couleurs d'accent chart-1..chart-5 définies dans @theme
                 Tailwind (globals.css). Chaque bloc affiche un nuancier,
                 le label et le nom de la variable CSS. Server Component
                 pur, aucune interaction. Les polices ont migré vers
                 <FontsGenesis /> (components/ui/fonts/FontsGenesis.tsx),
                 désormais générique et interactif.

                 Historique : ce fichier affichait à la fois les polices
                 et les couleurs. Il ne conserve que les couleurs pour
                 éviter la duplication avec FontsGenesis.

flow:            Constante COLORS → rend une grille 2/3/5 colonnes de
                 nuanciers. background: var(--chart-*).

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
                  "@/components/ui/fonts/FontsGenesis.tsx"]

imports:         ["lucide-react"]

exports:         ["DesignShowcase"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux visualiser les couleurs du design system"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { Palette } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Config — couleurs                                                  */
/* ------------------------------------------------------------------ */

interface ColorEntry {
  readonly id: string;
  readonly label: string;
}

const COLORS: readonly ColorEntry[] = [
  { id: "chart-1", label: "Accent 1" },
  { id: "chart-2", label: "Accent 2" },
  { id: "chart-3", label: "Accent 3" },
  { id: "chart-4", label: "Accent 4" },
  { id: "chart-5", label: "Accent 5" },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function DesignShowcase() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <header className="mb-4 flex items-center gap-2">
        <Palette className="size-4 text-chart-3" aria-hidden />
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Couleurs d&apos;accent
        </h2>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {COLORS.map((color) => (
          <div key={color.id} className="space-y-1.5">
            <div
              className="aspect-square w-full rounded-lg shadow-sm ring-1 ring-border/60"
              style={{ background: `var(--${color.id})` }}
              aria-hidden
            />
            <p className="text-[11px] font-semibold text-foreground">
              {color.label}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              --{color.id}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}