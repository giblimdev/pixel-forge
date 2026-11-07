/*
path:            app/pixel/components/image-comparison/comparison-slider.tsx
tag:             ["pixel", "component", "comparison", "slider"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Slider de comparaison avant/apres. Superpose deux
                 images : la version "apres" est en dessous, la version
                 "avant" est au-dessus mais clippee via clip-path a
                 gauche du curseur. Un <input type="range"> invisible
                 au-dessus fait office de controle (accessible au
                 clavier et au tactile).

                 Le curseur est materialise par une barre verticale + une
                 poignee ronde au centre. Composant CLIENT (useState pour
                 la position). N'affiche JAMAIS de contenu invente :
                 les deux images viennent des props.

                 Damier de transparence affiche derriere les deux images
                 (TransparencyGrid) si `showGrid` est true (defaut).

flow:            useState(50) pour la position (0-100) -> rend un
                 conteneur relatif aspect-[4/3] -> TransparencyGrid ->
                 <img src={after}> plein -> <img src={before}
                 style={{ clipPath: `inset(0 ${100-pos}% 0 0)` }}> ->
                 ligne verticale + poignee a `left: pos%` ->
                 <input type=range value={pos} onChange> transparent
                 au-dessus.

ecosystem:       ImageComparison = [
                   "@/app/pixel/components/image-comparison/transparency-grid.tsx",
                   "@/app/pixel/components/image-comparison/comparison-slider.tsx",
                   "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                   "@/app/pixel/components/image-comparison/image-comparison.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-comparison/transparency-grid.tsx",
                  "@/app/pixel/components/image-comparison/image-comparison.tsx"]
imports:         ["react",
                  "@/app/pixel/components/image-comparison/transparency-grid"]
exports:         ["ComparisonSlider", "ComparisonSliderProps"]
useBy:           ["@/app/pixel/components/image-comparison/image-comparison.tsx"]

userStories:     ["*en tant qu'utilisateur je veux comparer visuellement avant/apres avec un slider"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useState(position) + input range.

import { useState } from "react";

import { TransparencyGrid } from "@/app/pixel/components/image-comparison/transparency-grid";

export interface ComparisonSliderProps {
  readonly beforeSrc: string;
  readonly afterSrc: string;
  readonly beforeAlt?: string;
  readonly afterAlt?: string;
  readonly showGrid?: boolean;
  readonly className?: string;
}

export function ComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Original",
  afterAlt = "Converti",
  showGrid = true,
  className,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--pf-border)]/60 ${className ?? ""}`}
    >
      {showGrid && <TransparencyGrid />}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 size-full object-contain"
        draggable={false}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={beforeAlt}
        className="absolute inset-0 size-full object-contain"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Barre verticale + poignee */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md">
          <span className="font-mono text-[10px] font-bold text-black">
            &#8676;&#8677;
          </span>
        </span>
      </div>

      {/* Input range invisible pour l'accessibilite + tactile */}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Curseur de comparaison avant/apres"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}