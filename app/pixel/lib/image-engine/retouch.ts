/*
path:            app/pixel/lib/image-engine/retouch.ts
tag:             ["pixel", "image-engine", "retouch", "watermark"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Algorithmes purs pour la retouche globale et le
                 filigrane. Ne depend PAS de sharp (l'adaptateur fait
                 le pont). Deux fonctions :
                 - buildRetouchPipeline(options) : traduit les options
                   abstraites (brightness, contrast, saturation, hue,
                   blur, sharpen, grayscale) en une liste d'operations
                   sharp a appliquer dans l'ordre.
                 - buildWatermarkSvg(options) : genere un SVG inline
                   (texte) ou retourne null si logo. L'adaptateur
                   compose le SVG sur l'image via sharp.composite().

                 L'ordre des operations est important :
                 1. modulate(brightness, saturation, hue)
                 2. linear(contrast)
                 3. blur / sharpen
                 4. grayscale
                 (le watermark est applique APRES ces operations).

flow:            Module TypeScript pur -> helpers purs.

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/retouch.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.adapter.ts",
                  "@/app/pixel/types/image.ts"]
imports:         ["@/app/pixel/types/image"]
exports:         ["RetouchAdjustments", "WatermarkConfig",
                  "WATERMARK_POSITIONS", "WatermarkPosition",
                  "buildRetouchOperations", "buildWatermarkSvg"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux traduire les options de retouche en operations sharp"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RetouchAdjustments {
  /** -100 a +100 (0 = neutre). Mappe sur modulate().brightness. */
  readonly brightness: number;
  /** -100 a +100 (0 = neutre). Mappe sur linear(). */
  readonly contrast: number;
  /** -100 a +100 (0 = neutre). Mappe sur modulate().saturation. */
  readonly saturation: number;
  /** -180 a +180 (0 = neutre). Mappe sur modulate().hue (en degres). */
  readonly hue: number;
  /** 0 a 100 (0 = pas de flou). Mappe sur blur().sigma = value / 20. */
  readonly blur: number;
  /** 0 a 100 (0 = pas de nettete). Mappe sur sharpen().sigma = value / 20. */
  readonly sharpen: number;
  /** true = image en noir et blanc. */
  readonly grayscale: boolean;
}

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const WATERMARK_POSITIONS: readonly WatermarkPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export interface WatermarkConfig {
  /** Type de watermark : texte ou logo (data URL). */
  readonly kind: "text" | "logo";
  /** Texte si kind === "text". */
  readonly text: string;
  /** Taille relative (0-100 % de la largeur). */
  readonly sizePercent: number;
  /** Position dans l'image. */
  readonly position: WatermarkPosition;
  /** Opacite 0-100. */
  readonly opacity: number;
  /** Couleur du texte (hex). */
  readonly color: string;
}

// ---------------------------------------------------------------------------
// Operations de retouche (a appliquer dans l'ordre)
// ---------------------------------------------------------------------------

export type RetouchOperation =
  | { readonly kind: "modulate"; readonly brightness: number; readonly saturation: number; readonly hue: number }
  | { readonly kind: "linear"; readonly a: number; readonly b: number }
  | { readonly kind: "blur"; readonly sigma: number }
  | { readonly kind: "sharpen"; readonly sigma: number }
  | { readonly kind: "grayscale" };

export function buildRetouchOperations(
  adjustments: RetouchAdjustments,
): readonly RetouchOperation[] {
  const ops: RetouchOperation[] = [];

  // 1. modulate (brightness, saturation, hue)
  if (
    adjustments.brightness !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.hue !== 0
  ) {
    ops.push({
      kind: "modulate",
      brightness: 1 + adjustments.brightness / 100,
      saturation: 1 + adjustments.saturation / 100,
      hue: adjustments.hue,
    });
  }

  // 2. linear (contrast)
  if (adjustments.contrast !== 0) {
    const a = 1 + adjustments.contrast / 100;
    const b = -(128 * a) + 128;
    ops.push({ kind: "linear", a, b });
  }

  // 3. blur
  if (adjustments.blur > 0) {
    ops.push({ kind: "blur", sigma: adjustments.blur / 20 });
  }

  // 4. sharpen
  if (adjustments.sharpen > 0) {
    ops.push({ kind: "sharpen", sigma: adjustments.sharpen / 20 });
  }

  // 5. grayscale
  if (adjustments.grayscale) {
    ops.push({ kind: "grayscale" });
  }

  return ops;
}

// ---------------------------------------------------------------------------
// Watermark SVG (texte uniquement — le logo est compose par l'adaptateur)
// ---------------------------------------------------------------------------

/**
 * Genere un SVG inline pour un watermark texte. L'adaptateur le
 * composite sur l'image. Si kind === "logo", retourne null (le logo
 * sera fourni par un Buffer dans options.logoBuffer — a brancher dans
 * une iteration ulterieure).
 */
export function buildWatermarkSvg(
  config: WatermarkConfig,
  imageWidth: number,
  imageHeight: number,
): string | null {
  if (config.kind !== "text" || config.text.trim().length === 0) {
    return null;
  }

  const fontSize = Math.max(
    12,
    Math.round((imageWidth * config.sizePercent) / 100 / Math.max(1, config.text.length / 8)),
  );
  const padding = Math.round(fontSize * 0.5);
  const opacity = Math.max(0, Math.min(1, config.opacity / 100));

  // Position (x, y) dans le SVG.
  const positions: Record<WatermarkPosition, { x: string; y: string; anchor: string }> = {
    "top-left": { x: String(padding), y: String(padding + fontSize), anchor: "start" },
    "top-center": { x: "50%", y: String(padding + fontSize), anchor: "middle" },
    "top-right": { x: `calc(100% - ${padding}px)`, y: String(padding + fontSize), anchor: "end" },
    "middle-left": { x: String(padding), y: "50%", anchor: "start" },
    "middle-center": { x: "50%", y: "50%", anchor: "middle" },
    "middle-right": { x: `calc(100% - ${padding}px)`, y: "50%", anchor: "end" },
    "bottom-left": { x: String(padding), y: `calc(100% - ${padding}px)`, anchor: "start" },
    "bottom-center": { x: "50%", y: `calc(100% - ${padding}px)`, anchor: "middle" },
    "bottom-right": { x: `calc(100% - ${padding}px)`, y: `calc(100% - ${padding}px)`, anchor: "end" },
  };

  const pos = positions[config.position];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
  <text
    x="${pos.x}"
    y="${pos.y}"
    text-anchor="${pos.anchor}"
    dominant-baseline="middle"
    font-family="sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="${config.color}"
    fill-opacity="${opacity}"
    stroke="rgba(0,0,0,0.3)"
    stroke-width="1"
  >${escapeXml(config.text)}</text>
</svg>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}