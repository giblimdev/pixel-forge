/*
path:            app/pixel/features/resize/components/dimensions-input.tsx
tag:             ["pixel", "feature", "resize", "component", "dimensions"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Input largeur / hauteur. Numero + bouton "swap".

flow:            Props { width, height, onChange, disabled? } -> 2
                 inputs numeriques + bouton d'inversion.

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
relatedFiles:    ["@/app/pixel/features/resize/components/resize-panel.tsx"]
imports:         ["lucide-react"]
exports:         ["DimensionsInput", "DimensionsInputProps"]
useBy:           ["@/app/pixel/features/resize/components/resize-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux saisir largeur et hauteur"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : inputs + bouton swap.

import { ArrowLeftRight } from "lucide-react";

export interface DimensionsInputProps {
  readonly width: number;
  readonly height: number;
  readonly onChange: (next: { width?: number; height?: number }) => void;
  readonly disabled?: boolean;
}

export function DimensionsInput({
  width,
  height,
  onChange,
  disabled = false,
}: DimensionsInputProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Dimensions
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label
            htmlFor="resize-width"
            className="block text-[10px] uppercase text-[var(--pf-muted)]"
          >
            Largeur
          </label>
          <input
            id="resize-width"
            type="number"
            min={1}
            max={8000}
            value={width}
            onChange={(e) => onChange({ width: Number(e.target.value) })}
            disabled={disabled}
            className="h-9 w-full rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 font-mono text-sm text-[var(--pf-foreground)]"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ width: height, height: width })}
          disabled={disabled}
          aria-label="Inverser largeur et hauteur"
          className="mt-4 grid size-9 place-items-center rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)] hover:text-[var(--pf-foreground)]"
        >
          <ArrowLeftRight className="size-3.5" aria-hidden />
        </button>
        <div className="flex-1">
          <label
            htmlFor="resize-height"
            className="block text-[10px] uppercase text-[var(--pf-muted)]"
          >
            Hauteur
          </label>
          <input
            id="resize-height"
            type="number"
            min={1}
            max={8000}
            value={height}
            onChange={(e) => onChange({ height: Number(e.target.value) })}
            disabled={disabled}
            className="h-9 w-full rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 font-mono text-sm text-[var(--pf-foreground)]"
          />
        </div>
      </div>
    </div>
  );
}