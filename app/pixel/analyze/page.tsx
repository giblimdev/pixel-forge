/*
path:            app/pixel/analyze/page.tsx
tag:             ["pixel", "pixel-forge", "analyze", "page", "outil-12"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page de l'outil 12 (Analyse d'images). Affiche le
                 header + MetadataPanel + sections "Proprietes
                 analysees" + "Vie privee".

flow:            Server Component -> header -> <MetadataPanel /> ->
                 sections d'aide.

ecosystem:       Metadata = [
                   "@/app/api/images/metadata/route.ts",
                   "@/app/pixel/analyze/metadata/page.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                   "@/app/pixel/features/metadata/components/metadata-details.tsx",
                   "@/app/pixel/features/metadata/components/metadata-panel.tsx",
                   "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                   "@/app/pixel/features/metadata/index.ts",
                   "@/app/pixel/features/metadata/schemas/metadata.schema.ts",
                   "@/app/pixel/features/metadata/types/metadata.types.ts",
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/metadata/components/metadata-panel.tsx",
                  "@/app/pixel/features/metadata/index.ts",
                  "@/app/pixel/generate/page.tsx"]
imports:         ["next", "next/link", "lucide-react",
                  "@/app/pixel/features/metadata/index"]
exports:         ["default PixelAnalyzePage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux analyser les proprietes d'une image",
                  "*en tant qu'utilisateur je veux supprimer les metadonnees pour proteger ma vie privee"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode, Search, Sparkles } from "lucide-react";

import { MetadataPanel } from "@/app/pixel/features/metadata";

export const metadata: Metadata = {
  title: "Analyser",
  description:
    "Analyser les proprietes et les metadonnees EXIF d'une image, et les supprimer pour proteger votre vie privee.",
};

const PROPS: readonly { readonly label: string; readonly detail: string }[] = [
  { label: "Dimensions", detail: "Largeur × hauteur en pixels." },
  { label: "Format", detail: "JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG." },
  { label: "Poids", detail: "Taille du fichier en octets." },
  { label: "Alpha", detail: "Presence d'un canal de transparence." },
  { label: "Profil ICC", detail: "Espace colorimetrique embarque." },
  { label: "Entropie", detail: "Richesse visuelle (0-8, sharp.stats())." },
  { label: "Ecart-type", detail: "Variation par canal (proxy de nettete)." },
  { label: "EXIF", detail: "Appareil, date, orientation, logiciel." },
  { label: "GPS", detail: "Coordonnees geographiques (donnee sensible)." },
];

export default function PixelAnalyzePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-warning)]">
          <Search className="size-3.5" aria-hidden />
          Outil 12 · Analyser
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Analyse des images
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Inspectez les proprietes techniques et les metadonnees EXIF d&apos;une
          image. Supprimez les metadonnees pour proteger votre vie privee
          (GPS, appareil, date).
        </p>
      </header>

      <MetadataPanel />

      <section aria-labelledby="props-title">
        <h3
          id="props-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-warning)]" aria-hidden />
          Proprietes analysees
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PROPS.map((p) => (
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

      <section className="rounded-2xl border border-[var(--pf-warning)]/30 bg-[var(--pf-warning)]/5 p-5 backdrop-blur-xl">
        <header className="mb-2 flex items-center gap-2">
          <FileCode className="size-4 text-[var(--pf-warning)]" aria-hidden />
          <h2 className="text-sm font-bold text-[var(--pf-foreground)]">
            Vie privee
          </h2>
        </header>
        <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
          Les metadonnees EXIF peuvent contenir des informations sensibles :
          coordonnees GPS, numero de serie de l&apos;appareil, date de prise de
          vue. Utilisez le bouton &laquo; Supprimer les metadonnees &raquo;
          pour nettoyer vos images avant de les partager.
        </p>
        <Link
          href="/pixel/analyze/metadata"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pf-warning)] hover:underline"
        >
          Voir la page dediee aux metadonnees
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </section>
    </div>
  );
}