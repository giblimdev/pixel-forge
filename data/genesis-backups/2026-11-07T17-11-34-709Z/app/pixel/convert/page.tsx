/*
path :           app/pixel/convert/page.tsx
tag :            ["pixel", "pixel-forge", "convert", "page", "outil-01", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page d'entrée de l'outil 01 (Convertisseur universel).
                 Affiche header + ConverterPanel + "Comment ça marche"
                 + "Formats supportés".

                 ⚠️ IMPORTS : les features sont SOUS app/pixel/features/
                 (Option A validée par l'utilisateur). Les imports
                 référencent donc `@/app/pixel/features/converter/...`
                 et non `@/features/converter/...`.

flow:            Server Component → header → <ConverterPanel /> →
                 section étapes → section formats.

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

relatedFiles:    ["@/app/pixel/features/converter/components/converter-panel.tsx",
                  "@/app/pixel/features/converter/index.ts",
                  "@/app/pixel/layout.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/converter/components/converter-panel"]

exports:         ["default PixelConvertPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux convertir une image dans un autre format"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

import { ConverterPanel } from "@/app/pixel/features/converter/components/converter-panel";

export const metadata: Metadata = {
  title: "Convertir",
  description:
    "Convertir vos images entre JPEG, PNG, WebP, AVIF, TIFF, GIF et SVG.",
};

const STEPS: readonly {
  readonly title: string;
  readonly description: string;
}[] = [
  {
    title: "Déposez vos images",
    description:
      "Glissez-déposez jusqu'à 200 images (25 Mo max chacune), ou collez depuis le presse-papier.",
  },
  {
    title: "Choisissez le format",
    description:
      "WebP, AVIF, PNG, JPEG ou TIFF. Réglez la qualité et le mode de compression.",
  },
  {
    title: "Téléchargez",
    description:
      "Aperçu avant/après avec économie en Ko. Téléchargement individuel ou ZIP.",
  },
];

const FORMATS_IN = ["JPEG", "PNG", "WebP", "AVIF", "TIFF", "GIF", "SVG"];
const FORMATS_OUT = ["WebP", "AVIF", "PNG", "JPEG", "TIFF"];

export default function PixelConvertPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-primary)]">
          <ImageIcon className="size-3.5" aria-hidden />
          Outil 01 · Convertir
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Convertisseur universel
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Convertissez vos images entre les formats les plus courants. WebP
          réduit le poids de 25 à 35 % à qualité égale. AVIF fait encore
          mieux sur les photos.
        </p>
      </header>

      <ConverterPanel />

      <section aria-labelledby="how-title">
        <h3
          id="how-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Comment ça marche
        </h3>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <span className="mb-2 grid size-8 place-items-center rounded-full bg-gradient-to-br from-[var(--pf-primary)] to-[var(--pf-secondary)] font-mono text-sm font-bold text-white shadow-md">
                {i + 1}
              </span>
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {step.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="formats-title">
        <h3
          id="formats-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Formats supportés
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              Entrée
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS_IN.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-[var(--pf-primary)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--pf-primary)]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              Sortie <ArrowRight className="size-3" aria-hidden />
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS_OUT.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-[var(--pf-success)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--pf-success)]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}