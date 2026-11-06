/*
path :           app/pixel/features/background-removal/components/background-panel.tsx
tag :            ["pixel", "pixel-forge", "background-removal", "component", "placeholder", "panel"]
projectId:       pixel
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de suppression d'arrière-plan
                 (outil 07). Squelette temporaire pour permettre le build
                 de app/pixel/edit/background/page.tsx sans erreur. Sera
                 REMPLACÉ par l'implémentation réelle (pipette couleur,
                 slider tolérance, aperçu damier, gomme manuelle).

                 Contrat futur prévu :
                 - Client Component (pipette + sliders + aperçu).
                 - Monté dans app/pixel/edit/background/page.tsx.
                 - Déclenchera POST /api/images/background.
                 - Utilisera sharp.raw() + chroma-key.ts.
                 - Exposera : BackgroundPanelProps (vide pour l'instant).

flow:            Server Component → carte "à implémenter".

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/edit/background/page.tsx",
                  "@/app/pixel/features/background-removal/index.ts"]

imports:         ["lucide-react"]

exports:         ["BackgroundPanel", "BackgroundPanelProps"]

useBy:           ["@/app/pixel/edit/background/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux supprimer un fond uni d'une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Scissors } from "lucide-react";

export interface BackgroundPanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - defaultColor?: string
  // - onRemove?: (buffer: Buffer) => void
}

export function BackgroundPanel(_props: BackgroundPanelProps) {
  return (
    <section
      aria-label="Panneau de détourage (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-info)]/40 bg-[var(--pf-info)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-info)]/15 text-[var(--pf-info)]">
          <Scissors className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Suppression d&apos;arrière-plan
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : pipette de couleur, slider de tolérance
          (0-100), aperçu sur damier de transparence, gomme manuelle pour les
          pixels résiduels.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/background-removal/components/background-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Aperçu : canvas + damier de transparence</li>
          <li>• Traitement : sharp.raw() + chroma-key</li>
          <li>• Endpoint : POST /api/images/background</li>
        </ul>
      </div>
    </section>
  );
}
