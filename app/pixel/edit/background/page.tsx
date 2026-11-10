/*
path:            app/pixel/edit/background/page.tsx
tag:             ["pixel", "pixel-forge", "edit", "background", "page", "outil-07", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 07 (Suppression d'arriere-plan).
                 Affiche header + import/queue + <BackgroundPanel /> +
                 section "Parametres".

flow:            Server Component -> header -> import/queue ->
                 <BackgroundPanel /> -> parametres.

ecosystem:       Pixel = [
                   "@/app/pixel/edit/background/page.tsx",
                   "@/app/pixel/edit/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "lucide-react",
                  "@/app/pixel/features/background-removal/components/background-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelBackgroundPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux detourer une image sur fond uni"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import { Scissors, Sparkles } from "lucide-react";

import { BackgroundPanel } from "@/app/pixel/features/background-removal/components/background-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Detourer",
  description: "Supprimer un fond uni d'une image et exporter un PNG transparent.",
};

const PARAMS: readonly { readonly label: string; readonly detail: string }[] = [
  {
    label: "Couleur cible",
    detail: "Pipette ou code hex. Blanc, noir, vert, n'importe quelle couleur unie.",
  },
  {
    label: "Tolerance",
    detail: "0-100 %. Plus haut = plus de pixels consideres comme fond.",
  },
  {
    label: "Lissage des contours",
    detail: "Anti-aliasing (flou gaussien sur le canal alpha) pour des bords propres.",
  },
  {
    label: "Format de sortie",
    detail: "PNG avec canal alpha uniquement (le format source est ignore).",
  },
];

export default function PixelBackgroundPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-info)]">
          <Scissors className="size-3.5" aria-hidden />
          Outil 07 - Detourer
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Suppression d&apos;arriere-plan
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Supprimez un fond uni (blanc, noir, vert, autre) et exportez un PNG
          avec canal alpha. Ideal pour les logos et les mockups.
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

      <BackgroundPanel />

      <section aria-labelledby="params-title">
        <h3
          id="params-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-info)]" aria-hidden />
          Parametres disponibles
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PARAMS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {p.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {p.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}