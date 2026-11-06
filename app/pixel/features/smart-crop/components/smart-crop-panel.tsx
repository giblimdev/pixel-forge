/*
path :           app/pixel/features/smart-crop/components/smart-crop-panel.tsx
tag :            ["pixel", "pixel-forge", "smart-crop", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de recadrage intelligent (outil 05).
                 Squelette temporaire pour permettre le build de
                 app/pixel/optimize/smart-crop/page.tsx. Sera REMPLACÉ
                 par l'implémentation réelle (sélection ratio, aperçu,
                 déclenchement sharp.strategy.attention).

                 Contrat futur prévu :
                 - Client Component (ratio selector + aperçu).
                 - Monté dans app/pixel/optimize/smart-crop/page.tsx.
                 - Déclenchera POST /api/images/crop (avec strategy: attention).

flow:            Server Component → carte "à implémenter".

ecosystem:       SmartCrop = [
                   "@/app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
                   "@/app/pixel/features/smart-crop/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/optimize/smart-crop/page.tsx",
                  "@/app/pixel/features/smart-crop/index.ts"]

imports:         ["lucide-react"]

exports:         ["SmartCropPanel", "SmartCropPanelProps"]

useBy:           ["@/app/pixel/optimize/smart-crop/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux recadrer automatiquement une image vers un ratio"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Scissors } from "lucide-react";

export interface SmartCropPanelProps {
  // Placeholder — props réelles à ajouter plus tard.
}

export function SmartCropPanel(_props: SmartCropPanelProps) {
  return (
    <section
      aria-label="Panneau de recadrage intelligent (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-secondary)]/40 bg-[var(--pf-secondary)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-secondary)]/15 text-[var(--pf-secondary)]">
          <Scissors className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Panneau de recadrage intelligent
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : sélection du ratio cible, aperçu du
          recadrage avec détection du sujet (sharp.strategy.attention) et
          téléchargement.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/smart-crop/components/smart-crop-panel.tsx
        </code>
      </div>
    </section>
  );
}