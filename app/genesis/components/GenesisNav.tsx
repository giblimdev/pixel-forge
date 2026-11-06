/*
path :           app/genesis/components/GenesisNav.tsx
tag :            ["genesis", "nav", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Navigation entre les 4 routes du module Genesis (hub,
                 SelectFiles, CreateFiles, CopyToIA). Utilise usePathname pour
                 marquer l'onglet actif. Aucune logique métier : purement
                 présentationnel.

flow:            usePathname() → compare à NAV_ITEMS → rend un <nav> avec
                 liens actifs/inactifs stylés différemment.

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

relatedFiles:    ["@/app/genesis/layout.tsx"]

imports:         ["next/link", "next/navigation", "lucide-react"]

exports:         ["GenesisNav"]

useBy:           ["@/app/genesis/layout.tsx"]

userStories:     ["*en tant qu'utilisateur je veux naviguer entre les outils Genesis"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : usePathname pour l'état actif des liens.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCopy, FilePlus2, FolderTree, Home } from "lucide-react";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/genesis", label: "Accueil", icon: Home },
  { href: "/genesis/read-files", label: "SelectFiles", icon: FolderTree },
  { href: "/genesis/create-files", label: "CreateFiles", icon: FilePlus2 },
  { href: "/genesis/copy-to-ia", label: "CopyToIA", icon: ClipboardCopy },
];

export function GenesisNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation Genesis"
      className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/genesis"
            ? pathname === "/genesis"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}