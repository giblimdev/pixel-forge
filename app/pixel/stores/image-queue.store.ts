/*
path:            app/pixel/stores/image-queue.store.ts
tag:             ["pixel", "store", "queue", "zustand"]
projectId:       <Pixel-fotgen>
type:            store
generic:         false

role:            État global de la file d'attente PixelForge. Contient
                 UNIQUEMENT les données (items + compteurs dérivés via
                 sélecteurs). AUCUNE logique métier : le store ne traite
                 pas d'images, il ne fait qu'ajouter / retirer / changer
                 le statut des éléments. Les hooks use-* de chaque
                 feature appellent les routes API et mettent à jour le
                 store via setStatus / setProgress / setResult / setError.

                 ⚠️ SOURCE UNIQUE DE VÉRITÉ DES STATUTS :
                 le statut d'un item est un ProcessingStatus importé
                 depuis @/app/pixel/types/processing. Les 5 valeurs
                 possibles sont exactement ["pending", "running",
                 "success", "partial", "error"]. IL N'Y A PAS de statut
                 "cancelled" ni "done". Le type ProcessingResult (qui
                 utilise "done") est un AUTRE contrat propre au résultat
                 d'un traitement, pas au statut d'un item de file.

                 Les sélecteurs exposés reflètent les 5 statuts :
                 selectItems, selectTotal, selectSuccess, selectPartial,
                 selectRunning, selectPending, selectError,
                 selectProgress. Pour les compteurs agrégés "par
                 catégorie", selectCounts retourne un objet stable
                 (success, partial, error, running, pending) —
                 ATTENTION : selectProgress ET selectCounts créent un
                 nouvel objet à chaque appel, donc le composant
                 consommateur DOIT utiliser useShallow
                 (zustand/react/shallow) pour éviter les re-renders
                 infinis.

flow:            create<ImageQueueStore>()(devtools(...)) -> état
                 initial { items: [] } -> actions add, addMany, remove,
                 clear, setStatus, setProgress, setResult, setError,
                 setPartial -> sélecteurs dérivés.

ecosystem:       Queue = [
                   "@/app/pixel/stores/image-queue.store.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/queue.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts"]
imports:         ["zustand", "zustand/middleware",
                  "@/app/pixel/types/queue",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing"]
exports:         ["useImageQueueStore", "selectItems", "selectTotal",
                  "selectSuccess", "selectPartial", "selectRunning",
                  "selectPending", "selectError", "selectCounts",
                  "selectProgress"]
useBy:           ["@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une file d'attente globale partagée entre les outils"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : store Zustand = state navigateur.

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { QueueItem, QueueProgress } from "@/app/pixel/types/queue";
import type { SourceImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingStatus,
} from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Types du store
// ---------------------------------------------------------------------------

export interface ImageQueueStore {
  readonly items: readonly QueueItem[];
  readonly add: (source: SourceImage) => void;
  readonly addMany: (sources: readonly SourceImage[]) => void;
  readonly remove: (id: string) => void;
  readonly clear: () => void;
  readonly setStatus: (id: string, status: ProcessingStatus) => void;
  readonly setProgress: (id: string, progress: number | null) => void;
  /**
   * Marque un item en succès total (status "success", error reset,
   * progress 100). Utilisé par les hooks quand le serveur répond 200
   * pour un fichier unique ou pour chaque fichier d'un lot réussi.
   */
  readonly setResult: (id: string, result: QueueItem["result"]) => void;
  /**
   * Marque un item en succès PARTIEL (status "partial") : le résultat
   * existe mais une erreur annexe a été remontée par le serveur (ex.
   * lot avec un fichier en échec, mais ce fichier précis a réussi).
   * Contrairement à setResult, ne réinitialise pas `error`.
   */
  readonly setPartial: (
    id: string,
    result: QueueItem["result"],
    error: ProcessingError | null,
  ) => void;
  /**
   * Marque un item en erreur (status "error", error défini).
   * Utilisé quand le serveur répond avec un ProcessingError ou quand
   * le fetch lève une exception réseau.
   */
  readonly setError: (id: string, error: ProcessingError) => void;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function revokeSource(source: SourceImage): void {
  try {
    URL.revokeObjectURL(source.url);
  } catch {
    // best-effort : URL deja revoquee ou invalide.
  }
}

function withTimestamps(status: ProcessingStatus): {
  readonly status: ProcessingStatus;
  readonly updatedAt: string;
} {
  return { status, updatedAt: nowIso() };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useImageQueueStore = create<ImageQueueStore>()(
  devtools(
    (set) => ({
      items: [],

      add: (source) => {
        set((state) => {
          const item: QueueItem = {
            source,
            ...withTimestamps("pending"),
            result: null,
            error: null,
            progress: null,
            addedAt: nowIso(),
          };
          return { items: [...state.items, item] };
        });
      },

      addMany: (sources) => {
        set((state) => {
          const created: QueueItem[] = sources.map((source) => ({
            source,
            ...withTimestamps("pending"),
            result: null,
            error: null,
            progress: null,
            addedAt: nowIso(),
          }));
          return { items: [...state.items, ...created] };
        });
      },

      remove: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.source.id === id);
          if (item) revokeSource(item.source);
          return { items: state.items.filter((i) => i.source.id !== id) };
        });
      },

      clear: () => {
        set((state) => {
          for (const item of state.items) revokeSource(item.source);
          return { items: [] };
        });
      },

      setStatus: (id, status) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.source.id === id
              ? { ...item, ...withTimestamps(status) }
              : item,
          ),
        }));
      },

      setProgress: (id, progress) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.source.id === id
              ? { ...item, progress, updatedAt: nowIso() }
              : item,
          ),
        }));
      },

      setResult: (id, result) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.source.id !== id) return item;
            const updated: QueueItem = {
              ...item,
              result,
              error: null,
              status: "success",
              progress: 100,
              updatedAt: nowIso(),
            };
            return updated;
          }),
        }));
      },

      setPartial: (id, result, error) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.source.id === id
              ? {
                  ...item,
                  result,
                  error,
                  status: "partial",
                  progress: 100,
                  updatedAt: nowIso(),
                }
              : item,
          ),
        }));
      },

      setError: (id, error) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.source.id === id
              ? { ...item, error, status: "error", updatedAt: nowIso() }
              : item,
          ),
        }));
      },
    }),
    { name: "pixel-image-queue" },
  ),
);

// ---------------------------------------------------------------------------
// Selecteurs derives
// ---------------------------------------------------------------------------

export const selectItems = (s: ImageQueueStore): readonly QueueItem[] =>
  s.items;

export const selectTotal = (s: ImageQueueStore): number => s.items.length;

export const selectSuccess = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "success").length;

export const selectPartial = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "partial").length;

export const selectRunning = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "running").length;

export const selectPending = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "pending").length;

export const selectError = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "error").length;

/**
 * Compteurs agrégés par statut. Retourne un NOUVEL OBJET à chaque
 * appel → le composant consommateur DOIT utiliser useShallow
 * (zustand/react/shallow) pour éviter les re-renders infinis.
 */
export const selectCounts = (
  s: ImageQueueStore,
): {
  readonly total: number;
  readonly success: number;
  readonly partial: number;
  readonly error: number;
  readonly running: number;
  readonly pending: number;
} => {
  let success = 0;
  let partial = 0;
  let error = 0;
  let running = 0;
  let pending = 0;

  for (const item of s.items) {
    switch (item.status) {
      case "success":
        success += 1;
        break;
      case "partial":
        partial += 1;
        break;
      case "error":
        error += 1;
        break;
      case "running":
        running += 1;
        break;
      case "pending":
        pending += 1;
        break;
    }
  }

  return {
    total: s.items.length,
    success,
    partial,
    error,
    running,
    pending,
  };
};

/**
 * Progression agrégée. "completed" = success + partial + error
 * (un élément traité, même en erreur, est terminé du point de vue
 * de la progression). Retourne un NOUVEL OBJET à chaque appel →
 * utiliser useShallow côté composant.
 */
export const selectProgress = (s: ImageQueueStore): QueueProgress => {
  const total = s.items.length;
  let completed = 0;
  for (const item of s.items) {
    if (
      item.status === "success" ||
      item.status === "partial" ||
      item.status === "error"
    ) {
      completed += 1;
    }
  }
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percent,
    isComplete: total > 0 && completed === total,
  };
};