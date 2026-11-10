/*
path:            app/pixel/features/favicon-generator/components/favicon-preview.tsx
tag:             ["pixel", "feature", "favicon-generator", "component", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Apercu des fichiers generes (ICO + PNG + manifest) sous
                 forme de liste telechargeable individuellement.

                 Les URLs blob sont creees via useMemo (une fois par
                 fichier) et revoquees au demontage via useEffect.
                 Sans ca, chaque re-render creerait de nouvelles URLs
                 et fuiterait de la memoire.

flow:            Props { outcome } -> useMemo(files) -> useEffect
                 (cleanup URLs au demontage) -> liste des fichiers avec
                 lien download.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                  "@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["react", "lucide-react",
                  "@/app/pixel/features/favicon-generator/types/favicon.types"]
exports:         ["FaviconPreview", "FaviconPreviewProps"]
useBy:           ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir et telecharger les favicons generes"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : URL.createObjectURL + useEffect cleanup.

import { useEffect, useMemo } from "react";
import { Download } from "lucide-react";

import type { FaviconOutcome } from "@/app/pixel/features/favicon-generator/types/favicon.types";

export interface FaviconPreviewProps {
  readonly outcome: FaviconOutcome;
}

interface DownloadableFile {
  readonly filename: string;
  readonly url: string;
  readonly mime: string;
}

export function FaviconPreview({ outcome }: FaviconPreviewProps) {
  const success = outcome.success[0];

  const files = useMemo<readonly DownloadableFile[]>(() => {
    if (!success) return [];

    const result: DownloadableFile[] = [];

    if (success.icoBuffer) {
      const blob = new Blob([success.icoBuffer], { type: "image/x-icon" });
      result.push({
        filename: "favicon.ico",
        url: URL.createObjectURL(blob),
        mime: "image/x-icon",
      });
    }

    for (const png of success.pngFiles) {
      const blob = new Blob([png.buffer], { type: "image/png" });
      result.push({
        filename: png.filename,
        url: URL.createObjectURL(blob),
        mime: "image/png",
      });
    }

    const manifestBlob = new Blob([success.manifestJson], {
      type: "application/manifest+json",
    });
    result.push({
      filename: "manifest.webmanifest",
      url: URL.createObjectURL(manifestBlob),
      mime: "application/manifest+json",
    });

    return result;
  }, [success]);

  useEffect(() => {
    return () => {
      for (const file of files) {
        URL.revokeObjectURL(file.url);
      }
    };
  }, [files]);

  if (!success) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Fichiers generes
      </h4>
      <ul className="space-y-1">
        {files.map((file) => (
          <li
            key={file.filename}
            className="flex items-center justify-between gap-2 rounded border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-2"
          >
            <code className="font-mono text-xs text-[var(--pf-foreground)]">
              {file.filename}
            </code>
            <a
              href={file.url}
              download={file.filename}
              className="inline-flex items-center gap-1 text-xs text-[var(--pf-success)] hover:underline"
            >
              <Download className="size-3" aria-hidden />
              Telecharger
            </a>
          </li>
        ))}
      </ul>
      {success.downloadUrl && (
        <a
          href={success.downloadUrl}
          download="favicons.zip"
          className="inline-flex items-center gap-1 rounded-md bg-[var(--pf-success)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-success)] hover:bg-[var(--pf-success)]/25"
        >
          <Download className="size-3.5" aria-hidden />
          Telecharger le ZIP complet
        </a>
      )}
    </div>
  );
}