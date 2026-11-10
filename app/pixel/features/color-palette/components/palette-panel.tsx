/*
path:            app/pixel/features/color-palette/components/palette-panel.tsx
tag:             ["pixel", "feature", "color-palette", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'extracteur de palettes (outil 11).
                 Remplace le placeholder. Compose :
                 - ImageUploader (si file vide)
                 - Reglages (nombre de couleurs, skip extremes, taille
                   d'echantillon)
                 - Bouton "Extraire la palette"
                 - PalettePreview (swatches par image)
                 - PaletteExport (CSS / Tailwind / JSON) par image
                 - Liste des erreurs.
                 Mobile-first (grid-cols-1 -> md:grid-cols-2).

flow:            useColorPalette() + useImageQueueStore ->
                 si pendingCount === 0 : ImageUploader ->
                 sinon : reglages + bouton ->
                 outcome : pour chaque success, PalettePreview + PaletteExport
                 -> erreurs eventuelles.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                  "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                  "@/app/pixel/features/color-palette/components/palette-export.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/color-palette/hooks/use-color-palette",
                  "@/app/pixel/features/color-palette/types/palette.types",
                  "@/app/pixel/features/color-palette/components/palette-preview",
                  "@/app/pixel/features/color-palette/components/palette-export",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/stores/image-queue.store",
                  "@/components/ui/button"]
exports:         ["PalettePanel", "PalettePanelProps"]
useBy:           ["@/app/pixel/generate/palette/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux extraire les couleurs dominantes d'une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : hook + store Zustand + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { useColorPalette } from "@/app/pixel/features/color-palette/hooks/use-color-palette";
import type { PaletteGeneratorOptions } from "@/app/pixel/features/color-palette/types/palette.types";
import { PalettePreview } from "@/app/pixel/features/color-palette/components/palette-preview";
import { PaletteExport } from "@/app/pixel/features/color-palette/components/palette-export";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PalettePanelProps {
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function PalettePanel({ className }: PalettePanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useColorPalette();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  const hasPending = items.some((i) => i.status === "pending");

  function patch(partial: Partial<PaletteGeneratorOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="palette-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="palette-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Extracteur de palettes
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image pour extraire ses couleurs dominantes."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      {!hasPending ? (
        <ImageUploader />
      ) : (
        <>
          {/* --- Reglages --- */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="palette-color-count"
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
                >
                  Nombre de couleurs
                </label>
                <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
                  {options.colorCount}
                </span>
              </div>
              <input
                id="palette-color-count"
                type="range"
                min={1}
                max={10}
                value={options.colorCount}
                onChange={(e) => patch({ colorCount: Number(e.target.value) })}
                disabled={running}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.skipExtremes}
                onChange={(e) => patch({ skipExtremes: e.target.checked })}
                disabled={running}
                className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
              />
              <span className="text-[var(--pf-foreground)]">
                Ignorer les pixels quasi-blancs et quasi-noirs
              </span>
            </label>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="palette-sample-size"
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
                >
                  Taille d&apos;echantillon (px)
                </label>
                <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
                  {options.sampleSize}
                </span>
              </div>
              <input
                id="palette-sample-size"
                type="range"
                min={50}
                max={400}
                step={25}
                value={options.sampleSize}
                onChange={(e) => patch({ sampleSize: Number(e.target.value) })}
                disabled={running}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
              />
              <p className="text-[10px] text-[var(--pf-muted)]">
                Plus grand = plus precis mais plus lent.
              </p>
            </div>
          </div>

          {/* --- Bouton --- */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
            <p className="text-xs text-[var(--pf-muted)]">
              Options appliquees a toute la file.
            </p>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={pendingCount === 0 || running}
              className="gap-1.5 bg-gradient-to-r from-[var(--pf-success)] to-[var(--pf-primary)] text-white"
            >
              {running ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Extraction...
                </>
              ) : (
                <>
                  Extraire la palette
                  {pendingCount > 0 ? ` (${pendingCount})` : ""}
                  <ArrowRight className="size-3.5" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* --- Resultats --- */}
      {outcome && outcome.success.length > 0 && (
        <ul className="space-y-4 pt-2">
          {outcome.success.map((result) => (
            <li
              key={result.sourceId}
              className="space-y-3 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
            >
              <PalettePreview result={result} />
              <PaletteExport result={result} />
            </li>
          ))}
        </ul>
      )}

      {/* --- Erreurs --- */}
      {outcome && outcome.errors.length > 0 && (
        <ul className="space-y-2 pt-2">
          {outcome.errors.map((e, i) => (
            <li
              key={`err-${e.sourceId}-${i}`}
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
            >
              <code className="font-mono text-[10px] uppercase">
                {e.error.code}
              </code>
              {" : "}
              {e.sourceFilename} - {e.error.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}