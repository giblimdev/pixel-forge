/*
path :           app/pixel/optimize/compress/page.tsx
tag :            ["pixel", "pixel-forge", "optimize", "compress", "page", "outil-03", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil 03 (Compresseur JPEG / PNG).
                 Affiche header + CompressorPanel + "Quand l'utiliser"
                 + "Paramètres disponibles".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <CompressorPanel /> →
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

relatedFiles:    ["@/app/pixel/features/compressor/components/compressor-panel.tsx",
                  "@/app/pixel/features/compressor/index.ts",
                  "@/app/pixel/optimize/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/compressor/components/compressor-panel"]

exports:         ["default PixelCompressPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux compresser une image sans changer de format"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Shield, Sparkles } from "lucide-react";

import { CompressorPanel } from "@/app/pixel/features/compressor/components/compressor-panel";

export const metadata: Metadata = {
  title: "Compresser",
  description:
    "Compresser une image JPEG ou PNG sans changer de format.",
};

const PARAMS: readonly { readonly label: string; readonly detail: string }[] = [
  {
    label: "Qualité",
    detail: "Niveau 1-100. Plus haut = meilleure qualité, poids plus lourd.",
  },
  {
    label: "Palette PNG",
    detail: "Réduire à 256, 128 ou 64 couleurs (PNG-8) pour alléger les illustrations.",
  },
  {
    label: "Progressive JPEG",
    detail: "Chargement progressif (rendu par passes) — réduit la perception de latence.",
  },
  {
    label: "Strip métadonnées",
    detail: "Supprimer EXIF, ICC, commentaires. Réduit le poids de quelques Ko.",
  },
];

export default function PixelCompressPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Shield className="size-3.5" aria-hidden />
          Outil 03 · Compresser
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Compresseur JPEG / PNG
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Réduisez le poids d&apos;un PNG ou JPEG sans changer de format.
          Utile pour les assets qui doivent rester en PNG (transparence) ou
          JPEG (compatibilité navigateur).
        </p>
      </header>

      <CompressorPanel />

      <section aria-labelledby="params-title">
        <h3
          id="params-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-secondary)]" aria-hidden />
          Paramètres disponibles
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PARAMS.map((param) => (
            <div
              key={param.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {param.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {param.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}