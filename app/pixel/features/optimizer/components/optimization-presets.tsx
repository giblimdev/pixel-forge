/*
path:            app/pixel/features/optimizer/components/optimization-presets.tsx
tag:             ["pixel", "feature", "optimizer", "component", "presets"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Selection d'un preset d'optimisation (5 choix :
                 web-max, web-balanced, web-aggressive, thumbnail,
                 custom). Chaque preset met a jour la strategie
                 correspondante via le parent.

flow:            Props { value, onChange, disabled? } -> 5 boutons radio
                 stylises -> onChange(preset).

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                  "@/app/pixel/types/optimization.ts"]
imports:         ["@/app/pixel/types/optimization"]
exports:         ["OptimizationPresets", "OptimizationPresetsProps"]
useBy:           ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir un preset d'optimisation"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons interactifs.

import type { OptimizationPreset } from "@/app/pixel/types/optimization";

export interface OptimizationPresetsProps {
  readonly value: OptimizationPreset;
  readonly onChange: (next: OptimizationPreset) => void;
  readonly disabled?: boolean;
}

const PRESETS: readonly {
  readonly value: OptimizationPreset;
  readonly label: string;
  readonly hint: string;
}[] = [
  { value: "web-max", label: "Web max", hint: "Qualite perceptible" },
  { value: "web-balanced", label: "Web equilibre", hint: "Qualite / poids" },
  { value: "web-aggressive", label: "Web agressif", hint: "Poids minimal" },
  { value: "thumbnail", label: "Vignette", hint: "Petite taille" },
  { value: "custom", label: "Custom", hint: "Reglages manuels" },
];

export function OptimizationPresets({
  value,
  onChange,
  disabled = false,
}: OptimizationPresetsProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Preset
      </span>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {PRESETS.map((p) => {
          const active = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              disabled={disabled}
              aria-pressed={active}
              className={`rounded-lg border p-2 text-left transition-colors ${
                active
                  ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                  : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
              }`}
            >
              <p className="text-xs font-semibold">{p.label}</p>
              <p className="text-[10px] text-[var(--pf-muted)]">{p.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}