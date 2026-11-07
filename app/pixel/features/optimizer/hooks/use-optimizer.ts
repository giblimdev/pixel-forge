/*
path:            app/pixel/features/optimizer/hooks/use-optimizer.ts
tag:             ["pixel", "feature", "optimizer", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module optimizer. Meme pattern que
                 use-converter : lit la file, valide les options,
                 POST /api/images/optimize, met a jour le store, expose
                 outcome. Detecte le mode blob vs JSON selon le nombre
                 d'items pending.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/optimize -> blob ou json -> setResult /
                 setError par fichier -> outcome.

ecosystem:       Optimizer = [
                   "@/app/pixel/features/optimizer/types/optimizer.types.ts",
                   "@/app/pixel/features/optimizer/schemas/optimizer.schema.ts",
                   "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                   "@/app/pixel/features/optimizer/components/optimization-presets.tsx",
                   "@/app/pixel/features/optimizer/components/target-size-control.tsx",
                   "@/app/pixel/features/optimizer/components/optimizer-panel.tsx",
                   "@/app/pixel/features/optimizer/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/optimization.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/optimizer/types/optimizer.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/optimization",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/optimizer/types/optimizer.types",
                  "@/app/pixel/features/optimizer/schemas/optimizer.schema"]
exports:         ["UseOptimizerReturn", "useOptimizer"]
useBy:           ["@/app/pixel/features/optimizer/components/optimizer-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux optimiser toutes mes images"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useState + fetch + store Zustand.

import { useCallback, useState } from "react";

import {
  selectItems,
  useImageQueueStore,
} from "@/app/pixel/stores/image-queue.store";
import type { OptimizationOptions } from "@/app/pixel/types/optimization";
import type { ResultImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_OPTIMIZATION_OPTIONS,
  type OptimizationErrorItem,
  type OptimizationOutcome,
  type OptimizationSuccessItem,
  type OptimizerStage,
} from "@/app/pixel/features/optimizer/types/optimizer.types";
import { optimizerFormSchema } from "@/app/pixel/features/optimizer/schemas/optimizer.schema";

export interface UseOptimizerReturn {
  readonly options: OptimizationOptions;
  readonly setOptions: (next: OptimizationOptions) => void;
  readonly stage: OptimizerStage;
  readonly outcome: OptimizationOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

export function useOptimizer(): UseOptimizerReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<OptimizationOptions>(DEFAULT_OPTIMIZATION_OPTIONS);
  const [stage, setStage] = useState<OptimizerStage>("idle");
  const [outcome, setOutcome] = useState<OptimizationOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: OptimizationOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = optimizerFormSchema.safeParse(options);
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
        preset: options.preset,
      });
      return;
    }

    const targets = items.filter((i) => i.status === "pending");
    const startedAt = Date.now();
    const success: OptimizationSuccessItem[] = [];
    const errors: OptimizationErrorItem[] = [];

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

        const res = await fetch("/api/images/optimize", {
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
            disposition?.match(/filename="(.+)"/)?.[1] ?? "optimized";

          const downloadUrl = URL.createObjectURL(blob);
          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: single.source.format ?? "webp",
            mime: mime as ResultImage["mime"],
            sizeBytes: blob.size,
            dimensions: single.source.dimensions ?? { width: 0, height: 0 },
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
        for (const item of targets) {
          form.append("files", item.source.file, item.source.filename);
        }
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/optimize", {
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
              r.filename.startsWith(
                t.source.filename.replace(/\.[^.]+$/, ""),
              ),
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
      preset: options.preset,
    });
  }, [items, options, pendingCount, setError, setResult, setStatus]);

  return { options, setOptions, stage, outcome, pendingCount, submit };
}