/*
path:            app/pixel/features/compressor/components/compression-settings.tsx
tag:             ["pixel", "feature", "compressor", "component", "settings"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Reglages de compression : qualite (slider 0-100),
                 palette PNG (toggle), strip metadata (toggle).

flow:            Props { options, onChange, disabled? } -> slider +
                 toggles.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/components/compressor-panel.tsx",
                  "@/app/pixel/features/compressor/types/compressor.types.ts"]
imports:         ["@/app/pixel/features/compressor/types/compressor.types"]
exports:         ["CompressionSettings", "CompressionSettingsProps"]
useBy:           ["@/app/pixel/features/compressor/components/compressor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux regler la qualite et la palette PNG"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : sliders + toggles.

import type { CompressorOptions } from "@/app/pixel/features/compressor/types/compressor.types";

export interface CompressionSettingsProps {
  readonly options: CompressorOptions;
  readonly onChange: (next: CompressorOptions) => void;
  readonly disabled?: boolean;
}

export function CompressionSettings({
  options,
  onChange,
  disabled = false,
}: CompressionSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="compressor-quality"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
          >
            Qualite
          </label>
          <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
            {options.quality}
          </span>
        </div>
        <input
          id="compressor-quality"
          type="range"
          min={1}
          max={100}
          step={1}
          value={options.quality}
          onChange={(e) => onChange({ ...options, quality: Number(e.target.value) })}
          disabled={disabled}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.palette}
          onChange={(e) => onChange({ ...options, palette: e.target.checked })}
          disabled={disabled}
          className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
        />
        <span className="text-[var(--pf-foreground)]">Reduire la palette PNG (256 couleurs)</span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.stripMetadata}
          onChange={(e) => onChange({ ...options, stripMetadata: e.target.checked })}
          disabled={disabled}
          className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
        />
        <span className="text-[var(--pf-foreground)]">Supprimer EXIF / ICC</span>
      </label>
    </div>
  );
}