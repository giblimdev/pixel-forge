/*
path:            app/pixel/features/crop-editor/components/crop-editor-panel.tsx
tag:             ["pixel", "feature", "crop-editor", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'editeur de recadrage manuel
                 (outil 06). Remplace le placeholder. Compose
                 CropCanvas + CropToolbar + CropControls + bouton
                 "Recadrer". Le CropCanvas emet la zone de recadrage
                 (pixels) que le hook stocke via setCropArea.

                 Si aucun fichier n'est dans la file, affiche un message
                 "Ajoutez une image". Le canvas n'apparait que lorsqu'un
                 fichier "pending" existe (le premier de la file).

flow:            useCropEditor() + useImageQueueStore -> selectionne
                 le premier item pending -> si null : message vide ->
                 sinon : CropCanvas(imageUrl) + toolbar + controls +
                 bouton submit.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                  "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                  "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                  "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                  "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/crop-editor/hooks/use-crop-editor",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types",
                  "@/app/pixel/features/crop-editor/components/crop-canvas",
                  "@/app/pixel/features/crop-editor/components/crop-toolbar",
                  "@/app/pixel/features/crop-editor/components/crop-controls",
                  "@/app/pixel/components/image-comparison/comparison-stats",
                  "@/app/pixel/stores/image-queue.store",
                  "@/components/ui/button"]
exports:         ["CropEditorPanel", "CropEditorPanelProps"]
useBy:           ["@/app/pixel/edit/crop/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Download, Loader2 } from "lucide-react";

import { useCropEditor } from "@/app/pixel/features/crop-editor/hooks/use-crop-editor";
import type { CropEditorOptions } from "@/app/pixel/features/crop-editor/types/crop-editor.types";
import { CropCanvas } from "@/app/pixel/features/crop-editor/components/crop-canvas";
import { CropToolbar } from "@/app/pixel/features/crop-editor/components/crop-toolbar";
import { CropControls } from "@/app/pixel/features/crop-editor/components/crop-controls";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

export interface CropEditorPanelProps {
  readonly className?: string;
}

export function CropEditorPanel({ className }: CropEditorPanelProps) {
  const { options, setOptions, cropArea, setCropArea, stage, outcome, pendingCount, submit } =
    useCropEditor();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  const firstPending = items.find((i) => i.status === "pending");

  function patch(partial: Partial<CropEditorOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="crop-editor-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="crop-editor-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Editeur de recadrage
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image a la file pour commencer."
            : `Recadrage applique au premier fichier de la file.`}
        </p>
      </header>

      {firstPending ? (
        <>
          <CropCanvas
            imageUrl={firstPending.source.url}
            aspectRatio={options.aspectRatio}
            onCropAreaChange={setCropArea}
          />

          <CropToolbar
            rotation={options.rotation}
            flipHorizontal={options.flipHorizontal}
            onChange={patch}
            disabled={running}
          />

          <CropControls options={options} onChange={patch} disabled={running} />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
            <p className="text-xs text-[var(--pf-muted)]">
              {cropArea
                ? `Zone : ${cropArea.width}x${cropArea.height} px`
                : "Deplacez le cadre pour definir la zone."}
            </p>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={pendingCount === 0 || running || cropArea === null}
              className="gap-1.5 bg-gradient-to-r from-[var(--pf-info)] to-[var(--pf-primary)] text-white"
            >
              {running ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Recadrage...
                </>
              ) : (
                <>
                  Recadrer {pendingCount > 0 ? `(${pendingCount})` : ""}
                  <ArrowRight className="size-3.5" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-4 text-center text-xs text-[var(--pf-muted)]">
          Aucune image en attente. Ajoutez des images via le formulaire
          ci-dessus.
        </p>
      )}

      {outcome && outcome.success.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Resultats ({outcome.success.length})
          </h4>
          <ul className="space-y-2">
            {outcome.success.map((item) => (
              <li
                key={item.sourceId}
                className="space-y-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
                    {item.result.filename}
                  </p>
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      download={item.result.filename}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] hover:bg-[var(--pf-success)]/25"
                    >
                      <Download className="size-3.5" aria-hidden />
                      Telecharger
                    </a>
                  )}
                </div>
                <ComparisonStats
                  beforeSizeBytes={item.sourceSizeBytes}
                  afterSizeBytes={item.result.sizeBytes}
                  beforeDimensions={item.result.dimensions}
                  afterDimensions={item.result.dimensions}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {outcome && outcome.errors.length > 0 && (
        <ul className="space-y-2 pt-2">
          {outcome.errors.map((e, i) => (
            <li
              key={`err-${e.sourceId}-${i}`}
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
            >
              <code className="font-mono text-[10px] uppercase">{e.error.code}</code>
              {" : "}
              {e.sourceFilename} - {e.error.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}