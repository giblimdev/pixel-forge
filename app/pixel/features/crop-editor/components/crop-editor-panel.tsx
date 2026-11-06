/*
path :           app/pixel/features/crop-editor/components/crop-editor-panel.tsx
tag :            ["pixel", "pixel-forge", "crop-editor", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de l'éditeur de recadrage
                 (outil 06). Squelette temporaire pour permettre le build
                 de app/pixel/edit/crop/page.tsx sans erreur. Sera
                 REMPLACÉ par l'implémentation réelle (canvas
                 interactif, cadre draggable, ratios, grille des tiers).

                 Contrat futur prévu :
                 - Client Component (canvas + interactions pointer).
                 - Monté dans app/pixel/edit/crop/page.tsx.
                 - Utilisera react-easy-crop (à installer).
                 - Déclenchera POST /api/images/crop.
                 - Exposera : CropEditorPanelProps (vide pour l'instant).

                 ⚠️ AUCUNE PROP pour l'instant : le placeholder est
                 monté sans props. Si une prop devient nécessaire (ex.
                 defaultRatio), elle sera ajoutée dans l'implémentation
                 réelle.

                 ⚠️ ARCHITECTURE : conformément à l'Option A validée,
                 le fichier est sous app/pixel/features/ (et non à la
                 racine). Tous les imports internes au module devront
                 pointer vers `@/app/pixel/features/crop-editor/...`.

flow:            Server Component → carte "à implémenter" avec le
                 nom du composant, son rôle futur, et le chemin du
                 fichier.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/edit/crop/page.tsx",
                  "@/app/pixel/features/crop-editor/index.ts"]

imports:         ["lucide-react"]

exports:         ["CropEditorPanel", "CropEditorPanelProps"]

useBy:           ["@/app/pixel/edit/crop/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Scissors } from "lucide-react";

export interface CropEditorPanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - defaultRatio?: string
  // - onCrop?: (coords: { left; top; width; height }) => void
}

export function CropEditorPanel(_props: CropEditorPanelProps) {
  return (
    <section
      aria-label="Panneau de recadrage (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-info)]/40 bg-[var(--pf-info)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-info)]/15 text-[var(--pf-info)]">
          <Scissors className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Éditeur de recadrage
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : canvas interactif (react-easy-crop),
          cadre draggable, verrouillage de ratio, grille des tiers,
          rotation 90/180/270, flip horizontal/vertical.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/crop-editor/components/crop-editor-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Canvas : react-easy-crop (à installer)</li>
          <li>• Traitement : sharp.extract() + sharp.rotate() + sharp.flip()</li>
          <li>• Endpoint : POST /api/images/crop</li>
        </ul>
      </div>
    </section>
  );
}