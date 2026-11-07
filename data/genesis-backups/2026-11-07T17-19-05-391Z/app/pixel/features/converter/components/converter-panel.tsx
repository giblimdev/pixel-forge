/*
path :           app/pixel/features/converter/components/converter-panel.tsx
tag :            ["pixel", "pixel-forge", "converter", "component", "placeholder", "panel"]
projectId:       pixel
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de conversion (outil 01).
                 Ce composant est un SQUELETTE temporaire destiné à
                 permettre le build de app/pixel/convert/page.tsx sans
                 erreur. Il sera REMPLACÉ par l'implémentation réelle
                 (formulaire + Server Action + aperçu) dans une
                 itération suivante.

                 Contrat futur prévu :
                 - Server Component wrapper (aucun état local).
                 - Monté dans app/pixel/convert/page.tsx.
                 - Déclenchera POST /api/images/convert.
                 - Affichera ImageQueue + FormatSelector + QualityControl
                   + ConversionResults.

                 ⚠️ AUCUNE PROP pour l'instant : le placeholder est
                 monté sans props. Si une prop devient nécessaire
                 (ex. flow, platformRole), elle sera ajoutée dans
                 l'implémentation réelle.

flow:            Server Component → rend une carte bordée "à implémenter"
                 avec le nom du composant et un rappel de son rôle.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/convert/page.tsx",
                  "@/app/pixel/features/converter/index.ts"]

imports:         ["lucide-react"]

exports:         ["ConverterPanel", "ConverterPanelProps"]

useBy:           ["@/app/pixel/convert/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux convertir une image dans un autre format"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Image as ImageIcon } from "lucide-react";

export interface ConverterPanelProps {
  // Aucune prop pour l'instant — placeholder.
  // Les props réelles seront ajoutées lors de l'implémentation.
}

export function ConverterPanel(_props: ConverterPanelProps) {
  return (
    <section
      aria-label="Panneau de conversion (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]">
          <ImageIcon className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Panneau de conversion
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : dépôt d&apos;images, sélection du format,
          réglage de la qualité, aperçu avant/après et téléchargement.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/converter/components/converter-panel.tsx
        </code>
      </div>
    </section>
  );
}
