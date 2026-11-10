/*
path:            app/pixel/features/export-manager/components/export-options.tsx
tag:             ["pixel", "feature", "export-manager", "component", "options"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Reglages de l'export : organisation du ZIP (flat /
                 by-format / by-size) + toggle "inclure manifest.txt".
                 Purement presentationnel : remonte les changements au
                 parent via onChange.

flow:            Props { options, onChange, disabled? } -> 3 boutons
                 d'organisation + 1 checkbox manifest.

ecosystem:       ExportManager = [
                   "@/app/pixel/features/export-manager/types/export-manager.types.ts",
                   "@/app/pixel/features/export-manager/schemas/export-manager.schema.ts",
                   "@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "@/app/pixel/features/export-manager/components/export-options.tsx",
                   "@/app/pixel/features/export-manager/components/export-item.tsx",
                   "@/app/pixel/features/export-manager/components/export-progress.tsx",
                   "@/app/pixel/features/export-manager/components/export-manager.tsx",
                   "@/app/pixel/features/export-manager/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/export-manager/components/export-manager.tsx",
                  "@/app/pixel/types/export.ts"]
imports:         ["@/app/pixel/types/export"]
exports:         ["ExportOptionsControls", "ExportOptionsControlsProps"]
useBy:           ["@/app/pixel/features/export-manager/components/export-manager.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir comment organiser mon ZIP"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons + checkbox.

import type { ExportOptions } from "@/app/pixel/types/export";

export interface ExportOptionsControlsProps {
  readonly options: ExportOptions;
  readonly onChange: (next: ExportOptions) => void;
  readonly disabled?: boolean;
}

const ORGANIZATIONS: readonly {
  readonly value: ExportOptions["organization"];
  readonly label: string;
  readonly hint: string;
}[] = [
  { value: "flat", label: "Plat", hint: "Tous a la racine" },
  { value: "by-format", label: "Par format", hint: "webp/, png/..." },
  { value: "by-size", label: "Par taille", hint: "-640w/, -1280w/..." },
];

export function ExportOptionsControls({
  options,
  onChange,
  disabled = false,
}: ExportOptionsControlsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Organisation
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {ORGANIZATIONS.map((org) => {
            const active = options.organization === org.value;
            return (
              <button
                key={org.value}
                type="button"
                onClick={() => onChange({ ...options, organization: org.value })}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  active
                    ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                    : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
                }`}
              >
                <p className="text-xs font-semibold">{org.label}</p>
                <p className="text-[10px] text-[var(--pf-muted)]">{org.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.includeManifest}
          onChange={(e) =>
            onChange({ ...options, includeManifest: e.target.checked })
          }
          disabled={disabled}
          className="size-4 rounded border-[var(--pf-border)]/60 accent-[var(--pf-primary)]"
        />
        <span className="text-[var(--pf-foreground)]">
          Inclure un fichier manifest.txt
        </span>
      </label>
    </div>
  );
}