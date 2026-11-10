/*
path:            app/pixel/features/image-editor/components/watermark-editor.tsx
tag:             ["pixel", "feature", "image-editor", "component", "watermark"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Editeur de watermark : toggle on/off, texte, taille,
                 position (9 ancrages), opacite, couleur. Si watermark
                 est null, affiche un bouton "Ajouter un filigrane".

flow:            Props { watermark, onChange, disabled? } -> si null :
                 bouton "Ajouter" -> sinon : input texte + sliders +
                 grille 3x3 pour position + color picker.

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
imports:         ["@/app/pixel/features/image-editor/types/image-editor.types",
                  "@/components/ui/button"]
exports:         ["WatermarkEditor", "WatermarkEditorProps"]
useBy:           ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux ajouter un filigrane sur mes images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : inputs + sliders + grille.

import type {
  WatermarkConfig,
  WatermarkPosition,
} from "@/app/pixel/features/image-editor/types/image-editor.types";
import { Button } from "@/components/ui/button";

export interface WatermarkEditorProps {
  readonly watermark: WatermarkConfig | null;
  readonly onChange: (next: WatermarkConfig | null) => void;
  readonly disabled?: boolean;
}

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  "top-left": "Haut gauche",
  "top-center": "Haut centre",
  "top-right": "Haut droite",
  "middle-left": "Milieu gauche",
  "middle-center": "Centre",
  "middle-right": "Milieu droite",
  "bottom-left": "Bas gauche",
  "bottom-center": "Bas centre",
  "bottom-right": "Bas droite",
};

const POSITION_GRID: readonly (readonly WatermarkPosition[])[] = [
  ["top-left", "top-center", "top-right"],
  ["middle-left", "middle-center", "middle-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];

export function WatermarkEditor({
  watermark,
  onChange,
  disabled = false,
}: WatermarkEditorProps) {
  if (watermark === null) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange({
            kind: "text",
            text: "PixelForge",
            sizePercent: 20,
            position: "bottom-right",
            opacity: 70,
            color: "#ffffff",
          })
        }
        disabled={disabled}
        className="w-full gap-1.5"
      >
        + Ajouter un filigrane
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Filigrane
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Retirer
        </Button>
      </div>

      <input
        type="text"
        value={watermark.text}
        onChange={(e) => onChange({ ...watermark, text: e.target.value })}
        placeholder="Texte du filigrane"
        maxLength={200}
        disabled={disabled}
        className="h-9 w-full rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 text-sm text-[var(--pf-foreground)]"
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--pf-muted)]">Taille</span>
          <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
            {watermark.sizePercent}%
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={watermark.sizePercent}
          onChange={(e) => onChange({ ...watermark, sizePercent: Number(e.target.value) })}
          disabled={disabled}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--pf-muted)]">Opacite</span>
          <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
            {watermark.opacity}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={watermark.opacity}
          onChange={(e) => onChange({ ...watermark, opacity: Number(e.target.value) })}
          disabled={disabled}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--pf-muted)]">Couleur</span>
        <input
          type="color"
          value={watermark.color}
          onChange={(e) => onChange({ ...watermark, color: e.target.value })}
          disabled={disabled}
          className="size-8 cursor-pointer rounded border border-[var(--pf-border)]/60 bg-transparent"
        />
        <span className="font-mono text-xs text-[var(--pf-foreground)]">
          {watermark.color.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-[var(--pf-muted)]">Position</span>
        <div className="grid grid-cols-3 gap-1">
          {POSITION_GRID.flat().map((pos) => {
            const active = watermark.position === pos;
            return (
              <button
                key={pos}
                type="button"
                onClick={() => onChange({ ...watermark, position: pos })}
                disabled={disabled}
                aria-pressed={active}
                aria-label={POSITION_LABELS[pos]}
                title={POSITION_LABELS[pos]}
                className={`grid aspect-square place-items-center rounded border text-[9px] font-mono transition-colors ${
                  active
                    ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
                    : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-muted)] hover:bg-[var(--pf-surface)]/60"
                }`}
              >
                {active ? "*" : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}