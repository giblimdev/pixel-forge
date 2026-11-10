/*
path:            app/pixel/features/resize/components/resize-presets.tsx
tag:             ["pixel", "feature", "resize", "component", "presets"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Presets responsive : 320, 640, 1280, 1920 px de large.
                 Au clic, met a jour width ET height (proportionnel).

flow:            Props { onSelect, disabled? } -> 4 boutons.

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
imports:         []
exports:         ["ResizePresets", "ResizePresetsProps"]
useBy:           ["@/app/pixel/features/resize/components/resize-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir une taille responsive prdefinie"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons interactifs.

export interface ResizePresetsProps {
  readonly onSelect: (width: number) => void;
  readonly disabled?: boolean;
}

const PRESETS: readonly number[] = [320, 640, 1280, 1920];

export function ResizePresets({ onSelect, disabled = false }: ResizePresetsProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Presets responsive
      </span>
      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onSelect(w)}
            disabled={disabled}
            className="rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 py-1.5 text-center text-xs font-mono font-semibold text-[var(--pf-foreground)] transition-colors hover:border-[var(--pf-primary)]/40 hover:bg-[var(--pf-primary)]/5"
          >
            {w}w
          </button>
        ))}
      </div>
    </div>
  );
}