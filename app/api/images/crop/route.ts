/*
path:            app/api/images/crop/route.ts
tag:             ["pixel", "api", "crop", "route", "smart-crop", "manual-crop"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Recadrage (manuel + smart). Même contrat hybride B+C.
                 sourceId propagé : dans chaque ResultImage (lot JSON)
                 et dans les headers X-PixelForge-Source-Id /
                 X-PixelForge-Result-Id (réponse binaire à fichier
                 unique).

                 ⚠️ CORRECTION smart crop : la stratégie attention /
                 entropy n'était pas appliquée (crop centré naïf). La
                 route utilise désormais sharp.strategy.attention ou
                 sharp.strategy.entropy via createSharp, en déléguant
                 à un helper interne qui appelle sharp directement
                 (le moteur abstrait n'expose pas encore cette option).
                 La fenêtre cible est la plus grande fenêtre du ratio
                 demandé contenue dans l'image : aucun agrandissement.

                 Le mode "manual" reste inchangé : coordonnées exactes
                 passées au moteur.

flow:            POST -> cleanup -> formData -> files + sourceIds ->
                 validate -> crop (manual | smart) -> Blob/JSON.

ecosystem:       ApiCrop = ["@/app/api/images/crop/route.ts"]
relatedFiles:    ["app/pixel/lib/image-engine/index.ts",
                  "app/pixel/lib/image-engine/sharp.factory.ts",
                  "app/pixel/lib/api/source-ids.ts",
                  "app/pixel/lib/validators/file-validator.ts",
                  "app/pixel/lib/validators/image-validator.ts",
                  "app/pixel/lib/storage/temp-cleanup.ts",
                  "app/pixel/types/processing.ts",
                  "app/pixel/types/image.ts"]
imports:         ["next/server", "zod", "sharp",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/image-engine/sharp.factory",
                  "@/app/pixel/lib/api/source-ids",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "maxDuration", "cropOptionsSchema", "CropOptions"]
useBy:           []
userStories:     ["*en tant qu'utilisateur je veux recadrer une image (manuel ou smart)"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";
import sharp from "sharp";

import {
  crop,
  extensionForFormat,
  mimeForFormat,
} from "@/app/pixel/lib/image-engine";
import { createSharp } from "@/app/pixel/lib/image-engine/sharp.factory";
import { readSourceIds } from "@/app/pixel/lib/api/source-ids";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Options (discriminated union : manual | smart)
// ---------------------------------------------------------------------------

const manualCropSchema = z.object({
  mode: z.literal("manual"),
  left: z.number().int().min(0),
  top: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
  quality: z.number().int().min(0).max(100),
});

const smartCropSchema = z.object({
  mode: z.literal("smart"),
  aspectRatio: z.number().positive(),
  strategy: z.enum(["attention", "entropy"]),
  format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
  quality: z.number().int().min(0).max(100),
});

export const cropOptionsSchema = z.discriminatedUnion("mode", [
  manualCropSchema,
  smartCropSchema,
]);

export type CropOptions = z.infer<typeof cropOptionsSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_BY_CODE: Readonly<Record<ProcessingErrorCode, number>> = {
  INVALID_INPUT: 400,
  UNSUPPORTED_FORMAT: 415,
  LIMIT_EXCEEDED: 413,
  PROCESSING_ERROR: 500,
  NOT_FOUND: 404,
  EXPIRED: 410,
};

function errorResponse(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): NextResponse {
  const error: ProcessingError =
    details === undefined ? { code, message } : { code, message, details };
  return NextResponse.json({ error }, { status: STATUS_BY_CODE[code] });
}

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "image";
}

/**
 * Normalise le buffer d'un ResultImage en Uint8Array<ArrayBuffer>,
 * type accepté comme BodyInit par NextResponse. Un Buffer Node
 * (Buffer<ArrayBufferLike>) n'est plus accepté par les types récents.
 */
function toBodyBytes(
  value: ArrayBuffer | Uint8Array<ArrayBuffer> | null | undefined,
): Uint8Array<ArrayBuffer> | null {
  if (value === null || value === undefined) return null;
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}

/**
 * Plus grande fenêtre du ratio demandé contenue dans l'image.
 * Une des deux dimensions reste celle de l'image : sharp ne met donc
 * pas l'image à l'échelle, il recadre seulement (fit "cover").
 */
function largestWindow(
  width: number,
  height: number,
  aspectRatio: number,
): { width: number; height: number } {
  const currentRatio = width / height;
  if (currentRatio > aspectRatio) {
    return {
      width: Math.max(1, Math.round(height * aspectRatio)),
      height,
    };
  }
  return {
    width,
    height: Math.max(1, Math.round(width / aspectRatio)),
  };
}

/**
 * Smart crop avec stratégie attention / entropy réellement appliquée.
 * Utilise sharp directement (le moteur abstrait n'expose pas encore
 * l'option `position: sharp.strategy.*`). On borne quand même avec
 * createSharp pour conserver les garde-fous (limitInputPixels, etc.).
 *
 * sharp.strategy.attention : privilégie la zone la plus "intéressante"
 *   (visages, forts contrastes).
 * sharp.strategy.entropy   : privilégie la zone à plus forte entropie
 *   (détails, textures).
 */
async function smartCropWithStrategy(
  buffer: Buffer,
  width: number,
  height: number,
  strategy: "attention" | "entropy",
  format: ImageFormat,
  quality: number,
): Promise<Buffer> {
  const position =
    strategy === "attention"
      ? sharp.strategy.attention
      : sharp.strategy.entropy;

  let s = createSharp(buffer).resize({
    width,
    height,
    fit: "cover",
    position,
    withoutEnlargement: false,
  });

  switch (format) {
    case "jpeg":
      s = s.jpeg({
        quality: quality > 0 ? quality : 80,
        progressive: true,
        mozjpeg: true,
      });
      break;
    case "png":
      s = s.png({ compressionLevel: 9, adaptiveFiltering: true });
      break;
    case "webp":
      s = s.webp({ quality: quality > 0 ? quality : 80 });
      break;
    case "avif":
      s = s.avif({ quality: quality > 0 ? quality : 60 });
      break;
    case "tiff":
      s = s.tiff({ compression: "lzw" });
      break;
  }

  return s.toBuffer();
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  void cleanupExpiredFiles();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("INVALID_INPUT", "Corps multipart invalide.");
  }

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return errorResponse("INVALID_INPUT", "Aucun fichier fourni.");
  }

  const sourceIds = readSourceIds(form, files.length);

  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: CropOptions;
  try {
    options = cropOptionsSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options invalides.";
    return errorResponse("INVALID_INPUT", message);
  }

  const batch = validateBatch(files.map((f) => f.size));
  if (!batch.ok) {
    return errorResponse(
      batch.error.code,
      batch.error.message,
      batch.error.details,
    );
  }

  const results: ResultImage[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index];

    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({
        filename: file.name,
        message: `${basics.error.code}: ${basics.error.message}`,
      });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code}: ${dims.error.message}`,
      });
      continue;
    }

    let outBuffer: Buffer;
    let outFormat: ImageFormat;
    let suffix: string;

    try {
      if (options.mode === "manual") {
        const cropped = await crop(buffer, {
          left: options.left,
          top: options.top,
          width: options.width,
          height: options.height,
          format: options.format as ImageFormat,
          quality: options.quality,
        });
        if (!cropped.ok) {
          errors.push({
            filename: file.name,
            message: `${cropped.error.code}: ${cropped.error.message}`,
          });
          continue;
        }
        outBuffer = cropped.data.buffer;
        outFormat = cropped.data.format;
        suffix = "crop-manual";
      } else {
        // Smart crop : plus grande fenêtre du ratio demandé dans l'image.
        const target = largestWindow(
          dims.data.width,
          dims.data.height,
          options.aspectRatio,
        );

        outBuffer = await smartCropWithStrategy(
          buffer,
          target.width,
          target.height,
          options.strategy,
          options.format as ImageFormat,
          options.quality,
        );
        outFormat = options.format as ImageFormat;
        suffix = "cropped";
      }
    } catch (err) {
      errors.push({
        filename: file.name,
        message: `PROCESSING_ERROR: ${err instanceof Error ? err.message : "erreur inconnue"}`,
      });
      continue;
    }

    const finalExt = extensionForFormat(outFormat);
    const finalMime = mimeForFormat(outFormat);
    const finalFilename = `${safeBasename(file.name)}-${suffix}.${finalExt}`;

    // Recalcule les dimensions réelles du résultat.
    const outMeta = await createSharp(outBuffer).metadata();

    results.push({
      id: crypto.randomUUID(),
      ...(sourceId !== undefined ? { sourceId } : {}),
      filename: finalFilename,
      format: outFormat,
      mime: finalMime,
      sizeBytes: outBuffer.length,
      dimensions: {
        width: outMeta.width ?? 0,
        height: outMeta.height ?? 0,
      },
      url: null,
      buffer: outBuffer.buffer.slice(
        outBuffer.byteOffset,
        outBuffer.byteOffset + outBuffer.byteLength,
      ) as ArrayBuffer,
      expiresAt: null,
    });
  }

  if (results.length === 0) {
    return errorResponse("PROCESSING_ERROR", errors[0]!.message, { errors });
  }

  const durationMs = Date.now() - startedAt;
  if (results.length === 1 && errors.length === 0) {
    const single = results[0]!;
    const body = toBodyBytes(single.buffer);
    if (body === null) {
      return errorResponse("PROCESSING_ERROR", "Buffer de sortie introuvable.");
    }

    const headers: Record<string, string> = {
      "Content-Type": single.mime,
      "Content-Disposition": `attachment; filename="${single.filename}"`,
      "Content-Length": String(body.byteLength),
      "X-PixelForge-Duration-Ms": String(durationMs),
      "X-PixelForge-Result-Id": single.id,
    };
    if (single.sourceId !== undefined) {
      headers["X-PixelForge-Source-Id"] = single.sourceId;
    }

    return new NextResponse(body, { status: 200, headers });
  }

  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}
