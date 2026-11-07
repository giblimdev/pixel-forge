/*
path:            app/pixel/features/optimizer/components/optimizer-panel.tsx
tag:             ["pixel", "feature", "optimizer", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'optimiseur (outil 02). Compose
                 OptimizationPresets + TargetSizeControl + bouton
                 "Optimiser" + results (ComparisonStats + ImageComparison
                 par fichier). Lit useOptimizer.

flow:            useOptimizer() -> rend presets + controls + bouton
                 -> si outcome : liste des succes avec ComparisonStats
                 + ImageComparison + lien telecharger.

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                  "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/optimizer/hooks/use-optimizer",
                  "@/app/pixel/features/optimizer/types/optimizer.types",
                  "@/app/pixel/features/optimizer/components/optimization-presets",
                  "@/app/pixel/features/optimizer/components/target-size-control",
                  "@/app/pixel/components/image-comparison/comparison-stats",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/optimization",
                  "@/components/ui/button"]
exports:         ["OptimizerPanel", "OptimizerPanelProps"]
useBy:           ["@/app/pixel/optimize/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux optimiser mes images avec un preset ou un poids cible"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Download, Loader2 } from "lucide-react";

import { useOptimizer } from "@/app/pixel/features/optimizer/hooks/use-optimizer";
import type { OptimizationOptions } from "@/app/pixel/types/optimization";
import { OptimizationPresets } from "@/app/pixel/features/optimizer/components/optimization-presets";
import { TargetSizeControl } from "@/app/pixel/features/optimizer/components/target-size-control";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

export interface OptimizerPanelProps {
  readonly className?: string;
}

export function OptimizerPanel({ className }: OptimizerPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useOptimizer();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  function patch(partial: Partial<OptimizationOptions>) {
    setOptions({ ...options, ...partial });
  }

  const showTargetSize = options.strategy.kind === "target-size";

  return (
    <section
      aria-labelledby="optimizer-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="optimizer-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Options d&apos;optimisation
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez des images a la file pour commencer."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      <OptimizationPresets
        value={options.preset}
        onChange={(preset) => {
          if (preset === "web-max") patch({ preset, strategy: { kind: "quality", quality: 90 } });
          else if (preset === "web-balanced") patch({ preset, strategy: { kind: "quality", quality: 80 } });
          else if (preset === "web-aggressive") patch({ preset, strategy: { kind: "quality", quality: 60 } });
          else if (preset === "thumbnail") patch({ preset, strategy: { kind: "quality", quality: 70 }, resize: { maxWidth: 320, maxHeight: 320, fit: "inside" } });
          else patch({ preset: "custom" });
        }}
        disabled={running}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            patch({ strategy: { kind: "target-size", targetBytes: 200 * 1024, minQuality: 20 } })
          }
          disabled={running}
          aria-pressed={showTargetSize}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showTargetSize
              ? "bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
              : "bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)]"
          }`}
        >
          Poids cible
        </button>
        <button
          type="button"
          onClick={() => patch({ strategy: { kind: "quality", quality: 80 } })}
          disabled={running}
          aria-pressed={!showTargetSize}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !showTargetSize
              ? "bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
              : "bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)]"
          }`}
        >
          Qualite fixe
        </button>
      </div>

      {showTargetSize && options.strategy.kind === "target-size" && (
        <TargetSizeControl
          targetBytes={options.strategy.targetBytes}
          minQuality={options.strategy.minQuality}
          onChange={(next) => {
            if (options.strategy.kind !== "target-size") return;
            patch({
              strategy: {
                ...options.strategy,
                ...next,
              },
            });
          }}
          disabled={running}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          Le format source est conserve. Options appliquees a toute la file.
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
              Optimisation...
            </>
          ) : (
            <>
              Optimiser {pendingCount > 0 ? `(${pendingCount})` : ""}
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

      {items.length > 0 && !outcome && (
        <p className="text-[10px] text-[var(--pf-muted)]">
          Pret a optimiser {items.filter((i) => i.status === "pending").length} fichier(s).
        </p>
      )}
    </section>
  );
}