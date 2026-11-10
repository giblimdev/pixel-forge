/*
path :           app/pixel/features/crop-editor/types/crop-editor.types.ts
tag :            ["pixelforge", "crop-editor", "types", "react-easy-crop"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Contrats de l'éditeur de recadrage manuel (outil 06).
                 Alignés sur l'API react-easy-crop : pas de types Konva,
                 pas de coordonnées de nœuds. `croppedAreaPixels` est la
                 sortie directement consommable par l'endpoint serveur.

flow:            Consommé par use-crop-editor.ts (état local) et par
                 api/images/crop/route.ts (mode: "manual") pour décoder
                 les coordonnées côté serveur.

ecosystem:       PixelForge = [
                   "app/pixel/features/crop-editor/types/crop-editor.types.ts",
                 ]
relatedFiles:    [
                   "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "app/api/images/crop/route.ts",
                 ]
imports:         ["react-easy-crop"]
exports:         [
                   "CropArea",
                   "CropState",
                   "CropTransform",
                   "CropEditorResult",
                 ]
useBy:           [
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                 ]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { Area, Point } from "react-easy-crop";

/** Zone de recadrage exprimée en pixels de l'image source. */
export type CropArea = Area; // { x, y, width, height }

/** État contrôlé du composant <Cropper />. */
export type CropState = {
  crop: Point;
  zoom: number;
  rotation: number; // degrés, 0-360
  aspect: number | undefined; // undefined = libre
};

/** Transformations géométriques appliquées avant/après le recadrage. */
export type CropTransform = {
  rotate: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
};

/** Résultat complet transmis à l'endpoint /api/images/crop (mode manual). */
export type CropEditorResult = {
  croppedAreaPixels: CropArea;
  transform: CropTransform;
  outputFormat: "jpeg" | "png" | "webp";
  quality?: number; // 1-100, ignoré pour png lossless
};