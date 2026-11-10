/*
path:            app/pixel/features/crop-editor/components/crop-controls.tsx
tag:             ["pixel", "feature", "crop-editor", "component", "controls"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Controles de l'editeur : selection du ratio (1:1, 4:3,
                 3:2, 16:9, 21:9) + format de sortie + qualite. Les
                 changements remontent au parent.

flow:            Props { options, onChange, disabled? } -> 5 boutons
                 ratio + dropdown format + slider qualite.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types.ts"]
imports:         ["@/app/pixel/features/crop-editor/types/crop-editor.types",
                  "@/components/ui/native-select"]
exports:         ["CropControls", "CropControlsProps"]
useBy:           ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir un ratio et un format de sortie"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons + inputs.

import type { CropEditorOptions } from "@/app/pixel/features/crop-editor/types/crop-editor.types";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export interface CropControlsProps {
  readonly options: CropEditorOptions;
  readonly onChange: (next: Partial<CropEditorOptions>) => void;
  readonly disabled?: boolean;
}

const RATIOS: readonly { readonly label: string; readonly value: number }[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "21:9", value: 21 / 9 },
];

export function CropControls({
  options,
  onChange,
  disabled = false,
}: CropControlsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Ratio
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {RATIOS.map((r) => {
            const active = Math.abs(options.aspectRatio - r.value) < 0.01;
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

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Format
          </span>
          <NativeSelect
            value={options.format}
            onChange={(e) => onChange({ format: e.target.value as CropEditorOptions["format"] })}
            disabled={disabled}
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
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            disabled={disabled}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
          />
        </div>
      </div>
    </div>
  );
}