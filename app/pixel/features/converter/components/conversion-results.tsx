/*
path:            app/pixel/features/converter/components/conversion-results.tsx
tag:             ["pixel", "feature", "converter", "component", "results"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Affichage des resultats de conversion. Pour chaque
                 fichier converti : nom, taille finale, lien de
                 telechargement (ancre <a href={downloadUrl}
                 download={filename}>). Pour chaque erreur : nom +
                 message. Affiche aussi la duree totale et le format
                 cible. Composant purement presentationnel (controle
                 par les props, aucun state local).

                 Phase 19 : sourceSizeBytes est disponible sur chaque
                 ConversionSuccessItem — on pourrait brancher
                 ComparisonStats par fichier (avant/apres), mais on
                 garde l'affichage simple pour rester coherent avec
                 le contrat initial. L'economie est calculee dans
                 l'historique (dashboard) et non ici.

flow:            Props { outcome, className? } -> rend 2 sections
                 (Succes, Erreurs) + un bandeau duree. Chaque succes
                 est un <a download> cliquable.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/converter/types/converter.types.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/converter/types/converter.types",
                  "@/components/ui/button"]
exports:         ["ConversionResults", "ConversionResultsProps"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les fichiers convertis et les telecharger"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : <a download> + interactions.

import { CheckCircle2, Download, XCircle } from "lucide-react";

import type { ConversionOutcome } from "@/app/pixel/features/converter/types/converter.types";

export interface ConversionResultsProps {
  readonly outcome: ConversionOutcome;
  readonly className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ConversionResults({
  outcome,
  className,
}: ConversionResultsProps) {
  const hasSuccess = outcome.success.length > 0;
  const hasErrors = outcome.errors.length > 0;

  return (
    <section className={`space-y-3 ${className ?? ""}`}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--pf-foreground)]">
          Resultats
        </h3>
        <span className="font-mono text-[11px] text-[var(--pf-muted)]">
          {outcome.durationMs} ms
          {outcome.format && ` · ${outcome.format.toUpperCase()}`}
        </span>
      </header>

      {hasSuccess && (
        <ul className="space-y-2">
          {outcome.success.map((item) => (
            <li
              key={`success-${item.sourceId}`}
              className="flex items-center gap-2 rounded-lg border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-3"
            >
              <CheckCircle2
                className="size-4 shrink-0 text-[var(--pf-success)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
                  {item.result.filename}
                </p>
                <p className="font-mono text-[10px] text-[var(--pf-muted)]">
                  {formatSize(item.sourceSizeBytes)}
                  {" → "}
                  {formatSize(item.result.sizeBytes)}
                  {item.result.dimensions.width > 0 &&
                    ` · ${item.result.dimensions.width}x${item.result.dimensions.height}`}
                </p>
              </div>
              {item.downloadUrl && (
                <a
                  href={item.downloadUrl}
                  download={item.result.filename}
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] transition-colors hover:bg-[var(--pf-success)]/25"
                >
                  <Download className="size-3.5" aria-hidden />
                  Telecharger
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasErrors && (
        <ul className="space-y-2">
          {outcome.errors.map((item, index) => (
            <li
              key={`error-${item.sourceId}-${index}`}
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
            >
              <XCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
                  {item.sourceFilename}
                </p>
                <p className="text-xs leading-relaxed text-destructive">
                  <code className="font-mono text-[10px] uppercase tracking-wider">
                    {item.error.code}
                  </code>
                  {" : "}
                  {item.error.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!hasSuccess && !hasErrors && (
        <p className="rounded-lg border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-3 text-center text-xs text-[var(--pf-muted)]">
          Aucun resultat.
        </p>
      )}
    </section>
  );
}