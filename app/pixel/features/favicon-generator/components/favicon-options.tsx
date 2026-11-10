/*
path:            app/pixel/features/favicon-generator/components/favicon-options.tsx
tag:             ["pixel", "feature", "favicon-generator", "component", "options"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Options du generateur : selection des tailles (checkboxes),
                 manifest (nom, short_name, couleurs), toggles Apple/Android.

flow:            Props { options, onChange, disabled? } -> checkboxes
                 tailles + 4 inputs manifest + 2 checkboxes.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                  "@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["@/app/pixel/features/favicon-generator/types/favicon.types"]
exports:         ["FaviconOptions", "FaviconOptionsProps"]
useBy:           ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir les tailles et le manifest"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : checkboxes + inputs.

import {
  FAVICON_SIZES,
  type FaviconGeneratorOptions,
  type FaviconSize,
} from "@/app/pixel/features/favicon-generator/types/favicon.types";

export interface FaviconOptionsProps {
  readonly options: FaviconGeneratorOptions;
  readonly onChange: (next: FaviconGeneratorOptions) => void;
  readonly disabled?: boolean;
}

export function FaviconOptions({ options, onChange, disabled = false }: FaviconOptionsProps) {
  function toggleSize(size: FaviconSize) {
    const set = new Set(options.sizes);
    if (set.has(size)) set.delete(size);
    else set.add(size);
    if (set.size === 0) set.add(16);
    onChange({ ...options, sizes: Array.from(set).sort((a, b) => a - b) });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Tailles ICO
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FAVICON_SIZES.map((size) => {
            const active = options.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-full px-2.5 py-1 text-xs font-mono font-semibold transition-colors ${
                  active
                    ? "bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
                    : "bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)] hover:bg-[var(--pf-surface-hover)]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Manifest
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={options.manifest.appName}
            onChange={(e) => onChange({ ...options, manifest: { ...options.manifest, appName: e.target.value } })}
            placeholder="Nom complet"
            disabled={disabled}
            className="h-8 rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 text-xs text-[var(--pf-foreground)]"
          />
          <input
            type="text"
            value={options.manifest.shortName}
            onChange={(e) => onChange({ ...options, manifest: { ...options.manifest, shortName: e.target.value } })}
            placeholder="Nom court"
            disabled={disabled}
            className="h-8 rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 px-2 text-xs text-[var(--pf-foreground)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={options.manifest.themeColor}
              onChange={(e) => onChange({ ...options, manifest: { ...options.manifest, themeColor: e.target.value } })}
              disabled={disabled}
              className="size-8 cursor-pointer rounded border border-[var(--pf-border)]/60"
            />
            <span className="font-mono text-[10px] text-[var(--pf-muted)]">Theme</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={options.manifest.backgroundColor}
              onChange={(e) => onChange({ ...options, manifest: { ...options.manifest, backgroundColor: e.target.value } })}
              disabled={disabled}
              className="size-8 cursor-pointer rounded border border-[var(--pf-border)]/60"
            />
            <span className="font-mono text-[10px] text-[var(--pf-muted)]">Background</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={options.includeAppleTouch}
            onChange={(e) => onChange({ ...options, includeAppleTouch: e.target.checked })}
            disabled={disabled}
            className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
          />
          <span className="text-[var(--pf-foreground)]">Apple Touch Icon (180x180)</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={options.includeAndroidChrome}
            onChange={(e) => onChange({ ...options, includeAndroidChrome: e.target.checked })}
            disabled={disabled}
            className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
          />
          <span className="text-[var(--pf-foreground)]">Android Chrome (192 + 512)</span>
        </label>
      </div>
    </div>
  );
}