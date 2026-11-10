/*
path:            app/pixel/features/placeholder-generator/components/placeholder-panel.tsx
tag:             ["pixel", "feature", "placeholder-generator", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du generateur de placeholders (outil 10).
                 Remplace le placeholder. Compose : selection du format
                 (LQIP / BlurHash / SVG / Base64), reglages (largeur LQIP,
                 composantes BlurHash, qualite), bouton "Generer",
                 PlaceholderPreview (apercu damier + code copiable) et
                 la liste des resultats. Mobile-first.

flow:            usePlaceholderGenerator() + useImageQueueStore ->
                 si pendingCount === 0 : ImageUploader ->
                 sinon : FormatSelector inline + reglages + bouton ->
                 outcome : liste des resultats avec code copiable.

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
relatedFiles:    ["@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                  "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                  "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                  "@/app/pixel/stores/image-queue.store.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types",
                  "@/app/pixel/features/placeholder-generator/components/placeholder-preview",
                  "@/app/pixel/features/placeholder-generator/components/placeholder-output",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/stores/image-queue.store",
                  "@/components/ui/button"]
exports:         ["PlaceholderPanel", "PlaceholderPanelProps"]
useBy:           ["@/app/pixel/generate/placeholder/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux generer un placeholder LQIP ou BlurHash"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { usePlaceholderGenerator } from "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator";
import type {
  PlaceholderFormat,
  PlaceholderGeneratorOptions,
} from "@/app/pixel/features/placeholder-generator/types/placeholder.types";
import { PlaceholderPreview } from "@/app/pixel/features/placeholder-generator/components/placeholder-preview";
import { PlaceholderOutput } from "@/app/pixel/features/placeholder-generator/components/placeholder-output";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PlaceholderPanelProps {
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Config des formats
// ---------------------------------------------------------------------------

const FORMATS: readonly {
  readonly value: PlaceholderFormat;
  readonly label: string;
  readonly hint: string;
}[] = [
  { value: "lqip", label: "LQIP", hint: "Data URL base64" },
  { value: "blurhash", label: "BlurHash", hint: "Hash ~30 car." },
  { value: "svg", label: "SVG", hint: "Inline floute" },
  { value: "base64", label: "Base64", hint: "JPEG inline" },
];

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function PlaceholderPanel({ className }: PlaceholderPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    usePlaceholderGenerator();
  const items = useImageQueueStore((s) => s.items);
  const running = stage === "running";

  function patch(partial: Partial<PlaceholderGeneratorOptions>) {
    setOptions({ ...options, ...partial });
  }

  const firstPending = items.find((i) => i.status === "pending");

  return (
    <section
      aria-labelledby="placeholder-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="placeholder-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Generateur de placeholders
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez une image pour generer un placeholder ultra-leger."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      {pendingCount === 0 ? (
        <ImageUploader />
      ) : (
        <>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              Format de sortie
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {FORMATS.map((f) => {
                const active = options.format === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => patch({ format: f.value })}
                    disabled={running}
                    aria-pressed={active}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      active
                        ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
                        : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
                    }`}
                  >
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-[10px] text-[var(--pf-muted)]">{f.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {options.format === "lqip" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
                  Largeur LQIP
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
                  {options.lqipWidth} px
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={options.lqipWidth}
                onChange={(e) => patch({ lqipWidth: Number(e.target.value) })}
                disabled={running}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
              />
            </div>
          )}

          {options.format === "blurhash" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
                  Composantes BlurHash
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
                  {options.blurhashComponents}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                value={options.blurhashComponents}
                onChange={(e) =>
                  patch({ blurhashComponents: Number(e.target.value) })
                }
                disabled={running}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--pf-surface-hover)] accent-[var(--pf-primary)]"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
            <p className="text-xs text-[var(--pf-muted)]">
              Le code genere est copiable en un clic.
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
                  Generer
                  <ArrowRight className="size-3.5" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {firstPending && outcome && outcome.success.length > 0 && (
        <PlaceholderPreview
          sourceUrl={firstPending.source.url}
          result={outcome.success[0]!}
        />
      )}

      {outcome && outcome.success.length > 0 && (
        <PlaceholderOutput results={outcome.success} />
      )}

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