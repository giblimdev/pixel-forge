/*
path :           app/pixel/generate/placeholder/page.tsx
tag :            ["pixel", "pixel-forge", "generate", "placeholder", "page", "outil-10", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil 10 (Générateur de placeholders).
                 Affiche header + PlaceholderPanel + "Formats de
                 placeholder" + "Quand l'utiliser".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <PlaceholderPanel /> →
                 sections d'aide.

ecosystem:       Pixel = [
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/components/PixelNav.tsx",
                   "@/app/pixel/convert/page.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/generate/page.tsx",
                   "@/app/pixel/layout.tsx",
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/page.tsx",
                 ]

relatedFiles:    ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                  "@/app/pixel/features/placeholder-generator/index.ts",
                  "@/app/pixel/generate/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/placeholder-generator/components/placeholder-panel"]

exports:         ["default PixelPlaceholderPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux générer un placeholder LQIP ou BlurHash"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Image as ImageIcon, Sparkles } from "lucide-react";

import { PlaceholderPanel } from "@/app/pixel/features/placeholder-generator/components/placeholder-panel";

export const metadata: Metadata = {
  title: "Placeholders",
  description:
    "Générer un placeholder LQIP, BlurHash, SVG flouté ou Base64 pour le web.",
};

const FORMATS: readonly { readonly name: string; readonly detail: string }[] = [
  {
    name: "LQIP (data URL)",
    detail: "Image 20×20 base64, intégrable en background-image CSS.",
  },
  {
    name: "BlurHash",
    detail: "Chaîne courte (~30 car.) décodable en dégradé flou (package blurhash).",
  },
  {
    name: "SVG flouté",
    detail: "SVG avec filtre gaussien, sans dépendance JS côté client.",
  },
  {
    name: "Base64",
    detail: "Image compressée inline, utile pour les emails et AMP.",
  },
];

export default function PixelPlaceholderPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-success)]">
          <ImageIcon className="size-3.5" aria-hidden />
          Outil 10 · Placeholders
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Générateur de placeholders
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Générez un placeholder ultra-léger à afficher pendant le
          chargement d&apos;une image. Améliore la perception de
          performance (LCP, CLS).
        </p>
      </header>

      <PlaceholderPanel />

      <section aria-labelledby="formats-title">
        <h3
          id="formats-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-success)]" aria-hidden />
          Formats de placeholder
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {FORMATS.map((f) => (
            <div
              key={f.name}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <code className="block font-mono text-sm font-bold text-[var(--pf-success)]">
                {f.name}
              </code>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}