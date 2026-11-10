/*
path:            app/pixel/lib/archive/archive-builder.ts
tag:             ["pixel", "archive", "builder", "zip"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Construction d'une archive ZIP en memoire via archiver.
                 Assemblage par concatenation de Buffers (pas de streaming
                 direct vers HTTP — incompatible avec les limites Vercel).
                 Verifie la taille totale (LIMITS.MAX_ZIP_SIZE) avant
                 ecriture.

                 Importable UNIQUEMENT cote serveur (archiver est un
                 module Node.js). Le fichier reste compatible avec
                 Vercel serverless.

                 ATTENTION archiver : c'est un module CommonJS. Turbopack
                 ne simule pas son default export. On le charge via
                 createRequire("archiver") pour recuperer la fonction
                 factory, comme le montre le README officiel.

flow:            buildArchive(files, options) -> organizeEntries ->
                 new archiver("zip", { zlib: { level } }) ->
                 append chaque fichier (avec manifest si demande) ->
                 finalize() -> Promise<Buffer> -> verifie taille ->
                 retourne { ok: true, buffer, sizeBytes, entryCount }
                 ou { ok: false, error }.

ecosystem:       Archive = [
                   "@/app/pixel/lib/archive/archive.types.ts",
                   "@/app/pixel/lib/archive/archive-entry.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/archive/archive.types.ts",
                  "@/app/pixel/lib/archive/archive-entry.ts",
                  "@/app/pixel/lib/validators/image-limits.ts"]
imports:         ["server-only", "node:module", "archiver",
                  "@/app/pixel/lib/archive/archive.types",
                  "@/app/pixel/lib/archive/archive-entry",
                  "@/app/pixel/lib/validators/image-limits"]
exports:         ["buildArchive"]
useBy:           ["@/app/api/images/export/route.ts"]

userStories:     ["*en tant que developpeur je veux construire un ZIP en memoire"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import { createRequire } from "node:module";

import type {
  ArchiveOptions,
  ArchiveResult,
} from "@/app/pixel/lib/archive/archive.types";
import { organizeEntries } from "@/app/pixel/lib/archive/archive-entry";
import { LIMITS } from "@/app/pixel/lib/validators/image-limits";

// ---------------------------------------------------------------------------
// Chargement CommonJS de archiver (Turbopack ne simule pas le default export)
// ---------------------------------------------------------------------------

const nodeRequire = createRequire(import.meta.url);

interface ArchiverInstance {
  on: (event: string, cb: (arg: unknown) => void) => void;
  append: (data: Buffer | string, options: { name: string }) => void;
  finalize: () => Promise<void> | void;
}

type ArchiverFactory = (
  format: string,
  options?: { zlib?: { level?: number } },
) => ArchiverInstance;

const archiver: ArchiverFactory = nodeRequire("archiver") as ArchiverFactory;

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export async function buildArchive(
  files: readonly { filename: string; buffer: Buffer }[],
  options: ArchiveOptions,
): Promise<ArchiveResult> {
  if (files.length === 0) {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "Aucun fichier a archiver." },
    };
  }

  const organized = organizeEntries(files, options.organization);
  const totalBytes = organized.reduce((sum, f) => sum + f.buffer.length, 0);

  if (totalBytes > LIMITS.MAX_ZIP_SIZE) {
    return {
      ok: false,
      error: {
        code: "LIMIT_EXCEEDED",
        message: `Archive trop volumineuse (${totalBytes} octets, max ${LIMITS.MAX_ZIP_SIZE}).`,
        details: { totalBytes, max: LIMITS.MAX_ZIP_SIZE },
      },
    };
  }

  try {
    const archive = archiver("zip", {
      zlib: { level: options.compressionLevel },
    });

    const chunks: Buffer[] = [];
    archive.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    });

    for (const entry of organized) {
      archive.append(entry.buffer, { name: entry.filename });
    }

    if (options.includeManifest) {
      const manifest = [
        `PixelForge export - ${new Date().toISOString()}`,
        `Fichiers : ${organized.length}`,
        "",
        ...organized.map((f) => `- ${f.filename} (${f.buffer.length} octets)`),
      ].join("\n");
      archive.append(manifest, { name: "manifest.txt" });
    }

    await new Promise<void>((resolve, reject) => {
      archive.on("end", () => resolve());
      archive.on("error", (err) => reject(err));
      void archive.finalize();
    });

    const buffer = Buffer.concat(chunks);

    return {
      ok: true,
      buffer,
      sizeBytes: buffer.length,
      entryCount: organized.length,
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "PROCESSING_ERROR",
        message: `Echec de l'archive : ${err instanceof Error ? err.message : "erreur inconnue"}.`,
      },
    };
  }
}