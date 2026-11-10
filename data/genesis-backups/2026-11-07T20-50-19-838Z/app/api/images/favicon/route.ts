/*
path:            app/api/images/favicon/route.ts
tag:             ["pixel", "api", "favicon", "route", "ico", "manifest", "zip"]
projectId:       <Pixel-fotgen>
type:            route
generic:         false

role:            Endpoint de generation de favicons complets. Recoit une
                 image source (PNG, JPEG, SVG) + les options de generation
                 (tailles ICO, manifest, Apple/Android), puis produit :
                 - favicon.ico multi-resolutions (via buildIcoFromPngs)
                 - PNG Apple Touch (180x180) si includeAppleTouch
                 - PNG Android Chrome (192, 512) si includeAndroidChrome
                 - manifest.webmanifest (via buildManifest)
                 - ZIP complet uploade sur @vercel/blob (URL temporaire 1h).
                 Meme contrat d'erreur que les autres routes : { error: { code, message, details? } }.
                 Le ZIP est uploade sur Vercel Blob (necessaire car la
                 reponse JSON contient aussi les buffers base64 pour
                 l'apercu immediat). maxDuration = 60.

flow:            POST -> cleanupExpiredFiles -> formData -> file unique
                 -> validateFileBasics + sanitizeSvg + validateImageDimensions
                 -> faviconFormSchema.parse -> pour chaque taille :
                 convert (PNG) -> buildIcoFromPngs -> PNG Apple/Android
                 -> buildManifest -> buildArchive -> put @vercel/blob
                 -> JSON { icoBase64, pngFiles[], manifestJson, zipUrl }.

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
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/favicon/ico-builder.ts",
                  "@/app/pixel/lib/favicon/manifest-builder.ts",
                  "@/app/pixel/lib/archive/archive-builder.ts",
                  "@/app/pixel/lib/storage/temp-cleanup.ts",
                  "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts"]
imports:         ["next/server", "zod", "@vercel/blob",
                  "@/app/pixel/lib/image-engine",
                  "@/app/pixel/lib/favicon/ico-builder",
                  "@/app/pixel/lib/favicon/manifest-builder",
                  "@/app/pixel/lib/archive/archive-builder",
                  "@/app/pixel/lib/storage/temp-cleanup",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/lib/validators/image-validator",
                  "@/app/pixel/lib/validators/svg-sanitizer",
                  "@/app/pixel/features/favicon-generator/schemas/favicon.schema",
                  "@/app/pixel/types/processing"]
exports:         ["POST", "maxDuration"]
useBy:           ["@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts"]

userStories:     ["*en tant qu'utilisateur je veux generer tous les favicons d'un site"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
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
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "favicon";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
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

  if (files.length !== 1) {
    return errorResponse(
      "INVALID_INPUT",
      "Une seule image source est requise pour generer les favicons.",
      { count: files.length },
    );
  }

  const file = files[0]!;

  const rawOptions = form.get("options");
  if (typeof rawOptions !== "string") {
    return errorResponse("INVALID_INPUT", "Options manquantes.");
  }

  let options: z.infer<typeof faviconFormSchema>;
  try {
    options = faviconFormSchema.parse(JSON.parse(rawOptions));
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : "Options invalides.";
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
    return errorResponse(basics.error.code, basics.error.message);
  }

  let buffer = Buffer.from(await file.arrayBuffer());

  // SVG : sanitize avant rasterisation.
  if (basics.data.format === "svg") {
    const sanitized = sanitizeSvg(buffer);
    if (!sanitized.ok) {
      return errorResponse(sanitized.error.code, sanitized.error.message);
    }
    buffer = sanitized.data;
  }

  const dims = await validateImageDimensions(buffer);
  if (!dims.ok) {
    return errorResponse(dims.error.code, dims.error.message);
  }

  const base = safeBasename(file.name);

  // 1. Generer les PNG de chaque taille ICO demandee.
  const icoPngs: { size: number; buffer: Buffer }[] = [];
  const pngFiles: { filename: string; buffer: Buffer }[] = [];

  for (const size of options.sizes) {
    const resized = await convert(buffer, {
      format: "png",
      quality: 100,
      mode: null,
      keepExif: false,
      keepIcc: false,
      resize: { width: size, height: size, fit: "cover" },
    });
    if (!resized.ok) {
      return errorResponse(
        resized.error.code,
        `Echec generation PNG ${size}px : ${resized.error.message}`,
      );
    }
    icoPngs.push({ size, buffer: resized.data.buffer });
    pngFiles.push({
      filename: `${base}-${size}x${size}.png`,
      buffer: resized.data.buffer,
    });
  }

  // 2. Assembler l'ICO multi-resolutions.
  let icoBuffer: Buffer;
  try {
    icoBuffer = buildIcoFromPngs(icoPngs);
  } catch (err) {
    return errorResponse(
      "PROCESSING_ERROR",
      `Assemblage ICO echoue : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }

  // 3. PNG Apple / Android (tailles fixes).
  if (options.includeAppleTouch) {
    const apple = await convert(buffer, {
      format: "png",
      quality: 100,
      mode: null,
      keepExif: false,
      keepIcc: false,
      resize: { width: 180, height: 180, fit: "cover" },
    });
    if (!apple.ok) {
      return errorResponse(
        apple.error.code,
        `Echec generation Apple Touch Icon : ${apple.error.message}`,
      );
    }
    pngFiles.push({
      filename: "apple-touch-icon.png",
      buffer: apple.data.buffer,
    });
  }

  if (options.includeAndroidChrome) {
    for (const size of [192, 512] as const) {
      const png = await convert(buffer, {
        format: "png",
        quality: 100,
        mode: null,
        keepExif: false,
        keepIcc: false,
        resize: { width: size, height: size, fit: "cover" },
      });
      if (!png.ok) {
        return errorResponse(
          png.error.code,
          `Echec generation Android Chrome ${size}px : ${png.error.message}`,
        );
      }
      pngFiles.push({
        filename: `android-chrome-${size}x${size}.png`,
        buffer: png.data.buffer,
      });
    }
  }

  // 4. Manifest JSON.
  const manifest = buildManifest(options.manifest);
  const manifestJson = JSON.stringify(manifest, null, 2);

  // 5. ZIP de tous les fichiers.
  const archiveEntries = [
    { filename: "favicon.ico", buffer: icoBuffer },
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

  // 6. Upload ZIP sur @vercel/blob.
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const zipFilename = `favicons-${base}-${timestamp}.zip`;

  let zipUrl: string;
  try {
    const uploaded = await put(`temp/${zipFilename}`, archive.buffer, {
      access: "public",
      contentType: "application/zip",
    });
    zipUrl = uploaded.url;
  } catch (err) {
    return errorResponse(
      "PROCESSING_ERROR",
      `Echec de l'upload du ZIP : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
    );
  }

  // 7. Reponse JSON : buffers en base64 pour l'apercu client + URL du ZIP.
  return NextResponse.json(
    {
      icoBase64: icoBuffer.toString("base64"),
      pngFiles: pngFiles.map((p) => ({
        filename: p.filename,
        base64: p.buffer.toString("base64"),
      })),
      manifestJson,
      zipUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    { status: 200 },
  );
}
