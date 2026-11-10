/*
path:            app/pixel/features/placeholder-generator/components/placeholder-output.tsx
tag:             ["pixel", "feature", "placeholder-generator", "component", "output"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Liste des codes exportables generes (1 par image). Chaque
                 ligne affiche le format, les dimensions et un bouton
                 "Copier". Permet a l'utilisateur de recuperer directement
                 le code a integrer dans sa page.

flow:            Props { results } -> map -> ligne avec code tronque +
                 bouton Copier (clipboard).

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts"]
imports:         ["react", "lucide-react",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types"]
exports:         ["PlaceholderOutput", "PlaceholderOutputProps"]
useBy:           ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux copier le code du placeholder"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : clipboard + interaction.

import { useState } from "react";
import { Copy, Check } from "lucide-react";

import type { PlaceholderResult } from "@/app/pixel/features/placeholder-generator/types/placeholder.types";

export interface PlaceholderOutputProps {
  readonly results: readonly PlaceholderResult[];
}

function CopyButton({ value }: { readonly value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--pf-primary)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-primary)] hover:bg-[var(--pf-primary)]/25"
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Copie" : "Copier"}
    </button>
  );
}

export function PlaceholderOutput({ results }: PlaceholderOutputProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Codes generes ({results.length})
      </h4>
      <ul className="space-y-2">
        {results.map((r, i) => (
          <li
            key={`${r.description}-${i}`}
            className="flex items-center gap-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--pf-foreground)]">
                {r.description} · {r.width}x{r.height}
              </p>
              <code className="block truncate font-mono text-[10px] text-[var(--pf-muted)]">
                {r.code.slice(0, 80)}
                {r.code.length > 80 ? "…" : ""}
              </code>
            </div>
            <CopyButton value={r.code} />
          </li>
        ))}
      </ul>
    </div>
  );
}