/*
path:            app/pixel/components/image-comparison/comparison-stats.tsx
tag:             ["pixel", "component", "comparison", "stats"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Statistiques comparatives avant/apres : poids,
                 dimensions, economie en octets et en pourcentage.
                 Composant purement presentationnel, recoit les valeurs
                 deja calculees (aucun calcul metier ici).

                 Pas de SSIM (Decision 5) : la metrique affichee est le
                 poids et l'economie. L'utilisateur juge visuellement
                 via le slider.

flow:            Recoit { beforeSizeBytes, afterSizeBytes,
                 beforeDimensions, afterDimensions } -> calcule
                 savedBytes et savedPercent (helper pur local) -> rend
                 3 colonnes : Avant, Apres, Economie.

ecosystem:       ImageComparison = [
                   "@/app/pixel/components/image-comparison/transparency-grid.tsx",
                   "@/app/pixel/components/image-comparison/comparison-slider.tsx",
                   "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                   "@/app/pixel/components/image-comparison/image-comparison.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-comparison/image-comparison.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         ["lucide-react",
                  "@/app/pixel/types/image"]
exports:         ["ComparisonStats", "ComparisonStatsProps"]
useBy:           ["@/app/pixel/components/image-comparison/image-comparison.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir l'economie de poids realisee"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import type { ImageDimensions } from "@/app/pixel/types/image";

export interface ComparisonStatsProps {
  readonly beforeSizeBytes: number;
  readonly afterSizeBytes: number;
  readonly beforeDimensions: ImageDimensions;
  readonly afterDimensions: ImageDimensions;
  readonly className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ComparisonStats({
  beforeSizeBytes,
  afterSizeBytes,
  beforeDimensions,
  afterDimensions,
  className,
}: ComparisonStatsProps) {
  const savedBytes = beforeSizeBytes - afterSizeBytes;
  const savedPercent =
    beforeSizeBytes === 0
      ? 0
      : Math.round((savedBytes / beforeSizeBytes) * 100);
  const isSaving = savedBytes > 0;

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <div className="grid grid-cols-3 items-center gap-2 text-center">
        {/* Avant */}
        <div className="space-y-0.5 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Avant
          </p>
          <p className="font-mono text-sm font-bold text-[var(--pf-foreground)]">
            {formatSize(beforeSizeBytes)}
          </p>
          <p className="font-mono text-[10px] text-[var(--pf-muted)]">
            {beforeDimensions.width}x{beforeDimensions.height}
          </p>
        </div>

        {/* Fleche */}
        <ArrowRight className="mx-auto size-4 text-[var(--pf-muted)]" aria-hidden />

        {/* Apres */}
        <div className="space-y-0.5 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
            Apres
          </p>
          <p className="font-mono text-sm font-bold text-[var(--pf-foreground)]">
            {formatSize(afterSizeBytes)}
          </p>
          <p className="font-mono text-[10px] text-[var(--pf-muted)]">
            {afterDimensions.width}x{afterDimensions.height}
          </p>
        </div>
      </div>

      {/* Economie */}
      <div
        className={`flex items-center justify-center gap-1.5 rounded-lg p-2 text-sm font-semibold ${
          isSaving
            ? "bg-[var(--pf-success)]/10 text-[var(--pf-success)]"
            : "bg-[var(--pf-warning)]/10 text-[var(--pf-warning)]"
        }`}
      >
        {isSaving ? (
          <TrendingDown className="size-4" aria-hidden />
        ) : (
          <TrendingUp className="size-4" aria-hidden />
        )}
        <span className="font-mono tabular-nums">
          {isSaving ? "-" : "+"}
          {formatSize(Math.abs(savedBytes))} ({Math.abs(savedPercent)} %)
        </span>
      </div>
    </div>
  );
}