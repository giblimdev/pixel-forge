/*
path:            app/api/images/placeholder/route.ts
tag:             ["pixel", "api", "placeholder", "route", "lqip", "blurhash", "svg", "base64"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de generation de placeholders ultra-legers
                 (outil 10). Recoit une ou plusieurs images + les options
                 (format LQIP/BlurHash/SVG/Base64, largeur LQIP, composantes
                 BlurHash, qualite JPEG), et retourne pour chaque image un
                 code pret a integrer dans une page :
                 - LQIP    : data URL base64 d'une miniature 20x20 (ou custom)
                 - BlurHash: hash textuel via le package blurhash
                 - SVG     : SVG inline avec filtre gaussien
                 - Base64  : image JPEG inline base64 (plus lourde que LQIP)
                 Meme contrat d'erreur que les autres routes :
                 { error: { code, message, details? } }.
                 Reponse JSON : { results: [{ sourceId, code, width, height, description }], errors: [{ filename, message }] }.
                 maxDuration = 60.

                 ⚠️ Type-safety buffer : la variable `buffer` est annotee
                 `Buffer` (= Buffer<ArrayBufferLike>) car elle est
                 reassignee avec le resultat de sanitizeSvg(), type
                 Buffer. Sans annotation, TypeScript infere
                 Buffer<ArrayBuffer> depuis Buffer.from(arrayBuffer) et
                 refuse la reassignation (TS2322).

flow:            POST -> cleanupExpiredFiles -> formData -> files + options
                 -> validateBatch + validateFileBasics + sanitizeSvg +
                 validateImageDimensions -> pour chaque fichier, selon
                 options.format :
                 - lqip    : convert(resize width=lqipWidth) -> jpeg quality -> base64
                 - blurhash: convert(resize 32px cover) -> sharp.raw -> blurhash.encode
                 - svg     : convert(resize lqipWidth) -> jpeg base64 -> SVG wrapper
                 - base64  : convert(resize lqipWidth) -> jpeg quality -> base64
                 -> JSON { results, errors, durationMs }.

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/image-engine/sharp.factory.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/svg-sanitizer.ts",
                  "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts"]
imports:         ["next/server", "zod", "blurhash", "sharp",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/image-engine/sharp.factory",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/validators/svg-sanitizer",
                  "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema",
                  "@/app/pixel/types/processing"]
exports:         ["POST", "maxDuration"]
useBy:           ["@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts"]

userStories:     ["*en tant qu'utilisateur je veux generer un placeholder LQIP ou BlurHash"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";
import { encode as encodeBlurHash } from "blurhash";
import sharp from "sharp";

import { convert } from "@/app/pixel/lib/image-engine";
import { createSharp } from "@/app/pixel/lib/image-engine/sharp.factory";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { sanitizeSvg } from "@/app/pixel/lib/validators/svg-sanitizer";
import { placeholderFormSchema } from "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

export const maxDuration = 60;

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

// ---------------------------------------------------------------------------
// Generateurs de code par format
// ---------------------------------------------------------------------------

interface PlaceholderPayload {
  readonly sourceId: string;
  readonly code: string;
  readonly width: number;
  readonly height: number;
  readonly description: string;
}

interface BlurHashOptions {
  readonly components: number;
}

/**
 * LQIP : miniature JPEG encodee en data URL base64.
 * Largeur configurable (8-64 px). Aspect ratio preserve.
 */
async function generateLqip(
  buffer: Buffer,
  width: number,
  height: number,
  lqipWidth: number,
  quality: number,
): Promise<{
  code: string;
  width: number;
  height: number;
  description: string;
}> {
  const ratio = height / width;
  const lqipHeight = Math.max(1, Math.round(lqipWidth * ratio));

  const resized = await convert(buffer, {
    format: "jpeg",
    quality,
    mode: null,
    keepExif: false,
    keepIcc: false,
    resize: { width: lqipWidth, height: lqipHeight, fit: "cover" },
  });

  if (!resized.ok) {
    throw new Error(`${resized.error.code}: ${resized.error.message}`);
  }

  const b64 = resized.data.buffer.toString("base64");
  return {
    code: `data:image/jpeg;base64,${b64}`,
    width: lqipWidth,
    height: lqipHeight,
    description: `LQIP JPEG ${lqipWidth}x${lqipHeight}`,
  };
}

/**
 * BlurHash : hash textuel calcule sur une image 32px via sharp.raw().
 * `components` controle la finesse (1-9).
 */
async function generateBlurHash(
  buffer: Buffer,
  options: BlurHashOptions,
): Promise<{
  code: string;
  width: number;
  height: number;
  description: string;
}> {
  const targetW = 32;
  const raw = await createSharp(buffer)
    .resize({ width: targetW, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = raw;
  const w = info.width;
  const h = info.height;

  if (w === 0 || h === 0) {
    throw new Error("Dimensions BlurHash invalides.");
  }

  // blurhash.encode attend un Uint8ClampedArray RGBA.
  const pixels = new Uint8ClampedArray(data);
  const hash = encodeBlurHash(
    pixels,
    w,
    h,
    options.components,
    options.components,
  );

  return {
    code: hash,
    width: w,
    height: h,
    description: `BlurHash (${options.components}x${options.components})`,
  };
}

/**
 * SVG : miniature JPEG base64 embeddee dans un SVG avec filtre gaussien.
 * Le SVG est inline (pas de data URL SVG) pour pouvoir etre copie tel quel
 * dans un fichier HTML/TSX.
 */
async function generateSvg(
  buffer: Buffer,
  width: number,
  height: number,
  lqipWidth: number,
  quality: number,
): Promise<{
  code: string;
  width: number;
  height: number;
  description: string;
}> {
  const ratio = height / width;
  const lqipHeight = Math.max(1, Math.round(lqipWidth * ratio));

  const resized = await convert(buffer, {
    format: "jpeg",
    quality,
    mode: null,
    keepExif: false,
    keepIcc: false,
    resize: { width: lqipWidth, height: lqipHeight, fit: "cover" },
  });

  if (!resized.ok) {
    throw new Error(`${resized.error.code}: ${resized.error.message}`);
  }

  const b64 = resized.data.buffer.toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <filter id="b" x="0" y="0" width="100%" height="100%">
    <feGaussianBlur stdDeviation="8" />
  </filter>
  <image href="data:image/jpeg;base64,${b64}" width="${width}" height="${height}" filter="url(#b)" preserveAspectRatio="xMidYMid slice" />
</svg>`;

  return {
    code: svg,
    width,
    height,
    description: `SVG floute ${width}x${height}`,
  };
}

/**
 * Base64 : JPEG inline base64 (plus lourd que LQIP, mais utile pour AMP / emails).
 */
async function generateBase64(
  buffer: Buffer,
  width: number,
  height: number,
  lqipWidth: number,
  quality: number,
): Promise<{
  code: string;
  width: number;
  height: number;
  description: string;
}> {
  const ratio = height / width;
  const lqipHeight = Math.max(1, Math.round(lqipWidth * ratio));

  const resized = await convert(buffer, {
    format: "jpeg",
    quality,
    mode: null,
    keepExif: false,
    keepIcc: false,
    resize: { width: lqipWidth, height: lqipHeight, fit: "contain" },
  });

  if (!resized.ok) {
    throw new Error(`${resized.error.code}: ${resized.error.message}`);
  }

  const b64 = resized.data.buffer.toString("base64");
  return {
    code: b64,
    width: lqipWidth,
    height: lqipHeight,
    description: `Base64 JPEG ${lqipWidth}x${lqipHeight}`,
  };
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

  // Le hook envoie les sourceIds dans un champ "sourceIds" (array JSON).
  // On reste defensif : si absent, on genere un id aleatoire.
  const rawSourceIds = form.get("sourceIds");
  let sourceIds: string[] = [];
  if (typeof rawSourceIds === "string") {
    try {
      const parsed: unknown = JSON.parse(rawSourceIds);
      if (Array.isArray(parsed)) {
        sourceIds = parsed.filter((v): v is string => typeof v === "string");
      }
    } catch {
      // ignore
    }
  }

  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: z.infer<typeof placeholderFormSchema>;
  try {
    options = placeholderFormSchema.parse(JSON.parse(rawOptions));
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

  const results: PlaceholderPayload[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index] ?? crypto.randomUUID();

    // 1. Validation primaire.
    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({
        filename: file.name,
        message: `${basics.error.code}: ${basics.error.message}`,
      });
      continue;
    }

    // 2. Lecture buffer.
    // FIX TS2322 : annotation `Buffer` (large) car la variable est
    // reassignee plus bas avec sanitized.data (type Buffer).
    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

    // 3. SVG : sanitize avant rasterisation.
    if (basics.data.format === "svg") {
      const sanitized = sanitizeSvg(buffer);
      if (!sanitized.ok) {
        errors.push({
          filename: file.name,
          message: `${sanitized.error.code}: ${sanitized.error.message}`,
        });
        continue;
      }
      buffer = sanitized.data;
    }

    // 4. Validation secondaire (dimensions + anti-bomb).
    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code}: ${dims.error.message}`,
      });
      continue;
    }

    const width = dims.data.width;
    const height = dims.data.height;

    // 5. Generation selon le format choisi.
    try {
      let payload: {
        code: string;
        width: number;
        height: number;
        description: string;
      };

      switch (options.format) {
        case "lqip":
          payload = await generateLqip(
            buffer,
            width,
            height,
            options.lqipWidth,
            options.quality,
          );
          break;
        case "blurhash":
          payload = await generateBlurHash(buffer, {
            components: options.blurhashComponents,
          });
          break;
        case "svg":
          payload = await generateSvg(
            buffer,
            width,
            height,
            options.lqipWidth,
            options.quality,
          );
          break;
        case "base64":
          payload = await generateBase64(
            buffer,
            width,
            height,
            options.lqipWidth,
            options.quality,
          );
          break;
      }

      results.push({ sourceId, ...payload });
    } catch (err) {
      errors.push({
        filename: file.name,
        message: `PROCESSING_ERROR: ${err instanceof Error ? err.message : "erreur inconnue"}`,
      });
    }
  }

  // 6. Aucun succes : renvoyer la premiere erreur.
  if (results.length === 0) {
    return errorResponse(
      "PROCESSING_ERROR",
      errors[0]?.message ?? "Aucun placeholder genere.",
      { errors },
    );
  }

  // 7. Reponse JSON (toujours, meme pour 1 fichier : le hook attend ce format).
  const durationMs = Date.now() - startedAt;
  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}
