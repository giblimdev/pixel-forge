/*
path :           app/pixel/components/image-upload/image-uploader.tsx
tag :            ["pixel", "component", "upload", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Orchestrateur de l'upload. Compose Dropzone +
                 FilePicker + ClipboardUpload. Quand l'utilisateur
                 ajoute des fichiers (drag, pick, paste), ils sont
                 AJOUTÉS DIRECTEMENT au store Zustand (addMany) —
                 aucune étape "Ajouter à la file" intermédiaire.

                 ⚠️ CHANGEMENT UX v2 :
                 L'ancienne version stockait les fichiers dans un state
                 local `pendingFiles` et demandait un clic sur
                 "Ajouter à la file (N)" pour les transférer au store.
                 C'était une friction inutile (double consentement,
                 duplication visuelle entre UploadPreview et
                 ImageQueue). Désormais :
                   - Drop  → ajout direct au store
                   - Pick  → ajout direct au store
                   - Paste → ajout direct au store
                   - onFilesReady(sources) est appelé immédiatement
                     après l'ajout (le parent peut brancher une
                     action immédiate si besoin)
                 Le composant UploadPreview a été supprimé du
                 projet (plus aucun usage).

                 Validation primaire : filtre uniquement image/* +
                 taille <= 25 Mo (LIMITS.MAX_FILE_SIZE). La validation
                 réelle (MIME magic bytes, dimensions) est faite côté
                 serveur.

flow:            Drop / Pick / Paste -> handleFiles(files) ->
                 filtre (type image + taille <= LIMITS) -> map
                 toSourceImage -> addMany(store) -> onFilesReady?.
                 Aucun state local (plus de pendingFiles).

ecosystem:       ImageUpload = [
                   "app/pixel/components/image-upload/clipboard-upload.tsx",
                   "app/pixel/components/image-upload/dropzone.tsx",
                   "app/pixel/components/image-upload/file-picker.tsx",
                   "app/pixel/components/image-upload/image-uploader.tsx",
                   "app/pixel/components/image-upload/upload-preview.tsx",
                 ]
relatedFiles:    [
                   "app/pixel/stores/image-queue.store.ts",
                   "app/pixel/lib/validators/image-limits.ts",
                   "app/pixel/types/image.ts",
                   "app/pixel/components/image-upload/dropzone.tsx",
                   "app/pixel/components/image-upload/file-picker.tsx",
                   "app/pixel/components/image-upload/clipboard-upload.tsx",
                 ]
imports:         [
                   "react",
                   "@/app/pixel/stores/image-queue.store",
                   "@/app/pixel/lib/validators/image-limits",
                   "@/app/pixel/types/image",
                   "@/app/pixel/components/image-upload/dropzone",
                   "@/app/pixel/components/image-upload/file-picker",
                   "@/app/pixel/components/image-upload/clipboard-upload",
                 ]
exports:         ["ImageUploader", "ImageUploaderProps"]
useBy:           [
                   "app/pixel/convert/page.tsx",
                   "app/pixel/edit/background/page.tsx",
                   "app/pixel/edit/crop/page.tsx",
                   "app/pixel/edit/retouch/page.tsx",
                   "app/pixel/optimize/compress/page.tsx",
                   "app/pixel/optimize/page.tsx",
                   "app/pixel/optimize/resize/page.tsx",
                   "app/pixel/optimize/smart-crop/page.tsx",
                 ]

userStories:     ["*en tant qu'utilisateur je veux ajouter des images à la file par drag, pick ou paste"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : store Zustand + interactions (drop, pick, paste).

import { useCallback } from "react";

import { useImageQueueStore } from "@/app/pixel/stores/image-queue.store";
import { LIMITS } from "@/app/pixel/lib/validators/image-limits";
import type { SourceImage } from "@/app/pixel/types/image";
import { Dropzone } from "@/app/pixel/components/image-upload/dropzone";
import { FilePicker } from "@/app/pixel/components/image-upload/file-picker";
import { ClipboardUpload } from "@/app/pixel/components/image-upload/clipboard-upload";

export interface ImageUploaderProps {
  readonly onFilesReady?: (sources: readonly SourceImage[]) => void;
  readonly disabled?: boolean;
}

/**
 * Construit un SourceImage depuis un File navigateur.
 * Aligné sur le contrat SourceImage :
 * - declaredMime = file.type (ce que le navigateur déclare)
 * - mime         = file.type (le MIME canonique sera recalculé côté
 *                  serveur après validation magic bytes)
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
  const addMany = useImageQueueStore((s) => s.addMany);

  /**
   * Filtre + ajout direct au store. Le drop / pick / paste EST
   * l'action : aucune étape de confirmation.
   */
  const handleFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter(
        (f) =>
          f.type.startsWith("image/") &&
          f.size > 0 &&
          f.size <= LIMITS.MAX_FILE_SIZE,
      );
      if (valid.length === 0) return;

      const sources = valid.map(toSourceImage);
      addMany(sources);
      onFilesReady?.(sources);
    },
    [addMany, onFilesReady],
  );

  return (
    <div className="space-y-4">
      <ClipboardUpload onFiles={handleFiles} disabled={disabled} />

      <Dropzone onFiles={handleFiles} disabled={disabled} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <FilePicker onFiles={handleFiles} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
