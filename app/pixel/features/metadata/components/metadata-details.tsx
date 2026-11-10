/*
path:            app/pixel/features/metadata/components/metadata-details.tsx
tag:             ["pixel", "feature", "metadata", "component", "details"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Tableau des proprietes techniques d'une analyse :
                 format, dimensions, poids, alpha, ICC, entropie,
                 ecart-type, EXIF (make/model/date/software/GPS).
                 Purement presentationnel.

flow:            Props { analysis } -> rend 2 colonnes (proprietes
                 techniques / metadonnees EXIF). Chaque ligne : label
                 + valeur (monospace).

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
                  "@/app/pixel/features/metadata/types/metadata.types.ts"]
imports:         ["@/app/pixel/features/metadata/types/metadata.types"]
exports:         ["MetadataDetails", "MetadataDetailsProps"]
useBy:           ["@/app/pixel/features/metadata/components/metadata-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le detail des proprietes et EXIF d'une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { MetadataAnalysis } from "@/app/pixel/features/metadata/types/metadata.types";

export interface MetadataDetailsProps {
  readonly analysis: MetadataAnalysis;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Row({
  label,
  value,
  warn,
}: {
  readonly label: string;
  readonly value: string;
  readonly warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--pf-border)]/40 py-1.5 last:border-b-0">
      <span className="text-xs text-[var(--pf-muted)]">{label}</span>
      <span
        className={`truncate font-mono text-xs ${
          warn
            ? "text-[var(--pf-warning)]"
            : "text-[var(--pf-foreground)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function readExifString(
  exif: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!exif) return null;
  const v = exif[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function readExifNumber(
  exif: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!exif) return null;
  const v = exif[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function readGps(
  exif: Record<string, unknown> | null,
): { latitude: number; longitude: number } | null {
  if (!exif) return null;
  const gps = exif["gps"];
  if (
    gps !== null &&
    typeof gps === "object" &&
    "latitude" in gps &&
    "longitude" in gps
  ) {
    const g = gps as { latitude: unknown; longitude: unknown };
    if (typeof g.latitude === "number" && typeof g.longitude === "number") {
      return { latitude: g.latitude, longitude: g.longitude };
    }
  }
  return null;
}

export function MetadataDetails({ analysis }: MetadataDetailsProps) {
  const make = readExifString(analysis.exif, "make");
  const model = readExifString(analysis.exif, "model");
  const dateTime = readExifString(analysis.exif, "dateTime");
  const software = readExifString(analysis.exif, "software");
  const orientation = readExifNumber(analysis.exif, "orientation");
  const gps = readGps(analysis.exif);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* Proprietes techniques */}
      <section
        aria-label="Proprietes techniques"
        className="rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Proprietes
        </h5>
        <Row label="Nom" value={analysis.sourceFilename} />
        <Row label="Format" value={analysis.format.toUpperCase()} />
        <Row label="Poids" value={formatSize(analysis.sizeBytes)} />
        <Row
          label="Dimensions"
          value={`${analysis.dimensions.width} × ${analysis.dimensions.height}`}
        />
        <Row label="Alpha" value={analysis.hasAlpha ? "Oui" : "Non"} />
        <Row label="Profil ICC" value={analysis.hasIcc ? "Oui" : "Non"} />
        <Row
          label="Entropie"
          value={analysis.entropy.toFixed(3)}
        />
        <Row
          label="Ecart-type"
          value={analysis.stdev.map((v) => v.toFixed(1)).join(" / ")}
        />
      </section>

      {/* Metadonnees EXIF */}
      <section
        aria-label="Metadonnees EXIF"
        className="rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3"
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
          Metadonnees EXIF
        </h5>
        <Row label="Appareil" value={model ?? "Indisponible"} />
        <Row label="Fabricant" value={make ?? "Indisponible"} />
        <Row label="Date" value={dateTime ?? "Indisponible"} />
        <Row label="Logiciel" value={software ?? "Indisponible"} />
        <Row
          label="Orientation"
          value={orientation !== null ? String(orientation) : "Indisponible"}
        />
        <Row
          label="GPS"
          value={gps ? "Present (voir image source)" : "Absent"}
          warn={gps !== null}
        />
        {gps !== null && (
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--pf-warning)]">
            ⚠️ Cette image contient des coordonnees GPS. Utilisez
            &laquo; Supprimer les metadonnees &raquo; pour proteger votre vie
            privee.
          </p>
        )}
      </section>
    </div>
  );
}