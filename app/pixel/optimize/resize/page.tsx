/*
path:            app/pixel/optimize/resize/page.tsx
tag:             ["pixel", "pixel-forge", "optimize", "resize", "page", "outil-04", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 04 (Redimensionnement par lot).
                 Affiche header + import/queue + <ResizePanel /> +
                 section aide (cas d'usage + modes de fit).

flow:            Server Component -> header -> import/queue ->
                 <ResizePanel /> -> sections aide.

ecosystem:       Pixel = [
                   "@/app/pixel/optimize/resize/page.tsx",
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/resize/components/resize-panel.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "lucide-react",
                  "@/app/pixel/features/resize/components/resize-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelResizePage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux redimensionner un lot d'images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { Layers, Sparkles } from "lucide-react";

import { ResizePanel } from "@/app/pixel/features/resize/components/resize-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Redimensionner",
  description: "Redimensionner un lot d'images vers des dimensions cibles.",
};

const USE_CASES: readonly { readonly label: string; readonly detail: string }[] = [
  { label: "Responsive images", detail: "Generer 320w, 640w, 1280w, 1920w pour srcset." },
  { label: "Vignettes", detail: "Miniatures carrees 128x128, 256x256 pour les cartes." },
  { label: "Bannieres", detail: "1200x630 (Open Graph) ou 1920x1080 (hero)." },
  { label: "Avatars", detail: "Carre 512x512 avec fit cover." },
];

const FIT_MODES: readonly { readonly label: string; readonly detail: string }[] = [
  { label: "cover", detail: "Remplit la zone en coupant les debords." },
  { label: "contain", detail: "Tient dans la zone sans couper (marges)." },
  { label: "inside", detail: "Comme contain mais sans agrandir." },
];

export default function PixelResizePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Layers className="size-3.5" aria-hidden />
          Outil 04 - Redimensionner
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Redimensionnement par lot
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Redimensionnez N images vers des dimensions cibles, ou generez
          plusieurs variantes (320/640/1280) en une passe.
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

      <ResizePanel />

      <section aria-labelledby="cases-title">
        <h3
          id="cases-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-secondary)]" aria-hidden />
          Cas d&apos;usage
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {USE_CASES.map((uc) => (
            <div
              key={uc.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {uc.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {uc.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="fit-title">
        <h3
          id="fit-title"
          className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          Modes de fit
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {FIT_MODES.map((fit) => (
            <div
              key={fit.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <code className="font-mono text-sm font-bold text-[var(--pf-secondary)]">
                {fit.label}
              </code>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {fit.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}