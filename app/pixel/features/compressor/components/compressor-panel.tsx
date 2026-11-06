/*
path :           app/pixel/features/compressor/components/compressor-panel.tsx
tag :            ["pixel", "pixel-forge", "compressor", "component", "placeholder", "panel"]
projectId:       pixel
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de compression (outil 03).
                 Squelette temporaire pour permettre le build de
                 app/pixel/optimize/compress/page.tsx. Sera REMPLACÉ par
                 l'implémentation réelle (qualité, palette PNG, strip
                 EXIF, aperçu).

                 Contrat futur prévu :
                 - Client Component (sliders + aperçu).
                 - Monté dans app/pixel/optimize/compress/page.tsx.
                 - Déclenchera POST /api/images/compress.

flow:            Server Component → carte "à implémenter".

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/optimize/compress/page.tsx",
                  "@/app/pixel/features/compressor/index.ts"]

imports:         ["lucide-react"]

exports:         ["CompressorPanel", "CompressorPanelProps"]

useBy:           ["@/app/pixel/optimize/compress/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux compresser une image sans changer de format"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Shield } from "lucide-react";

export interface CompressorPanelProps {
  // Placeholder — props réelles à ajouter plus tard.
}

export function CompressorPanel(_props: CompressorPanelProps) {
  return (
    <section
      aria-label="Panneau de compression (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-secondary)]/40 bg-[var(--pf-secondary)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-secondary)]/15 text-[var(--pf-secondary)]">
          <Shield className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Panneau de compression
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : réglage de la qualité, palette PNG,
          progressive JPEG, strip des métadonnées et aperçu avant/après.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/compressor/components/compressor-panel.tsx
        </code>
      </div>
    </section>
  );
}
