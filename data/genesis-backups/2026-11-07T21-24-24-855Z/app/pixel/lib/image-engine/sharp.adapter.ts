/*
path:            app/pixel/lib/image-engine/sharp.adapter.ts
tag:             ["pixel", "image-engine", "sharp", "adapter"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Seul fichier du moteur (avec sharp.factory.ts) autorise a
                 parler a Sharp. Traduit les operations abstraites
                 (convert, resize, crop, rotate, flip, grayscale,
                 removeBackground, retouch, analyze) en appels Sharp
                 concrets. Ne leve jamais : toute erreur Sharp est
                 convertie en ProcessingError structure (Phase 1).
                 Importable UNIQUEMENT cote serveur.

                 Phase 13 : ajout de removeBackgroundSharp (chroma-key
                 sur fond uni via sharp.raw() + removeUniformBackground).
                 Phase 14 : ajout de retouchSharp (modulate, linear, blur,
                 sharpen, grayscale + watermark SVG composite).

flow:            Chaque operation :
                 1. const s = createSharp(buffer) ;
                 2. enchaine les transformations Sharp ;
                 3. await s.toBuffer() -> Buffer ;
                 4. await s.metadata() -> dimensions du resultat ;
                 5. retourne { ok: true, data: EngineOutput } ou
                    { ok: false, error: ProcessingError }.

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/format-mime.ts",
                   "@/app/pixel/lib/image-engine/format-capabilities.ts",
                   "@/app/pixel/lib/image-engine/format-registry.ts",
                   "@/app/pixel/lib/image-engine/sharp.options.ts",
                   "@/app/pixel/lib/image-engine/sharp.factory.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/lib/image-engine/image-engine.ts",
                   "@/app/pixel/lib/image-engine/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.factory.ts",
                  "@/app/pixel/lib/image-engine/format-capabilities.ts",
                  "@/app/pixel/lib/image-engine/format-mime.ts",
                  "@/app/pixel/lib/image-engine/chroma-key.ts",
                  "@/app/pixel/lib/image-engine/retouch.ts",
                  "@/app/pixel/lib/image-engine/image-engine.types.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only", "sharp",
                  "@/app/pixel/lib/image-engine/format-capabilities",
                  "@/app/pixel/lib/image-engine/format-mime",
                  "@/app/pixel/lib/image-engine/sharp.factory",
                  "@/app/pixel/lib/image-engine/chroma-key",
                  "@/app/pixel/lib/image-engine/retouch",
                  "@/app/pixel/lib/image-engine/image-engine.types",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["convertSharp", "resizeSharp", "cropSharp",
                  "rotateSharp", "flipSharp", "grayscaleSharp",
                  "removeBackgroundSharp", "retouchSharp", "analyzeSharp",
                  "ResizeSharpOptions", "CropSharpOptions",
                  "RotateSharpOptions", "FlipSharpOptions",
                  "GrayscaleSharpOptions", "RemoveBackgroundSharpOptions",
                  "RetouchSharpOptions"]
useBy:           ["@/app/pixel/lib/image-engine/image-engine.ts"]

userStories:     ["*en tant que developpeur je veux un adaptateur Sharp qui n'expose que des contrats abstraits"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import type { Sharp, Metadata } from "sharp";

import { FORMAT_CAPABILITIES } from "@/app/pixel/lib/image-engine/format-capabilities";
import { FORMAT_TO_EXTENSION } from "@/app/pixel/lib/image-engine/format-mime";
import { createSharp } from "@/app/pixel/lib/image-engine/sharp.factory";
import { removeUniformBackground } from "@/app/pixel/lib/image-engine/chroma-key";
import {
  buildRetouchOperations,
  buildWatermarkSvg,
  type RetouchAdjustments,
  type WatermarkConfig,
} from "@/app/pixel/lib/image-engine/retouch";
import type {
  EngineMetadata,
  EngineOutput,
} from "@/app/pixel/lib/image-engine/image-engine.types";
import type {
  ConversionMode,
  ConversionOptions,
} from "@/app/pixel/types/conversion";
import type { ImageFormat, ImageDimensions } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Types internes
// ---------------------------------------------------------------------------

type Ok<T> = { readonly ok: true; readonly data: T };
type Err = { readonly ok: false; readonly error: ProcessingError };
type Result<T> = Ok<T> | Err;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): ProcessingError {
  return details === undefined ? { code, message } : { code, message, details };
}

function fail(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): Err {
  return { ok: false, error: errorOf(code, message, details) };
}

function dimensionsOf(metadata: Metadata): ImageDimensions {
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

function engineMetadataOf(
  metadata: Metadata,
  sizeBytes: number,
): EngineMetadata {
  const format = (metadata.format ?? "png") as ImageFormat;
  return {
    format,
    dimensions: dimensionsOf(metadata),
    sizeBytes,
    hasAlpha: metadata.hasAlpha === true,
    entropy: 0,
    stdev: [0, 0, 0],
    exif: null,
    hasIcc: metadata.icc !== undefined,
  };
}

// ---------------------------------------------------------------------------
// Application des options de sortie
// ---------------------------------------------------------------------------

function applyOutputOptions(
  s: Sharp,
  format: ImageFormat,
  quality: number,
  mode: ConversionMode | null,
  keepExif: boolean,
  keepIcc: boolean,
): Result<Sharp> {
  const caps = FORMAT_CAPABILITIES[format];
  if (!caps.output) {
    return fail(
      "UNSUPPORTED_FORMAT",
      `Format de sortie non supporte : ${format}.`,
      { format },
    );
  }

  if (mode !== null && !caps.modes.includes(mode)) {
    return fail(
      "INVALID_INPUT",
      `Mode ${mode} non supporte par ${format}.`,
      { format, mode, supportedModes: caps.modes },
    );
  }

  if (quality > 0 && !caps.quality) {
    return fail(
      "INVALID_INPUT",
      `Le format ${format} ne supporte pas le reglage de qualite.`,
      { format },
    );
  }

  switch (format) {
    case "jpeg":
      s.jpeg({
        quality: quality > 0 ? quality : 80,
        progressive: true,
        mozjpeg: true,
      });
      break;
    case "png":
      s.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
      break;
    case "webp":
      s.webp({
        quality: quality > 0 ? quality : 80,
        lossless: mode === "lossless",
        nearLossless: mode === "near-lossless",
      });
      break;
    case "avif":
      s.avif({
        quality: quality > 0 ? quality : 60,
        lossless: mode === "lossless",
      });
      break;
    case "tiff":
      s.tiff({ compression: "lzw" });
      break;
    case "gif":
    case "svg":
      return fail(
        "UNSUPPORTED_FORMAT",
        `Format de sortie non supporte : ${format}.`,
        { format },
      );
  }

  if (keepExif || keepIcc) {
    s.withMetadata();
  } else {
    s.withMetadata({ exif: {} });
  }

  return { ok: true, data: s };
}

// ---------------------------------------------------------------------------
// CONVERT
// ---------------------------------------------------------------------------

export async function convertSharp(
  buffer: Buffer,
  options: ConversionOptions,
): Promise<Result<EngineOutput>> {
  try {
    let s = createSharp(buffer);

    if (options.resize !== null) {
      s = s.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit,
        withoutEnlargement: true,
      });
    }

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      options.mode,
      options.keepExif,
      options.keepIcc,
    );
    if (!applied.ok) return applied;
    s = applied.data;

    const out = await s.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Conversion Sharp echouee : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// RESIZE
// ---------------------------------------------------------------------------

export interface ResizeSharpOptions {
  readonly width: number;
  readonly height: number;
  readonly fit: "cover" | "contain" | "inside";
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function resizeSharp(
  buffer: Buffer,
  options: ResizeSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const s = createSharp(buffer).resize({
      width: options.width,
      height: options.height,
      fit: options.fit,
      withoutEnlargement: true,
    });

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      false,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Resize Sharp echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// CROP
// ---------------------------------------------------------------------------

export interface CropSharpOptions {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function cropSharp(
  buffer: Buffer,
  options: CropSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const s = createSharp(buffer).extract({
      left: Math.max(0, Math.round(options.left)),
      top: Math.max(0, Math.round(options.top)),
      width: Math.max(1, Math.round(options.width)),
      height: Math.max(1, Math.round(options.height)),
    });

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      false,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Crop Sharp echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// ROTATE
// ---------------------------------------------------------------------------

export interface RotateSharpOptions {
  readonly degrees: 90 | 180 | 270;
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function rotateSharp(
  buffer: Buffer,
  options: RotateSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const s = createSharp(buffer).rotate(options.degrees);

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      true,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Rotation Sharp echouee : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// FLIP / FLOP
// ---------------------------------------------------------------------------

export interface FlipSharpOptions {
  readonly horizontal: boolean;
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function flipSharp(
  buffer: Buffer,
  options: FlipSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const base = createSharp(buffer);
    const s = options.horizontal ? base.flop() : base.flip();

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      true,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Flip Sharp echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// GRAYSCALE
// ---------------------------------------------------------------------------

export interface GrayscaleSharpOptions {
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function grayscaleSharp(
  buffer: Buffer,
  options: GrayscaleSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const s = createSharp(buffer).grayscale();

    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      false,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const meta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(meta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Grayscale Sharp echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// REMOVE BACKGROUND (chroma-key sur fond uni)
// ---------------------------------------------------------------------------

export interface RemoveBackgroundSharpOptions {
  readonly target: {
    readonly r: number;
    readonly g: number;
    readonly b: number;
  };
  readonly tolerance: number;
  readonly feathering: boolean;
}

export async function removeBackgroundSharp(
  buffer: Buffer,
  options: RemoveBackgroundSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const base = createSharp(buffer);
    const meta = await base.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    if (width === 0 || height === 0) {
      return fail("INVALID_INPUT", "Dimensions de l'image inconnues.");
    }

    const rawResult = await base
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgba = rawResult.data;

    const modified = removeUniformBackground(
      rgba,
      width,
      height,
      options.target,
      options.tolerance,
    );

    let s = createSharp(modified, {
      raw: { width, height, channels: 4 },
    }).png({ compressionLevel: 9 });

    if (options.feathering) {
      const alpha = await s.extractChannel(3).blur(1).toBuffer();
      const rgb = await createSharp(modified, {
        raw: { width, height, channels: 4 },
      })
        .removeAlpha()
        .png()
        .toBuffer();
      s = createSharp(rgb).composite([{ input: alpha, blend: "dest-in" }]);
    }

    const out = await s.toBuffer();
    const outMeta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(outMeta, out.length),
          format: "png",
        },
        format: "png",
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Retrait du fond echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// RETOUCH (retouche globale + watermark)
// ---------------------------------------------------------------------------

export interface RetouchSharpOptions {
  readonly adjustments: RetouchAdjustments;
  readonly watermark: WatermarkConfig | null;
  readonly format: ImageFormat;
  readonly quality: number;
}

export async function retouchSharp(
  buffer: Buffer,
  options: RetouchSharpOptions,
): Promise<Result<EngineOutput>> {
  try {
    const base = createSharp(buffer);
    const meta = await base.metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    // 1. Operations de retouche (modulate, linear, blur, sharpen, grayscale).
    let s: Sharp = base;
    const ops = buildRetouchOperations(options.adjustments);

    for (const op of ops) {
      switch (op.kind) {
        case "modulate":
          s = s.modulate({
            brightness: op.brightness,
            saturation: op.saturation,
            hue: op.hue,
          });
          break;
        case "linear":
          s = s.linear(op.a, op.b);
          break;
        case "blur":
          s = s.blur(op.sigma);
          break;
        case "sharpen":
          s = s.sharpen({ sigma: op.sigma });
          break;
        case "grayscale":
          s = s.grayscale();
          break;
      }
    }

    // 2. Watermark (composite SVG).
    if (options.watermark) {
      const svg = buildWatermarkSvg(options.watermark, width, height);
      if (svg !== null) {
        s = s.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
      }
    }

    // 3. Options de sortie.
    const applied = applyOutputOptions(
      s,
      options.format,
      options.quality,
      null,
      false,
      true,
    );
    if (!applied.ok) return applied;

    const out = await applied.data.toBuffer();
    const outMeta = await createSharp(out).metadata();

    return {
      ok: true,
      data: {
        buffer: out,
        metadata: {
          ...engineMetadataOf(outMeta, out.length),
          format: options.format,
        },
        format: options.format,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Retouche Sharp echouee : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// ANALYZE
// ---------------------------------------------------------------------------

export async function analyzeSharp(
  buffer: Buffer,
): Promise<Result<EngineMetadata>> {
  try {
    const s = createSharp(buffer);
    const meta = await s.metadata();
    const stats = await s.stats();

    return {
      ok: true,
      data: {
        format: (meta.format ?? "png") as ImageFormat,
        dimensions: dimensionsOf(meta),
        sizeBytes: buffer.length,
        hasAlpha: meta.hasAlpha === true,
        entropy: stats.entropy,
        stdev: [
          stats.channels[0]?.stdev ?? 0,
          stats.channels[1]?.stdev ?? 0,
          stats.channels[2]?.stdev ?? 0,
        ],
        exif: meta.exif ? { raw: meta.exif.toString("base64") } : null,
        hasIcc: meta.icc !== undefined,
      },
    };
  } catch (err) {
    return fail(
      "PROCESSING_ERROR",
      `Analyse Sharp echouee : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }
}