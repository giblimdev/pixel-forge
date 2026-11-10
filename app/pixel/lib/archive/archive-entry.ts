/*
path:            app/pixel/lib/archive/archive-entry.ts
tag:             ["pixel", "archive", "entry", "naming"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Normalisation des noms de fichiers pour l'archive ZIP :
                 anti-collision (suffixe -2, -3 avant l'extension si deux
                 fichiers produisent le meme nom), organisation par
                 format (sous-dossier webp/, png/, ...) ou par suffixe
                 (-640w/, -1280w/, ...), sanitization (caracteres
                 speciaux remplaces par -).

                 Aucune dependance runtime (pas de sharp, pas de
                 @vercel/blob). Importable client ET serveur.

flow:            Module TypeScript pur -> helpers purs.

ecosystem:       Archive = [
                   "@/app/pixel/lib/archive/archive.types.ts",
                   "@/app/pixel/lib/archive/archive-entry.ts",
                   "@/app/pixel/lib/archive/archive-builder.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/archive/archive.types.ts"]
imports:         ["@/app/pixel/lib/archive/archive.types"]
exports:         ["normalizeEntryName", "organizeEntries"]
useBy:           ["@/app/pixel/lib/archive/archive-builder.ts"]

userStories:     ["*en tant que developpeur je veux normaliser les noms de fichiers du ZIP"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ArchiveFolderStrategy } from "@/app/pixel/lib/archive/archive.types";

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/**
 * Nettoie un nom de fichier pour l'archive :
 * - minuscules preservees (on ne touche pas a la casse)
 * - remplace les caracteres non [\w.-] par -
 * - tronque a 200 caracteres
 * - si vide apres nettoyage : "file"
 */
export function normalizeEntryName(filename: string): string {
  const cleaned = filename
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  return cleaned.length > 0 ? cleaned : "file";
}

// ---------------------------------------------------------------------------
// Anti-collision
// ---------------------------------------------------------------------------

function splitName(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

/**
 * Resout les collisions dans une liste de noms :
 * - si "photo.webp" apparait 2 fois, la 2e devient "photo-2.webp",
 *   la 3e "photo-3.webp", etc.
 * - preserve l'ordre d'apparition.
 */
export function resolveCollisions(
  filenames: readonly string[],
): readonly string[] {
  const used = new Map<string, number>();
  return filenames.map((name) => {
    const normalized = normalizeEntryName(name);
    const key = normalized.toLowerCase();
    const count = used.get(key) ?? 0;
    used.set(key, count + 1);
    if (count === 0) return normalized;
    const { base, ext } = splitName(normalized);
    return `${base}-${count + 1}${ext}`;
  });
}

// ---------------------------------------------------------------------------
// Organisation
// ---------------------------------------------------------------------------

/**
 * Determine le sous-dossier d'un fichier selon la strategie :
 * - "flat"      : pas de sous-dossier
 * - "by-format" : "webp/", "png/", ...
 * - "by-size"   : "-640w/", "-1280w/", ... (extrait du suffixe -XXXXw)
 */
function subfolderFor(
  filename: string,
  strategy: ArchiveFolderStrategy,
): string {
  if (strategy === "flat") return "";

  if (strategy === "by-format") {
    const dot = filename.lastIndexOf(".");
    const ext = dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
    return ext.length > 0 ? `${ext}/` : "";
  }

  // by-size : extrait -NNNw du nom (ex. photo-640w.webp -> -640w/)
  const match = filename.match(/-(\d+)w\./i);
  return match ? `-${match[1]}w/` : "";
}

/**
 * Applique l'organisation et l'anti-collision a une liste de fichiers.
 * Retourne une liste de { filename, buffer } prete pour l'archive.
 */
export function organizeEntries(
  files: readonly { filename: string; buffer: Buffer }[],
  strategy: ArchiveFolderStrategy,
): readonly { filename: string; buffer: Buffer }[] {
  const normalizedNames = resolveCollisions(files.map((f) => f.filename));
  return files.map((file, index) => ({
    filename: `${subfolderFor(normalizedNames[index]!, strategy)}${normalizedNames[index]!}`,
    buffer: file.buffer,
  }));
}