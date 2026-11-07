/*
path:            app/pixel/features/compressor/components/compressor-panel.tsx
tag:             ["pixel", "feature", "compressor", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur du compresseur (outil 03). Compose
                 CompressionSettings + bouton "Compresser" +
                 CompressionResults.

flow:            useCompressor() -> rend settings + bouton -> si
                 outcome : CompressionResults.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/hooks/use-compressor.ts",
                  "@/app/pixel/features/compressor/components/compression-settings.tsx",
                  "@/app/pixel/features/compressor/components/compression-results.tsx",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/compressor/hooks/use-compressor",
                  "@/app/pixel/features/compressor/types/compressor.types",
                  "@/app/pixel/features/compressor/components/compression-settings",
                  "@/app/pixel/features/compressor/components/compression-results",
                  "@/components/ui/button"]
exports:         ["CompressorPanel", "CompressorPanelProps"]
useBy:           ["@/app/pixel/optimize/compress/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux compresser mes images sans changer de format"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : hook + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { useCompressor } from "@/app/pixel/features/compressor/hooks/use-compressor";
import { CompressionSettings } from "@/app/pixel/features/compressor/components/compression-settings";
import { CompressionResults } from "@/app/pixel/features/compressor/components/compression-results";
import { Button } from "@/components/ui/button";

export interface CompressorPanelProps {
  readonly className?: string;
}

export function CompressorPanel({ className }: CompressorPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useCompressor();
  const running = stage === "running";

  return (
    <section
      aria-labelledby="compressor-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="compressor-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Options de compression
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez des images a la file pour commencer."
            : `${pendingCount} image(s) prete(s).`}
        </p>
      </header>

      <CompressionSettings options={options} onChange={setOptions} disabled={running} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          Le format source est conserve (JPEG reste JPEG, PNG reste PNG).
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={pendingCount === 0 || running}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-secondary)] to-[var(--pf-primary)] text-white"
        >
          {running ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Compression...
            </>
          ) : (
            <>
              Compresser {pendingCount > 0 ? `(${pendingCount})` : ""}
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </div>

      {outcome && <CompressionResults outcome={outcome} />}
    </section>
  );
}