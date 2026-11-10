/*
path:            app/api/images/metadata/route.ts
tag:             ["pixel", "api", "metadata", "route", "exif", "gps", "privacy"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint d'analyse et de gestion des metadonnees
                 (outil 12). Deux handlers :
                 - GET  : analyse d'une ou plusieurs images (dimensions,
                          format, poids, entropie, alpha, ICC, EXIF,
                          GPS). Retourne un JSON structure.
                 - POST : suppression des metadonnees EXIF/ICC. Recoit
                          un ou plusieurs fichiers, retourne des
                          ResultImage (meme contrat que les autres
                          routes) avec un buffer SANS metadonnees.

                 ⚠️ Formats supportes :
                 - Lecture : tous (jpeg, png, webp, avif, tiff, gif, svg).
                 - Suppression : jpeg, png, webp, avif, tiff
                   (pas gif/svg — voir stripMetadata).

                 Meme contrat d'erreur que les autres routes :
                 { error: { code, message, details? } }.
                 maxDuration = 60. Runtime Node.js implicite.

flow:            GET  : formData ? non — query string ? non — on
                 accepte uniquement POST multipart pour les fichiers.
                 Une lecture "GET" n'a pas de sens sans fichier, donc
                 on force tout en POST :
                 - POST ?action=analyze   -> analyse
                 - POST ?action=strip     -> suppression
                 Cela simplifie le client (1 seul endpoint, 1 seul
                 fetch par action).

                 POST ?action=analyze :
                   formData -> files + options -> validate -> pour
                   chaque fichier : analyzeSharp(buffer) -> JSON
                   { results, errors, durationMs }.

                 POST ?action=strip :
                   formData -> files -> validate -> pour chaque
                   fichier : stripMetadata(buffer, format) -> ResultImage
                   -> Blob/JSON (contrat hybride B+C, comme /convert).

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
relatedFiles:    ["@/app/pixel/lib/image-engine/index.ts",
                  "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/lib/validators/image-validator.ts",
                  "@/app/pixel/lib/validators/svg-sanitizer.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/types/image.ts"]
imports:         ["next/server", "zod",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/image-engine/metadata-stripper",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/validators/svg-sanitizer",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/types/image"]
exports:         ["POST", "maxDuration"]
useBy:           ["@/app/pixel/features/metadata/hooks/use-image-metadata.ts"]

userStories:     ["*en tant qu'utilisateur je veux voir les metadonnees EXIF d'une image",
                  "*en tant qu'utilisateur je veux supprimer les metadonnees d'une image"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { NextResponse } from "next/server";
import { z } from "zod";

import { analyze } from "@/app/pixel/lib/image-engine";
import { stripMetadata } from "@/app/pixel/lib/image-engine/metadata-stripper";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";
import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";
import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { sanitizeSvg } from "@/app/pixel/lib/validators/svg-sanitizer";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";

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

// ---------------------------------------------------------------------------
// Schema de requete (query string ?action=analyze|strip)
// ---------------------------------------------------------------------------

const actionSchema = z.enum(["analyze", "strip"]);

// ---------------------------------------------------------------------------
// Analyse (lecture)
// ---------------------------------------------------------------------------

interface AnalyzeResult {
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly format: ImageFormat;
  readonly dimensions: { readonly width: number; readonly height: number };
  readonly sizeBytes: number;
  readonly hasAlpha: boolean;
  readonly entropy: number;
  readonly stdev: readonly [number, number, number];
  readonly hasIcc: boolean;
  readonly exif: Record<string, unknown> | null;
}

async function handleAnalyze(
  form: FormData,
  files: readonly File[],
  sourceIds: readonly (string | undefined)[],
): Promise<NextResponse> {
  const startedAt = Date.now();
  const results: AnalyzeResult[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index]!;
    const sourceId = sourceIds[index] ?? crypto.randomUUID();

    const basics = validateFileBasics(file.name, file.size);
    if (!basics.ok) {
      errors.push({
        filename: file.name,
        message: `${basics.error.code}: ${basics.error.message}`,
      });
      continue;
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());

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

    const dims = await validateImageDimensions(buffer);
    if (!dims.ok) {
      errors.push({
        filename: file.name,
        message: `${dims.error.code}: ${dims.error.message}`,
      });
      continue;
    }

    const analyzed = await analyze(buffer);
    if (!analyzed.ok) {
      errors.push({
        filename: file.name,
        message: `${analyzed.error.code}: ${analyzed.error.message}`,
      });
      continue;
    }

    results.push({
      sourceId,
      sourceFilename: file.name,
      format: analyzed.data.format,
      dimensions: analyzed.data.dimensions,
      sizeBytes: analyzed.data.sizeBytes,
      hasAlpha: analyzed.data.hasAlpha,
      entropy: analyzed.data.entropy,
      stdev: analyzed.data.stdev,
      hasIcc: analyzed.data.hasIcc,
      exif: (analyzed.data.exif as Record<string, unknown> | null) ?? null,
    });
  }

  if (results.length === 0) {
    return errorResponse(
      "PROCESSING_ERROR",
      errors[0]?.message ?? "Aucune image analysee.",
      { errors },
    );
  }

  const durationMs = Date.now() - startedAt;
  return NextResponse.json({ results, errors, durationMs }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Suppression EXIF/ICC
// ---------------------------------------------------------------------------

async function handleStrip(
  form: FormData,
  files: readonly File[],
  sourceIds: readonly (string | undefined)[],
): Promise<NextResponse> {
  const startedAt = Date.now();
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

    const stripped = await stripMetadata(
      buffer,
      dims.data.format,
      85,
    );

    if (!stripped.ok) {
      errors.push({
        filename: file.name,
        message: `${stripped.error.code}: ${stripped.error.message}`,
      });
      continue;
    }

    const out = stripped.data.buffer;
    const finalExt =
      stripped.data.format === "jpeg" ? "jpg" : stripped.data.format;
    const finalMime = `image/${stripped.data.format === "jpeg" ? "jpeg" : stripped.data.format}`;

    results.push({
      id: crypto.randomUUID(),
      ...(sourceId !== undefined ? { sourceId } : {}),
      filename: `${safeBasename(file.name)}-clean.${finalExt}`,
      format: stripped.data.format,
      mime: finalMime as ResultImage["mime"],
      sizeBytes: out.length,
      dimensions: stripped.data.metadata.dimensions,
      url: null,
      buffer: out.buffer.slice(
        out.byteOffset,
        out.byteOffset + out.byteLength,
      ) as ArrayBuffer,
      expiresAt: null,
    });
  }

  if (results.length === 0) {
    return errorResponse(
      "PROCESSING_ERROR",
      errors[0]?.message ?? "Aucune image traitee.",
      { errors },
    );
  }

  const durationMs = Date.now() - startedAt;

  // Contrat hybride B+C : 1 fichier -> Blob, 2+ -> JSON.
  if (results.length === 1 && errors.length === 0) {
    const single = results[0]!;
    const body = toBodyBytes(single.buffer);
    if (body === null) {
      return errorResponse(
        "PROCESSING_ERROR",
        "Buffer de sortie introuvable.",
      );
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

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  void cleanupExpiredFiles();

  // 1. Action (query string ?action=analyze|strip).
  const url = new URL(request.url);
  const rawAction = url.searchParams.get("action") ?? "analyze";
  const parsedAction = actionSchema.safeParse(rawAction);
  if (!parsedAction.success) {
    return errorResponse(
      "INVALID_INPUT",
      `Action invalide : "${rawAction}". Valeurs attendues : analyze, strip.`,
    );
  }
  const action = parsedAction.data;

  // 2. Parse multipart.
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

  // 3. SourceIds (alignés sur files[]).
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
  const alignedSourceIds: (string | undefined)[] = files.map(
    (_, i) => sourceIds[i],
  );

  // 4. Validation batch.
  const batch = validateBatch(files.map((f) => f.size));
  if (!batch.ok) {
    return errorResponse(
      batch.error.code,
      batch.error.message,
      batch.error.details,
    );
  }

  // 5. Dispatch.
  if (action === "strip") {
    return handleStrip(form, files, alignedSourceIds);
  }
  return handleAnalyze(form, files, alignedSourceIds);
}