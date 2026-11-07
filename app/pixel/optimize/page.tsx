/*
path:            app/pixel/optimize/page.tsx
tag:             ["pixel", "pixel-forge", "optimize", "page", "hub", "outil-02", "pixel-forge-charte"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page HUB de la famille "Optimiser" (outil 02). Affiche
                 le header + section import/queue (Phase 5) +
                 <OptimizerPanel /> (Phase 9) + grille vers les 3 autres
                 outils (compress, resize, smart-crop).

flow:            Server Component -> header -> import/queue ->
                 <OptimizerPanel /> -> grille 3 cartes.

ecosystem:       Pixel = [
                   "@/app/pixel/optimize/page.tsx",
                   "@/app/pixel/optimize/compress/page.tsx",
                   "@/app/pixel/optimize/resize/page.tsx",
                   "@/app/pixel/optimize/smart-crop/page.tsx",
                   "@/app/pixel/components/image-upload/image-uploader.tsx",
                   "@/app/pixel/components/image-queue/image-queue.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                  "@/app/pixel/components/image-upload/image-uploader.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]
imports:         ["next", "next/link", "lucide-react",
                  "@/app/pixel/features/optimizer/components/optimizer-panel",
                  "@/app/pixel/components/image-upload/image-uploader",
                  "@/app/pixel/components/image-queue/image-queue"]
exports:         ["default PixelOptimizePage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux optimiser mes images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Scissors,
  Settings,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { OptimizerPanel } from "@/app/pixel/features/optimizer/components/optimizer-panel";
import { ImageUploader } from "@/app/pixel/components/image-upload/image-uploader";
import { ImageQueue } from "@/app/pixel/components/image-queue/image-queue";

export const metadata: Metadata = {
  title: "Optimiser",
  description: "Reduire le poids et adapter les dimensions de vos images.",
};

interface ToolCard {
  readonly href: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

const OTHER_TOOLS: readonly ToolCard[] = [
  {
    href: "/pixel/optimize/compress",
    number: "03",
    title: "Compresseur JPEG / PNG",
    description: "Compression sans changement de format.",
    icon: Shield,
  },
  {
    href: "/pixel/optimize/resize",
    number: "04",
    title: "Redimensionnement par lot",
    description: "Dimensions fixes, variantes responsive.",
    icon: Layers,
  },
  {
    href: "/pixel/optimize/smart-crop",
    number: "05",
    title: "Recadrage intelligent",
    description: "Detection du sujet (attention/entropy).",
    icon: Scissors,
  },
];

export default function PixelOptimizePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
          <Wrench className="size-3.5" aria-hidden />
          Famille 02 - Optimiser
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Optimiseur intelligent
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Reduisez le poids par compression adaptative, redimensionnement et
          strip metadata. Poids cible ou qualite fixe.
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

      <OptimizerPanel />

      <section>
        <h3 className="mb-4 text-lg font-bold tracking-tight text-[var(--pf-foreground)]">
          Autres outils d&apos;optimisation
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {OTHER_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--pf-secondary)]/60"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--pf-secondary)] to-transparent opacity-70"
                />
                <header className="mb-3 flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--pf-secondary)] to-[var(--pf-primary)] text-white shadow-md">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--pf-secondary)]">
                      Outil {tool.number}
                    </p>
                    <h3 className="text-base font-bold tracking-tight text-[var(--pf-foreground)]">
                      {tool.title}
                    </h3>
                  </div>
                </header>
                <p className="flex-1 text-sm leading-relaxed text-[var(--pf-muted)]">
                  {tool.description}
                </p>
                <footer className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--pf-foreground)]/80 transition-transform group-hover:translate-x-1">
                  Ouvrir
                  <ArrowRight className="size-4" aria-hidden />
                </footer>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}