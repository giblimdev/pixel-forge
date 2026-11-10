/*
path:            app/pixel/features/placeholder-generator/components/placeholder-preview.tsx
tag:             ["pixel", "feature", "placeholder-generator", "component", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Apercu visuel d'un placeholder genere. Affiche le code
                 (LQIP data URL, BlurHash, SVG ou Base64) sur un damier
                 de transparence via TransparencyGrid + un bouton
                 "Copier". Pour BlurHash, on ne peut PAS decoder sans
                 decoder JS cote client ; on affiche donc le hash
                 textuel avec une note explicative.

flow:            Props { sourceUrl, result } -> si format lqip/svg/base64 :
                 rendu direct. Si blurhash : note explicative.
                 Le bouton Copier utilise navigator.clipboard.

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                  "@/app/pixel/components/image-comparison/transparency-grid.tsx"]
imports:         ["react", "lucide-react",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types",
                  "@/app/pixel/components/image-comparison/transparency-grid"]
exports:         ["PlaceholderPreview", "PlaceholderPreviewProps"]
useBy:           ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir l'apercu du placeholder genere"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : clipboard + interaction.

import { useState } from "react";
import { Copy, Check } from "lucide-react";

import type { PlaceholderResult } from "@/app/pixel/features/placeholder-generator/types/placeholder.types";
import { TransparencyGrid } from "@/app/pixel/components/image-comparison/transparency-grid";

export interface PlaceholderPreviewProps {
  readonly sourceUrl: string;
  readonly result: PlaceholderResult;
}

export function PlaceholderPreview({
  sourceUrl,
  result,
}: PlaceholderPreviewProps) {
  const [copied, setCopied] = useState(false);

  const isImageLike =
    result.code.startsWith("data:image/") ||
    result.code.startsWith("<svg");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Apercu ({result.description})
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--pf-primary)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-primary)] hover:bg-[var(--pf-primary)]/25"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {copied ? "Copie" : "Copier"}
        </button>
      </div>

      {isImageLike ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--pf-border)]/60">
          <TransparencyGrid />
          <img
            src={result.code}
            alt="Placeholder genere"
            className="absolute inset-0 size-full object-contain"
            draggable={false}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 p-4">
          <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
            Le format BlurHash est un hash textuel. Pour l&apos;afficher, integrez
            la librairie <code className="font-mono text-[var(--pf-foreground)]">blurhash</code> cote client :
          </p>
          <pre className="mt-2 overflow-x-auto rounded bg-[var(--pf-surface-hover)]/40 p-2 font-mono text-[10px] text-[var(--pf-foreground)]">
{`import { decode } from "blurhash";

const pixels = decode("${result.code}", ${result.width}, ${result.height});`}
          </pre>
          <p className="mt-2 text-[10px] text-[var(--pf-muted)]">
            Image source : {sourceUrl.slice(0, 60)}…
          </p>
        </div>
      )}
    </div>
  );
}