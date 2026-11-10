/*
path:            app/pixel/features/resize/hooks/use-resize.ts
tag:             ["pixel", "feature", "resize", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module resize. Meme pattern que
                 use-optimizer : lit la file, valide, POST
                 /api/images/resize, met a jour le store, expose
                 outcome.

                 Phase 19 : ajout d'une entree d'historique locale
                 (localStorage) a la fin de submit() si au moins un
                 fichier a ete traite avec succes.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/resize -> blob ou json -> setResult /
                 setError par fichier -> outcome -> recordHistory().

ecosystem:       Resize = [
                   "@/app/pixel/features/resize/types/resize.types.ts",
                   "@/app/pixel/features/resize/schemas/resize.schema.ts",
                   "@/app/pixel/features/resize/hooks/use-resize.ts",
                   "@/app/pixel/features/resize/components/dimensions-input.tsx",
                   "@/app/pixel/features/resize/components/aspect-ratio-control.tsx",
                   "@/app/pixel/features/resize/components/resize-presets.tsx",
                   "@/app/pixel/features/resize/components/resize-panel.tsx",
                   "@/app/pixel/features/resize/index.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/resize/types/resize.types.ts",
                  "@/app/pixel/lib/history/local-history.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/resize/types/resize.types",
                  "@/app/pixel/features/resize/schemas/resize.schema",
                  "@/app/pixel/lib/history/local-history"]
exports:         ["UseResizeReturn", "useResize"]
useBy:           ["@/app/pixel/features/resize/components/resize-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux redimensionner toute ma file",
                  "*en tant qu'utilisateur je veux retrouver mes redimensionnements dans mon historique"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useState + fetch + store Zustand + localStorage.

import { useCallback, useState } from "react";

import {
  selectItems,
  useImageQueueStore,
} from "@/app/pixel/stores/image-queue.store";
import type { ResultImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_RESIZE_OPTIONS,
  type ResizeErrorItem,
  type ResizeFeatureOptions,
  type ResizeOutcome,
  type ResizeStage,
  type ResizeSuccessItem,
} from "@/app/pixel/features/resize/types/resize.types";
import { resizeFormSchema } from "@/app/pixel/features/resize/schemas/resize.schema";
import { saveHistory } from "@/app/pixel/lib/history/local-history";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface UseResizeReturn {
  readonly options: ResizeFeatureOptions;
  readonly setOptions: (next: ResizeFeatureOptions) => void;
  readonly stage: ResizeStage;
  readonly outcome: ResizeOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

function recordHistory(success: readonly ResizeSuccessItem[]): void {
  if (success.length === 0) return;

  const first = success[0]!;
  const totalSourceBytes = success.reduce(
    (sum, s) => sum + s.sourceSizeBytes,
    0,
  );
  const totalResultBytes = success.reduce(
    (sum, s) => sum + s.result.sizeBytes,
    0,
  );

  saveHistory({
    id: crypto.randomUUID(),
    type: "resize",
    createdAt: new Date().toISOString(),
    toolHref: "/pixel/optimize/resize",
    sourceFilename: first.sourceFilename,
    sourceSizeBytes: totalSourceBytes,
    resultFilename: first.result.filename,
    resultSizeBytes: totalResultBytes,
    savedBytes: totalSourceBytes - totalResultBytes,
    itemCount: success.length,
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useResize(): UseResizeReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<ResizeFeatureOptions>(DEFAULT_RESIZE_OPTIONS);
  const [stage, setStage] = useState<ResizeStage>("idle");
  const [outcome, setOutcome] = useState<ResizeOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: ResizeFeatureOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = resizeFormSchema.safeParse(options);
    if (!parsed.success) {
      setOutcome({
        stage: "done",
        success: [],
        errors: [
          {
            sourceId: "__form__",
            sourceFilename: "Options",
            error: errorOf(
              "INVALID_INPUT",
              parsed.error.issues[0]?.message ?? "Options invalides.",
            ),
          },
        ],
        durationMs: 0,
      });
      return;
    }

    const targets = items.filter((i) => i.status === "pending");
    const startedAt = Date.now();
    const success: ResizeSuccessItem[] = [];
    const errors: ResizeErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    const multi = targets.length > 1;

    try {
      if (!multi) {
        const single = targets[0]!;
        const form = new FormData();
        form.append("files", single.source.file, single.source.filename);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/resize", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            (body as { error?: { message?: string } } | null)?.error?.message ??
            `Erreur HTTP ${res.status}.`;
          const err = errorOf("PROCESSING_ERROR", message);
          errors.push({
            sourceId: single.source.id,
            sourceFilename: single.source.filename,
            error: err,
          });
          setError(single.source.id, err);
        } else {
          const blob = await res.blob();
          const mime = res.headers.get("Content-Type") ?? "application/octet-stream";
          const disposition = res.headers.get("Content-Disposition");
          const filename =
            disposition?.match(/filename="(.+?)"/)?.[1] ?? "resized";
          const downloadUrl = URL.createObjectURL(blob);
          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: options.format,
            mime: mime as ResultImage["mime"],
            sizeBytes: blob.size,
            dimensions: { width: options.width, height: options.height },
            url: null,
            buffer: null,
            expiresAt: null,
          };
          setResult(single.source.id, result);
          success.push({
            sourceId: single.source.id,
            sourceFilename: single.source.filename,
            sourceSizeBytes: single.source.sizeBytes,
            result,
            downloadUrl,
          });
        }
      } else {
        const form = new FormData();
        for (const item of targets)
          form.append("files", item.source.file, item.source.filename);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/resize", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            (body as { error?: { message?: string } } | null)?.error?.message ??
            `Erreur HTTP ${res.status}.`;
          for (const item of targets) {
            const err = errorOf("PROCESSING_ERROR", message);
            errors.push({
              sourceId: item.source.id,
              sourceFilename: item.source.filename,
              error: err,
            });
            setError(item.source.id, err);
          }
        } else {
          const json = (await res.json()) as {
            results: readonly ResultImage[];
            errors: readonly { filename: string; message: string }[];
          };
          for (const r of json.results) {
            const match = targets.find((t) =>
              r.filename.startsWith(t.source.filename.replace(/\.[^.]+$/, "")),
            );
            const sourceId = match?.source.id ?? r.id;
            const sourceFilename = match?.source.filename ?? r.filename;
            setResult(sourceId, r);
            success.push({
              sourceId,
              sourceFilename,
              sourceSizeBytes: match?.source.sizeBytes ?? 0,
              result: r,
              downloadUrl: r.url ?? "",
            });
          }
          for (const e of json.errors) {
            const match = targets.find((t) => t.source.filename === e.filename);
            const err = errorOf("PROCESSING_ERROR", e.message);
            errors.push({
              sourceId: match?.source.id ?? e.filename,
              sourceFilename: e.filename,
              error: err,
            });
            setError(match?.source.id ?? e.filename, err);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      for (const item of targets) {
        const e = errorOf("PROCESSING_ERROR", message);
        errors.push({
          sourceId: item.source.id,
          sourceFilename: item.source.filename,
          error: e,
        });
        setError(item.source.id, e);
      }
    }

    setStage("done");
    setOutcome({
      stage: "done",
      success,
      errors,
      durationMs: Date.now() - startedAt,
    });

    // Phase 19 — Historique local
    recordHistory(success);
  }, [items, options, pendingCount, setError, setResult, setStatus]);

  return { options, setOptions, stage, outcome, pendingCount, submit };
}