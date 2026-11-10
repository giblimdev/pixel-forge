/*
path:            app/pixel/analyze/metadata/page.tsx
tag:             ["pixel", "pixel-forge", "analyze", "metadata", "page", "outil-12"]
projectId:       <Pixel-fotgen>
type:            page
generic:         false

role:            Page dediee aux metadonnees EXIF (outil 12). Affiche
                 le header + MetadataPanel + sections "Champs EXIF" +
                 "Suppression".

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
                  "@/app/pixel/analyze/page.tsx"]
imports:         ["next", "next/link", "lucide-react",
                  "@/app/pixel/features/metadata/index"]
exports:         ["default PixelMetadataPage", "metadata"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir et supprimer les metadonnees EXIF"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode, ShieldOff, Sparkles } from "lucide-react";

import { MetadataPanel } from "@/app/pixel/features/metadata";

export const metadata: Metadata = {
  title: "Metadonnees",
  description:
    "Consulter et supprimer les metadonnees EXIF (GPS, appareil, date) d'une image.",
};

const FIELDS: readonly { readonly label: string; readonly detail: string }[] = [
  { label: "Appareil", detail: "Modele de l'appareil photo ou du smartphone." },
  { label: "Fabricant", detail: "Marque de l'appareil." },
  { label: "Date", detail: "Date et heure de prise de vue." },
  { label: "Logiciel", detail: "Logiciel de retouche ou de capture." },
  { label: "Orientation", detail: "Rotation appliquee a la capture." },
  { label: "GPS", detail: "Coordonnees geographiques (donnee sensible)." },
];

export default function PixelMetadataPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--pf-warning)]">
          <FileCode className="size-3.5" aria-hidden />
          Outil 12 · Metadonnees
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--pf-foreground)]">
          Metadonnees EXIF
        </h2>
        <p className="max-w-2xl text-sm text-[var(--pf-muted)]">
          Consultez les metadonnees EXIF d&apos;une image (appareil, date,
          orientation, GPS) et supprimez-les pour proteger votre vie privee.
        </p>
      </header>

      <MetadataPanel />

      <section aria-labelledby="fields-title">
        <h3
          id="fields-title"
          className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--pf-foreground)]"
        >
          <Sparkles className="size-5 text-[var(--pf-warning)]" aria-hidden />
          Champs EXIF detectes
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-4 backdrop-blur-xl"
            >
              <h4 className="text-sm font-bold text-[var(--pf-foreground)]">
                {f.label}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted)]">
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--pf-warning)]/30 bg-[var(--pf-warning)]/5 p-5 backdrop-blur-xl">
        <header className="mb-2 flex items-center gap-2">
          <ShieldOff className="size-4 text-[var(--pf-warning)]" aria-hidden />
          <h2 className="text-sm font-bold text-[var(--pf-foreground)]">
            Suppression des metadonnees
          </h2>
        </header>
        <p className="text-xs leading-relaxed text-[var(--pf-muted)]">
          Le bouton &laquo; Supprimer les metadonnees &raquo; reencode
          l&apos;image sans EXIF ni profil ICC. Le format source est conserve
          (JPEG reste JPEG, PNG reste PNG). Une copie nettoyee est ajoutee a
          la file avec le suffixe <code className="font-mono">-clean</code>.
          L&apos;original n&apos;est jamais modifie.
        </p>
      </section>

      <section>
        <Link
          href="/pixel/analyze"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pf-warning)] hover:underline"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          Retour a l&apos;analyse d&apos;image
        </Link>
      </section>
    </div>
  );
}