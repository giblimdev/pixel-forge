/*
path:            app/pixel/features/converter/components/converter-panel.tsx
tag:             ["pixel", "feature", "converter", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'outil 01. Remplace le placeholder
                 precedent. Compose :
                 - FormatSelector (format de sortie)
                 - QualityControl (qualite + mode)
                 - Bouton "Convertir" (desactive si pendingCount === 0
                   ou stage === "running")
                 - ConversionResults (si outcome !== null)
                 Lit le hook useConverter qui pilote tout le pipeline
                 (validation, fetch, store, resultats).

flow:            useConverter() -> rend un formulaire avec les
                 controles. A chaque changement de champ, appelle
                 setOptions (merge partiel). Au clic Convertir,
                 submit(). Si outcome, affiche <ConversionResults />.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/pixel/features/converter/types/converter.types.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/converter/hooks/use-converter",
                  "@/app/pixel/features/converter/types/converter.types",
                  "@/app/pixel/features/converter/components/format-selector",
                  "@/app/pixel/features/converter/components/quality-control",
                  "@/app/pixel/features/converter/components/conversion-results",
                  "@/components/ui/button"]
exports:         ["ConverterPanel", "ConverterPanelProps"]
useBy:           ["@/app/pixel/convert/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux convertir toute ma file d'images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useConverter + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { useConverter } from "@/app/pixel/features/converter/hooks/use-converter";
import type { ConversionOptions } from "@/app/pixel/types/conversion";
import { FormatSelector } from "@/app/pixel/features/converter/components/format-selector";
import { QualityControl } from "@/app/pixel/features/converter/components/quality-control";
import { ConversionResults } from "@/app/pixel/features/converter/components/conversion-results";
import { Button } from "@/components/ui/button";

export interface ConverterPanelProps {
  readonly className?: string;
}

export function ConverterPanel({ className }: ConverterPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useConverter();

  const running = stage === "running";

  function patch(partial: Partial<ConversionOptions>) {
    setOptions({ ...options, ...partial });
  }

  return (
    <section
      aria-labelledby="converter-panel-title"
      className={`space-y-4 rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="space-y-1">
        <h3
          id="converter-panel-title"
          className="text-base font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Options de conversion
        </h3>
        <p className="text-xs text-[var(--pf-muted)]">
          {pendingCount === 0
            ? "Ajoutez des images a la file ci-dessus pour commencer."
            : `${pendingCount} image${pendingCount > 1 ? "s" : ""} prete${pendingCount > 1 ? "s" : ""} a convertir.`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormatSelector
          value={options.format}
          onChange={(format) => patch({ format })}
          disabled={running}
        />
        <QualityControl
          format={options.format}
          quality={options.quality}
          mode={options.mode}
          onChange={(next) => patch(next)}
          disabled={running}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
        <p className="text-xs text-[var(--pf-muted)]">
          Les options seront appliquees a toutes les images de la file.
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={pendingCount === 0 || running}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white"
        >
          {running ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Conversion en cours...
            </>
          ) : (
            <>
              Convertir {pendingCount > 0 ? `(${pendingCount})` : ""}
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </div>

      {outcome && <ConversionResults outcome={outcome} />}
    </section>
  );
}