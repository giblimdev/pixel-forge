/*
path:            app/pixel/features/converter/hooks/use-conversion-preview.ts
tag:             ["pixel", "feature", "converter", "hook", "preview"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client d'aperçu live du converter. Envoie le
                 fichier sélectionné (1er pending par défaut, ou choix
                 utilisateur) à /api/images/convert en mode mono avec
                 les options courantes, debounce 500 ms. Expose l'URL
                 objectURL du résultat, les métadonnées source/après,
                 et un cache mémoire (Map session) pour éviter les
                 re-requêtes identiques.

                 ⚠️ DÉCISIONS UX (validées) :
                 - Fichier par défaut : 1er item status === "pending".
                 - L'utilisateur peut choisir un autre fichier via un
                   strip de miniatures (ConversionPreview).
                 - Changer de fichier GARDE les options courantes
                   (format, quality, mode) : cohérent pour comparer.
                 - Debounce 500 ms sur changement d'options.
                 - File vide : status "empty" (message affiché par le
                   composant).

                 ⚠️ CACHE (stratégie session) :
                 Map<`${sourceId}|${format}|${quality}|${mode}`, { url,
                 sizeBytes, dimensions }>. Rempli à chaque preview
                 réussie. Les objectURL sont TOUS révoqués au démontage
                 du hook (cleanup). Pas de persistance entre sessions :
                 fermer/rouvrir le panneau vide le cache (accepté V1).
                 Un cache-hit évite le fetch et remet la preview
                 instantanément.

                 ⚠️ RACE CONDITION :
                 Un compteur `requestIdRef` incrémental + AbortController
                 garantissent qu'une réponse obsolète (l'utilisateur a
                 glissé quality plusieurs fois) est ignorée. Seule la
                 dernière requête compte.

flow:            useState(selectedSourceId, preview, status) +
                 useRef(cache, requestId, abortController)
                 -> useEffect([options, selectedSourceId]) :
                    - si file vide : status = "empty"
                    - si cache-hit : status = "ready" (instantané)
                    - sinon : debounce 500ms -> AbortController ->
                      fetch POST /api/images/convert (1 fichier, mode
                      mono) -> res.blob() -> objectURL -> cache.set ->
                      status = "ready"
                    - cleanup : clearTimeout + abort
                 -> cleanup global au démontage : revoke TOUS les
                    objectURL du cache + abort en cours.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/hooks/use-conversion-preview.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/conversion-preview.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/api/images/convert/route.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/conversion"]
exports:         ["UseConversionPreviewReturn", "ConversionPreviewState",
                  "useConversionPreview"]
useBy:           ["@/app/pixel/features/converter/components/conversion-preview.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le resultat reel de ma conversion avant de lancer le lot",
                  "*en tant qu'utilisateur je veux comparer plusieurs fichiers avec les memes reglages",
                  "*en tant qu'utilisateur je veux eviter les aller-retours de reglage"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useState, useEffect, useRef, fetch, objectURL.

import { useCallback, useEffect, useRef, useState } from "react";

import {
  selectItems,
  useImageQueueStore,
} from "@/app/pixel/stores/image-queue.store";
import type { ConversionOptions } from "@/app/pixel/types/conversion";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface ConversionPreviewSuccess {
  readonly url: string;
  readonly sourceId: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly sourceDimensions: { readonly width: number; readonly height: number };
  readonly resultSizeBytes: number;
  readonly resultDimensions: { readonly width: number; readonly height: number };
  readonly format: string;
  readonly durationMs: number;
}

export type ConversionPreviewState =
  | { readonly status: "empty" }
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: ConversionPreviewSuccess }
  | { readonly status: "error"; readonly message: string };

export interface UseConversionPreviewReturn {
  /** Fichier actuellement prévisualisé (id du SourceImage). */
  readonly selectedSourceId: string | null;
  /** Change le fichier à prévisualiser. */
  readonly setSelectedSourceId: (id: string) => void;
  /** Liste des fichiers prévisualisables (id + filename + url). */
  readonly availableFiles: readonly {
    readonly id: string;
    readonly filename: string;
    readonly url: string;
  }[];
  /** État courant de la preview. */
  readonly state: ConversionPreviewState;
}

// ---------------------------------------------------------------------------
// Types internes
// ---------------------------------------------------------------------------

type CacheKey = string;

interface CacheEntry {
  readonly url: string;
  readonly data: Omit<ConversionPreviewSuccess, "url">;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cacheKeyOf(
  sourceId: string,
  options: ConversionOptions,
): CacheKey {
  return [
    sourceId,
    options.format,
    options.quality,
    options.mode ?? "null",
    options.keepExif ? "exif" : "noexif",
    options.keepIcc ? "icc" : "noicc",
    options.resize
      ? `r:${options.resize.width}x${options.resize.height}:${options.resize.fit}`
      : "noresize",
  ].join("|");
}

function safeBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return base.replace(/[^\w.-]+/g, "-").slice(0, 200) || "image";
}

function extensionForFormat(format: string): string {
  if (format === "jpeg") return "jpg";
  return format;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConversionPreview(
  options: ConversionOptions,
): UseConversionPreviewReturn {
  const items = useImageQueueStore(selectItems);

  // Fichiers prévisualisables = tous les items de la file.
  const availableFiles = items.map((i) => ({
    id: i.source.id,
    filename: i.source.filename,
    url: i.source.url,
  }));

  // Fichier sélectionné : 1er pending par défaut, puis choix utilisateur.
  const firstPending = items.find((i) => i.status === "pending");
  const [selectedSourceId, setSelectedSourceIdState] = useState<string | null>(
    firstPending?.source.id ?? null,
  );

  // Si le fichier sélectionné disparaît de la file (clear, remove),
  // on retombe sur le 1er pending (ou null).
  useEffect(() => {
    if (selectedSourceId === null) {
      if (firstPending) setSelectedSourceIdState(firstPending.source.id);
      return;
    }
    const stillExists = items.some((i) => i.source.id === selectedSourceId);
    if (!stillExists) {
      setSelectedSourceIdState(firstPending?.source.id ?? null);
    }
  }, [items, selectedSourceId, firstPending]);

  const setSelectedSourceId = useCallback((id: string) => {
    setSelectedSourceIdState(id);
  }, []);

  // ---- Cache session (Map) : objectURL révoqués au démontage -----------
  const cacheRef = useRef<Map<CacheKey, CacheEntry>>(new Map());

  // ---- Race condition : compteur + AbortController ---------------------
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // ---- État exposé ------------------------------------------------------
  const [state, setState] = useState<ConversionPreviewState>(
    firstPending ? { status: "idle" } : { status: "empty" },
  );

  // ---- Effet principal : fetch debounced -------------------------------
  useEffect(() => {
    // Cleanup précédent (si options ou fichier changent)
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // File vide
    if (items.length === 0) {
      setState({ status: "empty" });
      return;
    }

    // Aucun fichier sélectionné
    if (selectedSourceId === null) {
      setState({ status: "idle" });
      return;
    }

    // Trouver le SourceImage dans la file
    const item = items.find((i) => i.source.id === selectedSourceId);
    if (!item) {
      setState({ status: "error", message: "Fichier introuvable." });
      return;
    }

    // Cache-hit ?
    const key = cacheKeyOf(selectedSourceId, options);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setState({
        status: "ready",
        data: { ...cached.data, url: cached.url },
      });
      return;
    }

    // Sinon : debounce 500 ms puis fetch mono
    setState({ status: "loading" });

    const myRequestId = ++requestIdRef.current;

    const timer = window.setTimeout(async () => {
      // Si une autre requête est partie entre-temps, abandonner.
      if (myRequestId !== requestIdRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const form = new FormData();
        form.append("files", item.source.file, item.source.filename);
        form.append("sourceIds", item.source.id);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/convert", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });

        // Course : une autre requête a démarré pendant le fetch.
        if (myRequestId !== requestIdRef.current) return;

        if (!res.ok) {
          const errBody: unknown = await res.json().catch(() => null);
          const message =
            (errBody as { error?: { message?: string } } | null)?.error
              ?.message ?? `Erreur HTTP ${res.status}.`;
          setState({ status: "error", message });
          return;
        }

        const blob = await res.blob();
        const mime =
          res.headers.get("Content-Type") ?? "application/octet-stream";
        const disposition = res.headers.get("Content-Disposition");
        const resultFilename =
          disposition?.match(/filename="(.+?)"/)?.[1] ??
          `${safeBasename(item.source.filename)}-preview.${extensionForFormat(options.format)}`;

        const url = URL.createObjectURL(
          new Blob([blob], { type: mime }),
        );

        // Dimensions source : lues côté client (createImageBitmap).
        // Pas de dépendance serveur pour ça — c'est juste pour l'affichage.
        let sourceDimensions = { width: 0, height: 0 };
        try {
          const bitmap = await createImageBitmap(item.source.file);
          sourceDimensions = {
            width: bitmap.width,
            height: bitmap.height,
          };
          bitmap.close();
        } catch {
          // best-effort
        }

        const previewData: Omit<ConversionPreviewSuccess, "url"> = {
          sourceId: item.source.id,
          sourceFilename: item.source.filename,
          sourceSizeBytes: item.source.sizeBytes,
          sourceDimensions,
          resultSizeBytes: blob.size,
          // Dimensions après : parsing du header X-PixelForge-Result-Id
          // ne donne pas les dimensions. On utilise le format connu
          // (JPEG/WebP conservent les dimensions source sauf resize).
          resultDimensions: options.resize
            ? {
                width: options.resize.width,
                height: options.resize.height,
              }
            : sourceDimensions,
          format: options.format,
          durationMs: Number(
            res.headers.get("X-PixelForge-Duration-Ms") ?? "0",
          ),
        };

        cacheRef.current.set(key, { url, data: previewData });

        setState({
          status: "ready",
          data: { ...previewData, url },
        });

        // Note : on ne revoke PAS l'objectURL ici (il est dans le cache
        // et sert à l'affichage). Le revoke est fait au démontage.
        // resultFilename est calculé mais pas exposé — cohérence avec
        // le nom final sera faite dans ConversionResults après batch.
        void resultFilename;
      } catch (err) {
        if (controller.signal.aborted) return;
        if (myRequestId !== requestIdRef.current) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Erreur inconnue.",
        });
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [items, selectedSourceId, options]);

  // ---- Cleanup global au démontage : revoke TOUS les objectURL --------
  useEffect(() => {
    return () => {
      for (const entry of cacheRef.current.values()) {
        URL.revokeObjectURL(entry.url);
      }
      cacheRef.current.clear();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
    selectedSourceId,
    setSelectedSourceId,
    availableFiles,
    state,
  };
}