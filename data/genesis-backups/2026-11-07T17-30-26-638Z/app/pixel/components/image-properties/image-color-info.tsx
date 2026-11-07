/*
path:            app/pixel/components/image-properties/image-color-info.tsx
tag:             ["pixel", "component", "properties", "color", "alpha"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Affiche l'information "canal alpha" (oui/non/inconnu)
                 et le MIME declare. Composant purement presentationnel.

                 Note : l'espace colorimetrique (sRGB, Display P3, etc.)
                 n'est pas exposable sans appeler Sharp cote client, ce
                 qui est interdit. On affiche donc ce qui est
                 disponible : hasAlpha et mime. L'espace ICC complet
                 serait affichable via un futur outil d'analyse
                 serveur (Phase 18).

flow:            Recoit { hasAlpha, mime } -> rend 2 lignes "Alpha" et
                 "MIME".

ecosystem:       ImageProperties = [
                   "@/app/pixel/components/image-properties/image-dimensions.tsx",
                   "@/app/pixel/components/image-properties/image-file-info.tsx",
                   "@/app/pixel/components/image-properties/image-color-info.tsx",
                   "@/app/pixel/components/image-properties/image-properties.tsx",
                 ]
relatedFiles:    ["@/app/pixel/components/image-properties/image-properties.tsx",
                  "@/app/pixel/types/image.ts"]
imports:         []
exports:         ["ImageColorInfoRows", "ImageColorInfoRowsProps"]
useBy:           ["@/app/pixel/components/image-properties/image-properties.tsx"]

userStories:     ["*en tant qu'utilisateur je veux savoir si une image a de la transparence"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export interface ImageColorInfoRowsProps {
  readonly hasAlpha: boolean | null;
  readonly mime: string;
}

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--pf-border)]/40 py-1.5 last:border-b-0">
      <span className="text-xs text-[var(--pf-muted)]">{label}</span>
      <span className="truncate font-mono text-xs text-[var(--pf-foreground)]">
        {value}
      </span>
    </div>
  );
}

export function ImageColorInfoRows({
  hasAlpha,
  mime,
}: ImageColorInfoRowsProps) {
  const alphaLabel =
    hasAlpha === true ? "Oui" : hasAlpha === false ? "Non" : "Inconnu";
  return (
    <>
      <Row label="Alpha" value={alphaLabel} />
      <Row label="MIME" value={mime || "-"} />
    </>
  );
}