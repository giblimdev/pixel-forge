/*
path:            app/pixel/features/converter/components/converter-panel.tsx
tag:             ["pixel", "feature", "converter", "component", "panel"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'outil 01. Compose :
                 - FormatSelector (format de sortie)
                 - QualityControl (qualite + mode)
                 - ConversionPreview (apercu live avant/apres)
                 - Bouton "Convertir"
                 - ConversionResults (si outcome !== null)

                 ⚠️ CORRECTIF v2 (coherence format/mode) :
                 Quand l'utilisateur change le format cible, le mode
                 courant peut devenir invalide (ex: PNG ne supporte
                 QUE lossless, pas lossy). coerceModeForFormat() ajuste
                 automatiquement le mode :
                   - si le mode courant est supporte -> inchange
                   - sinon -> premier mode supporte par le format
                   - si le format ne supporte aucun mode -> null
                 Applique UNIQUEMENT quand `format` change (pas quand
                 `mode` change, sinon on ecraserait le choix explicite
                 de l'utilisateur dans QualityControl).

                 ⚠️ CORRECTIF v3 (readonly) :
                 ConversionOptions est readonly (bonne pratique). On
                 ne peut donc PAS faire `next.mode = ...`. patch()
                 RECONSTRUIT l'objet avec setOptions({ ...options,
                 ...partial, mode: coerceModeForFormat(...) }) au lieu
                 de muter une propriete. Aucun cast, aucun `as any`.

flow:            useConverter() -> rend FormatSelector + QualityControl
                 + ConversionPreview + bouton + ConversionResults.
                 patch() reconstruit l'objet si format change.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/components/conversion-preview.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/hooks/use-conversion-preview.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/index.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/pixel/features/converter/components/conversion-preview.tsx",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/converter/hooks/use-converter",
                  "@/app/pixel/features/converter/components/format-selector",
                  "@/app/pixel/features/converter/components/quality-control",
                  "@/app/pixel/features/converter/components/conversion-preview",
                  "@/app/pixel/features/converter/components/conversion-results",
                  "@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/image",
                  "@/components/ui/button"]
exports:         ["ConverterPanel", "ConverterPanelProps"]
useBy:           ["@/app/pixel/convert/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux convertir toute ma file",
                  "*en tant qu'utilisateur je veux voir le resultat avant de convertir",
                  "*en tant qu'utilisateur je veux que le mode se corrige quand je change de format"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useConverter + useConversionPreview + interactions.

import { ArrowRight, Loader2 } from "lucide-react";

import { useConverter } from "@/app/pixel/features/converter/hooks/use-converter";
import type {
  ConversionMode,
  ConversionOptions,
} from "@/app/pixel/types/conversion";
import type { ImageFormat } from "@/app/pixel/types/image";
import { FormatSelector } from "@/app/pixel/features/converter/components/format-selector";
import { QualityControl } from "@/app/pixel/features/converter/components/quality-control";
import { ConversionPreview } from "@/app/pixel/features/converter/components/conversion-preview";
import { ConversionResults } from "@/app/pixel/features/converter/components/conversion-results";
import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Cohérence format / mode                                           */
/* ------------------------------------------------------------------ */

/**
 * Retourne un mode valide pour le format cible :
 * - si le mode actuel est supporté → on le garde
 * - sinon → premier mode supporté par le format
 * - si le format ne supporte aucun mode → null
 *
 * Exemples :
 *   coerceModeForFormat("png", "lossy")     → "lossless"
 *   coerceModeForFormat("webp", "lossless") → "lossless"
 *   coerceModeForFormat("tiff", "lossy")    → "lossless"
 *   coerceModeForFormat("jpeg", "lossless") → "lossy"
 */
function coerceModeForFormat(
  format: ImageFormat,
  currentMode: ConversionMode | null,
): ConversionMode | null {
  const caps = FORMAT_CAPABILITIES[format];
  if (currentMode !== null && caps.modes.includes(currentMode)) {
    return currentMode;
  }
  return caps.modes[0] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                         */
/* ------------------------------------------------------------------ */

export interface ConverterPanelProps {
  readonly className?: string;
}

export function ConverterPanel({ className }: ConverterPanelProps) {
  const { options, setOptions, stage, outcome, pendingCount, submit } =
    useConverter();

  const running = stage === "running";

  function patch(partial: Partial<ConversionOptions>) {
    // Cas simple : pas de changement de format, ou le mode est
    // explicitement fourni dans le patch. On merge directement sans
    // toucher au mode.
    if (partial.format === undefined || partial.mode !== undefined) {
      setOptions({ ...options, ...partial });
      return;
    }

    // Le format change ET le mode n'est pas explicitement fourni :
    // on RECONSTRUIT l'objet avec le mode corrigé (ConversionOptions
    // est readonly, on ne peut pas muter `next.mode`).
    setOptions({
      ...options,
      ...partial,
      mode: coerceModeForFormat(partial.format, options.mode),
    });
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

      {/* Aperçu live avant/après — se rafraîchit automatiquement
          quand format/quality/mode changent (debounce 500 ms). */}
      <ConversionPreview options={options} />

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
