/*
path:            app/api/images/favicon/route.ts
tag:             ["pixel", "api", "favicon", "route", "ico", "manifest", "zip"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de génération complète de favicons.

                 Reçoit une image source (PNG, JPEG, SVG) et les options
                 de génération, puis produit :
                 - favicon.ico multi-résolutions ;
                 - PNG Apple Touch Icon (180x180), si demandé ;
                 - PNG Android Chrome (192x192 et 512x512), si demandé ;
                 - manifest.webmanifest ;
                 - archive ZIP complète uploadée sur Vercel Blob.

                 Réponse JSON contenant :
                 - icoBase64 ;
                 - pngFiles ;
                 - manifestJson ;
                 - zipUrl ;
                 - expiresAt.

                 Le contrat d'erreur est identique aux autres routes :
                 { error: { code, message, details? } }.

                 ⚠️ runtime Node.js IMPLICITE : avec cacheComponents activé
                 dans next.config.ts (Next.js 16), l'export
                 `runtime = "nodejs"` est INTERDIT et fait échouer le
                 build Turbopack. Node.js est le runtime par défaut.

                 ⚠️ Type-safety Buffer : `archive.buffer` est un
                 Buffer<ArrayBufferLike> (retour de archiver). On le
                 copie dans un Buffer<ArrayBuffer> via toSafeBuffer()
                 avant de le passer à put() de @vercel/blob qui exige
                 ce type strict.

                 ⚠️ Type-safety sourceBuffer : la variable est annotée
                 `Buffer` (= Buffer<ArrayBufferLike>) car elle est
                 réassignée avec le résultat de sanitizeSvg(), typé
                 Buffer. Sans annotation, TypeScript infère
                 Buffer<ArrayBuffer> depuis Buffer.from(arrayBuffer) et
                 refuse la réassignation (TS2322).

flow:            POST -> cleanupExpiredFiles -> formData -> file unique
                 -> validateBatch -> validateFileBasics
                 -> sanitizeSvg -> validateImageDimensions
                 -> faviconFormSchema.parse
                 -> convert PNG (tailles ICO)
                 -> buildIcoFromPngs
                 -> convert PNG Apple/Android
                 -> buildManifest
                 -> buildArchive
                 -> toSafeBuffer
                 -> put Vercel Blob
                 -> JSON.

ecosystem:       FaviconGenerator = [
                   "@/app/api/images/favicon/route.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/index.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                   "@/app/pixel/lib/image-engine/index.ts",
                   "@/app/pixel/lib/storage/temp-cleanup.ts",
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                   "@/app/pixel/types/processing.ts"
                 ]

relatedFiles:    [
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                   "@/app/pixel/lib/storage/temp-cleanup.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts"
                 ]

imports:         [
                   "next/server",
                   "zod",
                   "@vercel/blob",
                   "@/app/pixel/lib/image-engine",
                   "@/app/pixel/lib/favicon/ico-builder",
                   "@/app/pixel/lib/favicon/manifest-builder",
                   "@/app/pixel/lib/archive/archive-builder",
                   "@/app/pixel/lib/storage/temp-cleanup",
                   "@/app/pixel/lib/validators/file-validator",
                   "@/app/pixel/lib/validators/image-validator",
                   "@/app/pixel/lib/validators/svg-sanitizer",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema",
                   "@/app/pixel/types/processing"
                 ]

exports:         ["POST", "maxDuration"]

useBy:           [
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts"
                 ]

userStories:     [
                   "*en tant qu'utilisateur je veux générer tous les favicons d'un site"
                 ]

status:          corrected
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { NextResponse } from "next/server";
import { z } from "zod";
import { put } from "@vercel/blob";

import { convert } from "@/app/pixel/lib/image-engine";
import { buildIcoFromPngs } from "@/app/pixel/lib/favicon/ico-builder";
import { buildManifest } from "@/app/pixel/lib/favicon/manifest-builder";
import { buildArchive } from "@/app/pixel/lib/archive/archive-builder";
import { cleanupExpiredFiles } from "@/app/pixel/lib/storage/temp-cleanup";

import {
  validateBatch,
  validateFileBasics,
} from "@/app/pixel/lib/validators/file-validator";

import { validateImageDimensions } from "@/app/pixel/lib/validators/image-validator";
import { sanitizeSvg } from "@/app/pixel/lib/validators/svg-sanitizer";

import { faviconFormSchema } from "@/app/pixel/features/favicon-generator/schemas/favicon.schema";

import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// -----------------------------------------------------------------------------
// Runtime
// -----------------------------------------------------------------------------
//
// ⚠️ PAS d'export `runtime = "nodejs"` : avec cacheComponents activé
// dans next.config.ts (Next.js 16), Turbopack REFUSE cet export.
// Node.js est le runtime par défaut pour les routes API.

export const maxDuration = 60;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type FaviconOptions = z.infer<typeof faviconFormSchema>;

interface IcoPng {
  size: number;
  buffer: Buffer;
}

interface GeneratedPng {
  filename: string;
  buffer: Buffer;
}

// -----------------------------------------------------------------------------
// Gestion des erreurs
// -----------------------------------------------------------------------------

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Erreur inconnue pendant le traitement.";
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;

  const sanitized = base
    .normalize("NFKC")
    .replace(/[^\w.-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 200);

  return sanitized || "favicon";
}

/**
 * Copie un Buffer dans un Buffer neuf backed par ArrayBuffer strict.
 *
 * Utile quand le Buffer source peut être backed par SharedArrayBuffer
 * (cas de Buffer.concat via archiver) et qu'on doit passer le résultat
 * à une API qui exige `Buffer<ArrayBuffer>` strict — par exemple
 * put() de @vercel/blob dans ses versions récentes.
 */
function toSafeBuffer(buffer: Buffer): Buffer<ArrayBuffer> {
  const copy = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(copy).set(buffer);
  return Buffer.from(copy) as Buffer<ArrayBuffer>;
}

function extractSourceFile(form: FormData): File {
  const entries = form.getAll("files");

  if (entries.length !== 1) {
    throw new Error(
      "Une seule image source est requise pour générer les favicons.",
    );
  }

  const entry = entries[0];

  if (!(entry instanceof File)) {
    throw new Error("Le champ files ne contient pas un fichier valide.");
  }

  return entry;
}

function parseFaviconOptions(
  rawOptions: FormDataEntryValue | null,
): FaviconOptions {
  if (typeof rawOptions !== "string") {
    throw new Error("Options de génération manquantes.");
  }

  const parsedJson: unknown = JSON.parse(rawOptions);

  return faviconFormSchema.parse(parsedJson);
}

function encodeBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

// -----------------------------------------------------------------------------
// Génération des PNG
// -----------------------------------------------------------------------------

async function convertToPng(source: Buffer, size: number): Promise<Buffer> {
  const converted = await convert(source, {
    format: "png",
    quality: 100,
    mode: null,
    keepExif: false,
    keepIcc: false,
    resize: {
      width: size,
      height: size,
      fit: "cover",
    },
  });

  if (!converted.ok) {
    throw Object.assign(
      new Error(
        `Échec de génération du PNG ${size}px : ${converted.error.message}`,
      ),
      { code: converted.error.code },
    );
  }

  if (converted.data.buffer.byteLength === 0) {
    throw Object.assign(new Error(`Le PNG ${size}px généré est vide.`), {
      code: "PROCESSING_ERROR" as const,
    });
  }

  return converted.data.buffer;
}

async function generateIcoPngs(
  source: Buffer,
  sizes: number[],
  base: string,
): Promise<{
  icoPngs: IcoPng[];
  pngFiles: GeneratedPng[];
}> {
  const icoPngs: IcoPng[] = [];
  const pngFiles: GeneratedPng[] = [];

  for (const size of sizes) {
    const buffer = await convertToPng(source, size);

    icoPngs.push({ size, buffer });
    pngFiles.push({
      filename: `${base}-${size}x${size}.png`,
      buffer,
    });
  }

  return { icoPngs, pngFiles };
}

async function generateAppleTouch(
  source: Buffer,
  pngFiles: GeneratedPng[],
): Promise<void> {
  const buffer = await convertToPng(source, 180);

  pngFiles.push({
    filename: "apple-touch-icon.png",
    buffer,
  });
}

async function generateAndroidChrome(
  source: Buffer,
  pngFiles: GeneratedPng[],
): Promise<void> {
  const sizes = [192, 512] as const;

  for (const size of sizes) {
    const buffer = await convertToPng(source, size);

    pngFiles.push({
      filename: `android-chrome-${size}x${size}.png`,
      buffer,
    });
  }
}

// -----------------------------------------------------------------------------
// Classification des erreurs
// -----------------------------------------------------------------------------

function getProcessingErrorCode(error: unknown): ProcessingErrorCode {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;

    if (typeof code === "string" && Object.hasOwn(STATUS_BY_CODE, code)) {
      return code as ProcessingErrorCode;
    }
  }

  return "PROCESSING_ERROR";
}

// -----------------------------------------------------------------------------
// Handler POST
// -----------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  void cleanupExpiredFiles().catch((error: unknown) => {
    console.error("[PixelForge][Favicon] Temporary cleanup failed:", error);
  });

  try {
    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return errorResponse("INVALID_INPUT", "Corps multipart invalide.");
    }

    let file: File;

    try {
      file = extractSourceFile(form);
    } catch (error: unknown) {
      return errorResponse("INVALID_INPUT", getErrorMessage(error));
    }

    let options: FaviconOptions;

    try {
      options = parseFaviconOptions(form.get("options"));
    } catch (error: unknown) {
      const message =
        error instanceof z.ZodError
          ? error.issues
              .map(
                (issue) =>
                  `${issue.path.join(".") || "options"}: ${issue.message}`,
              )
              .join("; ")
          : error instanceof SyntaxError
            ? "Le JSON des options est invalide."
            : getErrorMessage(error);

      return errorResponse("INVALID_INPUT", message);
    }

    const batch = validateBatch([file.size]);

    if (!batch.ok) {
      return errorResponse(
        batch.error.code,
        batch.error.message,
        batch.error.details,
      );
    }

    const basics = validateFileBasics(file.name, file.size);

    if (!basics.ok) {
      return errorResponse(
        basics.error.code,
        basics.error.message,
        basics.error.details,
      );
    }

    // FIX TS2322 : annotation `Buffer` (large) car la variable est
    // réassignée plus bas avec sanitized.data (type Buffer).
    let sourceBuffer: Buffer = Buffer.from(await file.arrayBuffer());

    if (sourceBuffer.byteLength === 0) {
      return errorResponse("INVALID_INPUT", "Le fichier source est vide.");
    }

    if (basics.data.format === "svg") {
      const sanitized = sanitizeSvg(sourceBuffer);

      if (!sanitized.ok) {
        return errorResponse(
          sanitized.error.code,
          sanitized.error.message,
          sanitized.error.details,
        );
      }

      sourceBuffer = sanitized.data;
    }

    const dimensions = await validateImageDimensions(sourceBuffer);

    if (!dimensions.ok) {
      return errorResponse(
        dimensions.error.code,
        dimensions.error.message,
        dimensions.error.details,
      );
    }

    const base = safeBasename(file.name);

    const { icoPngs, pngFiles } = await generateIcoPngs(
      sourceBuffer,
      options.sizes,
      base,
    );

    let icoBuffer: Buffer;

    try {
      icoBuffer = buildIcoFromPngs(icoPngs);
    } catch (error: unknown) {
      return errorResponse(
        "PROCESSING_ERROR",
        `Échec de l'assemblage ICO : ${getErrorMessage(error)}`,
      );
    }

    if (icoBuffer.byteLength === 0) {
      return errorResponse(
        "PROCESSING_ERROR",
        "Le fichier favicon.ico généré est vide.",
      );
    }

    if (options.includeAppleTouch) {
      await generateAppleTouch(sourceBuffer, pngFiles);
    }

    if (options.includeAndroidChrome) {
      await generateAndroidChrome(sourceBuffer, pngFiles);
    }

    const manifest = buildManifest(options.manifest);
    const manifestJson = JSON.stringify(manifest, null, 2);

    const archiveEntries = [
      {
        filename: "favicon.ico",
        buffer: icoBuffer,
      },
      ...pngFiles,
      {
        filename: "manifest.webmanifest",
        buffer: Buffer.from(manifestJson, "utf-8"),
      },
    ];

    const archive = await buildArchive(archiveEntries, {
      organization: "flat",
      includeManifest: false,
      compressionLevel: 6,
    });

    if (!archive.ok) {
      return errorResponse(
        archive.error.code,
        archive.error.message,
        archive.error.details,
      );
    }

    if (archive.buffer.byteLength === 0) {
      return errorResponse(
        "PROCESSING_ERROR",
        "L'archive ZIP générée est vide.",
      );
    }

    // ⚠️ archive.buffer est un Buffer<ArrayBufferLike> (retour d'archiver
    // via Buffer.concat). On le copie dans un Buffer<ArrayBuffer> strict
    // avant de le passer à put() qui exige ce type exact.
    const zipBuffer = toSafeBuffer(archive.buffer);

    if (zipBuffer.byteLength === 0) {
      return errorResponse(
        "PROCESSING_ERROR",
        "Impossible de préparer le buffer de l'archive ZIP.",
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const zipFilename = `favicons-${base}-${timestamp}.zip`;

    let zipUrl: string;

    try {
      const uploaded = await put(`temp/${zipFilename}`, zipBuffer, {
        access: "public",
        contentType: "application/zip",
        addRandomSuffix: true,
      });

      zipUrl = uploaded.url;
    } catch (error: unknown) {
      console.error("[PixelForge][Favicon] Blob upload failed:", error);

      return errorResponse(
        "PROCESSING_ERROR",
        `Échec de l'upload du ZIP : ${getErrorMessage(error)}`,
      );
    }

    const responsePngFiles = pngFiles.map((png) => ({
      filename: png.filename,
      base64: encodeBase64(png.buffer),
    }));

    return NextResponse.json(
      {
        icoBase64: encodeBase64(icoBuffer),
        pngFiles: responsePngFiles,
        manifestJson,
        zipUrl,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const code = getProcessingErrorCode(error);
    const message = getErrorMessage(error);

    console.error("[PixelForge][Favicon] Unexpected processing error:", error);

    return errorResponse(code, message);
  }
}
