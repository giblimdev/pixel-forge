/*
path:            app/pixel/features/smart-crop/components/crop-ratio-selector.tsx
tag:             ["pixel", "feature", "smart-crop", "component", "ratio"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Selection du ratio cible (parmi une liste de ratios
                 predefinis : 1:1, 4:3, 3:2, 16:9, 21:9) + toggle de
                 strategie (attention / entropy).

flow:            Props { aspectRatio, strategy, onChange, disabled? }
                 -> 5 boutons ratio + 2 boutons strategie.

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/types/smart-crop.types.ts",
                   "@/app/pixel/features/smart-crop/schemas/smart-crop.schema.ts",
                   "@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                   "@/app/pixel/features/smart-crop/components/crop-ratio-selector.tsx",
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                  "@/app/pixel/features/smart-crop/types/smart-crop.types.ts"]
imports:         ["@/app/pixel/features/smart-crop/types/smart-crop.types"]
exports:         ["CropRatioSelector", "CropRatioSelectorProps"]
useBy:           ["@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir un ratio de recadrage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons interactifs.

import type {
  CropRatio,
  SmartCropStrategy,
} from "@/app/pixel/features/smart-crop/types/smart-crop.types";

export interface CropRatioSelectorProps {
  readonly aspectRatio: number;
  readonly strategy: SmartCropStrategy;
  readonly onChange: (next: { aspectRatio?: number; strategy?: SmartCropStrategy }) => void;
  readonly disabled?: boolean;
}

const RATIOS: readonly CropRatio[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "21:9", value: 21 / 9 },
];

const STRATEGIES: readonly { readonly value: SmartCropStrategy; readonly label: string }[] = [
  { value: "attention", label: "Attention" },
  { value: "entropy", label: "Entropy" },
];

export function CropRatioSelector({
  aspectRatio,
  strategy,
  onChange,
  disabled = false,
}: CropRatioSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Ratio cible
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {RATIOS.map((r) => {
            const active = Math.abs(aspectRatio - r.value) < 0.01;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => onChange({ aspectRatio: r.value })}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-lg border py-1.5 text-center text-xs font-mono font-semibold transition-colors ${
                  active
                    ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                    : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Strategie
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {STRATEGIES.map((s) => {
            const active = strategy === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ strategy: s.value })}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-lg border py-1.5 text-center text-xs font-semibold transition-colors ${
                  active
                    ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                    : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}