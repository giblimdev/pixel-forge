/*
path:            app/pixel/optimize/compress/page.tsx
tag:             ["pixel", "pixel-forge", "optimize", "compress", "page", "outil-03", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 03 (Compresseur JPEG/PNG). Affiche
                 header + import/queue + <CompressorPanel /> +
                 <ExportManager /> + section "Parametres".

flow:            Server Component -> header -> import/queue ->
                 <CompressorPanel /> -> <ExportManager /> -> parametres.

ecosystem:       Pixel = [
                   "@/app/pixel/optimize/compress/page.tsx",
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/compressor/components/compressor-panel.tsx",
                  "@/app/pixel/features/export-manager/components/export-manager.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "lucide-react",
                  "@/app/pixel/features/compressor/components/compressor-panel",
                  "@/app/pixel/features/export-manager/components/export-manager",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelCompressPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux compresser mes images et les telecharger en ZIP"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { Shield, Sparkles } from "lucide-react";

import { CompressorPanel } from "@/app/pixel/features/compressor/components/compressor-panel";
import { ExportManager } from "@/app/pixel/features/export-manager/components/export-manager";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Compresser",
  description: "Compresser une image JPEG ou PNG sans changer de format.",
};

const PARAMS: readonly { readonly label: string; readonly detail: string }[] = [
  {
    label: "Qualite",
    detail: "Niveau 1-100. Plus haut = meilleure qualite, poids plus lourd.",
  },
  {
    label: "Palette PNG",
    detail: "Reduire a 256 couleurs (PNG-8) pour alleger les illustrations.",
  },
  {
    label: "Strip metadata",
    detail: "Supprimer EXIF, ICC, commentaires (gain de quelques Ko).",
  },
  {
    label: "Format conserve",
    detail: "JPEG reste JPEG, PNG reste PNG. Aucune conversion.",
  },
];

export default function PixelCompressPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Shield className="size-3.5" aria-hidden />
          Outil 03 - Compresser
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Compresseur JPEG / PNG
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Reduisez le poids d&apos;un PNG ou JPEG sans changer de format.
          Utile pour les assets qui doivent rester en PNG (transparence) ou
          JPEG (compatibilite navigateur).
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

      <CompressorPanel />

      <ExportManager />

      <section aria-labelledby="params-title">
        <h3
          id="params-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-secondary)]" aria-hidden />
          Parametres disponibles
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