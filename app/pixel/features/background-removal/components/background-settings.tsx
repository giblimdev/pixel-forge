/*
path:            app/pixel/features/background-removal/components/background-settings.tsx
tag:             ["pixel", "feature", "background-removal", "component", "settings"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Reglages du detourage : slider de tolerance (0-100 %)
                 + toggle feathering + affichage de la couleur cible.

flow:            Props { target, tolerance, feathering, onChange,
                 disabled? } -> swatch couleur + slider + checkbox.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx",
                  "@/app/pixel/features/background-removal/types/background.types.ts"]
imports:         ["@/app/pixel/features/background-removal/types/background.types"]
exports:         ["BackgroundSettings", "BackgroundSettingsProps"]
useBy:           ["@/app/pixel/features/background-removal/components/background-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux regler la tolerance et le lissage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : slider + checkbox.

import type { RgbColor } from "@/app/pixel/features/background-removal/types/background.types";

export interface BackgroundSettingsProps {
  readonly target: RgbColor;
  readonly tolerance: number;
  readonly feathering: boolean;
  readonly onChange: (next: { tolerance?: number; feathering?: boolean }) => void;
  readonly disabled?: boolean;
}

export function BackgroundSettings({
  target,
  tolerance,
  feathering,
  onChange,
  disabled = false,
}: BackgroundSettingsProps) {
  const tolerancePct = Math.round(tolerance * 100);
  const hex = `#${[target.r, target.g, target.b]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="size-6 shrink-0 rounded border border-[var(--pf-border)]/60"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
        <span className="font-mono text-xs text-[var(--pf-foreground)]">
          {hex.toUpperCase()} ({target.r}, {target.g}, {target.b})
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Tolerance
          </span>
          <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
            {tolerancePct}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={tolerancePct}
          onChange={(e) => onChange({ tolerance: Number(e.target.value) / 100 })}
          disabled={disabled}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
        />
        <p className="text-[10px] text-[var(--pf-muted)]">
          Plus haut = plus de pixels consideres comme fond.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={feathering}
          onChange={(e) => onChange({ feathering: e.target.checked })}
          disabled={disabled}
          className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
        />
        <span className="text-[var(--pf-foreground)]">
          Lisser les contours (anti-aliasing)
        </span>
      </label>
    </div>
  );
}