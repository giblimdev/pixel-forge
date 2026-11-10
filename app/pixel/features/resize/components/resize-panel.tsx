/*
path:            app/pixel/features/resize/components/resize-panel.tsx
tag:             ["pixel", "feature", "resize", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du redimensionnement (outil 04).
                 Compose DimensionsInput + AspectRatioControl +
                 ResizePresets + selection format/qualite + bouton
                 "Redimensionner" + resultats.

flow:            useResize() -> rend controles + bouton -> si
                 outcome : liste des succes avec lien telecharger +
                 ComparisonStats.

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/types/resize.types.ts",
                   "@/app/pixel/features/resize/schemas/resize.schema.ts",
                   "@/app/pixel/features/resize/hooks/use-resize.ts",
                   "@/app/pixel/features/resize/components/dimensions-input.tsx",
                   "@/app/pixel/features/resize/components/aspect-ratio-control.tsx",
                   "@/app/pixel/features/resize/components/resize-presets.tsx",
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/resize/hooks/use-resize.ts",
                  "@/app/pixel/features/resize/types/resize.types.ts",
                  "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/native-select.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/resize/hooks/use-resize",
                  "@/app/pixel/features/resize/types/resize.types",
                  "@/app/pixel/features/resize/components/dimensions-input",
                  "@/app/pixel/features/resize/components/aspect-ratio-control",
                  "@/app/pixel/features/resize/components/resize-presets",
                  "@/app/pixel/components/image-comparison/comparison-stats",
                  "@/components/ui/button",
                  "@/components/ui/native-select"]
exports:         ["ResizePanel", "ResizePanelProps"]
useBy:           ["@/app/pixel/optimize/resize/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux redimensionner mes images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Download, Loader2 } from "lucide-react";

import { useResize } from "@/app/pixel/features/resize/hooks/use-resize";
import type { ResizeFeatureOptions } from "@/app/pixel/features/resize/types/resize.types";
import { DimensionsInput } from "@/app/pixel/features/resize/components/dimensions-input";
import { AspectRatioControl } from "@/app/pixel/features/resize/components/aspect-ratio-control";
import { ResizePresets } from "@/app/pixel/features/resize/components/resize-presets";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export interface ResizePanelProps {
  readonly className?: string;
}

export function ResizePanel({ className }: ResizePanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useResize();
  const running = stage === "running";

  function patch(partial: Partial<ResizeFeatureOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="resize-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="resize-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Options de redimensionnement
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez des images a la file pour commencer."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      <DimensionsInput
        width={options.width}
        height={options.height}
        onChange={patch}
        disabled={running}
      />

      <AspectRatioControl
        value={options.fit}
        onChange={(fit) => patch({ fit })}
        disabled={running}
      />

      <ResizePresets
        onSelect={(w) => patch({ width: w, height: Math.round(w * (options.height / options.width)) })}
        disabled={running}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Format
          </span>
          <NativeSelect
            value={options.format}
            onChange={(e) => patch({ format: e.target.value as ResizeFeatureOptions["format"] })}
            disabled={running}
          >
            <NativeSelectOption value="webp">WebP</NativeSelectOption>
            <NativeSelectOption value="jpeg">JPEG</NativeSelectOption>
            <NativeSelectOption value="png">PNG</NativeSelectOption>
            <NativeSelectOption value="avif">AVIF</NativeSelectOption>
            <NativeSelectOption value="tiff">TIFF</NativeSelectOption>
          </NativeSelect>
        </label>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              Qualite
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
              {options.quality}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={options.quality}
            onChange={(e) => patch({ quality: Number(e.target.value) })}
            disabled={running}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          {options.width}x{options.height} - fit {options.fit}
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={pendingCount === 0 || running}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-secondary)] to-[var(--pf-primary)] text-white"
        >
          {running ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Redimensionnement...
            </>
          ) : (
            <>
              Redimensionner {pendingCount > 0 ? `(${pendingCount})` : ""}
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </div>

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