/*
path :           app/pixel/features/resize/components/resize-panel.tsx
tag :            ["pixel", "pixel-forge", "resize", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de redimensionnement (outil 04).
                 Squelette temporaire pour permettre le build de
                 app/pixel/optimize/resize/page.tsx. Sera REMPLACÉ par
                 l'implémentation réelle (dimensions, ratio, presets).

                 Contrat futur prévu :
                 - Client Component (inputs + presets).
                 - Monté dans app/pixel/optimize/resize/page.tsx.
                 - Déclenchera POST /api/images/resize.

flow:            Server Component → carte "à implémenter".

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/optimize/resize/page.tsx",
                  "@/app/pixel/features/resize/index.ts"]

imports:         ["lucide-react"]

exports:         ["ResizePanel", "ResizePanelProps"]

useBy:           ["@/app/pixel/optimize/resize/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux redimensionner un lot d'images"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Layers } from "lucide-react";

export interface ResizePanelProps {
  // Placeholder — props réelles à ajouter plus tard.
}

export function ResizePanel(_props: ResizePanelProps) {
  return (
    <section
      aria-label="Panneau de redimensionnement (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-secondary)]/40 bg-[var(--pf-secondary)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-secondary)]/15 text-[var(--pf-secondary)]">
          <Layers className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Panneau de redimensionnement
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : saisie largeur/hauteur, verrouillage du
          ratio, presets responsive (320/640/1280) et génération de
          plusieurs variantes.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/resize/components/resize-panel.tsx
        </code>
      </div>
    </section>
  );
}