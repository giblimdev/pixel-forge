/*
path:            app/pixel/features/converter/components/conversion-preview.tsx
tag:             ["pixel", "feature", "converter", "component", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Aperçu live avant/apres du converter. Affiche un strip
                 horizontal de miniatures (cliquables) pour choisir le
                 fichier prévisualisé, un slider avant/après via
                 <ComparisonSlider>, et les stats comparatives via
                 <ComparisonStats>. États : empty (message), idle
                 (silencieux), loading (loader superposé au slider
                 précédent), ready (slider + stats), error (message).

                 ⚠️ Loader SUPERPOSÉ (pas de remplacement) : pendant un
                 rechargement, l'utilisateur voit le slider précédent à
                 opacity 50 % + un spinner central. Il peut comparer
                 mentalement.

                 ⚠️ Si la file est vide : message « Ajoutez une image
                 pour voir l'aperçu » + icône.

                 ⚠️ Aucun state local : tout vient de
                 useConversionPreview(). Le composant est purement
                 présentationnel (le hook gère fetch, cache, debounce,
                 race condition).

flow:            useConversionPreview(options) -> rend :
                 - file vide : EmptyState
                 - fichiers : strip de miniatures + zone preview
                   (slider + stats en overlay)
                 - état ready : ComparisonSlider + ComparisonStats
                 - état loading : slider précédent en opacity 50% +
                   spinner
                 - état error : message d'erreur + retry (via re-render
                   automatique du hook si options changent)

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/components/conversion-preview.tsx",
                   "@/app/pixel/components/image-comparison/comparison-slider.tsx",
                   "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                   "@/app/pixel/components/image-preview/image-thumbnail.tsx",
                   "@/app/pixel/components/feedback/empty-state.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/converter/hooks/use-conversion-preview.ts",
                  "@/app/pixel/types/conversion.ts"]
imports:         ["lucide-react",
                  "@/app/pixel/features/converter/hooks/use-conversion-preview",
                  "@/app/pixel/components/image-comparison/comparison-slider",
                  "@/app/pixel/components/image-comparison/comparison-stats",
                  "@/app/pixel/components/image-preview/image-thumbnail",
                  "@/app/pixel/components/feedback/empty-state",
                  "@/app/pixel/types/conversion"]
exports:         ["ConversionPreview", "ConversionPreviewProps"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le resultat reel avant de convertir",
                  "*en tant qu'utilisateur je veux comparer plusieurs fichiers",
                  "*en tant qu'utilisateur je veux ajuster la qualite en voyant le rendu"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : onClick sur les miniatures + interactions.

import { ImagePlus, Loader2, RefreshCw } from "lucide-react";

import { useConversionPreview } from "@/app/pixel/features/converter/hooks/use-conversion-preview";
import { ComparisonSlider } from "@/app/pixel/components/image-comparison/comparison-slider";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";
import { ImageThumbnail } from "@/app/pixel/components/image-preview/image-thumbnail";
import { EmptyState } from "@/app/pixel/components/feedback/empty-state";
import type { ConversionOptions } from "@/app/pixel/types/conversion";

export interface ConversionPreviewProps {
  readonly options: ConversionOptions;
  readonly className?: string;
}

export function ConversionPreview({
  options,
  className,
}: ConversionPreviewProps) {
  const { selectedSourceId, setSelectedSourceId, availableFiles, state } =
    useConversionPreview(options);

  return (
    <section
      aria-labelledby="conversion-preview-title"
      className={`space-y-3 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4
          id="conversion-preview-title"
          className="text-sm font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Aperçu
        </h4>
        <p className="text-[11px] text-[var(--pf-muted)]">
          {availableFiles.length > 0
            ? `Fichier ${availableFiles.findIndex((f) => f.id === selectedSourceId) + 1} / ${availableFiles.length}`
            : ""}
        </p>
      </header>

      {state.status === "empty" && (
        <EmptyState
          icon={ImagePlus}
          title="Aucun fichier dans la file"
          description="Ajoutez une image pour voir l'aperçu de la conversion."
        />
      )}

      {(state.status === "idle" || state.status === "loading") &&
        availableFiles.length > 0 && (
          <div className="space-y-3">
            <FileStrip
              files={availableFiles}
              selectedId={selectedSourceId}
              onSelect={setSelectedSourceId}
            />

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60">
              {state.status === "loading" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--pf-background)]/60 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-[var(--pf-primary)]" />
                </div>
              )}
              <div className="grid size-full place-items-center text-xs text-[var(--pf-muted)]">
                Préparation de l&apos;aperçu…
              </div>
            </div>
          </div>
        )}

      {state.status === "ready" && (
        <div className="space-y-3">
          <FileStrip
            files={availableFiles}
            selectedId={selectedSourceId}
            onSelect={setSelectedSourceId}
          />

          <div className="relative">
            <ComparisonSlider
              beforeSrc={
                availableFiles.find((f) => f.id === state.data.sourceId)
                  ?.url ?? ""
              }
              afterSrc={state.data.url}
              beforeAlt={state.data.sourceFilename}
              afterAlt={`Aperçu ${state.data.format.toUpperCase()}`}
            />
            {state.status === "ready" && (
              <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-[var(--pf-background)]/70 px-2 py-0.5 font-mono text-[10px] text-[var(--pf-muted)] backdrop-blur">
                {state.data.durationMs} ms
              </div>
            )}
          </div>

          <ComparisonStats
            beforeSizeBytes={state.data.sourceSizeBytes}
            afterSizeBytes={state.data.resultSizeBytes}
            beforeDimensions={state.data.sourceDimensions}
            afterDimensions={state.data.resultDimensions}
          />

          <p className="text-[10px] text-[var(--pf-muted)]">
            Aperçu réel sur 1 fichier · le lot applique les mêmes options aux{" "}
            {availableFiles.length} fichier
            {availableFiles.length > 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
        >
          <p className="flex items-center gap-1.5">
            <RefreshCw className="size-3.5" aria-hidden />
            Aperçu indisponible : {state.message}
          </p>
          <p className="mt-1 text-[10px] text-destructive/80">
            Modifiez une option pour relancer l&apos;aperçu.
          </p>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Strip horizontal de miniatures                                    */
/* ------------------------------------------------------------------ */

interface FileStripProps {
  readonly files: readonly {
    readonly id: string;
    readonly filename: string;
    readonly url: string;
  }[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

function FileStrip({ files, selectedId, onSelect }: FileStripProps) {
  if (files.length <= 1) return null;

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {files.map((file) => {
        const active = file.id === selectedId;
        return (
          <li key={file.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(file.id)}
              aria-pressed={active}
              aria-label={`Prévisualiser ${file.filename}`}
              title={file.filename}
              className={`rounded-lg ring-2 transition-all ${
                active
                  ? "ring-[var(--pf-primary)]"
                  : "ring-transparent hover:ring-[var(--pf-primary)]/40"
              }`}
            >
              <ImageThumbnail
                src={file.url}
                alt={file.filename}
                size={56}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}