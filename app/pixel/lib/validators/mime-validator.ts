/*
path:            app/pixel/lib/validators/mime-validator.ts
tag:             ["pixel", "validation", "mime", "magic-bytes", "security"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Verification du type MIME REEl d'un fichier via ses
                 magic bytes (package file-type). Le Content-Type declare
                 par le navigateur n'est JAMAIS fiable : ce validateur
                 detecte le format a partir du contenu binaire et compare
                 a l'extension. Ne leve jamais : retourne un
                 ProcessingError structure. Importable UNIQUEMENT cote
                 serveur (server-only).

flow:            detectRealMime(buffer) -> file-type fromBuffer ->
                 si null : erreur UNSUPPORTED_FORMAT ; sinon compare le
                 MIME detecte au MIME attendu par l'extension
                 (validateMimeMatchesExtension) -> si incoherent :
                 erreur INVALID_INPUT avec details.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/file-validator.ts",
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/lib/validators/image-validator.ts",
                   "@/app/pixel/lib/validators/mime-validator.ts",
                   "@/app/pixel/lib/validators/svg-sanitizer.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/validators/file-validator.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["server-only", "file-type",
                  "@/app/pixel/lib/validators/file-validator",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["DetectedMime", "detectRealMime",
                  "validateMimeMatchesExtension"]
useBy:           ["@/app/api/images/convert/route.ts",
                  "@/app/api/images/optimize/route.ts",
                  "@/app/api/images/compress/route.ts",
                  "@/app/api/images/resize/route.ts",
                  "@/app/api/images/crop/route.ts",
                  "@/app/api/images/background/route.ts",
                  "@/app/api/images/retouch/route.ts",
                  "@/app/api/images/favicon/route.ts",
                  "@/app/api/images/placeholder/route.ts",
                  "@/app/api/images/palette/route.ts",
                  "@/app/api/images/metadata/route.ts"]

userStories:     ["*en tant que developpeur je veux verifier le MIME reel via magic bytes",
                  "*en tant qu'utilisateur je veux etre protege des fichiers falsifies"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import { fileTypeFromBuffer } from "file-type";

import type { AllowedInputFormat } from "@/app/pixel/lib/validators/file-validator";
import type { ImageMimeType } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Table extension -> MIME attendu
// ---------------------------------------------------------------------------

const EXPECTED_MIME_BY_EXT: Readonly<
  Record<AllowedInputFormat, ImageMimeType>
> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
  gif: "image/gif",
  svg: "image/svg+xml",
};

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface DetectedMime {
  readonly mime: ImageMimeType;
  readonly ext: AllowedInputFormat;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
  details?: unknown,
): ProcessingError {
  return details === undefined ? { code, message } : { code, message, details };
}

function isImageMime(value: string): value is ImageMimeType {
  return (
    value === "image/jpeg" ||
    value === "image/png" ||
    value === "image/webp" ||
    value === "image/avif" ||
    value === "image/tiff" ||
    value === "image/gif" ||
    value === "image/svg+xml"
  );
}

function extFromDetected(
  detectedExt: string,
): AllowedInputFormat | null {
  const lower = detectedExt.toLowerCase();
  if (lower === "jpg" || lower === "jpeg") return "jpeg";
  if (lower === "png") return "png";
  if (lower === "webp") return "webp";
  if (lower === "avif") return "avif";
  if (lower === "tif" || lower === "tiff") return "tiff";
  if (lower === "gif") return "gif";
  if (lower === "svg") return "svg";
  return null;
}

// ---------------------------------------------------------------------------
// Detection reelle (magic bytes)
// ---------------------------------------------------------------------------

export async function detectRealMime(
  buffer: Buffer,
): Promise<
  | { readonly ok: true; readonly data: DetectedMime }
  | { readonly ok: false; readonly error: ProcessingError }
> {
  if (buffer.length === 0) {
    return {
      ok: false,
      error: errorOf("INVALID_INPUT", "Buffer vide : MIME indeterminable."),
    };
  }

  const detected = await fileTypeFromBuffer(buffer);

  // Cas particulier SVG : file-type ne detecte PAS le SVG (pas de magic
  // bytes binaires, c'est du XML). On se rabat sur un sniff textuel.
  if (!detected) {
    const head = buffer.subarray(0, 512).toString("utf-8").trimStart();
    if (head.startsWith("<svg") || head.startsWith("<?xml")) {
      return {
        ok: true,
        data: { mime: "image/svg+xml", ext: "svg" },
      };
    }
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        "Format non reconnu (magic bytes absents).",
      ),
    };
  }

  if (!isImageMime(detected.mime)) {
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        `MIME non supporte : ${detected.mime}.`,
        { detectedMime: detected.mime },
      ),
    };
  }

  const ext = extFromDetected(detected.ext);
  if (ext === null) {
    return {
      ok: false,
      error: errorOf(
        "UNSUPPORTED_FORMAT",
        `Extension detectee non supportee : .${detected.ext}.`,
        { detectedExt: detected.ext },
      ),
    };
  }

  return { ok: true, data: { mime: detected.mime, ext } };
}

// ---------------------------------------------------------------------------
// Coherence MIME reel <-> extension declaree
// ---------------------------------------------------------------------------

export function validateMimeMatchesExtension(
  declaredExt: AllowedInputFormat,
  detected: DetectedMime,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly error: ProcessingError } {
  const expectedMime = EXPECTED_MIME_BY_EXT[declaredExt];
  if (expectedMime !== detected.mime) {
    return {
      ok: false,
      error: errorOf(
        "INVALID_INPUT",
        `Le contenu ne correspond pas a l'extension .${declaredExt} (attendu ${expectedMime}, detecte ${detected.mime}).`,
        { declaredExt, expectedMime, detectedMime: detected.mime },
      ),
    };
  }
  return { ok: true };
}