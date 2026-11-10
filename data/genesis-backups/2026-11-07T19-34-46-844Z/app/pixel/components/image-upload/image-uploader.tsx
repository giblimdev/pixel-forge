/*
path :           app/pixel/components/image-upload/image-uploader.tsx
tag :            ["pixel", "component", "upload", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'upload. Compose Dropzone +
                 FilePicker + ClipboardUpload + UploadPreview. Quand
                 l'utilisateur ajoute des fichiers (drag, pick, paste),
                 ils sont stockés localement en attente (state
                 pendingFiles) et affichés en preview. Un bouton
                 « Ajouter à la file » les transfère au store Zustand
                 via addMany(). Le parent peut aussi brancher
                 `onFilesReady` pour traiter immédiatement.

                 Validation primaire : filtre uniquement image/* +
                 taille <= 25 Mo (LIMITS.MAX_FILE_SIZE). La validation
                 réelle (MIME magic bytes, dimensions) est faite côté
                 serveur.

                 toSourceImage est aligné sur le contrat SourceImage
                 (déclare `declaredMime`, `addedAt`, accepte hasAlpha
                 null, format null, dimensions null).

flow:            useState(pendingFiles) -> handleFiles(files) ->
                 filtre (type image + taille <= LIMITS) -> append à
                 pendingFiles -> bouton « Ajouter à la file » -> map
                 -> SourceImage[] -> addMany(store) -> onFilesReady?
                 (sources) -> setPendingFiles([]).

ecosystem:       ImageUpload = [
                   "app/pixel/components/image-upload/dropzone.tsx",
                   "app/pixel/components/image-upload/file-picker.tsx",
                   "app/pixel/components/image-upload/clipboard-upload.tsx",
                   "app/pixel/components/image-upload/upload-preview.tsx",
                   "app/pixel/components/image-upload/image-uploader.tsx",
                 ]
relatedFiles:    [
                   "app/pixel/stores/image-queue.store.ts",
                   "app/pixel/lib/validators/image-limits.ts",
                   "app/pixel/types/image.ts",
                   "app/pixel/components/image-upload/dropzone.tsx",
                   "app/pixel/components/image-upload/file-picker.tsx",
                   "app/pixel/components/image-upload/clipboard-upload.tsx",
                   "app/pixel/components/image-upload/upload-preview.tsx",
                 ]
imports:         [
                   "react",
                   "lucide-react",
                   "@/app/pixel/stores/image-queue.store",
                   "@/app/pixel/lib/validators/image-limits",
                   "@/app/pixel/types/image",
                   "@/app/pixel/components/image-upload/dropzone",
                   "@/app/pixel/components/image-upload/file-picker",
                   "@/app/pixel/components/image-upload/clipboard-upload",
                   "@/app/pixel/components/image-upload/upload-preview",
                   "@/components/ui/button",
                 ]
exports:         ["ImageUploader", "ImageUploaderProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux ajouter des images à la file par drag, pick ou paste"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState + store + interactions.

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";

import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { LIMITS } from "@/app/pixel/lib/validators/image-limits";
import type { SourceImage } from "@/app/pixel/types/image";
import { Dropzone } from "@/app/pixel/components/image-upload/dropzone";
import { FilePicker } from "@/app/pixel/components/image-upload/file-picker";
import { ClipboardUpload } from "@/app/pixel/components/image-upload/clipboard-upload";
import { UploadPreview } from "@/app/pixel/components/image-upload/upload-preview";
import { Button } from "@/components/ui/button";

export interface ImageUploaderProps {
  readonly onFilesReady?: (sources: readonly SourceImage[]) => void;
  readonly disabled?: boolean;
}

/**
 * Construit un SourceImage depuis un File navigateur.
 * Aligné sur le contrat SourceImage :
 * - declaredMime = file.type (ce que le navigateur déclare)
 * - mime         = file.type (même valeur, le MIME canonique sera
 *                  recalculé côté serveur après validation magic bytes)
 * - format       = null (inconnu tant que createImageBitmap n'a pas lu)
 * - dimensions   = null (idem)
 * - hasAlpha     = null (idem)
 * - addedAt      = ISO 8601
 */
function toSourceImage(file: File): SourceImage {
  return {
    id: crypto.randomUUID(),
    filename: file.name,
    file,
    url: URL.createObjectURL(file),
    declaredMime: file.type,
    mime: file.type,
    sizeBytes: file.size,
    format: null,
    dimensions: null,
    hasAlpha: null,
    addedAt: new Date().toISOString(),
  };
}

export function ImageUploader({
  onFilesReady,
  disabled = false,
}: ImageUploaderProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const addMany = useImageQueueStore((s) => s.addMany);

  const handleFiles = useCallback((files: File[]) => {
    const valid = files.filter(
      (f) =>
        f.type.startsWith("image/") &&
        f.size > 0 &&
        f.size <= LIMITS.MAX_FILE_SIZE,
    );
    if (valid.length === 0) return;
    setPendingFiles((prev) => [...prev, ...valid]);
  }, []);

  function handleRemovePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCommit() {
    if (pendingFiles.length === 0) return;
    const sources = pendingFiles.map(toSourceImage);
    addMany(sources);
    onFilesReady?.(sources);
    setPendingFiles([]);
  }

  return (
    <div className="space-y-4">
      <ClipboardUpload onFiles={handleFiles} disabled={disabled} />

      <Dropzone onFiles={handleFiles} disabled={disabled} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <FilePicker onFiles={handleFiles} disabled={disabled} />
        </div>
        {pendingFiles.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={handleCommit}
            className="gap-1.5 bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-secondary)] to-[var(--pf-info)] text-white"
          >
            <Plus className="size-3.5" aria-hidden />
            Ajouter à la file ({pendingFiles.length})
          </Button>
        )}
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          {pendingFiles.map((file, index) => (
            <UploadPreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemovePending(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}