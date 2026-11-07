/*
path:            app/pixel/features/converter/components/quality-control.tsx
tag:             ["pixel", "feature", "converter", "component", "quality", "mode"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Controle de la qualite (slider 0-100) + toggle du mode
                 de compression (lossy / lossless / near-lossless).
                 Masque automatiquement le slider si le format cible
                 ne supporte pas la qualite (TIFF). Masque les modes
                 non supportes par le format (via
                 FORMAT_CAPABILITIES[format].modes). Affiche la valeur
                 en direct (font-mono tabular-nums).

flow:            Props { format, quality, mode, onChange, disabled? }
                 -> recupere les capacites du format -> si
                 caps.quality : affiche le slider -> si caps.modes
                 contient au moins 1 mode : affiche le toggle. onChange
                 remonte les changements.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/image"]
exports:         ["QualityControl", "QualityControlProps"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux regler la qualite et le mode de compression"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : sliders + toggle = interaction.

import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";
import type { ConversionMode } from "@/app/pixel/types/conversion";
import type { ImageFormat } from "@/app/pixel/types/image";

export interface QualityControlProps {
  readonly format: ImageFormat;
  readonly quality: number;
  readonly mode: ConversionMode | null;
  readonly onChange: (next: {
    readonly quality?: number;
    readonly mode?: ConversionMode | null;
  }) => void;
  readonly disabled?: boolean;
}

const MODE_LABELS: Readonly<Record<ConversionMode, string>> = {
  lossy: "Avec perte",
  lossless: "Sans perte",
  "near-lossless": "Quasi sans perte",
};

export function QualityControl({
  format,
  quality,
  mode,
  onChange,
  disabled = false,
}: QualityControlProps) {
  const caps = FORMAT_CAPABILITIES[format];
  const showQuality = caps.quality;
  const availableModes = caps.modes;

  return (
    <div className="space-y-3">
      {showQuality && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="converter-quality"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
            >
              Qualite
            </label>
            <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
              {quality}
            </span>
          </div>
          <input
            id="converter-quality"
            type="range"
            min={1}
            max={100}
            step={1}
            value={quality}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            disabled={disabled}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
          />
        </div>
      )}

      {availableModes.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Mode de compression
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableModes.map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ mode: m })}
                  disabled={disabled}
                  aria-pressed={active}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
                      : "bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)] hover:bg-[var(--pf-surface-hover)]"
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}