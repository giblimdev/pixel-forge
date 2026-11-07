/*
path :           app/pixel/types/processing.ts
tag :            ["pixel", "pixel-forge", "types", "processing", "errors",
                  "contract", "history"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats communs de traitement pour PixelForge :
                 statuts, erreurs structurées, résultat discriminé, et
                 interface d'adaptateur d'historique (no-op par défaut,
                 implémentation Prisma optionnelle en Phase 19). Aucune
                 dépendance runtime. Importable client ET serveur.

                 Le contrat `ProcessingResult<T>` est générique et
                 discriminé : `{ ok: true, data }` ou `{ ok: false, error }`.
                 Aligné sur `ActionResult<T>` de @/lib/actions/result (mais
                 défini localement pour éviter le couplage avec les Server
                 Actions — PixelForge utilise des routes HTTP, pas des
                 Server Actions).

flow:            Module TypeScript pur → export des types + constantes.

ecosystem:       Types = [
                   "@/app/pixel/types/processing.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/queue.ts",
                 ]

relatedFiles:    ["@/lib/actions/result.ts",
                  "@/app/pixel/types/image.ts"]

imports:         []

exports:         ["ProcessingStatus",
                  "ProcessingErrorCode",
                  "ProcessingError",
                  "ProcessingResult",
                  "ProcessingType",
                  "ProcessingHistoryEntry",
                  "HistoryAdapter",
                  "noopHistoryAdapter",
                  "PROCESSING_ERROR_MESSAGES"]

useBy:           ["@/app/pixel/types/queue.ts",
                  "@/app/pixel/types/export.ts",
                  "@/app/pixel/features/*/hooks/use-*.ts",
                  "@/app/api/images/*/route.ts"]

userStories:     ["*en tant que développeur je veux un contrat de traitement et d'erreur PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/* ------------------------------------------------------------------ */
/*  Statuts                                                            */
/* ------------------------------------------------------------------ */

/**
 * Statut d'un élément dans la file d'attente.
 * - `pending` : uploadé, pas encore traité.
 * - `running` : traitement en cours.
 * - `done`    : traité avec succès.
 * - `error`   : traitement échoué (voir `error`).
 * - `cancelled` : annulé par l'utilisateur avant la fin.
 */
export type ProcessingStatus =
  | "pending"
  | "running"
  | "done"
  | "error"
  | "cancelled";

/* ------------------------------------------------------------------ */
/*  Erreurs structurées                                                */
/* ------------------------------------------------------------------ */

/**
 * Codes d'erreur stables, utilisés côté client pour adapter l'UI
 * (message, retry, action corrective) et côté serveur pour les logs.
 *
 * Convention : SCREAMING_SNAKE_CASE, préfixé par le domaine si ambigu.
 */
export type ProcessingErrorCode =
  | "INVALID_INPUT"          // Paramètres invalides (Zod)
  | "UNSUPPORTED_FORMAT"     // Format non supporté par Sharp
  | "UNSUPPORTED_OPTION"     // Option non supportée par le format
  | "LIMIT_EXCEEDED"         // Taille / dimensions / pixels dépassés
  | "DECODE_FAILED"          // Sharp ne peut pas décoder le fichier
  | "PROCESSING_ERROR"       // Erreur Sharp générique
  | "STORAGE_ERROR"          // Erreur @vercel/blob
  | "ARCHIVE_ERROR"          // Erreur archiver
  | "TIMEOUT"                // Traitement > maxDuration
  | "UNKNOWN";

/**
 * Erreur structurée retournée par les routes API.
 * - `code` : stable, utilisé par l'UI.
 * - `message` : lisible par l'utilisateur final (français).
 * - `details` : optionnel, technique (logs, jamais exposé brut à l'UI).
 */
export interface ProcessingError {
  readonly code: ProcessingErrorCode;
  readonly message: string;
  readonly details?: unknown;
}

/**
 * Messages français par défaut pour chaque code d'erreur.
 * Utilisé côté serveur pour construire `ProcessingError.message`, et
 * côté client comme fallback.
 */
export const PROCESSING_ERROR_MESSAGES: Record<ProcessingErrorCode, string> = {
  INVALID_INPUT: "Paramètres invalides.",
  UNSUPPORTED_FORMAT: "Format non supporté.",
  UNSUPPORTED_OPTION: "Option non supportée par ce format.",
  LIMIT_EXCEEDED: "Limite dépassée (taille, dimensions ou pixels).",
  DECODE_FAILED: "Impossible de lire l'image.",
  PROCESSING_ERROR: "Erreur lors du traitement de l'image.",
  STORAGE_ERROR: "Erreur lors du stockage temporaire.",
  ARCHIVE_ERROR: "Erreur lors de la création de l'archive.",
  TIMEOUT: "Traitement trop long. Réessayez avec moins de fichiers.",
  UNKNOWN: "Erreur inconnue.",
};

/* ------------------------------------------------------------------ */
/*  Résultat discriminé                                                */
/* ------------------------------------------------------------------ */

/**
 * Résultat discriminé : soit succès avec data, soit échec avec error.
 * Aligné sur ActionResult<T> de @/lib/actions/result mais défini
 * localement (PixelForge utilise des routes HTTP, pas des Server Actions).
 */
export type ProcessingResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ProcessingError };

/* ------------------------------------------------------------------ */
/*  Historique (Phase 19 — optionnel)                                  */
/* ------------------------------------------------------------------ */

/**
 * Types d'opération historisables.
 * Utilisé en Phase 19 pour filtrer/classer les entrées.
 */
export type ProcessingType =
  | "convert"
  | "optimize"
  | "compress"
  | "resize"
  | "smart-crop"
  | "crop-manual"
  | "background-removal"
  | "retouch"
  | "favicon"
  | "placeholder"
  | "palette"
  | "metadata";

/**
 * Entrée d'historique d'un traitement. Ne contient JAMAIS de Buffer
 * binaire — uniquement des métadonnées (paramètres, statut, résultat
 * sérialisable).
 */
export interface ProcessingHistoryEntry {
  readonly id: string;
  readonly type: ProcessingType;
  readonly createdAt: string; // ISO 8601
  readonly params: Readonly<Record<string, unknown>>;
  readonly status: "success" | "partial" | "error";
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Adaptateur d'historique. Permet d'ajouter Prisma en Phase 19 sans
 * refactorer les hooks. Par défaut : `noopHistoryAdapter` (aucune
 * persistance).
 */
export interface HistoryAdapter {
  readonly save: (entry: ProcessingHistoryEntry) => Promise<void>;
  readonly list: (
    limit: number,
  ) => Promise<readonly ProcessingHistoryEntry[]>;
}

/**
 * Implémentation no-op : aucune persistance. Utilisée tant que la
 * Phase 19 (Prisma) n'est pas livrée.
 */
export const noopHistoryAdapter: HistoryAdapter = {
  save: async () => {},
  list: async () => [],
};