/*
path:            app/pixel/features/optimizer/components/target-size-control.tsx
tag:             ["pixel", "feature", "optimizer", "component", "target-size"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Controle du poids cible (en Ko) + qualite minimale.
                 Affiche un input numerique + un slider qualite min.
                 Utilise uniquement si strategy.kind === "target-size".

flow:            Props { targetBytes, minQuality, onChange, disabled? }
                 -> input Ko (converti en octets) + slider qualite ->
                 onChange({ targetBytes?, minQuality? }).

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]
imports:         []
exports:         ["TargetSizeControl", "TargetSizeControlProps"]
useBy:           ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux viser un poids cible en Ko"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : input + slider.

export interface TargetSizeControlProps {
  readonly targetBytes: number;
  readonly minQuality: number;
  readonly onChange: (next: {
    readonly targetBytes?: number;
    readonly minQuality?: number;
  }) => void;
  readonly disabled?: boolean;
}

export function TargetSizeControl({
  targetBytes,
  minQuality,
  onChange,
  disabled = false,
}: TargetSizeControlProps) {
  const targetKo = Math.round(targetBytes / 1024);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label
          htmlFor="target-size-ko"
          className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
        >
          Poids cible
        </label>
        <div className="flex items-center gap-2">
          <input
            id="target-size-ko"
            type="number"
            min={1}
            max={25600}
            step={1}
            value={targetKo}
            onChange={(e) =>
              onChange({ targetBytes: Number(e.target.value) * 1024 })
            }
            disabled={disabled}
            className="h-9 w-full rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 font-mono text-sm text-[var(--pf-foreground)]"
          />
          <span className="font-mono text-xs text-[var(--pf-muted)]">Ko</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="min-quality"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]"
          >
            Qualite minimale
          </label>
          <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
            {minQuality}
          </span>
        </div>
        <input
          id="min-quality"
          type="range"
          min={0}
          max={100}
          step={1}
          value={minQuality}
          onChange={(e) => onChange({ minQuality: Number(e.target.value) })}
          disabled={disabled}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
        />
      </div>
    </div>
  );
}