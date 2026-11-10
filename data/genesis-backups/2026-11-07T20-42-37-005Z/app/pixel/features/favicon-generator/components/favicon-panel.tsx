/*
path :           app/pixel/features/favicon-generator/components/favicon-panel.tsx
tag :            ["pixel", "pixel-forge", "favicon-generator", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau du générateur de favicons
                 (outil 09). Squelette temporaire pour permettre le build
                 de app/pixel/generate/favicon/page.tsx sans erreur. Sera
                 REMPLACÉ par l'implémentation réelle (upload, sélection
                 des tailles, aperçu multi-résolutions, génération ZIP).

                 Contrat futur prévu :
                 - Client Component (upload + sélection tailles + aperçu).
                 - Monté dans app/pixel/generate/favicon/page.tsx.
                 - Déclenchera POST /api/images/favicon.
                 - Utilisera sharp (multi-tailles) + png-to-ico (assemblage ICO)
                   + archiver (ZIP).
                 - Exposera : FaviconPanelProps (vide pour l'instant).

                 ⚠️ AUCUNE PROP pour l'instant : le placeholder est
                 monté sans props. Si une prop devient nécessaire
                 (ex. defaultSizes), elle sera ajoutée dans
                 l'implémentation réelle.

                 ⚠️ ARCHITECTURE : conformément à l'Option A validée,
                 le fichier est sous app/pixel/features/ (et non à la
                 racine). Tous les imports internes au module devront
                 pointer vers `@/app/pixel/features/favicon-generator/...`.

flow:            Server Component → carte "à implémenter" avec le
                 nom du composant, son rôle futur, et le chemin du
                 fichier.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/generate/favicon/page.tsx",
                  "@/app/pixel/features/favicon-generator/index.ts"]

imports:         ["lucide-react"]

exports:         ["FaviconPanel", "FaviconPanelProps"]

useBy:           ["@/app/pixel/generate/favicon/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux générer tous les favicons d'un site"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Image as ImageIcon } from "lucide-react";

export interface FaviconPanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - defaultSizes?: number[]
  // - onGenerate?: (buffer: Buffer) => void
}

export function FaviconPanel(_props: FaviconPanelProps) {
  return (
    <section
      aria-label="Panneau de génération de favicons (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-success)]/40 bg-[var(--pf-success)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-success)]/15 text-[var(--pf-success)]">
          <ImageIcon className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Générateur de favicons
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : upload d&apos;une image source, sélection
          des tailles (16/24/32/48/64/128/256), aperçu par résolution,
          génération ICO (png-to-ico) + PNG Apple/Android + manifest,
          téléchargement ZIP.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/favicon-generator/components/favicon-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Aperçu : canvas multi-tailles</li>
          <li>• Traitement : sharp (redimensionnement) + png-to-ico (assemblage ICO)</li>
          <li>• Export : archiver (ZIP)</li>
          <li>• Endpoint : POST /api/images/favicon</li>
        </ul>
      </div>
    </section>
  );
}