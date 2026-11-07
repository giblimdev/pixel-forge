/*
path:            app/pixel/features/compressor/components/compression-results.tsx
tag:             ["pixel", "feature", "compressor", "component", "results"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Affichage des resultats de compression. Pour chaque
                 succes : nom, lien telecharger, ComparisonStats
                 (avant/apres). Pour les erreurs : nom + message.

flow:            Props { outcome, className? } -> liste.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/types/compressor.types.ts",
                  "@/app/pixel/components/image-comparison/comparison-stats.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/compressor/types/compressor.types",
                  "@/app/pixel/components/image-comparison/comparison-stats"]
exports:         ["CompressionResults", "CompressionResultsProps"]
useBy:           ["@/app/pixel/features/compressor/components/compressor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les resultats de compression"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : lien telecharger.

import { Download } from "lucide-react";

import type { CompressionOutcome } from "@/app/pixel/features/compressor/types/compressor.types";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";

export interface CompressionResultsProps {
  readonly outcome: CompressionOutcome;
  readonly className?: string;
}

export function CompressionResults({
  outcome,
  className,
}: CompressionResultsProps) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {outcome.success.length > 0 && (
        <ul className="space-y-2">
          {outcome.success.map((item) => (
            <li
              key={item.sourceId}
              className="space-y-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
                  {item.result.filename}
                </p>
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download={item.result.filename}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] hover:bg-[var(--pf-success)]/25"
                  >
                    <Download className="size-3.5" aria-hidden />
                    Telecharger
                  </a>
                )}
              </div>
              <ComparisonStats
                beforeSizeBytes={item.sourceSizeBytes}
                afterSizeBytes={item.result.sizeBytes}
                beforeDimensions={item.result.dimensions}
                afterDimensions={item.result.dimensions}
              />
            </li>
          ))}
        </ul>
      )}

      {outcome.errors.length > 0 && (
        <ul className="space-y-2">
          {outcome.errors.map((e, i) => (
            <li
              key={`err-${e.sourceId}-${i}`}
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
            >
              <code className="font-mono text-[10px] uppercase">{e.error.code}</code>
              {" : "}
              {e.sourceFilename} - {e.error.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}