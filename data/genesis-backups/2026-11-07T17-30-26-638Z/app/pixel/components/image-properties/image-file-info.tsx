/*
path:            app/pixel/components/image-properties/image-file-info.tsx
tag:             ["pixel", "component", "properties", "file-info"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Affiche les informations fichier : nom, format, poids.
                 Composant purement presentationnel.

flow:            Recoit { filename, format, sizeBytes } -> rend 3
                 lignes "Nom", "Format", "Poids".

ecosystem:       ImageProperties = [
                   "@/app/pixel/components/image-properties/image-dimensions.tsx",
                   "@/app/pixel/components/image-properties/image-file-info.tsx",
                   "@/app/pixel/components/image-properties/image-color-info.tsx",
                   "@/app/pixel/components/image-properties/image-properties.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-properties/image-properties.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/types/image"]
exports:         ["ImageFileInfoRows", "ImageFileInfoRowsProps"]
useBy:           ["@/app/pixel/components/image-properties/image-properties.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le nom, le format et le poids d'une image"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ImageFormat } from "@/app/pixel/types/image";

export interface ImageFileInfoRowsProps {
  readonly filename: string;
  readonly format: ImageFormat | null;
  readonly sizeBytes: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--pf-border)]/40 py-1.5 last:border-b-0">
      <span className="text-xs text-[var(--pf-muted)]">{label}</span>
      <span className="truncate font-mono text-xs text-[var(--pf-foreground)]">
        {value}
      </span>
    </div>
  );
}

export function ImageFileInfoRows({
  filename,
  format,
  sizeBytes,
}: ImageFileInfoRowsProps) {
  return (
    <>
      <Row label="Nom" value={filename} />
      <Row label="Format" value={format ? format.toUpperCase() : "-"} />
      <Row label="Poids" value={formatSize(sizeBytes)} />
    </>
  );
}