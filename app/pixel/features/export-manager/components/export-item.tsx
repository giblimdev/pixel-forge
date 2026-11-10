/*
path:            app/pixel/features/export-manager/components/export-item.tsx
tag:             ["pixel", "feature", "export-manager", "component", "item"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Ligne de resultat exportable : nom, taille, bouton
                 "Telecharger" individuel. Utilise dans ExportManager
                 pour lister les fichiers qui seront inclus dans le ZIP.

flow:            Props { filename, sizeBytes, downloadUrl } -> ligne
                 avec nom + taille + <a download>.

ecosystem:       ExportManager = [
                   "@/app/pixel/features/export-manager/types/export-manager.types.ts",
                   "@/app/pixel/features/export-manager/schemas/export-manager.schema.ts",
                   "@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "@/app/pixel/features/export-manager/components/export-options.tsx",
                   "@/app/pixel/features/export-manager/components/export-item.tsx",
                   "@/app/pixel/features/export-manager/components/export-progress.tsx",
                   "@/app/pixel/features/export-manager/components/export-manager.tsx",
                   "@/app/pixel/features/export-manager/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/export-manager/components/export-manager.tsx"]
imports:         ["lucide-react"]
exports:         ["ExportItemRow", "ExportItemRowProps"]
useBy:           ["@/app/pixel/features/export-manager/components/export-manager.tsx"]

userStories:     ["*en tant qu'utilisateur je veux telecharger un fichier individuellement"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : <a download>.

import { Download } from "lucide-react";

export interface ExportItemRowProps {
  readonly filename: string;
  readonly sizeBytes: number;
  readonly downloadUrl: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportItemRow({
  filename,
  sizeBytes,
  downloadUrl,
}: ExportItemRowProps) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
          {filename}
        </p>
        <p className="font-mono text-[10px] text-[var(--pf-muted)]">
          {formatSize(sizeBytes)}
        </p>
      </div>
      <a
        href={downloadUrl}
        download={filename}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] hover:bg-[var(--pf-success)]/25"
      >
        <Download className="size-3.5" aria-hidden />
        Telecharger
      </a>
    </li>
  );
}