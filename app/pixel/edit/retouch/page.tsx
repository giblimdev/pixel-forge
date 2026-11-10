/*
path:            app/pixel/edit/retouch/page.tsx
tag:             ["pixel", "pixel-forge", "edit", "retouch", "page", "outil-08", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 08 (Retouche et filigrane). Affiche
                 header + import/queue + <ImageEditorPanel /> + section
                 "Reglages colorimetriques" + section "Watermark".

flow:            Server Component -> header -> import/queue ->
                 <ImageEditorPanel /> -> reglages -> watermark.

ecosystem:       Pixel = [
                   "@/app/pixel/edit/retouch/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/image-editor/components/image-editor-panel.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "lucide-react",
                  "@/app/pixel/features/image-editor/components/image-editor-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelRetouchPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux retoucher une image et ajouter un filigrane"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { Palette, Sparkles } from "lucide-react";

import { ImageEditorPanel } from "@/app/pixel/features/image-editor/components/image-editor-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Retoucher",
  description:
    "Retoucher une image (luminosite, contraste, saturation) et ajouter un filigrane.",
};

const ADJUSTMENTS: readonly {
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    label: "Luminosite",
    detail: "modulate({ brightness }) - +/- 100 %.",
  },
  {
    label: "Contraste",
    detail: "linear(a, b) - +/- 100 %.",
  },
  {
    label: "Saturation",
    detail: "modulate({ saturation }) - 0 (gris) a 200 %.",
  },
  {
    label: "Teinte",
    detail: "modulate({ hue }) - +/- 180 degres.",
  },
  {
    label: "Flou / Nettete",
    detail: "blur({ sigma }) / sharpen({ sigma }).",
  },
  {
    label: "Niveaux de gris",
    detail: "greyscale() - conversion monochrome.",
  },
];

const WATERMARK: readonly {
  readonly label: string;
  readonly detail: string;
}[] = [
  {
    label: "Type",
    detail: "Texte (police systeme). Logo (a venir).",
  },
  {
    label: "Position",
    detail: "9 ancrages (haut-gauche a bas-droite).",
  },
  {
    label: "Opacite",
    detail: "0-100 % (fill-opacity SVG).",
  },
  {
    label: "Taille relative",
    detail: "Pourcentage de la largeur de l'image.",
  },
];

export default function PixelRetouchPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Palette className="size-3.5" aria-hidden />
          Outil 08 - Retoucher
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Retouche et filigrane
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Reglez la luminosite, le contraste, la saturation, la teinte, la
          nettete, le flou, ou passez en niveaux de gris. Ajoutez un filigrane
          en surimpression.
        </p>
      </header>

      <section aria-labelledby="import-title" className="space-y-4">
        <h3
          id="import-title"
          className="text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Importer des images
        </h3>
        <ImageUploader />
        <ImageQueue />
      </section>

      <ImageEditorPanel />

      <section aria-labelledby="adjustments-title">
        <h3
          id="adjustments-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Reglages colorimetriques
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