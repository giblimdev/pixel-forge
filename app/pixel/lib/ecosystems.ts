/*
path :           app/pixel/lib/ecosystems.ts
tag :            ["pixelforge", "ecosystem", "constants", "foundation"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Source de vérité unique des domaines métier PixelForge.
                 Chaque domaine est un tableau readonly de chemins complets
                 triés alphabétiquement. Les en-têtes de tous les fichiers
                 PixelForge référencent ces constantes par leur nom
                 (`ecosystem: PIXELFORGE_ENGINE` par exemple) au lieu de
                 dupliquer le tableau sur ~200 fichiers, ce qui garantit
                 la cohérence et permet une évolution centralisée.

                 Les routes HTTP vivent sous `app/api/images/…` et
                 `app/api/temp/…` (convention Next.js idiomatique, hors de
                 l'espace `/pixel`). Le fichier de navigation est
                 `app/pixel/dataNav.ts`.

flow:            Importé uniquement par app/pixel/dev/page.tsx (affichage
                 de la carte des domaines) et par les en-têtes (référence
                 documentaire). Aucune logique runtime : uniquement des
                 constantes `as const`.

ecosystem:       PIXELFORGE_FOUNDATION
relatedFiles:    [
                   "app/pixel/dev/page.tsx",
                   "app/pixel/dataNav.ts",
                   "next.config.ts",
                 ]
imports:         []
exports:         [
                   "PIXELFORGE_FOUNDATION",
                   "PIXELFORGE_CONTRACTS",
                   "PIXELFORGE_ENGINE",
                   "PIXELFORGE_API",
                   "PIXELFORGE_CONVERSION",
                   "PIXELFORGE_OPTIMIZATION",
                   "PIXELFORGE_EDITING",
                   "PIXELFORGE_GENERATION",
                   "PIXELFORGE_ANALYSIS",
                   "PIXELFORGE_UX",
                   "PIXELFORGE_DOMAINS",
                   "PixelForgeDomain",
                 ]
useBy:           ["app/pixel/dev/page.tsx"]

userStories:     ["*en tant que développeur je veux une source unique des domaines PixelForge"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/**
 * Domaine 01 — Fondations PixelForge.
 * Layout, page racine, dashboard, navigation, configuration Next.js,
 * environnement, et ce fichier lui-même.
 */
export const PIXELFORGE_FOUNDATION = [
  "app/pixel/components/PixelNav.tsx",
  "app/pixel/dashboard/loading.tsx",
  "app/pixel/dashboard/page.tsx",
  "app/pixel/dataNav.ts",
  "app/pixel/dev/page.tsx",
  "app/pixel/layout.tsx",
  "app/pixel/lib/ecosystems.ts",
  "app/pixel/page.tsx",
  "lib/env.ts",
  "next.config.ts",
  "package.json",
] as const;

/**
 * Domaine 02 — Contrats TypeScript et schémas Zod transversaux.
 * Modèles partagés entre UI, hooks, routes et moteur.
 */
export const PIXELFORGE_CONTRACTS = [
  "app/pixel/lib/archive/archive.types.ts",
  "app/pixel/lib/image-engine/image-engine.types.ts",
  "app/pixel/types/conversion.ts",
  "app/pixel/types/export.ts",
  "app/pixel/types/image.ts",
  "app/pixel/types/optimization.ts",
  "app/pixel/types/processing.ts",
  "app/pixel/types/queue.ts",
] as const;

/**
 * Domaine 03 — Moteur image, validateurs, archive et stockage temporaire.
 * Cœur technique serveur. Aucun composant React ici.
 */
export const PIXELFORGE_ENGINE = [
  "app/pixel/lib/archive/archive-builder.ts",
  "app/pixel/lib/archive/archive-entry.ts",
  "app/pixel/lib/archive/archive.types.ts",
  "app/pixel/lib/image-engine/formats/format-capabilities.ts",
  "app/pixel/lib/image-engine/formats/format-detection.ts",
  "app/pixel/lib/image-engine/formats/format-mime.ts",
  "app/pixel/lib/image-engine/formats/format-registry.ts",
  "app/pixel/lib/image-engine/image-engine.ts",
  "app/pixel/lib/image-engine/image-engine.types.ts",
  "app/pixel/lib/image-engine/index.ts",
  "app/pixel/lib/image-engine/metadata/metadata-reader.ts",
  "app/pixel/lib/image-engine/metadata/metadata-stripper.ts",
  "app/pixel/lib/image-engine/metadata/metadata-writer.ts",
  "app/pixel/lib/image-engine/optimization/compression.ts",
  "app/pixel/lib/image-engine/optimization/image-analysis.ts",
  "app/pixel/lib/image-engine/optimization/optimization.ts",
  "app/pixel/lib/image-engine/optimization/quality.ts",
  "app/pixel/lib/image-engine/optimization/target-size.ts",
  "app/pixel/lib/image-engine/sharp/index.ts",
  "app/pixel/lib/image-engine/sharp/sharp.adapter.ts",
  "app/pixel/lib/image-engine/sharp/sharp.factory.ts",
  "app/pixel/lib/image-engine/sharp/sharp.options.ts",
  "app/pixel/lib/image-engine/transformations/crop.ts",
  "app/pixel/lib/image-engine/transformations/filters.ts",
  "app/pixel/lib/image-engine/transformations/flip.ts",
  "app/pixel/lib/image-engine/transformations/resize.ts",
  "app/pixel/lib/image-engine/transformations/rotate.ts",
  "app/pixel/lib/image-engine/transformations/watermark.ts",
  "app/pixel/lib/storage/temp-cleanup.ts",
  "app/pixel/lib/validators/file-validator.ts",
  "app/pixel/lib/validators/image-limits.ts",
  "app/pixel/lib/validators/image-validator.ts",
  "app/pixel/lib/validators/mime-validator.ts",
  "app/pixel/lib/validators/svg-sanitizer.ts",
] as const;

/**
 * Domaine 04 — Routes HTTP /api/images/* et /api/temp/*.
 * Routes minces : parsing + validation + appel moteur + sérialisation.
 * Emplacement Next.js idiomatique, hors de l'espace /pixel.
 */
export const PIXELFORGE_API = [
  "app/api/images/background/route.ts",
  "app/api/images/compress/route.ts",
  "app/api/images/convert/route.ts",
  "app/api/images/crop/route.ts",
  "app/api/images/export/route.ts",
  "app/api/images/favicon/route.ts",
  "app/api/images/metadata/route.ts",
  "app/api/images/optimize/route.ts",
  "app/api/images/palette/route.ts",
  "app/api/images/placeholder/route.ts",
  "app/api/images/resize/route.ts",
  "app/api/images/retouch/route.ts",
  "app/api/temp/[id]/route.ts",
] as const;

/**
 * Domaine 05 — Outil 01 : Convertisseur universel.
 */
export const PIXELFORGE_CONVERSION = [
  "app/pixel/convert/loading.tsx",
  "app/pixel/convert/page.tsx",
  "app/pixel/features/converter/components/conversion-results.tsx",
  "app/pixel/features/converter/components/converter-panel.tsx",
  "app/pixel/features/converter/components/format-selector.tsx",
  "app/pixel/features/converter/components/quality-control.tsx",
  "app/pixel/features/converter/hooks/use-converter.ts",
  "app/pixel/features/converter/index.ts",
  "app/pixel/features/converter/schemas/converter.schema.ts",
  "app/pixel/features/converter/types/converter.types.ts",
] as const;

/**
 * Domaine 06 — Outils 02 à 05 : Optimiseur, Compresseur, Resize, Smart crop.
 */
export const PIXELFORGE_OPTIMIZATION = [
  "app/pixel/features/compressor/components/compression-results.tsx",
  "app/pixel/features/compressor/components/compression-settings.tsx",
  "app/pixel/features/compressor/components/compressor-panel.tsx",
  "app/pixel/features/compressor/hooks/use-compressor.ts",
  "app/pixel/features/compressor/index.ts",
  "app/pixel/features/compressor/schemas/compressor.schema.ts",
  "app/pixel/features/compressor/types/compressor.types.ts",
  "app/pixel/features/optimizer/components/optimization-presets.tsx",
  "app/pixel/features/optimizer/components/optimization-results.tsx",
  "app/pixel/features/optimizer/components/optimizer-panel.tsx",
  "app/pixel/features/optimizer/components/target-size-control.tsx",
  "app/pixel/features/optimizer/hooks/use-optimizer.ts",
  "app/pixel/features/optimizer/index.ts",
  "app/pixel/features/optimizer/schemas/optimizer.schema.ts",
  "app/pixel/features/optimizer/types/optimizer.types.ts",
  "app/pixel/features/resize/components/aspect-ratio-control.tsx",
  "app/pixel/features/resize/components/dimensions-input.tsx",
  "app/pixel/features/resize/components/resize-panel.tsx",
  "app/pixel/features/resize/components/resize-presets.tsx",
  "app/pixel/features/resize/hooks/use-resize.ts",
  "app/pixel/features/resize/index.ts",
  "app/pixel/features/resize/schemas/resize.schema.ts",
  "app/pixel/features/resize/types/resize.types.ts",
  "app/pixel/features/smart-crop/components/crop-preview.tsx",
  "app/pixel/features/smart-crop/components/crop-ratio-selector.tsx",
  "app/pixel/features/smart-crop/components/smart-crop-panel.tsx",
  "app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
  "app/pixel/features/smart-crop/index.ts",
  "app/pixel/features/smart-crop/schemas/smart-crop.schema.ts",
  "app/pixel/features/smart-crop/types/smart-crop.types.ts",
  "app/pixel/optimize/compress/page.tsx",
  "app/pixel/optimize/page.tsx",
  "app/pixel/optimize/resize/page.tsx",
  "app/pixel/optimize/smart-crop/page.tsx",
] as const;

/**
 * Domaine 07 — Outils 06 à 08 : Recadrage, Détourage, Retouche + filigrane.
 */
export const PIXELFORGE_EDITING = [
  "app/pixel/edit/background/page.tsx",
  "app/pixel/edit/crop/page.tsx",
  "app/pixel/edit/page.tsx",
  "app/pixel/edit/retouch/page.tsx",
  "app/pixel/features/background-removal/components/background-panel.tsx",
  "app/pixel/features/background-removal/components/background-preview.tsx",
  "app/pixel/features/background-removal/components/background-settings.tsx",
  "app/pixel/features/background-removal/hooks/use-background-removal.ts",
  "app/pixel/features/background-removal/index.ts",
  "app/pixel/features/background-removal/schemas/background.schema.ts",
  "app/pixel/features/background-removal/types/background.types.ts",
  "app/pixel/features/crop-editor/components/crop-canvas.tsx",
  "app/pixel/features/crop-editor/components/crop-controls.tsx",
  "app/pixel/features/crop-editor/components/crop-preview.tsx",
  "app/pixel/features/crop-editor/components/crop-toolbar.tsx",
  "app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
  "app/pixel/features/crop-editor/index.ts",
  "app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
  "app/pixel/features/crop-editor/store/crop-editor.store.ts",
  "app/pixel/features/crop-editor/types/crop-editor.types.ts",
  "app/pixel/features/image-editor/components/adjustment-controls.tsx",
  "app/pixel/features/image-editor/components/editor-sidebar.tsx",
  "app/pixel/features/image-editor/components/editor-toolbar.tsx",
  "app/pixel/features/image-editor/components/preview-canvas.tsx",
  "app/pixel/features/image-editor/components/watermark-editor.tsx",
  "app/pixel/features/image-editor/hooks/use-image-editor.ts",
  "app/pixel/features/image-editor/index.ts",
  "app/pixel/features/image-editor/schemas/image-editor.schema.ts",
  "app/pixel/features/image-editor/store/image-editor.store.ts",
  "app/pixel/features/image-editor/types/image-editor.types.ts",
] as const;

/**
 * Domaine 08 — Outils 09 à 11 : Favicons, Placeholders, Palettes.
 */
export const PIXELFORGE_GENERATION = [
  "app/pixel/features/color-palette/components/palette-export.tsx",
  "app/pixel/features/color-palette/components/palette-panel.tsx",
  "app/pixel/features/color-palette/components/palette-preview.tsx",
  "app/pixel/features/color-palette/hooks/use-color-palette.ts",
  "app/pixel/features/color-palette/index.ts",
  "app/pixel/features/color-palette/schemas/palette.schema.ts",
  "app/pixel/features/color-palette/types/palette.types.ts",
  "app/pixel/features/favicon-generator/components/favicon-files.tsx",
  "app/pixel/features/favicon-generator/components/favicon-options.tsx",
  "app/pixel/features/favicon-generator/components/favicon-panel.tsx",
  "app/pixel/features/favicon-generator/components/favicon-preview.tsx",
  "app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
  "app/pixel/features/favicon-generator/index.ts",
  "app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
  "app/pixel/features/favicon-generator/types/favicon.types.ts",
  "app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
  "app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
  "app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
  "app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
  "app/pixel/features/placeholder-generator/index.ts",
  "app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
  "app/pixel/features/placeholder-generator/types/placeholder.types.ts",
  "app/pixel/generate/favicon/page.tsx",
  "app/pixel/generate/page.tsx",
  "app/pixel/generate/palette/page.tsx",
  "app/pixel/generate/placeholder/page.tsx",
] as const;

/**
 * Domaine 09 — Outil 12 : Analyse et métadonnées.
 */
export const PIXELFORGE_ANALYSIS = [
  "app/pixel/analyze/metadata/page.tsx",
  "app/pixel/analyze/page.tsx",
  "app/pixel/features/metadata/components/metadata-actions.tsx",
  "app/pixel/features/metadata/components/metadata-details.tsx",
  "app/pixel/features/metadata/components/metadata-panel.tsx",
  "app/pixel/features/metadata/hooks/use-image-metadata.ts",
  "app/pixel/features/metadata/index.ts",
  "app/pixel/features/metadata/schemas/metadata.schema.ts",
  "app/pixel/features/metadata/types/metadata.types.ts",
] as const;

/**
 * Domaine 10 — Composants transversaux et stores.
 * Réutilisés par toutes les features. Ni moteur, ni route.
 */
export const PIXELFORGE_UX = [
  "app/pixel/components/export-manager/export-item.tsx",
  "app/pixel/components/export-manager/export-manager.tsx",
  "app/pixel/components/export-manager/export-options.tsx",
  "app/pixel/components/export-manager/export-progress.tsx",
  "app/pixel/components/export-manager/export-zip-button.tsx",
  "app/pixel/components/feedback/empty-state.tsx",
  "app/pixel/components/feedback/error-message.tsx",
  "app/pixel/components/feedback/processing-progress.tsx",
  "app/pixel/components/feedback/processing-status.tsx",
  "app/pixel/components/image-comparison/comparison-slider.tsx",
  "app/pixel/components/image-comparison/comparison-stats.tsx",
  "app/pixel/components/image-comparison/image-comparison.tsx",
  "app/pixel/components/image-comparison/transparency-grid.tsx",
  "app/pixel/components/image-preview/image-lightbox.tsx",
  "app/pixel/components/image-preview/image-placeholder.tsx",
  "app/pixel/components/image-preview/image-preview.tsx",
  "app/pixel/components/image-preview/image-thumbnail.tsx",
  "app/pixel/components/image-properties/image-color-info.tsx",
  "app/pixel/components/image-properties/image-dimensions.tsx",
  "app/pixel/components/image-properties/image-file-info.tsx",
  "app/pixel/components/image-properties/image-properties.tsx",
  "app/pixel/components/image-queue/image-queue.tsx",
  "app/pixel/components/image-queue/queue-empty.tsx",
  "app/pixel/components/image-queue/queue-item.tsx",
  "app/pixel/components/image-queue/queue-progress.tsx",
  "app/pixel/components/image-queue/queue-toolbar.tsx",
  "app/pixel/components/image-upload/clipboard-upload.tsx",
  "app/pixel/components/image-upload/dropzone.tsx",
  "app/pixel/components/image-upload/file-picker.tsx",
  "app/pixel/components/image-upload/image-uploader.tsx",
  "app/pixel/components/image-upload/upload-preview.tsx",
  "app/pixel/stores/image-queue.store.ts",
  "app/pixel/stores/settings.store.ts",
  "app/pixel/stores/workspace.store.ts",
] as const;

/**
 * Type union des identifiants de domaines PixelForge.
 */
export type PixelForgeDomain =
  | "PIXELFORGE_FOUNDATION"
  | "PIXELFORGE_CONTRACTS"
  | "PIXELFORGE_ENGINE"
  | "PIXELFORGE_API"
  | "PIXELFORGE_CONVERSION"
  | "PIXELFORGE_OPTIMIZATION"
  | "PIXELFORGE_EDITING"
  | "PIXELFORGE_GENERATION"
  | "PIXELFORGE_ANALYSIS"
  | "PIXELFORGE_UX";

/**
 * Carte nom → tableau, pour l'affichage dev et les vérifications de cohérence.
 */
export const PIXELFORGE_DOMAINS = {
  PIXELFORGE_FOUNDATION,
  PIXELFORGE_CONTRACTS,
  PIXELFORGE_ENGINE,
  PIXELFORGE_API,
  PIXELFORGE_CONVERSION,
  PIXELFORGE_OPTIMIZATION,
  PIXELFORGE_EDITING,
  PIXELFORGE_GENERATION,
  PIXELFORGE_ANALYSIS,
  PIXELFORGE_UX,
} as const;