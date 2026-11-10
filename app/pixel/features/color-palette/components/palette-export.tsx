/*
path:            app/pixel/features/color-palette/components/palette-export.tsx
tag:             ["pixel", "feature", "color-palette", "component", "export"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Export de la palette dans 3 formats (CSS variables,
                 Tailwind config, JSON). Un onglet par format, un
                 textarea avec le code genere, un bouton Copier.
                 Le code est genere via des helpers purs
                 (toCssVariables, toTailwindConfig, toJson) testes par
                 TypeScript.

flow:            Props { result } -> useState(format) ->
                 code = format === "css" ? toCssVariables(result) :
                 format === "tailwind" ? toTailwindConfig(result) :
                 toJson(result) -> onglets + code + bouton Copier.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/color-palette/components/palette-panel.tsx",
                  "@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["react", "lucide-react",
                  "@/app/pixel/features/color-palette/types/palette.types"]
exports:         ["PaletteExport", "PaletteExportProps"]
useBy:           ["@/app/pixel/features/color-palette/components/palette-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux exporter ma palette en CSS, Tailwind ou JSON"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useState + clipboard.

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import type {
  PaletteExportFormat,
  PaletteResult,
} from "@/app/pixel/features/color-palette/types/palette.types";

export interface PaletteExportProps {
  readonly result: PaletteResult;
}

// ---------------------------------------------------------------------------
// Generateurs de code (helpers purs)
// ---------------------------------------------------------------------------

function slugifyName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const slug = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "palette";
}

function toCssVariables(result: PaletteResult): string {
  const slug = slugifyName(result.sourceFilename);
  const lines = result.colors.map(
    (c, i) => `  --${slug}-${i + 1}: ${c.hex}; /* ${(c.ratio * 100).toFixed(1)}% */`,
  );
  return `:root {\n${lines.join("\n")}\n}`;
}

function toTailwindConfig(result: PaletteResult): string {
  const slug = slugifyName(result.sourceFilename);
  const lines = result.colors.map(
    (c, i) => `        ${i + 1}: "${c.hex}",`,
  );
  return `// tailwind.config.ts\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        ${slug}: {\n${lines.join("\n")}\n        },\n      },\n    },\n  },\n};`;
}

function toJson(result: PaletteResult): string {
  const payload = {
    source: result.sourceFilename,
    totalPixels: result.totalPixels,
    colors: result.colors.map((c) => ({
      hex: c.hex,
      rgb: c.rgb,
      ratio: Number(c.ratio.toFixed(4)),
    })),
  };
  return JSON.stringify(payload, null, 2);
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

const FORMATS: readonly {
  readonly value: PaletteExportFormat;
  readonly label: string;
}[] = [
  { value: "css", label: "CSS" },
  { value: "tailwind", label: "Tailwind" },
  { value: "json", label: "JSON" },
];

export function PaletteExport({ result }: PaletteExportProps) {
  const [format, setFormat] = useState<PaletteExportFormat>("css");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    switch (format) {
      case "css":
        return toCssVariables(result);
      case "tailwind":
        return toTailwindConfig(result);
      case "json":
        return toJson(result);
    }
  }, [format, result]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  }

  return (
    <div className="space-y-2">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5" role="tablist" aria-label="Format d'export">
          {FORMATS.map((f) => {
            const active = format === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFormat(f.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--pf-primary)]/15 text-[var(--pf-primary)]"
                    : "bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)] hover:bg-[var(--pf-surface-hover)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--pf-primary)]/15 px-2 py-1 text-xs font-medium text-[var(--pf-primary)] hover:bg-[var(--pf-primary)]/25"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {copied ? "Copie" : "Copier"}
        </button>
      </header>

      <pre className="max-h-64 overflow-auto rounded-lg border border-[var(--pf-border)]/60 bg-[var(--pf-background)]/60 p-3 font-mono text-[11px] leading-relaxed text-[var(--pf-foreground)]">
        {code}
      </pre>
    </div>
  );
}