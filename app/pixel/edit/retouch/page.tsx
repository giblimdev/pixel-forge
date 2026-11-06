/*
path :           app/pixel/edit/retouch/page.tsx
tag :            ["pixel", "pixel-forge", "edit", "retouch", "page", "outil-08", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page de l'outil 08 (Retouche et filigrane).
                 Affiche header + ImageEditorPanel + "Réglages" +
                 "Watermark".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <ImageEditorPanel /> →
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

relatedFiles:    ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                  "@/app/pixel/features/image-editor/index.ts",
                  "@/app/pixel/edit/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/image-editor/components/image-editor-panel"]

exports:         ["default PixelRetouchPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux retoucher une image et ajouter un filigrane"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Palette, Sparkles } from "lucide-react";

import { ImageEditorPanel } from "@/app/pixel/features/image-editor/components/image-editor-panel";

export const metadata: Metadata = {
  title: "Retoucher",
  description:
    "Retoucher une image (luminosité, contraste, saturation) et ajouter un filigrane.",
};

const ADJUSTMENTS: readonly {
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    label: "Luminosité",
    detail: "modulate({ brightness }) — ±100 %.",
  },
  {
    label: "Contraste",
    detail: "linear(a, b) — ±100 %.",
  },
  {
    label: "Saturation",
    detail: "modulate({ saturation }) — 0 (gris) à 200 %.",
  },
  {
    label: "Teinte",
    detail: "tint({ r, g, b }) — teinte colorée unie.",
  },
  {
    label: "Netteté / Flou",
    detail: "sharpen() / blur({ sigma }) — accentuer ou adoucir.",
  },
  {
    label: "Niveaux de gris",
    detail: "greyscale() — conversion monochrome.",
  },
];

const WATERMARK: readonly {
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    label: "Type",
    detail: "Logo (PNG, SVG) ou texte (police, taille).",
  },
  {
    label: "Position",
    detail:
      "9 ancrages (haut-gauche, haut-centre, …, bas-droite) ou coordonnées.",
  },
  {
    label: "Opacité",
    detail: "0-100 % (blend mode optionnel).",
  },
  {
    label: "Taille relative",
    detail: "Pourcentage de la largeur de l'image (ex. 20 %).",
  },
];

export default function PixelRetouchPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Palette className="size-3.5" aria-hidden />
          Outil 08 · Retoucher
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Retouche et filigrane
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Réglez la luminosité, le contraste, la saturation, la teinte, la
          netteté, le flou, ou passez en niveaux de gris. Ajoutez un filigrane
          (logo ou texte) en surimpression.
        </p>
      </header>

      <ImageEditorPanel />

      <section aria-labelledby="adjustments-title">
        <h3
          id="adjustments-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Réglages colorimétriques
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ADJUSTMENTS.map((a) => (
            <div
              key={a.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {a.label}
              </h4>
              <p className="mt-1 font-mono text-xs leading-relaxed text-[var(--pf-muted)]">
                {a.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="watermark-title">
        <h3
          id="watermark-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Watermark
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {WATERMARK.map((w) => (
            <div
              key={w.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {w.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {w.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
