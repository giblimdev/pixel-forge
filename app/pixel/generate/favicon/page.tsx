/*
path :           app/pixel/generate/favicon/page.tsx
tag :            ["pixel", "pixel-forge", "generate", "favicon", "page", "outil-09", "pixel-forge-charte"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'outil 09 (Générateur de favicons).
                 Affiche header + FaviconPanel + "Fichiers générés" +
                 "Tailles disponibles".

                 ⚠️ IMPORTS : features sous app/pixel/features/ (Option A).

flow:            Server Component → header → <FaviconPanel /> →
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

relatedFiles:    ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                  "@/app/pixel/features/favicon-generator/index.ts",
                  "@/app/pixel/generate/page.tsx"]

imports:         ["next", "lucide-react",
                  "@/app/pixel/features/favicon-generator/components/favicon-panel"]

exports:         ["default PixelFaviconPage", "metadata"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux générer tous les favicons d'un site"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Image as ImageIcon, Sparkles } from "lucide-react";

import { FaviconPanel } from "@/app/pixel/features/favicon-generator/components/favicon-panel";

export const metadata: Metadata = {
  title: "Favicons",
  description:
    "Générer tous les favicons d'un site (ICO, PNG, Apple, Android, manifest).",
};

const FILES: readonly { readonly name: string; readonly detail: string }[] = [
  { name: "favicon.ico", detail: "ICO multi-résolutions (16/24/32/48/64/128/256)." },
  { name: "apple-touch-icon.png", detail: "180×180 pour iOS." },
  { name: "android-chrome-192x192.png", detail: "Android Chrome (petit)." },
  { name: "android-chrome-512x512.png", detail: "Android Chrome (grand)." },
  { name: "manifest.webmanifest", detail: "Manifest PWA avec les icônes référencées." },
];

export default function PixelFaviconPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-success)]">
          <ImageIcon className="size-3.5" aria-hidden />
          Outil 09 · Favicons
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Générateur de favicons
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          À partir d&apos;une image source, générez tous les favicons
          nécessaires : ICO, PNG Apple/Android, manifest PWA. ZIP
          téléchargeable.
        </p>
      </header>

      <FaviconPanel />

      <section aria-labelledby="files-title">
        <h3
          id="files-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-success)]" aria-hidden />
          Fichiers générés
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {FILES.map((f) => (
            <div
              key={f.name}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <code className="block font-mono text-sm font-bold text-[var(--pf-success)]">
                {f.name}
              </code>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}