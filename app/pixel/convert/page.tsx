/*
path:            app/pixel/convert/page.tsx
tag:             ["pixel", "pixel-forge", "convert", "page", "outil-01", "pixel-forge-charte"]
projectId:       pixel
type:            page
generic:         false

role:            Page d'entree de l'outil 01 (Convertisseur universel).
                 Affiche header + section import/queue (Phase 5) +
                 ConverterPanel (placeholder en attendant Phase 7) +
                 "Comment ca marche" + "Formats supportes".

                 DEPUIS PHASE 5 : la section import/queue est BRANCHEE
                 avec les composants reels :
                 - <ImageUploader />     : dropzone + picker + paste + preview
                 - <ImageQueue />        : file d'attente globale (store Zustand)

                 Cela permet de tester immediatement dans le navigateur
                 le pipeline d'import (glisser-deposer, Ctrl+V, parcourir)
                 et la file d'attente, SANS attendre Phase 7 (converter
                 vertical complet). Le placeholder <ConverterPanel /> reste
                 affiche en dessous pour rappeler que l'outil n'est pas
                 encore fonctionnel.

                 Les features sont sous app/pixel/features/ (Option A).
                 Les imports referencent donc
                 `@/app/pixel/features/converter/...`.

flow:            Server Component -> header -> section Import
                 (<ImageUploader /> + <ImageQueue />) -> <ConverterPanel />
                 (placeholder) -> section etapes -> section formats.

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
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx",
                  "@/app/pixel/layout.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/converter/components/converter-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]

exports:         ["default PixelConvertPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux convertir une image dans un autre format",
                  "*en tant qu'utilisateur je veux deposer mes images dans une file avant traitement"]

status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

import { ConverterPanel } from "@/app/pixel/features/converter/components/converter-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

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
    title: "Deposez vos images",
    description:
      "Glissez-deposez jusqu'a 20 images (25 Mo max chacune), collez depuis le presse-papier (Ctrl+V), ou utilisez le selecteur de fichiers.",
  },
  {
    title: "Choisissez le format",
    description:
      "WebP, AVIF, PNG, JPEG ou TIFF. Reglez la qualite et le mode de compression.",
  },
  {
    title: "Telechargez",
    description:
      "Apercu avant/apres avec economie en Ko. Telechargement individuel ou ZIP.",
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
          reduit le poids de 25 a 35 % a qualite egale. AVIF fait encore
          mieux sur les photos.
        </p>
      </header>

      {/* ========== Phase 5 : import + file d'attente ========== */}
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

      {/* ========== Phase 7 (a venir) : panneau de conversion ========== */}
      <ConverterPanel />

      {/* ========== Comment ca marche ========== */}
      <section aria-labelledby="how-title">
        <h3
          id="how-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Comment ca marche
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

      {/* ========== Formats supportes ========== */}
      <section aria-labelledby="formats-title">
        <h3
          id="formats-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Formats supportes
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
              Entree
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