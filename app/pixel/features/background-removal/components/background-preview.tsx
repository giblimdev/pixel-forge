/*
path:            app/pixel/features/background-removal/components/background-preview.tsx
tag:             ["pixel", "feature", "background-removal", "component", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Apercu avant/apres du detourage. Affiche l'image
                 source (avec pipette) et le resultat (avec damier de
                 transparence via TransparencyGrid). Utilise <ImageComparison>
                 quand les deux sont disponibles.

flow:            Props { sourceUrl, resultUrl } -> si resultUrl :
                 ImageComparison ; sinon : image seule avec pipette.

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
relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx"]
imports:         ["@/app/pixel/components/image-comparison/comparison-slider"]
exports:         ["BackgroundPreview", "BackgroundPreviewProps"]
useBy:           ["@/app/pixel/features/background-removal/components/background-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir avant/apres le detourage"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : ComparisonSlider est client.

import { ComparisonSlider } from "@/app/pixel/components/image-comparison/comparison-slider";

export interface BackgroundPreviewProps {
  readonly sourceUrl: string;
  readonly resultUrl: string;
}

export function BackgroundPreview({ sourceUrl, resultUrl }: BackgroundPreviewProps) {
  return (
    <ComparisonSlider
      beforeSrc={sourceUrl}
      afterSrc={resultUrl}
      beforeAlt="Original"
      afterAlt="Detoure"
      showGrid
    />
  );
}