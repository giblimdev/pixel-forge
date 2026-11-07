/*
path:            app/pixel/components/image-preview/image-thumbnail.tsx
tag:             ["pixel", "component", "preview", "thumbnail"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Miniature carree (par defaut 48x48) avec object-cover.
                 Reutilisable dans les files, listes et cartes. Utilise
                 ImagePreview pour les etats loading/error. Rendue en
                 <button> si onClick est fourni, sinon en <div>.

flow:            Recoit { src, alt, size?, onClick?, className? } ->
                 taille via style inline (w/h) -> wrapper <button>
                 ou <div> -> ImagePreview a l'interieur.

ecosystem:       ImagePreview = [
                   "@/app/pixel/components/image-preview/image-preview.tsx",
                   "@/app/pixel/components/image-preview/image-thumbnail.tsx",
                   "@/app/pixel/components/image-preview/image-lightbox.tsx",
                   "@/app/pixel/components/image-preview/image-placeholder.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-preview/image-preview.tsx"]
imports:         ["@/app/pixel/components/image-preview/image-preview"]
exports:         ["ImageThumbnail", "ImageThumbnailProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir une miniature carree d'une image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : si onClick fourni, interactif.

import { ImagePreview } from "@/app/pixel/components/image-preview/image-preview";

export interface ImageThumbnailProps {
  readonly src: string;
  readonly alt: string;
  readonly size?: number;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function ImageThumbnail({
  src,
  alt,
  size = 48,
  onClick,
  className,
}: ImageThumbnailProps) {
  const style = { width: size, height: size };

  const inner = (
    <ImagePreview
      src={src}
      alt={alt}
      className="size-full rounded-md"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={alt}
        style={style}
        className={`group shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-[var(--pf-border)]/60 transition-all hover:border-[var(--pf-primary)]/40 ${className ?? ""}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      style={style}
      className={`shrink-0 overflow-hidden rounded-md border border-[var(--pf-border)]/60 ${className ?? ""}`}
    >
      {inner}
    </div>
  );
}