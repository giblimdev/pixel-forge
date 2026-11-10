/*
path:            app/pixel/features/metadata/components/metadata-panel.tsx
tag:             ["pixel", "feature", "metadata", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'analyse et de la suppression de
                 metadonnees (outil 12). Compose ImageUploader (si
                 file vide), MetadataActions, MetadataDetails (si
                 analyses disponibles), et les erreurs. Mobile-first.

flow:            useImageMetadata() + useImageQueueStore ->
                 si pendingCount === 0 : ImageUploader ->
                 sinon : MetadataActions + resultats.

ecosystem:       Metadata = [
                   "@/app/api/images/metadata/route.ts",
                   "@/app/pixel/analyze/metadata/page.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                   "@/app/pixel/features/metadata/components/metadata-details.tsx",
                   "@/app/pixel/features/metadata/components/metadata-panel.tsx",
                   "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                   "@/app/pixel/features/metadata/index.ts",
                   "@/app/pixel/features/metadata/schemas/metadata.schema.ts",
                   "@/app/pixel/features/metadata/types/metadata.types.ts",
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                  "@/app/pixel/features/metadata/components/metadata-details.tsx",
                  "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/stores/image-queue.store.ts"]
imports:         ["@/app/pixel/features/metadata/hooks/use-image-metadata",
                  "@/app/pixel/features/metadata/components/metadata-details",
                  "@/app/pixel/features/metadata/components/metadata-actions",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/stores/image-queue.store"]
exports:         ["MetadataPanel", "MetadataPanelProps"]
useBy:           ["@/app/pixel/analyze/page.tsx",
                  "@/app/pixel/analyze/metadata/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux analyser et supprimer les metadonnees d'une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : hook + store Zustand + interactions.

import { useImageMetadata } from "@/app/pixel/features/metadata/hooks/use-image-metadata";
import { MetadataDetails } from "@/app/pixel/features/metadata/components/metadata-details";
import { MetadataActions } from "@/app/pixel/features/metadata/components/metadata-actions";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";

export interface MetadataPanelProps {
  readonly className?: string;
}

export function MetadataPanel({ className }: MetadataPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useImageMetadata();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  const hasPending = items.some((i) => i.status === "pending");

  function handleAnalyze() {
    setOptions({ action: "analyze" });
    // On laisse React flush le state avant de déclencher submit().
    // useImageMetadata lit `options` dans son callback submit, donc
    // un simple setOptions + submit() dans la même frame pourrait
    // utiliser l'ancienne valeur. On force la mise à jour immédiate.
    queueMicrotask(() => void submit());
  }

  function handleStrip() {
    setOptions({ action: "strip" });
    queueMicrotask(() => void submit());
  }

  return (
    <section
      aria-labelledby="metadata-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="metadata-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Analyse et metadonnees
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image pour analyser ses proprietes ou supprimer ses metadonnees."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      {!hasPending ? (
        <ImageUploader />
      ) : (
        <MetadataActions
          action={options.action}
          onAnalyze={handleAnalyze}
          onStrip={handleStrip}
          disabled={!hasPending}
          pendingCount={pendingCount}
          running={running}
        />
      )}

      {/* Resultats d'analyse */}
      {outcome &&
        outcome.action === "analyze" &&
        outcome.analyses.length > 0 && (
          <ul className="space-y-3 pt-2">
            {outcome.analyses.map((analysis) => (
              <li
                key={analysis.sourceId}
                className="space-y-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
              >
                <p className="text-sm font-medium text-[var(--pf-foreground)]">
                  {analysis.sourceFilename}
                </p>
                <MetadataDetails analysis={analysis} />
              </li>
            ))}
          </ul>
        )}

      {/* Resultats de suppression */}
      {outcome &&
        outcome.action === "strip" &&
        outcome.analyses.length === 0 &&
        outcome.errors.length === 0 && (
          <p className="rounded-lg border border-[var(--pf-success)]/30 bg-[var(--pf-success)]/5 p-3 text-center text-xs text-[var(--pf-success)]">
            Metadonnees supprimees. Les fichiers nettoyes sont disponibles
            dans la file (statut &laquo; Reussi &raquo;).
          </p>
        )}

      {/* Erreurs */}
      {outcome && outcome.errors.length > 0 && (
        <ul className="space-y-2 pt-2">
          {outcome.errors.map((e, i) => (
            <li
              key={`err-${e.sourceId}-${i}`}
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
            >
              <code className="font-mono text-[10px] uppercase">
                {e.error.code}
              </code>
              {" : "}
              {e.sourceFilename} - {e.error.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}