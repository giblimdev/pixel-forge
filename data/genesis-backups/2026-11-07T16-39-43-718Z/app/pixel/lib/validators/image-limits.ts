/*
path:            app/pixel/lib/validators/image-limits.ts
tag:             ["pixel", "validation", "image", "limits", "zod"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Definit et exporte le schema Zod des limites d'image
                 (formats acceptes, taille max, dimensions max, ratio).
                 Fournit aussi des helpers de verification synchrones
                 (isAllowedMimeType, isWithinSizeLimit, isWithinDimensions)
                 reutilisables par les composants d'upload et les Server
                 Actions du domaine pixel. Ne contient aucune logique UI.

flow:            IMAGE_LIMITS (const) -> imageLimitsSchema (Zod) ->
                 helpers purs (mime, taille, dimensions) -> types inferes
                 (ImageLimits) exportes vers processing.ts et les pages
                 d'upload.

ecosystem:       Pixel = [
                   "@/app/pixel/lib/validators/image-limits.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/processing.ts"]
imports:         ["zod"]
exports:         ["IMAGE_LIMITS", "imageLimitsSchema", "ImageLimits",
                  "isAllowedMimeType", "isWithinSizeLimit",
                  "isWithinDimensions"]
useBy:           ["@/app/pixel/types/processing.ts"]

userStories:     ["*en tant qu'utilisateur je veux uploader une image valide",
                  "*en tant que developpeur je veux valider les limites cote serveur"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import { z } from "zod";

// ---------------------------------------------------------------------------
// Constantes de limites (source de verite unique du domaine pixel)
// ---------------------------------------------------------------------------

export const IMAGE_LIMITS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 Mo
  minWidth: 16,
  minHeight: 16,
  maxWidth: 8192,
  maxHeight: 8192,
  allowedMimeTypes: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/avif",
  ] as const,
} as const;

// ---------------------------------------------------------------------------
// Schema Zod
// ---------------------------------------------------------------------------

export const imageLimitsSchema = z.object({
  size: z
    .number()
    .int()
    .positive()
    .max(
      IMAGE_LIMITS.maxSizeBytes,
      `La taille maximale est de ${IMAGE_LIMITS.maxSizeBytes} octets.`,
    ),
  width: z
    .number()
    .int()
    .min(IMAGE_LIMITS.minWidth, `Largeur minimale : ${IMAGE_LIMITS.minWidth}px.`)
    .max(IMAGE_LIMITS.maxWidth, `Largeur maximale : ${IMAGE_LIMITS.maxWidth}px.`),
  height: z
    .number()
    .int()
    .min(IMAGE_LIMITS.minHeight, `Hauteur minimale : ${IMAGE_LIMITS.minHeight}px.`)
    .max(IMAGE_LIMITS.maxHeight, `Hauteur maximale : ${IMAGE_LIMITS.maxHeight}px.`),
  mimeType: z.enum(IMAGE_LIMITS.allowedMimeTypes),
});

export type ImageLimits = z.infer<typeof imageLimitsSchema>;

// ---------------------------------------------------------------------------
// Helpers purs
// ---------------------------------------------------------------------------

export function isAllowedMimeType(mimeType: string): boolean {
  return (IMAGE_LIMITS.allowedMimeTypes as readonly string[]).includes(mimeType);
}

export function isWithinSizeLimit(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= IMAGE_LIMITS.maxSizeBytes;
}

export function isWithinDimensions(width: number, height: number): boolean {
  return (
    width >= IMAGE_LIMITS.minWidth &&
    width <= IMAGE_LIMITS.maxWidth &&
    height >= IMAGE_LIMITS.minHeight &&
    height <= IMAGE_LIMITS.maxHeight
  );
}