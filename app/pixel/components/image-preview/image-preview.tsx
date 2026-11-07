/*
path:            app/pixel/components/image-preview/image-preview.tsx
tag:             ["pixel", "component", "preview", "image"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Affichage d'une image avec etats de chargement/erreur.
                 Utilise <img> natif (pas next/image) parce que les URL
                 peuvent etre des blobs locaux, des data URLs, ou des
                 URLs temporaires @vercel/blob — next/image ne gere pas
                 tous ces cas sans config domain. Affiche un skeleton
                 pendant le chargement et une icone d'erreur si
                 onError. Controle la taille via les props width/height
                 ou via className.

flow:            useState(loading, error) -> <img onLoad onError> ->
                 si loading : skeleton par-dessus (position absolute)
                 -> si error : icone + message.

ecosystem:       ImagePreview = [
                   "@/app/pixel/components/image-preview/image-preview.tsx",
                   "@/app/pixel/components/image-preview/image-thumbnail.tsx",
                   "@/app/pixel/components/image-preview/image-lightbox.tsx",
                   "@/app/pixel/components/image-preview/image-placeholder.tsx",
                 ]
relatedFiles:    []
imports:         ["react", "lucide-react"]
exports:         ["ImagePreview", "ImagePreviewProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir une image avec un etat de chargement clair"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useState(loading/error) + onLoad/onError.

import { useState } from "react";
import { ImageOff } from "lucide-react";

export interface ImagePreviewProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly width?: number;
  readonly height?: number;
}

export function ImagePreview({
  src,
  alt,
  className,
  width,
  height,
}: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {error ? (
        <div className="flex size-full flex-col items-center justify-center gap-1 bg-[var(--pf-surface-hover)]/40 text-[var(--pf-muted)]">
          <ImageOff className="size-6" aria-hidden />
          <p className="text-[10px]">Image indisponible</p>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className="size-full object-contain"
          />
          {loading && (
            <div className="absolute inset-0 animate-pulse bg-[var(--pf-surface-hover)]" />
          )}
        </>
      )}
    </div>
  );
}