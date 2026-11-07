/*
path:            app/pixel/features/converter/components/format-selector.tsx
tag:             ["pixel", "feature", "converter", "component", "format"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Selection du format de sortie. Derive les options de
                 OUTPUT_FORMATS (source unique de verite, elle-meme
                 derivee de FORMAT_CAPABILITIES). Affiche un
                 <NativeSelect> alimente par cette liste. Le parent
                 (ConverterPanel) recoit onChange et met a jour les
                 options globales.

flow:            Props { value, onChange, disabled? } -> rend un
                 <NativeSelect> avec un <NativeSelectOption> par
                 format de OUTPUT_FORMATS. Affiche le label lisible
                 (JPEG, PNG, WebP, AVIF, TIFF).

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/format-registry.ts",
                  "@/app/pixel/components/ui/native-select.tsx"]
imports:         ["@/app/pixel/lib/image-engine/format-registry",
                  "@/app/pixel/types/image",
                  "@/components/ui/native-select"]
exports:         ["FormatSelector", "FormatSelectorProps"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir le format de sortie"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : <NativeSelect> avec onChange.

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { OUTPUT_FORMATS } from "@/app/pixel/lib/image-engine/format-registry";
import type { ImageFormat } from "@/app/pixel/types/image";

export interface FormatSelectorProps {
  readonly value: ImageFormat;
  readonly onChange: (next: ImageFormat) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

const LABELS: Readonly<Record<ImageFormat, string>> = {
  jpeg: "JPEG",
  png: "PNG",
  webp: "WebP",
  avif: "AVIF",
  tiff: "TIFF",
  gif: "GIF",
  svg: "SVG",
};

export function FormatSelector({
  value,
  onChange,
  disabled = false,
  className,
}: FormatSelectorProps) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Format de sortie
      </span>
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.target.value as ImageFormat)}
        disabled={disabled}
        aria-label="Format de sortie"
      >
        {OUTPUT_FORMATS.map((format) => (
          <NativeSelectOption key={format} value={format}>
            {LABELS[format]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}