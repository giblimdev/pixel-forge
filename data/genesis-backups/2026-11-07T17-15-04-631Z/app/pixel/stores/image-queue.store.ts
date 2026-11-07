/*
path:            app/pixel/stores/image-queue.store.ts
tag:             ["pixel", "store", "queue", "zustand"]
projectId:       <Pixel-fotgen>
type:            store
generic:         false

role:            Etat global de la file d'attente PixelForge. Contient
                 UNIQUEMENT les donnees (items + compteurs derives via
                 selecteurs). AUCUNE logique metier : le store ne traite
                 pas d'images, il ne fait qu'ajouter / retirer / changer
                 le statut des elements. Les hooks use-* de chaque
                 feature appellent les routes API et mettent a jour le
                 store via setStatus / setProgress.

                 Selecteurs exposes pour eviter de re-render sur tout
                 le store : selectItems, selectTotal, selectDone,
                 selectRunning, selectPending, selectFailed,
                 selectProgress. La progression globale est calculee a
                 la volee (pas stockee) pour rester coherente.

                 Nettoyage : remove() et clear() revoquent systematiquement
                 les URL.createObjectURL associees aux SourceImage pour
                 eviter les fuites memoire (règle Phase 5).

flow:            create<ImageQueueState>()(devtools(persist(...))) ->
                 etat initial { items: [] } -> actions
                 add, addMany, remove, clear, setStatus, setProgress,
                 setResult, setError -> selecteurs derives.

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
                  "selectDone", "selectRunning", "selectPending",
                  "selectFailed", "selectProgress"]
useBy:           ["@/app/pixel/components/image-queue/queue-item.tsx",
                  "@/app/pixel/components/image-queue/queue-toolbar.tsx",
                  "@/app/pixel/components/image-queue/queue-progress.tsx",
                  "@/app/pixel/components/image-queue/queue-empty.tsx",
                  "@/app/pixel/components/image-queue/image-queue.tsx"]

userStories:     ["*en tant qu'utilisateur je veux une file d'attente globale partagee entre les outils"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
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

interface ImageQueueActions {
  readonly add: (source: SourceImage) => void;
  readonly addMany: (sources: readonly SourceImage[]) => void;
  readonly remove: (id: string) => void;
  readonly clear: () => void;
  readonly setStatus: (id: string, status: ProcessingStatus) => void;
  readonly setProgress: (id: string, progress: number | null) => void;
  readonly setResult: (
    id: string,
    result: QueueItem["result"],
  ) => void;
  readonly setError: (id: string, error: ProcessingError) => void;
}

export interface ImageQueueStore {
  readonly items: readonly QueueItem[];
  readonly add: ImageQueueActions["add"];
  readonly addMany: ImageQueueActions["addMany"];
  readonly remove: ImageQueueActions["remove"];
  readonly clear: ImageQueueActions["clear"];
  readonly setStatus: ImageQueueActions["setStatus"];
  readonly setProgress: ImageQueueActions["setProgress"];
  readonly setResult: ImageQueueActions["setResult"];
  readonly setError: ImageQueueActions["setError"];
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
          items: state.items.map((item) =>
            item.source.id === id
              ? {
                  ...item,
                  result,
                  error: null,
                  status: "done",
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
// Selecteurs derives (composes dans les composants via useImageQueueStore)
// ---------------------------------------------------------------------------

export const selectItems = (s: ImageQueueStore): readonly QueueItem[] =>
  s.items;

export const selectTotal = (s: ImageQueueStore): number => s.items.length;

export const selectDone = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "done").length;

export const selectRunning = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "running").length;

export const selectPending = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "pending").length;

export const selectFailed = (s: ImageQueueStore): number =>
  s.items.filter((i) => i.status === "error").length;

export const selectProgress = (s: ImageQueueStore): QueueProgress => {
  const total = s.items.length;
  const completed = s.items.filter(
    (i) =>
      i.status === "done" ||
      i.status === "error" ||
      i.status === "success",
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percent,
    isComplete: total > 0 && completed === total,
  };
};