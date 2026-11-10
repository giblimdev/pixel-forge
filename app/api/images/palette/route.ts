/*
path:            app/api/images/palette/route.ts
tag:             ["pixel", "api", "palette", "route", "colors", "clustering"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint d'extraction de palette (outil 11). Recoit
                 une ou plusieurs images + les options (nombre de
                 couleurs, skip extremes, taille d'echantillon) et
                 retourne pour chaque image les N couleurs dominantes
                 (HEX + RGB + ratio).

                 Algorithme : reduction sharp -> resize a sampleSize ->
                 getRawPixels RGBA -> quantification (bucketing RGB en
                 cellules 32x32x32) -> tri par frequence -> extraction
                 des N couleurs les plus frequentes -> calcul du ratio.

                 Meme contrat d'erreur que les autres routes :
                 { error: { code, message, details? } }.
                 maxDuration = 60.
                 Runtime Node.js implicite (cacheComponents).

flow:            POST -> cleanupExpiredFiles -> formData -> files +
                 sourceIds + options -> validateBatch + validateFileBasics
                 + sanitizeSvg + validateImageDimensions -> pour chaque
                 fichier : extrairePalette(buffer, options) -> JSON
                 { results, errors, durationMs }.

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
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.factory.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/svg-sanitizer.ts",
                  "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                  "@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["next/server", "zod", "sharp",
                  "@/app/pixel/lib/image-engine/sharp.factory",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/validators/svg-sanitizer",
                  "@/app/pixel/features/color-palette/schemas/palette.schema",
                  "@/app/pixel/features/color-palette/types/palette.types",
                  "@/app/pixel/types/processing"]
exports:         ["POST", "maxDuration"]
useBy:           ["@/app/pixel/features/color-palette/hooks/use-color-palette.ts"]

userStories:     ["*en tant qu'utilisateur je veux extraire les couleurs dominantes d'une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import { createSharp } from "@/app/pixel/lib/image-engine/sharp.factory";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { sanitizeSvg } from "@/app/pixel/lib/validators/svg-sanitizer";
import { paletteFormSchema } from "@/app/pixel/features/color-palette/schemas/palette.schema";
import type {
  PaletteColor,
} from "@/app/pixel/features/color-palette/types/palette.types";
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

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Extraction de palette (clustering par bucketing RGB)
// ---------------------------------------------------------------------------

interface Bucket {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  count: number;
}

/**
 * Extrait les N couleurs dominantes d'une image via un bucketing
 * RGB 32x32x32 (8 bits par canal, 5 bits utilises -> 32 valeurs).
 * Complexite O(pixels), robuste, pas de dependance externe.
 *
 * @param buffer     Image source (Buffer).
 * @param colorCount Nombre de couleurs a retourner (1-10).
 * @param skipExtremes  Ignore les pixels quasi-blancs (>= 250) et
 *                      quasi-noirs (<= 5) sur les 3 canaux.
 * @param sampleSize Taille max de l'echantillon (perf).
 * @returns { colors, totalPixels } ou null si aucun pixel valide.
 */
async function extractPalette(
  buffer: Buffer,
  colorCount: number,
  skipExtremes: boolean,
  sampleSize: number,
): Promise<{ colors: PaletteColor[]; totalPixels: number } | null> {
  // 1. Reduction de l'image a `sampleSize` px (perf).
  const resized = await createSharp(buffer)
    .resize({
      width: sampleSize,
      height: sampleSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  if (width === 0 || height === 0 || channels !== 4) {
    return null;
  }

  const totalPixels = width * height;

  // 2. Bucketing RGB 32x32x32 (5 bits par canal).
  const buckets = new Map<number, Bucket>();

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    const r = data[offset]!;
    const g = data[offset + 1]!;
    const b = data[offset + 2]!;
    const a = data[offset + 3]!;

    // Ignore les pixels transparents.
    if (a < 128) continue;

    // Ignore les quasi-blancs / quasi-noirs si demande.
    if (skipExtremes) {
      if (r >= 250 && g >= 250 && b >= 250) continue;
      if (r <= 5 && g <= 5 && b <= 5) continue;
    }

    // Quantification : on garde les 5 bits de poids fort par canal.
    const qr = r >> 3; // 0-31
    const qg = g >> 3;
    const qb = b >> 3;
    const key = (qr << 10) | (qg << 5) | qb;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count += 1;
    } else {
      // On stocke la moyenne RGB du bucket (les 5 bits reconstruits
      // donnes une approximation suffisante pour l'affichage).
      buckets.set(key, {
        r: (qr << 3) | 0x04,
        g: (qg << 3) | 0x04,
        b: (qb << 3) | 0x04,
        count: 1,
      });
    }
  }

  if (buckets.size === 0) {
    return null;
  }

  // 3. Tri par frequence decroissante, extraction des N premiers.
  const sorted = Array.from(buckets.values()).sort(
    (a, b) => b.count - a.count,
  );
  const top = sorted.slice(0, colorCount);

  // 4. Calcul du ratio (part de chaque couleur dans le total analyse).
  const totalAnalyzed = sorted.reduce((sum, b) => sum + b.count, 0);

  const colors: PaletteColor[] = top.map((b) => ({
    hex: toHex(b.r, b.g, b.b),
    rgb: { r: b.r, g: b.g, b: b.b },
    ratio: totalAnalyzed > 0 ? b.count / totalAnalyzed : 0,
  }));

  return { colors, totalPixels };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

interface PaletteRouteResult {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly colors: readonly PaletteColor[];
  readonly totalPixels: number;
}

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

  // SourceIds (alignes sur files[]) — defensif : si absent, genere un id.
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

  // Options.
  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: z.infer<typeof paletteFormSchema>;
  try {
    options = paletteFormSchema.parse(JSON.parse(rawOptions));
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

  const results: PaletteRouteResult[] = [];
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

    // 5. Extraction de la palette.
    try {
      const palette = await extractPalette(
        buffer,
        options.colorCount,
        options.skipExtremes,
        options.sampleSize,
      );

      if (palette === null) {
        errors.push({
          filename: file.name,
          message:
            "PROCESSING_ERROR: Aucun pixel analysable (image vide ou entierement transparente).",
        });
        continue;
      }

      results.push({
        sourceId,
        sourceFilename: file.name,
        colors: palette.colors,
        totalPixels: palette.totalPixels,
      });
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
      errors[0]?.message ?? "Aucune palette generee.",
      { errors },
    );
  }

  // 7. Reponse JSON.
  const durationMs = Date.now() - startedAt;
  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}