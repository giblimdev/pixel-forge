/*
path:            app/pixel/components/image-properties/image-properties.tsx
tag:             ["pixel", "component", "properties", "orchestrator"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Orchestrateur des proprietes d'une image. Compose
                 file-info + dimensions + color-info. Recoit source OU
                 result.

flow:            Recoit { source?, result?, title? } -> rend les 3
                 groupes de lignes.

ecosystem:       ImageProperties = [
                   "@/app/pixel/components/image-properties/image-dimensions.tsx",
                   "@/app/pixel/components/image-properties/image-file-info.tsx",
                   "@/app/pixel/components/image-properties/image-color-info.tsx",
                   "@/app/pixel/components/image-properties/image-properties.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-properties/image-file-info.tsx",
                  "@/app/pixel/components/image-properties/image-dimensions.tsx",
                  "@/app/pixel/components/image-properties/image-color-info.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/components/image-properties/image-file-info",
                  "@/app/pixel/components/image-properties/image-dimensions",
                  "@/app/pixel/components/image-properties/image-color-info"]
exports:         ["ImageProperties", "ImagePropertiesProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir les proprietes techniques d'une image"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ResultImage, SourceImage } from "@/app/pixel/types/image";
import { ImageFileInfoRows } from "@/app/pixel/components/image-properties/image-file-info";
import { ImageDimensionsRow } from "@/app/pixel/components/image-properties/image-dimensions";
import { ImageColorInfoRows } from "@/app/pixel/components/image-properties/image-color-info";

export interface ImagePropertiesProps {
  readonly source?: SourceImage;
  readonly result?: ResultImage;
  readonly title?: string;
  readonly className?: string;
}

export function ImageProperties({
  source,
  result,
  title = "Proprietes",
  className,
}: ImagePropertiesProps) {
  if (!source && !result) {
    return (
      <div
        className={`rounded-xl border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 p-4 text-center text-xs text-[var(--pf-muted)] ${className ?? ""}`}
      >
        Aucune propriete a afficher.
      </div>
    );
  }

  return (
    <section
      aria-label={title}
      className={`space-y-1 rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3 ${className ?? ""}`}
    >
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        {title}
      </h4>

      {source && (
        <>
          <ImageFileInfoRows
            filename={source.filename}
            format={source.format}
            sizeBytes={source.sizeBytes}
          />
          <ImageDimensionsRow dimensions={source.dimensions} />
          <ImageColorInfoRows hasAlpha={source.hasAlpha} mime={source.mime} />
        </>
      )}

      {!source && result && (
        <>
          <ImageFileInfoRows
            filename={result.filename}
            format={result.format}
            sizeBytes={result.sizeBytes}
          />
          <ImageDimensionsRow dimensions={result.dimensions} />
          <ImageColorInfoRows
            hasAlpha={
              result.format === "png" ||
              result.format === "webp" ||
              result.format === "avif"
            }
            mime={result.mime}
          />
        </>
      )}
    </section>
  );
}