/*
path:            app/pixel/lib/image-engine/chroma-key.ts
tag:             ["pixel", "image-engine", "chroma-key", "background"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Algorithme de suppression de fond uni. Implemente la
                 Decision 6 : distance RGB euclidienne normalisee. Pour
                 chaque pixel, si la distance a la couleur cible est
                 inferieure a tolerance * max_distance, le pixel devient
                 transparent (alpha = 0). Sinon, alpha = 255.

                 Anti-aliasing : optionnellement, un flou gaussien sur
                 le canal alpha (via sharp.blur) adoucit les contours.
                 Le gomme manuelle est laissee a l'UI (Phase 13 ne
                 l'implemente pas — perimetre "fond uni").

                 Aucune dependance a sharp : prend un Buffer RGBA brut
                 et retourne un Buffer RGBA modifie. L'adaptateur sharp
                 fait le .raw() et le .png().

flow:            removeUniformBackground(rgbaBuffer, width, height,
                 target, tolerance) -> parcourt les pixels par blocs de
                 4 octets (RGBA) -> pour chaque pixel, calcule la
                 distance euclidienne -> si < tolerance * 441, alpha =
                 0 -> retourne le Buffer modifie.

ecosystem:       ImageEngine = [
                   "@/app/pixel/lib/image-engine/chroma-key.ts",
                 ]
relatedFiles:    ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]
imports:         []
exports:         ["RgbColor", "removeUniformBackground"]
useBy:           ["@/app/pixel/lib/image-engine/sharp.adapter.ts"]

userStories:     ["*en tant que developpeur je veux detourer un fond uni"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

// ---------------------------------------------------------------------------
// Constante : diagonale RGB max
// ---------------------------------------------------------------------------

const MAX_DISTANCE = Math.sqrt(255 * 255 + 255 * 255 + 255 * 255); // ~441

// ---------------------------------------------------------------------------
// Algorithme (Decision 6)
// ---------------------------------------------------------------------------

export function removeUniformBackground(
  rgba: Buffer,
  width: number,
  height: number,
  target: RgbColor,
  tolerance: number,
): Buffer {
  const out = Buffer.from(rgba);
  const threshold = tolerance * MAX_DISTANCE;
  const pixelCount = width * height;

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = out[offset]!;
    const g = out[offset + 1]!;
    const b = out[offset + 2]!;

    const dr = r - target.r;
    const dg = g - target.g;
    const db = b - target.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    if (distance < threshold) {
      out[offset + 3] = 0; // alpha = 0
    } else {
      out[offset + 3] = 255; // alpha = 255
    }
  }

  return out;
}