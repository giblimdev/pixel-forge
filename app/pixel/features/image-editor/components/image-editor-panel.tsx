/*
path :           app/pixel/features/image-editor/components/image-editor-panel.tsx
tag :            ["pixel", "pixel-forge", "image-editor", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau de retouche et filigrane
                 (outil 08). Squelette temporaire pour permettre le build
                 de app/pixel/edit/retouch/page.tsx sans erreur. Sera
                 REMPLACÉ par l'implémentation réelle (sliders
                 luminosité/contraste/saturation/teinte/netteté/flou,
                 niveaux de gris, éditeur de watermark).

                 Contrat futur prévu :
                 - Client Component (sliders + aperçu canvas).
                 - Monté dans app/pixel/edit/retouch/page.tsx.
                 - Déclenchera POST /api/images/retouch.
                 - Utilisera sharp.modulate(), linear(), tint(), blur(),
                   sharpen(), greyscale() + composite pour le watermark.
                 - Exposera : ImageEditorPanelProps (vide pour l'instant).

flow:            Server Component → carte "à implémenter".

ecosystem:       ImageEditor = [
                   "@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                   "@/app/pixel/features/image-editor/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/edit/retouch/page.tsx",
                  "@/app/pixel/features/image-editor/index.ts"]

imports:         ["lucide-react"]

exports:         ["ImageEditorPanel", "ImageEditorPanelProps"]

useBy:           ["@/app/pixel/edit/retouch/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux retoucher une image et ajouter un filigrane"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Palette } from "lucide-react";

export interface ImageEditorPanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - onApply?: (options: RetouchOptions) => void
  // - onWatermark?: (options: WatermarkOptions) => void
}

export function ImageEditorPanel(_props: ImageEditorPanelProps) {
  return (
    <section
      aria-label="Panneau de retouche (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-info)]/40 bg-[var(--pf-info)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-info)]/15 text-[var(--pf-info)]">
          <Palette className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Retouche et filigrane
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : sliders (luminosité, contraste,
          saturation, teinte, netteté, flou), toggle niveaux de gris,
          éditeur de watermark (logo ou texte, 9 positions, opacité,
          taille).
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/image-editor/components/image-editor-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Aperçu : canvas (rendu temps réel approximatif)</li>
          <li>• Traitement : sharp.modulate(), linear(), tint(), blur(), sharpen(), greyscale()</li>
          <li>• Watermark : sharp.composite() avec logo/texte SVG</li>
          <li>• Endpoint : POST /api/images/retouch</li>
        </ul>
      </div>
    </section>
  );
}