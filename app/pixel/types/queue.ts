/*
path :           app/pixel/types/queue.ts
tag :            ["pixel", "pixel-forge", "types", "queue", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats de la file d'attente côté client. Décrit un
                 élément de file (source + statut + résultat + erreur),
                 l'état global de la file (items + progression globale),
                 et les actions exposées par le store Zustand. Aucune
                 dépendance runtime. Importable client ET serveur (mais
                 l'usage runtime est client).

                 ⚠️ La file est PUREMENT un conteneur d'état. Elle ne
                 traite PAS d'images elle-même. Le traitement passe
                 exclusivement par les routes API (via les hooks
                 use-* de chaque feature).

flow:            Module TypeScript pur → export des types.

ecosystem:       Types = [
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                   "@/app/pixel/types/queue.ts",
                 ]

relatedFiles:    ["@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/stores/image-queue.store.ts"]

imports:         ["@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]

exports:         ["QueueItem",
                  "QueueState",
                  "QueueProgress"]

useBy:           ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/components/image-queue/*.tsx"]

userStories:     ["*en tant que développeur je veux un contrat de file d'attente PixelForge"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { ResultImage, SourceImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingStatus,
} from "@/app/pixel/types/processing";

/* ------------------------------------------------------------------ */
/*  Élément de file                                                    */
/* ------------------------------------------------------------------ */

/**
 * Élément de la file d'attente.
 *
 * Cycle de vie :
 * 1. Upload → status "pending", result null, error null.
 * 2. Traitement → status "running", progress optionnel.
 * 3. Succès → status "done", result défini.
 * 4. Échec → status "error", error défini.
 * 5. Annulation → status "cancelled".
 */
export interface QueueItem {
  /** Source uploadée (image entrante). */
  readonly source: SourceImage;
  /** Statut courant. */
  readonly status: ProcessingStatus;
  /** Résultat (défini uniquement si status === "done"). */
  readonly result: ResultImage | null;
  /** Erreur (définie uniquement si status === "error"). */
  readonly error: ProcessingError | null;
  /**
   * Progression 0-100 si le traitement expose une progression
   * granulaire (rare : Sharp ne fournit pas de progression native).
   * null si non applicable.
   */
  readonly progress: number | null;
  /** Timestamp d'ajout (ISO 8601). */
  readonly addedAt: string;
  /** Timestamp du dernier changement de statut (ISO 8601). */
  readonly updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  État global                                                        */
/* ------------------------------------------------------------------ */

/**
 * État global de la file (dans le store Zustand).
 * Ne contient AUCUNE logique — uniquement les données.
 */
export interface QueueState {
  readonly items: readonly QueueItem[];
  /** Nombre total d'éléments. */
  readonly total: number;
  /** Nombre d'éléments en succès. */
  readonly done: number;
  /** Nombre d'éléments en erreur. */
  readonly failed: number;
  /** Nombre d'éléments en cours. */
  readonly running: number;
  /** Nombre d'éléments en attente. */
  readonly pending: number;
}

/* ------------------------------------------------------------------ */
/*  Progression globale                                                */
/* ------------------------------------------------------------------ */

/**
 * Progression agrégée de la file, calculée à la volée par le store.
 * Utilisée par le composant `queue-progress.tsx`.
 */
export interface QueueProgress {
  /** Nombre traité (done + error + cancelled). */
  readonly completed: number;
  /** Nombre total. */
  readonly total: number;
  /** Pourcentage 0-100. */
  readonly percent: number;
  /** La file est-elle entièrement terminée ? */
  readonly isComplete: boolean;
}