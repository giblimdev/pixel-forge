/*
path :           app/pixel/features/color-palette/components/palette-panel.tsx
tag :            ["pixel", "pixel-forge", "color-palette", "component", "placeholder", "panel"]
projectId:       pixel
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de l'extracteur de palettes
                 (outil 11). Squelette temporaire pour permettre le build
                 de app/pixel/generate/palette/page.tsx sans erreur. Sera
                 REMPLACÉ par l'implémentation réelle (upload, extraction
                 des 5 couleurs dominantes, aperçu hex/RGB, export CSS /
                 Tailwind / JSON).

                 Contrat futur prévu :
                 - Client Component (upload + preview + copy).
                 - Monté dans app/pixel/generate/palette/page.tsx.
                 - Déclenchera POST /api/images/palette.
                 - Utilisera sharp.stats() + clustering (k-means ou
                   colorthief).
                 - Exposera : PalettePanelProps (vide pour l'instant).

flow:            Server Component → carte "à implémenter".

ecosystem:       ColorPalette = [
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/generate/palette/page.tsx",
                  "@/app/pixel/features/color-palette/index.ts"]

imports:         ["lucide-react"]

exports:         ["PalettePanel", "PalettePanelProps"]

useBy:           ["@/app/pixel/generate/palette/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux extraire les couleurs dominantes d'une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Palette } from "lucide-react";

export interface PalettePanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - defaultCount?: number
  // - onExtract?: (palette: { hex: string; ratio: number }[]) => void
}

export function PalettePanel(_props: PalettePanelProps) {
  return (
    <section
      aria-label="Panneau d'extraction de palette (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-success)]/40 bg-[var(--pf-success)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-success)]/15 text-[var(--pf-success)]">
          <Palette className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Extracteur de palettes
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : upload d&apos;une image, extraction des 5
          couleurs dominantes, aperçu avec code hex/RGB, boutons d&apos;export
          CSS / Tailwind / JSON.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/color-palette/components/palette-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Extraction : sharp.stats() + clustering</li>
          <li>• Aperçu : 5 swatches avec hex/RGB/ratio</li>
          <li>• Export : CSS variables, Tailwind config, JSON</li>
          <li>• Endpoint : POST /api/images/palette</li>
        </ul>
      </div>
    </section>
  );
}
