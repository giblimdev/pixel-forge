/*
path :           app/pixel/features/placeholder-generator/components/placeholder-panel.tsx
tag :            ["pixel", "pixel-forge", "placeholder-generator", "component", "placeholder", "panel"]
projectId:       new-genesis
type:            component
generic:         false

role:            ⚠️ PLACEHOLDER — Panneau du générateur de placeholders
                 (outil 10). Squelette temporaire pour permettre le build
                 de app/pixel/generate/placeholder/page.tsx sans erreur.
                 Sera REMPLACÉ par l'implémentation réelle (upload,
                 sélection format, aperçu damier, code exportable).

                 Contrat futur prévu :
                 - Client Component (upload + preview + copy).
                 - Monté dans app/pixel/generate/placeholder/page.tsx.
                 - Déclenchera POST /api/images/placeholder.
                 - Utilisera sharp (LQIP 20×20) + blurhash (encodage).
                 - Exposera : PlaceholderPanelProps (vide pour l'instant).

flow:            Server Component → carte "à implémenter".

ecosystem:       PlaceholderGenerator = [
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                 ]

relatedFiles:    ["@/app/pixel/generate/placeholder/page.tsx",
                  "@/app/pixel/features/placeholder-generator/index.ts"]

imports:         ["lucide-react"]

exports:         ["PlaceholderPanel", "PlaceholderPanelProps"]

useBy:           ["@/app/pixel/generate/placeholder/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux générer un placeholder LQIP ou BlurHash"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { Image as ImageIcon } from "lucide-react";

export interface PlaceholderPanelProps {
  // Placeholder — props réelles à ajouter plus tard :
  // - defaultFormat?: "lqip" | "blurhash" | "svg" | "base64"
  // - onGenerate?: (output: string) => void
}

export function PlaceholderPanel(_props: PlaceholderPanelProps) {
  return (
    <section
      aria-label="Panneau de génération de placeholders (placeholder)"
      className="rounded-2xl border-2 border-dashed border-[var(--pf-success)]/40 bg-[var(--pf-success)]/5 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-success)]/15 text-[var(--pf-success)]">
          <ImageIcon className="size-6" aria-hidden />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Générateur de placeholders
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-[var(--pf-muted)]">
          ⚠️ <strong>Placeholder</strong> — Ce composant sera remplacé par
          l&apos;interface réelle : upload d&apos;une image, sélection du
          format (LQIP / BlurHash / SVG flouté / Base64), aperçu sur
          damier, code exportable avec bouton Copier.
        </p>
        <code className="rounded bg-[var(--pf-background)]/60 px-2 py-1 font-mono text-[11px] text-[var(--pf-muted)]">
          app/pixel/features/placeholder-generator/components/placeholder-panel.tsx
        </code>
        <ul className="mt-2 space-y-1 text-left text-[11px] text-[var(--pf-muted)]">
          <li>• Aperçu : canvas + damier pour transparence</li>
          <li>• LQIP : sharp().resize(20).toBuffer() → data URL</li>
          <li>• BlurHash : pixels → blurhash.encode() → chaîne</li>
          <li>• Endpoint : POST /api/images/placeholder</li>
        </ul>
      </div>
    </section>
  );
}