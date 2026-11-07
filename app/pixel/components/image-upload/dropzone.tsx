/*
path:            app/pixel/components/image-upload/dropzone.tsx
tag:             ["pixel", "component", "upload", "dropzone"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Zone de glisser-deposer. Client Component :
                 gere les evenements dragenter, dragover, dragleave,
                 drop sur un <div> stylise. Expose le callback onFiles
                 au parent (ImageUploader) qui decide de la suite
                 (validation, ajout au store, etc.). Aucune logique
                 metier : juste la detection du drop.

flow:            useState(dragging) -> gere les 4 evenements drag ->
                 au drop : extrait les File[] -> appelle onFiles.

ecosystem:       ImageUpload = [
                   "@/app/pixel/components/image-upload/dropzone.tsx",
                   "@/app/pixel/components/image-upload/file-picker.tsx",
                   "@/app/pixel/components/image-upload/clipboard-upload.tsx",
                   "@/app/pixel/components/image-upload/upload-preview.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-upload/image-uploader.tsx"]
imports:         ["react", "lucide-react"]
exports:         ["Dropzone", "DropzoneProps"]
useBy:           ["@/app/pixel/components/image-upload/image-uploader.tsx"]

userStories:     ["*en tant qu'utilisateur je veux deposer plusieurs images par glisser-deposer"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useState + gestionnaires d'evenements drag.

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

export interface DropzoneProps {
  readonly onFiles: (files: File[]) => void;
  readonly disabled?: boolean;
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly className?: string;
}

export function Dropzone({
  onFiles,
  disabled = false,
  accept = "image/*",
  multiple = true,
  className,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) onFiles(files);
    },
    [disabled, onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zone de depot d'images"
      aria-disabled={disabled}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
        dragging
          ? "border-[var(--pf-primary)] bg-[var(--pf-primary)]/10"
          : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 hover:border-[var(--pf-primary)]/40 hover:bg-[var(--pf-surface)]/40"
      } ${disabled ? "pointer-events-none opacity-50" : ""} ${className ?? ""}`}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]">
        <UploadCloud className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--pf-foreground)]">
          {dragging ? "Relachez pour ajouter" : "Glissez vos images ici"}
        </p>
        <p className="text-xs text-[var(--pf-muted)]">
          ou utilisez les boutons ci-dessous — JPEG, PNG, WebP, AVIF, TIFF
        </p>
      </div>
      <p className="font-mono text-[10px] text-[var(--pf-muted)]/70">
        Ctrl+V pour coller depuis le presse-papier
      </p>
    </div>
  );
}