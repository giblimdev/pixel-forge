/*
path:            app/pixel/features/favicon-generator/components/favicon-panel.tsx
tag:             ["pixel", "feature", "favicon-generator", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du generateur de favicons (outil 09).
                 Compose : un bloc "importer une image source" qui accepte
                 PNG/JPEG/SVG (1 seul fichier, via <ImageUploader /> en mode
                 mono), FaviconOptions (tailles + manifest + toggles),
                 un bouton "Generer les favicons", FaviconPreview (si
                 outcome) et la liste des fichiers ZIP a telecharger.
                 Le composant lit useFaviconGenerator() + le store global
                 pour verifier qu'une image source est bien en file.
                 Responsive mobile-first (grid-cols-1 -> md:grid-cols-2).

flow:            useFaviconGenerator() + useImageQueueStore ->
                 si pendingCount === 0 : message vide + ImageUploader ->
                 sinon : FaviconOptions + bouton submit ->
                 si outcome.success[0] : FaviconPreview ->
                 si outcome.errors : liste erreurs.

ecosystem:       FaviconGenerator = [
                   "@/app/api/images/favicon/route.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/index.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                   "@/app/pixel/lib/image-engine/index.ts",
                   "@/app/pixel/lib/storage/temp-cleanup.ts",
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                  "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                  "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator",
                  "@/app/pixel/features/favicon-generator/types/favicon.types",
                  "@/app/pixel/features/favicon-generator/components/favicon-options",
                  "@/app/pixel/features/favicon-generator/components/favicon-preview",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/stores/image-queue.store",
                  "@/components/ui/button"]
exports:         ["FaviconPanel", "FaviconPanelProps"]
useBy:           ["@/app/pixel/generate/favicon/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux generer tous les favicons d'un site"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : hook + store Zustand + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { useFaviconGenerator } from "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator";
import type { FaviconGeneratorOptions } from "@/app/pixel/features/favicon-generator/types/favicon.types";
import { FaviconOptions } from "@/app/pixel/features/favicon-generator/components/favicon-options";
import { FaviconPreview } from "@/app/pixel/features/favicon-generator/components/favicon-preview";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FaviconPanelProps {
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function FaviconPanel({ className }: FaviconPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useFaviconGenerator();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  // Une seule image source attendue : on prend le premier item pending.
  const firstPending = items.find((i) => i.status === "pending");
  const lastSuccess = outcome?.success[0];

  function patch(partial: Partial<FaviconGeneratorOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="favicon-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="favicon-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Generateur de favicons
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image source (PNG, JPEG, SVG) pour commencer."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      {pendingCount === 0 ? (
        <ImageUploader />
      ) : (
        <>
          <FaviconOptions
            options={options}
            onChange={(next) => setOptions(next)}
            disabled={running}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
            <p className="text-xs text-[var(--pf-muted)]">
              Le ZIP contient favicon.ico, PNG Apple/Android et manifest.webmanifest.
            </p>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={pendingCount === 0 || running}
              className="gap-1.5 bg-gradient-to-r from-[var(--pf-success)] to-[var(--pf-primary)] text-white"
            >
              {running ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Generation...
                </>
              ) : (
                <>
                  Generer les favicons
                  <ArrowRight className="size-3.5" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {firstPending && lastSuccess && <FaviconPreview outcome={outcome!} />}

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