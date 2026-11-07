/*
path:            app/pixel/components/image-preview/image-lightbox.tsx
tag:             ["pixel", "component", "preview", "lightbox"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Modal plein ecran d'affichage d'image. Utilise
                 <dialog> natif pour beneficier de l'accessibilite
                 (focus trap, Escape, backdrop) sans dependance. S'ouvre
                 via prop open et se ferme via onOpenChange. Affiche
                 l'image centree avec un bouton X et un click backdrop
                 pour fermer.

flow:            useEffect -> si open : dialogRef.current.showModal()
                 sinon close() -> onClick backdrop (event.target ===
                 dialog) : onOpenChange(false) -> onClose natif :
                 onOpenChange(false).

ecosystem:       ImagePreview = [
                   "@/app/pixel/components/image-preview/image-preview.tsx",
                   "@/app/pixel/components/image-preview/image-thumbnail.tsx",
                   "@/app/pixel/components/image-preview/image-lightbox.tsx",
                   "@/app/pixel/components/image-preview/image-placeholder.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-preview/image-preview.tsx"]
imports:         ["react", "lucide-react"]
exports:         ["ImageLightbox", "ImageLightboxProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux agrandir une image en plein ecran"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useRef + useEffect + dialog natif.

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ImageLightboxProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly src: string;
  readonly alt: string;
}

export function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false);
      }}
      className="m-0 h-screen max-h-none w-screen max-w-none bg-black/90 p-0 backdrop:bg-black/80 open:flex open:items-center open:justify-center"
    >
      <div className="relative flex size-full items-center justify-center p-4">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="size-5" aria-hidden />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </dialog>
  );
}