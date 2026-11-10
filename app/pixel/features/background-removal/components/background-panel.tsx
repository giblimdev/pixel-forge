/*
path:            app/pixel/features/background-removal/components/background-panel.tsx
tag:             ["pixel", "feature", "background-removal", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du detourage (outil 07). Remplace le
                 placeholder. Compose ColorPicker + BackgroundSettings +
                 BackgroundPreview (si resultat) + bouton "Detourer".

flow:            useBackgroundRemoval() + useImageQueueStore ->
                 premier item pending -> pipette (si fichier) ->
                 settings -> bouton -> results.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                  "@/app/pixel/features/background-removal/components/color-picker.tsx",
                  "@/app/pixel/features/background-removal/components/background-settings.tsx",
                  "@/app/pixel/features/background-removal/components/background-preview.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/background-removal/hooks/use-background-removal",
                  "@/app/pixel/features/background-removal/types/background.types",
                  "@/app/pixel/features/background-removal/components/color-picker",
                  "@/app/pixel/features/background-removal/components/background-settings",
                  "@/app/pixel/features/background-removal/components/background-preview",
                  "@/app/pixel/stores/image-queue.store",
                  "@/components/ui/button"]
exports:         ["BackgroundPanel", "BackgroundPanelProps"]
useBy:           ["@/app/pixel/edit/background/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux detourer une image sur fond uni"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Download, Loader2 } from "lucide-react";

import { useBackgroundRemoval } from "@/app/pixel/features/background-removal/hooks/use-background-removal";
import { ColorPicker } from "@/app/pixel/features/background-removal/components/color-picker";
import { BackgroundSettings } from "@/app/pixel/features/background-removal/components/background-settings";
import { BackgroundPreview } from "@/app/pixel/features/background-removal/components/background-preview";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

export interface BackgroundPanelProps {
  readonly className?: string;
}

export function BackgroundPanel({ className }: BackgroundPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useBackgroundRemoval();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  const firstPending = items.find((i) => i.status === "pending");
  const lastSuccess = outcome?.success[0];

  function patch(partial: Partial<typeof options>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="background-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="background-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Suppression d&apos;arriere-plan
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image a la file pour commencer."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      {firstPending && (
        <ColorPicker
          imageUrl={firstPending.source.url}
          onColorPick={(color) => patch({ target: color })}
          disabled={running}
        />
      )}

      <BackgroundSettings
        target={options.target}
        tolerance={options.tolerance}
        feathering={options.feathering}
        onChange={patch}
        disabled={running}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          Sortie : PNG avec canal alpha. Format source ignore.
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={pendingCount === 0 || running}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-info)] to-[var(--pf-primary)] text-white"
        >
          {running ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Detourage...
            </>
          ) : (
            <>
              Detourer {pendingCount > 0 ? `(${pendingCount})` : ""}
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </div>

      {firstPending && lastSuccess && lastSuccess.downloadUrl && (
        <BackgroundPreview
          sourceUrl={firstPending.source.url}
          resultUrl={lastSuccess.downloadUrl}
        />
      )}

      {outcome && outcome.success.length > 0 && (
        <ul className="space-y-2 pt-2">
          {outcome.success.map((item) => (
            <li
              key={item.sourceId}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
            >
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
            </li>
          ))}
        </ul>
      )}

      {outcome && outcome.errors.length > 0 && (
        <ul className="space-y-2 pt-2">
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
    </section>
  );
}