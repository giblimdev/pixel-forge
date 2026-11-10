/*
path:            app/pixel/features/image-editor/components/adjustment-controls.tsx
tag:             ["pixel", "feature", "image-editor", "component", "adjustments"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Sliders de retouche : luminosite, contraste, saturation,
                 teinte, flou, nettete + toggle grayscale.

flow:            Props { adjustments, onChange, disabled? } -> 6 sliders
                 + 1 checkbox.

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/types/image-editor.types.ts",
                   "@/app/pixel/features/image-editor/schemas/image-editor.schema.ts",
                   "@/app/pixel/features/image-editor/hooks/use-image-editor.ts",
                   "@/app/pixel/features/image-editor/components/adjustment-controls.tsx",
                   "@/app/pixel/features/image-editor/components/watermark-editor.tsx",
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                  "@/app/pixel/features/image-editor/types/image-editor.types.ts"]
imports:         ["@/app/pixel/features/image-editor/types/image-editor.types"]
exports:         ["AdjustmentControls", "AdjustmentControlsProps"]
useBy:           ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux regler luminosite, contraste, saturation, etc."]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : sliders + checkbox.

import type { RetouchAdjustments } from "@/app/pixel/features/image-editor/types/image-editor.types";

export interface AdjustmentControlsProps {
  readonly adjustments: RetouchAdjustments;
  readonly onChange: (next: Partial<RetouchAdjustments>) => void;
  readonly disabled?: boolean;
}

interface SliderConfig {
  readonly key: keyof Omit<RetouchAdjustments, "grayscale">;
  readonly label: string;
  readonly min: number;
  readonly max: number;
}

const SLIDERS: readonly SliderConfig[] = [
  { key: "brightness", label: "Luminosite", min: -100, max: 100 },
  { key: "contrast", label: "Contraste", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "hue", label: "Teinte", min: -180, max: 180 },
  { key: "blur", label: "Flou", min: 0, max: 100 },
  { key: "sharpen", label: "Nettete", min: 0, max: 100 },
];

export function AdjustmentControls({
  adjustments,
  onChange,
  disabled = false,
}: AdjustmentControlsProps) {
  return (
    <div className="space-y-3">
      {SLIDERS.map((slider) => (
        <div key={slider.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              {slider.label}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
              {adjustments[slider.key]}
            </span>
          </div>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            value={adjustments[slider.key]}
            onChange={(e) => onChange({ [slider.key]: Number(e.target.value) })}
            disabled={disabled}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
          />
        </div>
      ))}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={adjustments.grayscale}
          onChange={(e) => onChange({ grayscale: e.target.checked })}
          disabled={disabled}
          className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
        />
        <span className="text-[var(--pf-foreground)]">Niveaux de gris</span>
      </label>
    </div>
  );
}