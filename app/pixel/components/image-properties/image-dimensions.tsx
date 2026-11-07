/*
path:            app/pixel/components/image-properties/image-dimensions.tsx
tag:             ["pixel", "component", "properties", "dimensions"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Affiche dimensions + ratio. Pur presentationnel.

flow:            Recoit { dimensions } -> rend une ligne.

ecosystem:       ImageProperties = [
                   "@/app/pixel/components/image-properties/image-dimensions.tsx",
                   "@/app/pixel/components/image-properties/image-file-info.tsx",
                   "@/app/pixel/components/image-properties/image-color-info.tsx",
                   "@/app/pixel/components/image-properties/image-properties.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-properties/image-properties.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/types/image"]
exports:         ["ImageDimensionsRow", "ImageDimensionsRowProps"]
useBy:           ["@/app/pixel/components/image-properties/image-properties.tsx"]

userStories:     ["*en tant qu'utilisateur je veux connaitre les dimensions d'une image"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageDimensions } from "@/app/pixel/types/image";

export interface ImageDimensionsRowProps {
  readonly dimensions: ImageDimensions | null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(w: number, h: number): string {
  if (w <= 0 || h <= 0) return "-";
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

export function ImageDimensionsRow({
  dimensions,
}: ImageDimensionsRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--pf-border)]/40 py-1.5 last:border-b-0">
      <span className="text-xs text-[var(--pf-muted)]">Dimensions</span>
      <span className="font-mono text-xs tabular-nums text-[var(--pf-foreground)]">
        {dimensions
          ? `${dimensions.width} x ${dimensions.height} (${ratioLabel(dimensions.width, dimensions.height)})`
          : "Inconnues"}
      </span>
    </div>
  );
}