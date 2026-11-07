/*
path:            app/pixel/components/image-upload/clipboard-upload.tsx
tag:             ["pixel", "component", "upload", "clipboard", "paste"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Composant invisible qui ecoute les evenements "paste"
                 globaux sur window et extrait les fichiers image du
                 presse-papier. Ne rend rien visuellement (retourne
                 null) : c'est un hook deplace dans un composant pour
                 rester composable avec Suspense.

                 Filtre uniquement les items de type image. Ignore les
                 pastes de texte.

flow:            useEffect -> addEventListener("paste", handler) ->
                 handler -> event.clipboardData.items -> filtre
                 kind === "file" && type.startsWith("image/") ->
                 getAsFile() -> onFiles(File[]). Cleanup au demontage.

ecosystem:       ImageUpload = [
                   "@/app/pixel/components/image-upload/dropzone.tsx",
                   "@/app/pixel/components/image-upload/file-picker.tsx",
                   "@/app/pixel/components/image-upload/clipboard-upload.tsx",
                   "@/app/pixel/components/image-upload/upload-preview.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-upload/image-uploader.tsx"]
imports:         ["react"]
exports:         ["ClipboardUpload", "ClipboardUploadProps"]
useBy:           ["@/app/pixel/components/image-upload/image-uploader.tsx"]

userStories:     ["*en tant qu'utilisateur je veux coller une image depuis le presse-papier"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useEffect + window.addEventListener("paste").

import { useEffect } from "react";

export interface ClipboardUploadProps {
  readonly onFiles: (files: File[]) => void;
  readonly disabled?: boolean;
}

export function ClipboardUpload({
  onFiles,
  disabled = false,
}: ClipboardUploadProps) {
  useEffect(() => {
    if (disabled) return;

    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.kind !== "file") continue;
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (file) files.push(file);
      }

      if (files.length > 0) {
        event.preventDefault();
        onFiles(files);
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onFiles]);

  return null;
}