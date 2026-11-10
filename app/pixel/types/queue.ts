/*
path :           app/pixel/types/queue.ts
tag :            ["pixel", "pixel-forge", "types", "queue", "contract"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrats de la file d'attente côté client. Décrit un
                 élément de file (source + statut + résultat + erreur),
                 l'état global de la file (items + compteurs dérivés),
                 et la progression agrégée. Aucune dépendance runtime.
                 Importable client ET serveur (mais l'usage runtime est
                 client).

                 ⚠️ SOURCE UNIQUE DE VÉRITÉ DES STATUTS :
                 le statut d'un QueueItem est un ProcessingStatus
                 (importé depuis @/app/pixel/types/processing), PAS un
                 type propre à la file. Il n'y a donc PAS de statut
                 "cancelled" ni "done" : les 5 statuts possibles sont
                 exactement ["pending", "running", "success", "partial",
                 "error"]. Le type ProcessingResult (qui utilise "done"
                 pour l'état final d'un traitement) est un AUTRE contrat
                 et ne doit pas être confondu avec ProcessingStatus.

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
 * Cycle de vie (aligné sur ProcessingStatus) :
 * 1. Upload        → status "pending",  result null, error null.
 * 2. Traitement    → status "running",  progress optionnel (0-100).
 * 3. Succès total  → status "success",  result défini.
 * 4. Succès partiel→ status "partial",  result défini (certains
 *                    fichiers du lot ont échoué, d'autres non).
 * 5. Échec         → status "error",    error défini.
 *
 * Il n'existe PAS de statut "cancelled" (la suppression de la file
 * retire l'item) ni de statut "done" (le succès est "success").
 */
export interface QueueItem {
  /** Source uploadée (image entrante). */
  readonly source: SourceImage;
  /**
   * Statut courant. Réutilise ProcessingStatus (source unique de
   * vérité) — voir @/app/pixel/types/processing.
   */
  readonly status: ProcessingStatus;
  /** Résultat (défini si status === "success" ou "partial"). */
  readonly result: ResultImage | null;
  /** Erreur (définie si status === "error" ou "partial"). */
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
 * Ne contient AUCUNE logique — uniquement les données et les
 * compteurs dérivés par statut.
 */
export interface QueueState {
  readonly items: readonly QueueItem[];
  /** Nombre total d'éléments. */
  readonly total: number;
  /** Nombre d'éléments en succès total. */
  readonly success: number;
  /** Nombre d'éléments en succès partiel. */
  readonly partial: number;
  /** Nombre d'éléments en erreur. */
  readonly error: number;
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
 *
 * "completed" inclut success + partial + error : un élément traité
 * (même en erreur) est un élément terminé du point de vue de la
 * progression. La notion de succès est portée séparément par
 * QueueState.success.
 */
export interface QueueProgress {
  /** Nombre traité (success + partial + error). */
  readonly completed: number;
  /** Nombre total. */
  readonly total: number;
  /** Pourcentage 0-100. */
  readonly percent: number;
  /** La file est-elle entièrement terminée ? */
  readonly isComplete: boolean;
}