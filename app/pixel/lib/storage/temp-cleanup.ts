/*
path:            app/pixel/lib/storage/temp-cleanup.ts
tag:             ["pixel", "storage", "cleanup", "vercel-blob"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Purge opportuniste des blobs temporaires expires
                 (@vercel/blob) : tout blob dont l'upload date de plus
                 d'1 heure est supprime. Appelee en fire-and-forget au
                 debut de chaque route /api/images/* (Decision 7).
                 NE BLOQUE JAMAIS le traitement : toute erreur est
                 silencieuse. Importable UNIQUEMENT cote serveur.

                 ⚠️ Necessite BLOB_READ_WRITE_TOKEN (deja valide dans
                 lib/env.ts). Si la variable n'est pas definie (dev
                 local sans Vercel Blob), la fonction retourne 0 sans
                 erreur.

flow:            cleanupExpiredFiles() -> lit process.env.BLOB_READ_WRITE_TOKEN
                 -> si absent : return 0 -> sinon list({ prefix: "temp/" })
                 -> filtre les blobs dont uploadedAt > TTL_MS -> del(url)
                 pour chacun -> retourne le nombre supprime.

ecosystem:       Storage = [
                   "@/app/pixel/lib/storage/temp-cleanup.ts",
                 ]
relatedFiles:    ["@/lib/env.ts"]
imports:         ["server-only", "@vercel/blob"]
exports:         ["cleanupExpiredFiles", "TEMP_TTL_MS"]
useBy:           ["@/app/api/images/convert/route.ts"]

userStories:     ["*en tant que developpeur je veux purger les blobs expires"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import "server-only";

import { del, list } from "@vercel/blob";

export const TEMP_TTL_MS = 60 * 60 * 1000; // 1 heure

export async function cleanupExpiredFiles(): Promise<number> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return 0;
  }

  try {
    const { blobs } = await list({ prefix: "temp/" });
    const now = Date.now();
    let deleted = 0;

    for (const blob of blobs) {
      const uploadedAt = new Date(blob.uploadedAt).getTime();
      if (now - uploadedAt > TEMP_TTL_MS) {
        try {
          await del(blob.url);
          deleted += 1;
        } catch {
          // best-effort : si un blob echoue, on continue.
        }
      }
    }

    return deleted;
  } catch {
    return 0;
  }
}