/*
path:            app/pixel/components/image-comparison/image-comparison.tsx
tag:             ["pixel", "component", "comparison", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Orchestrateur de la comparaison avant/apres. Compose
                 le slider et les stats. Recoit une SourceImage et un
                 ResultImage deja traites, affiche le slider puis les
                 stats. Aucun fetch, aucun etat metier — juste de la
                 composition.

flow:            Recoit { source, result, beforeUrl? } -> determine
                 beforeUrl (source.url par defaut) et afterUrl
                 (URL.createObjectURL(result.buffer) ou result.url) ->
                 rend ComparisonSlider + ComparisonStats.

ecosystem:       ImageComparison = [
                   "@/app/pixel/components/image-comparison/transparency-grid.tsx",
                   "@/app/pixel/components/image-comparison/comparison-slider.tsx",
                   "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                   "@/app/pixel/components/image-comparison/image-comparison.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-comparison/comparison-slider.tsx",
                  "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         ["react",
                  "@/app/pixel/types/image",
                  "@/app/pixel/components/image-comparison/comparison-slider",
                  "@/app/pixel/components/image-comparison/comparison-stats"]
exports:         ["ImageComparison", "ImageComparisonProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux comparer avant/apres avec les stats"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useEffect pour creer/revoquer l'URL blob du resultat.

import { useEffect, useState } from "react";

import type { ResultImage, SourceImage } from "@/app/pixel/types/image";
import { ComparisonSlider } from "@/app/pixel/components/image-comparison/comparison-slider";
import { ComparisonStats } from "@/app/pixel/components/image-comparison/comparison-stats";

export interface ImageComparisonProps {
  readonly source: SourceImage;
  readonly result: ResultImage;
  readonly className?: string;
}

export function ImageComparison({
  source,
  result,
  className,
}: ImageComparisonProps) {
  const [afterUrl, setAfterUrl] = useState<string | null>(result.url);

  useEffect(() => {
    if (result.url) {
      setAfterUrl(result.url);
      return;
    }
    if (result.buffer) {
      const blob = new Blob([result.buffer], { type: result.mime });
      const url = URL.createObjectURL(blob);
      setAfterUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setAfterUrl(null);
  }, [result.url, result.buffer, result.mime]);

  if (!afterUrl) {
    return (
      <div className={`rounded-xl border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-6 text-center text-xs text-[var(--pf-muted)] ${className ?? ""}`}>
        Aucune image apres disponible pour la comparaison.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <ComparisonSlider
        beforeSrc={source.url}
        afterSrc={afterUrl}
        beforeAlt={source.filename}
        afterAlt={result.filename}
      />
      <ComparisonStats
        beforeSizeBytes={source.sizeBytes}
        afterSizeBytes={result.sizeBytes}
        beforeDimensions={
          source.dimensions ?? { width: 0, height: 0 }
        }
        afterDimensions={result.dimensions}
      />
    </div>
  );
}