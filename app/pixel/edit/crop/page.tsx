/*
path:            app/pixel/edit/crop/page.tsx
tag:             ["pixel", "pixel-forge", "edit", "crop", "page", "outil-06", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 06 (Editeur de recadrage). Affiche
                 header + import/queue + <CropEditorPanel /> + section
                 "Ratios disponibles".

flow:            Server Component -> header -> import/queue ->
                 <CropEditorPanel /> -> ratios.

ecosystem:       Pixel = [
                   "@/app/pixel/edit/crop/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "lucide-react",
                  "@/app/pixel/features/crop-editor/components/crop-editor-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelCropPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { Scissors, Sparkles } from "lucide-react";

import { CropEditorPanel } from "@/app/pixel/features/crop-editor/components/crop-editor-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Recadrer",
  description: "Recadrer manuellement une image avec rotation et retournement.",
};

const RATIOS: readonly { readonly label: string; readonly value: string }[] = [
  { label: "Carre", value: "1:1" },
  { label: "Paysage", value: "16:9" },
  { label: "Photo", value: "4:3" },
  { label: "Portrait", value: "3:4" },
  { label: "Cinema", value: "21:9" },
];

export default function PixelCropPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Scissors className="size-3.5" aria-hidden />
          Outil 06 - Recadrer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Editeur de recadrage
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Recadrez manuellement une image, faites-la pivoter, retournez-la
          horizontalement, ou verrouillez un ratio predefini.
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

      <CropEditorPanel />

      <section aria-labelledby="ratios-title">
        <h3
          id="ratios-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Ratios disponibles
        </h3>
        <div className="flex flex-wrap gap-2">
          {RATIOS.map((r) => (
            <span
              key={r.value}
              className="inline-flex flex-col items-center gap-0.5 rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 px-3 py-2 backdrop-blur-xl"
            >
              <code className="font-mono text-sm font-bold text-[var(--pf-info)]">
                {r.value}
              </code>
              <span className="text-[10px] text-[var(--pf-muted)]">
                {r.label}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}