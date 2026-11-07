/*
path:            app/pixel/components/image-upload/upload-preview.tsx
tag:             ["pixel", "component", "upload", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Apercu d'un fichier AVANT ajout au store : miniature
                 carree, nom tronque, taille formatee, bouton "Retirer".
                 Utilise dans ImageUploader quand on veut montrer ce qui
                 va etre ajoute. N'est PAS la file d'attente (qui est
                 geree par image-queue/).

flow:            Recoit { file, onRemove } -> cree une URL blob via
                 URL.createObjectURL -> rend un flex avec thumbnail +
                 nom + taille + bouton. Cleanup URL au demontage.

ecosystem:       ImageUpload = [
                   "@/app/pixel/components/image-upload/dropzone.tsx",
                   "@/app/pixel/components/image-upload/file-picker.tsx",
                   "@/app/pixel/components/image-upload/clipboard-upload.tsx",
                   "@/app/pixel/components/image-upload/upload-preview.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-upload/image-uploader.tsx"]
imports:         ["react", "lucide-react",
                  "@/components/ui/button"]
exports:         ["UploadPreview", "UploadPreviewProps"]
useBy:           ["@/app/pixel/components/image-upload/image-uploader.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les fichiers que je viens de selectionner avant de les ajouter"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : URL.createObjectURL + bouton Retirer.

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface UploadPreviewProps {
  readonly file: File;
  readonly onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadPreview({ file, onRemove }: UploadPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-2">
      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[var(--pf-surface-hover)]">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="size-full object-cover"
            onLoad={() => URL.revokeObjectURL(url)}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
          {file.name}
        </p>
        <p className="font-mono text-[10px] text-[var(--pf-muted)]">
          {formatSize(file.size)} · {file.type || "image"}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Retirer ${file.name}`}
        className="shrink-0 text-[var(--pf-muted)] hover:text-destructive"
      >
        <X className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}