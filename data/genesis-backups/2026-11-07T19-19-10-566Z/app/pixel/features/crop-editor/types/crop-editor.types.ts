/*
path :           app/pixel/features/crop-editor/types/crop-editor.types.ts
tag :            ["pixelforge", "crop-editor", "types", "react-easy-crop", "editing"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Contrats de l'éditeur de recadrage manuel (outil 06).
                 Alignés sur l'API react-easy-crop : pas de types Konva,
                 pas de coordonnées de nœuds. `CropAreaPixels` est la
                 sortie directement consommable par l'endpoint serveur
                 /api/images/crop (mode: "manual"). Fournit aussi les
                 options par défaut, les étapes du cycle de vie et les
                 résultats discriminés succès/erreur consommés par
                 use-crop-editor.ts.

flow:            DEFAULT_CROP_EDITOR_OPTIONS → état initial du hook.
                 CropEditorOptions → options contrôlées par l'UI.
                 CropEditorStage → "idle" | "ready" | "processing" |
                 "success" | "error" | "partial".
                 CropEditorOutcome → union discriminée { ok: true, items }
                 | { ok: false, errors } | { ok: "partial", items, errors }.
                 CropAreaPixels → { x, y, width, height } en pixels image
                 source, transmis tel quel au serveur.

ecosystem:       PIXELFORGE_EDITING
relatedFiles:    [
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "app/pixel/features/crop-editor/store/crop-editor.store.ts",
                   "app/api/images/crop/route.ts",
                 ]
imports:         ["react-easy-crop"]
exports:         [
                   "CropAreaPixels",
                   "CropEditorOptions",
                   "CropEditorStage",
                   "CropEditorSuccessItem",
                   "CropEditorErrorItem",
                   "CropEditorOutcome",
                   "DEFAULT_CROP_EDITOR_OPTIONS",
                 ]
useBy:           [
                   "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "app/pixel/features/crop-editor/store/crop-editor.store.ts",
                 ]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { Area, Point } from "react-easy-crop";

/**
 * Zone de recadrage exprimée en pixels de l'image source.
 * Alias direct de `Area` de react-easy-crop : { x, y, width, height }.
 * `croppedAreaPixels` fourni par <Cropper /> est déjà dans ce format,
 * aucune conversion écran → image n'est nécessaire.
 */
export type CropAreaPixels = Area;

/**
 * Point de recadrage contrôlé (react-easy-crop).
 * { x, y } en coordonnées relatives au conteneur.
 */
export type CropPoint = Point;

/** Rotation autorisée (degrés), alignée sur sharp.rotate(). */
export type CropRotation = 0 | 90 | 180 | 270;

/** Format de sortie accepté par l'endpoint /api/images/crop. */
export type CropOutputFormat = "jpeg" | "png" | "webp";

/**
 * Options contrôlées par l'UI et transmises au hook.
 * Toutes les valeurs sont optionnelles à la construction ; les valeurs
 * par défaut sont fournies par DEFAULT_CROP_EDITOR_OPTIONS.
 */
export type CropEditorOptions = {
  /** Ratio d'aspect : number (1 = carré, 16/9, 4/3) ou undefined = libre. */
  readonly aspect: number | undefined;
  /** Zoom relatif, 1 = pas de zoom. */
  readonly zoom: number;
  /** Rotation en degrés (0, 90, 180, 270). */
  readonly rotation: CropRotation;
  /** Retournement horizontal. */
  readonly flipH: boolean;
  /** Retournement vertical. */
  readonly flipV: boolean;
  /** Format de sortie. */
  readonly outputFormat: CropOutputFormat;
  /** Qualité 1-100, ignorée pour png lossless. */
  readonly quality: number;
  /** Inclure les métadonnées EXIF/ICC dans la sortie. */
  readonly keepMetadata: boolean;
};

/**
 * Étapes du cycle de vie de l'éditeur.
 * - "idle" : aucun fichier chargé.
 * - "ready" : image chargée, prête à être recadrée.
 * - "processing" : requête serveur en cours.
 * - "success" : tous les fichiers traités.
 * - "partial" : certains fichiers traités, d'autres en erreur.
 * - "error" : aucun fichier traité.
 */
export type CropEditorStage =
  | "idle"
  | "ready"
  | "processing"
  | "success"
  | "partial"
  | "error";

/**
 * Résultat d'un fichier traité avec succès.
 * `url` est une URL temporaire servie par /api/temp/[id] (Décision 2).
 */
export type CropEditorSuccessItem = {
  readonly ok: true;
  /** Identifiant du traitement (généré côté serveur). */
  readonly id: string;
  /** Nom de fichier d'origine (pour traçabilité). */
  readonly sourceName: string;
  /** Nom de fichier de sortie, ex. "photo-crop.webp". */
  readonly filename: string;
  /** MIME réel de la sortie. */
  readonly mime: string;
  /** Taille en octets. */
  readonly size: number;
  /** Dimensions de sortie. */
  readonly width: number;
  /** Dimensions de sortie. */
  readonly height: number;
  /** URL temporaire téléchargeable. */
  readonly url: string;
};

/**
 * Résultat d'un fichier en erreur.
 * `code` reprend ProcessingErrorCode (app/pixel/types/processing.ts).
 */
export type CropEditorErrorItem = {
  readonly ok: false;
  /** Nom de fichier d'origine (pour traçabilité). */
  readonly sourceName: string;
  /** Code d'erreur stable. */
  readonly code:
    | "INVALID_INPUT"
    | "UNSUPPORTED_FORMAT"
    | "LIMIT_EXCEEDED"
    | "PROCESSING_ERROR";
  /** Message utilisateur (FR). */
  readonly message: string;
  /** Détails techniques non sensibles (log serveur uniquement). */
  readonly details?: unknown;
};

/**
 * Résultat discriminé d'un batch de recadrages.
 * Consommé par le hook pour dériver `stage` et afficher les résultats.
 */
export type CropEditorOutcome =
  | {
      readonly ok: true;
      readonly items: readonly CropEditorSuccessItem[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly CropEditorErrorItem[];
    }
  | {
      readonly ok: "partial";
      readonly items: readonly CropEditorSuccessItem[];
      readonly errors: readonly CropEditorErrorItem[];
    };

/**
 * Options par défaut de l'éditeur.
 * `aspect: undefined` = cadrage libre (pas de contrainte de ratio).
 * `quality: 82` = bon compromis poids/qualité pour webp/jpeg.
 * `keepMetadata: false` = vie privée par défaut (EXIF/GPS supprimés).
 */
export const DEFAULT_CROP_EDITOR_OPTIONS: CropEditorOptions = {
  aspect: undefined,
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
  outputFormat: "webp",
  quality: 82,
  keepMetadata: false,
} as const;