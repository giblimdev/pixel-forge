/*
path:            app/pixel/components/image-upload/file-picker.tsx
tag:             ["pixel", "component", "upload", "file-picker"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Bouton "Parcourir" qui ouvre le selecteur de fichiers
                 natif. Utilise un <input type="file"> cache et le
                 declenche via ref. Expose onFiles au parent.

flow:            useRef<HTMLInputElement> -> bouton onClick ->
                 fileInputRef.current.click() -> onChange ->
                 onFiles(Array.from(event.target.files)) -> reset
                 e.target.value (pour pouvoir re-selectionner le meme
                 fichier).

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
exports:         ["FilePicker", "FilePickerProps"]
useBy:           ["@/app/pixel/components/image-upload/image-uploader.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir des images depuis l'explorateur"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useRef + input file cache.

import { useRef } from "react";
import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface FilePickerProps {
  readonly onFiles: (files: File[]) => void;
  readonly disabled?: boolean;
  readonly accept?: string;
  readonly multiple?: boolean;
}

export function FilePicker({
  onFiles,
  disabled = false,
  accept = "image/*",
  multiple = true,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFiles(Array.from(files).filter((f) => f.type.startsWith("image/")));
    }
    event.target.value = "";
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="gap-1.5"
      >
        <FolderOpen className="size-3.5" aria-hidden />
        Parcourir
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />
    </>
  );
}