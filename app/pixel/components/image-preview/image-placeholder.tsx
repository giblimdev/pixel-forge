/*
path:            app/pixel/components/image-preview/image-placeholder.tsx
tag:             ["pixel", "component", "preview", "placeholder"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Skeleton de chargement pour une image. Reutilisable
                 dans image-preview, image-thumbnail, ou tout composant
                 qui veut afficher un etat de chargement coherent avec
                 la charte. Rend un <div> anime (pulse) aux dimensions
                 demandees.

flow:            Recoit { width?, height?, className? } -> rend un
                 <div> avec animate-pulse + fond pf-surface-hover.

ecosystem:       ImagePreview = [
                   "@/app/pixel/components/image-preview/image-preview.tsx",
                   "@/app/pixel/components/image-preview/image-thumbnail.tsx",
                   "@/app/pixel/components/image-preview/image-lightbox.tsx",
                   "@/app/pixel/components/image-preview/image-placeholder.tsx",
                 ]
relatedFiles:    []
imports:         []
exports:         ["ImagePlaceholder", "ImagePlaceholderProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un etat de chargement coherent pour les images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export interface ImagePlaceholderProps {
  readonly width?: number | string;
  readonly height?: number | string;
  readonly className?: string;
}

export function ImagePlaceholder({
  width,
  height,
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="status"
      aria-label="Chargement de l'image"
      style={{ width, height }}
      className={`animate-pulse rounded-md bg-[var(--pf-surface-hover)] ${className ?? ""}`}
    />
  );
}