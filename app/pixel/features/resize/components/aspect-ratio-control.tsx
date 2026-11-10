/*
path:            app/pixel/features/resize/components/aspect-ratio-control.tsx
tag:             ["pixel", "feature", "resize", "component", "fit"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Toggle du mode de fit (cover / contain / inside).

flow:            Props { value, onChange, disabled? } -> 3 boutons.

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
relatedFiles:    ["@/app/pixel/features/resize/components/resize-panel.tsx",
                  "@/app/pixel/features/resize/types/resize.types.ts"]
imports:         ["@/app/pixel/features/resize/types/resize.types"]
exports:         ["AspectRatioControl", "AspectRatioControlProps"]
useBy:           ["@/app/pixel/features/resize/components/resize-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir comment l'image tient dans les dimensions"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons interactifs.

import type { ResizeFit } from "@/app/pixel/features/resize/types/resize.types";

export interface AspectRatioControlProps {
  readonly value: ResizeFit;
  readonly onChange: (next: ResizeFit) => void;
  readonly disabled?: boolean;
}

const FITS: readonly { readonly value: ResizeFit; readonly label: string; readonly hint: string }[] = [
  { value: "inside", label: "Inside", hint: "Ne pas agrandir" },
  { value: "contain", label: "Contain", hint: "Marges possibles" },
  { value: "cover", label: "Cover", hint: "Remplit, coupe" },
];

export function AspectRatioControl({
  value,
  onChange,
  disabled = false,
}: AspectRatioControlProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Mode de fit
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {FITS.map((fit) => {
          const active = value === fit.value;
          return (
            <button
              key={fit.value}
              type="button"
              onClick={() => onChange(fit.value)}
              disabled={disabled}
              aria-pressed={active}
              className={`rounded-lg border p-2 text-left transition-colors ${
                active
                  ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                  : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
              }`}
            >
              <p className="text-xs font-semibold">{fit.label}</p>
              <p className="text-[10px] text-[var(--pf-muted)]">{fit.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}