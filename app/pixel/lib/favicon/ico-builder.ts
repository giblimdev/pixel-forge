/*
path:            app/pixel/lib/favicon/ico-builder.ts
tag:             ["pixel", "favicon", "ico", "builder"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Construction d'un fichier ICO multi-resolutions a
                 partir de buffers PNG. Implemente le format ICO
                 (ICONDIR + ICONDIRENTRY + payloads PNG) en pur JS,
                 conformement au standard Windows ICO (PNG-backed
                 entries, supporte par Windows 10/11 et tous les
                 navigateurs modernes).

                 Ne depend PAS de png-to-ico : le package npm accepte
                 des chemins de fichiers, pas des buffers. Pour eviter
                 les I/O disque temporaires, on assemble l'ICO
                 directement.

                 Format ICO :
                 - ICONDIR (6 octets) : reserved (2) + type (2) + count (2)
                 - ICONDIRENTRY (16 octets x N) : width, height, colors,
                   reserved, planes, bitCount, bytesInRes, imageOffset
                 - Payloads PNG concatenes

flow:            buildIcoFromPngs(pngs: { size, buffer }[]) -> trie
                 par taille -> ecrit ICONDIR -> pour chaque PNG, ecrit
                 ICONDIRENTRY (avec offset calcule) -> concat payloads ->
                 retourne Buffer.

ecosystem:       Favicon = [
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/favicon/manifest-builder.ts"]
imports:         []
exports:         ["IcoPngInput", "buildIcoFromPngs"]
useBy:           ["@/app/api/images/favicon/route.ts"]

userStories:     ["*en tant que developpeur je veux assembler un ICO multi-resolutions"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

export interface IcoPngInput {
  readonly size: number;
  readonly buffer: Buffer;
}

/**
 * Assemble un fichier ICO a partir de buffers PNG deja redimensionnes.
 * Chaque PNG doit correspondre a une taille (16, 24, 32, 48, 64, 128, 256).
 * Le resultat est un ICO PNG-backed, compatible Windows 10/11 et
 * navigateurs modernes.
 */
export function buildIcoFromPngs(pngs: readonly IcoPngInput[]): Buffer {
  if (pngs.length === 0) {
    throw new Error("buildIcoFromPngs : au moins un PNG requis.");
  }

  // Trier par taille croissante (convention ICO).
  const sorted = [...pngs].sort((a, b) => a.size - b.size);

  // ICONDIR (6 octets)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = 1 (icon)
  header.writeUInt16LE(sorted.length, 4); // count

  // ICONDIRENTRY (16 octets x N)
  const entries = Buffer.alloc(16 * sorted.length);
  let offset = 6 + 16 * sorted.length;

  sorted.forEach((png, index) => {
    const entryOffset = index * 16;
    // width/height : 0 signifie 256 dans le format ICO.
    entries.writeUInt8(png.size >= 256 ? 0 : png.size, entryOffset);
    entries.writeUInt8(png.size >= 256 ? 0 : png.size, entryOffset + 1);
    entries.writeUInt8(0, entryOffset + 2); // color count
    entries.writeUInt8(0, entryOffset + 3); // reserved
    entries.writeUInt16LE(1, entryOffset + 4); // color planes
    entries.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    entries.writeUInt32LE(png.buffer.length, entryOffset + 8); // bytes in resource
    entries.writeUInt32LE(offset, entryOffset + 12); // image offset
    offset += png.buffer.length;
  });

  return Buffer.concat([header, entries, ...sorted.map((p) => p.buffer)]);
}