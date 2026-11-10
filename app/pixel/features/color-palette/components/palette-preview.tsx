/*
path:            app/pixel/features/color-palette/components/palette-preview.tsx
tag:             ["pixel", "feature", "color-palette", "component", "preview"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Apercu d'une palette : grille de swatches avec
                 couleur + code HEX + ratio. Chaque swatch est
                 cliquable pour copier le HEX dans le presse-papier
                 (feedback visuel 1.5s). Mobile-first (grille 2 cols
                 sur mobile, 5 cols sur desktop).

flow:            Props { result } -> rend une grille de swatches.
                 Chaque swatch : bouton -> navigator.clipboard.writeText
                 -> setCopied(true) -> setTimeout 1.5s.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/color-palette/components/palette-panel.tsx",
                  "@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["react", "lucide-react",
                  "@/app/pixel/features/color-palette/types/palette.types"]
exports:         ["PalettePreview", "PalettePreviewProps"]
useBy:           ["@/app/pixel/features/color-palette/components/palette-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir les couleurs dominantes avec leur code"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : clipboard + interaction.

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { PaletteResult } from "@/app/pixel/features/color-palette/types/palette.types";

export interface PalettePreviewProps {
  readonly result: PaletteResult;
}

function Swatch({ color }: { readonly color: PaletteResult["colors"][number] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  }

  // Determine si le texte doit etre clair ou sombre selon la luminance
  // (formule W3C simplifiee : 0.299 R + 0.587 G + 0.114 B).
  const luminance =
    (0.299 * color.rgb.r + 0.587 * color.rgb.g + 0.114 * color.rgb.b) / 255;
  const textClass = luminance > 0.6 ? "text-black" : "text-white";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group relative flex h-24 flex-col justify-between overflow-hidden rounded-lg border border-[var(--pf-border)]/60 p-2 text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]"
      style={{ backgroundColor: color.hex }}
      aria-label={`Copier la couleur ${color.hex}`}
    >
      <div className={`flex items-start justify-between ${textClass}`}>
        <code className="font-mono text-xs font-bold">{color.hex}</code>
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        )}
      </div>

      <div className={`space-y-0.5 ${textClass}`}>
        <p className="font-mono text-[10px] opacity-80">
          {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
        </p>
        <p className="font-mono text-[10px] font-semibold">
          {(color.ratio * 100).toFixed(1)} %
        </p>
      </div>
    </button>
  );
}

export function PalettePreview({ result }: PalettePreviewProps) {
  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Palette extraite ({result.colors.length} couleurs)
        </h4>
        <span className="truncate font-mono text-[10px] text-[var(--pf-muted)]">
          {result.sourceFilename}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {result.colors.map((c) => (
          <Swatch key={c.hex} color={c} />
        ))}
      </div>

      <p className="text-[10px] text-[var(--pf-muted)]">
        {result.totalPixels.toLocaleString("fr-FR")} pixels analyses ·{" "}
        Cliquez sur une couleur pour copier son code HEX
      </p>
    </div>
  );
}