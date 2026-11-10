/*
path:            app/pixel/features/export-manager/components/export-manager.tsx
tag:             ["pixel", "feature", "export-manager", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du module export-manager. Affiche :
                 - un resume des fichiers exportables (count + poids total),
                 - ExportOptionsControls (organisation + manifest),
                 - ExportProgress pendant le traitement,
                 - un bouton "Tout telecharger en ZIP",
                 - un lien vers le ZIP genere (si succes).

                 Le panel est concu pour etre monte dans n'importe quelle
                 page HUB (optimize, resize, compress, smart-crop, edit,
                 generate) : il lit le store global, donc il fonctionne
                 partout ou des items "success" existent.

flow:            useExportManager() -> rend resume + options + bouton +
                 progress + lien ZIP si succes.

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
relatedFiles:    ["@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                  "@/app/pixel/features/export-manager/components/export-options.tsx",
                  "@/app/pixel/features/export-manager/components/export-progress.tsx",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/export-manager/hooks/use-export-manager",
                  "@/app/pixel/features/export-manager/components/export-options",
                  "@/app/pixel/features/export-manager/components/export-progress",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/export",
                  "@/components/ui/button"]
exports:         ["ExportManager", "ExportManagerProps"]
useBy:           ["@/app/pixel/optimize/page.tsx",
                  "@/app/pixel/optimize/compress/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux telecharger tous mes resultats en un ZIP"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { Download, Package, Loader2 } from "lucide-react";

import { useExportManager } from "@/app/pixel/features/export-manager/hooks/use-export-manager";
import type { ExportOptions } from "@/app/pixel/types/export";
import { ExportOptionsControls } from "@/app/pixel/features/export-manager/components/export-options";
import { ExportProgress } from "@/app/pixel/features/export-manager/components/export-progress";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

export interface ExportManagerProps {
  readonly className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportManager({ className }: ExportManagerProps) {
  const { options, setOptions, stage, outcome, exportableCount, submit } =
    useExportManager();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  const totalSizeBytes = items
    .filter((i) => i.status === "success" && i.result !== null)
    .reduce((sum, i) => sum + (i.result?.sizeBytes ?? 0), 0);

  function patch(partial: Partial<ExportOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="export-manager-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="export-manager-title"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Package className="size-4 text-[var(--pf-info)]" aria-hidden />
          Export Manager
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {exportableCount === 0
            ? "Aucun fichier exportable pour l'instant. Traitez des images d'abord."
            : `${exportableCount} fichier${exportableCount > 1 ? "s" : ""} exportable${exportableCount > 1 ? "s" : ""} · ${formatSize(totalSizeBytes)}`}
        </p>
      </header>

      <ExportOptionsControls
        options={options}
        onChange={patch}
        disabled={running || exportableCount === 0}
      />

      <ExportProgress running={running} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          Les fichiers seront compresses dans une archive ZIP et stockes
          temporairement (URL valide 1 heure).
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={exportableCount === 0 || running}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-info)] to-[var(--pf-primary)] text-white"
        >
          {running ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Construction du ZIP...
            </>
          ) : (
            <>
              <Download className="size-3.5" aria-hidden />
              Tout telecharger en ZIP
            </>
          )}
        </Button>
      </div>

      {outcome?.success && (
        <div className="space-y-2 rounded-lg border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-3">
          <p className="text-sm font-medium text-[var(--pf-foreground)]">
            Archive creee : {outcome.success.filename}
          </p>
          <p className="font-mono text-[10px] text-[var(--pf-muted)]">
            {outcome.success.entryCount} fichiers ·{" "}
            {formatSize(outcome.success.sizeBytes)} · expire le{" "}
            {new Date(outcome.success.expiresAt).toLocaleString("fr-FR")}
          </p>
          <a
            href={outcome.success.url}
            download={outcome.success.filename}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] hover:bg-[var(--pf-success)]/25"
          >
            <Download className="size-3.5" aria-hidden />
            Telecharger le ZIP
          </a>
        </div>
      )}

      {outcome?.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
        >
          <code className="font-mono text-[10px] uppercase">
            {outcome.error.code}
          </code>
          {" : "}
          {outcome.error.message}
        </p>
      )}
    </section>
  );
}