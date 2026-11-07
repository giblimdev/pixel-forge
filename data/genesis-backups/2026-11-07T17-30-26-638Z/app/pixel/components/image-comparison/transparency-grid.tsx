/*
path:            app/pixel/components/image-comparison/transparency-grid.tsx
tag:             ["pixel", "component", "comparison", "transparency"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Damier de transparence derriere une image PNG / WebP /
                 AVIF avec alpha. Affiche une grille de cases claires et
                 sombres (fond "checkerboard" standard) pour visualiser
                 le canal alpha. Purement presentationnel, aucun etat.

                 Utilise un background CSS pur (linear-gradient +
                 background-size) pour rester performant, sans image
                 externe ni SVG inline.

flow:            Recoit { size?, className? } -> rend un <div> absolu
                 avec background-image (2 gradients croises) et
                 background-size (size x size). Place en position
                 absolute inset-0 : le parent doit etre position relative.

ecosystem:       ImageComparison = [
                   "@/app/pixel/components/image-comparison/transparency-grid.tsx",
                   "@/app/pixel/components/image-comparison/comparison-slider.tsx",
                   "@/app/pixel/components/image-comparison/comparison-stats.tsx",
                   "@/app/pixel/components/image-comparison/image-comparison.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-comparison/image-comparison.tsx"]
imports:         []
exports:         ["TransparencyGrid", "TransparencyGridProps"]
useBy:           ["@/app/pixel/components/image-comparison/comparison-slider.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la transparence reelle d'une image"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export interface TransparencyGridProps {
  readonly size?: number;
  readonly className?: string;
}

export function TransparencyGrid({
  size = 16,
  className,
}: TransparencyGridProps) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(45deg, #cfcfcf 25%, transparent 25%), linear-gradient(-45deg, #cfcfcf 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cfcfcf 75%), linear-gradient(-45deg, transparent 75%, #cfcfcf 75%)",
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px`,
        backgroundColor: "#f0f0f0",
      }}
    />
  );
}