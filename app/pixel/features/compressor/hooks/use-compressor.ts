/*
path:            app/pixel/features/compressor/hooks/use-compressor.ts
tag:             ["pixel", "feature", "compressor", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module compressor. Meme pattern que
                 use-optimizer mais avec CompressorOptions et POST
                 /api/images/compress. Le format source est conserve
                 (options.format = null cote route).

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/compress -> blob ou json -> setResult /
                 setError par fichier -> outcome.

ecosystem:       Compressor = [
                   "@/app/pixel/features/compressor/types/compressor.types.ts",
                   "@/app/pixel/features/compressor/schemas/compressor.schema.ts",
                   "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                   "@/app/pixel/features/compressor/components/compression-settings.tsx",
                   "@/app/pixel/features/compressor/components/compression-results.tsx",
                   "@/app/pixel/features/compressor/components/compressor-panel.tsx",
                   "@/app/pixel/features/compressor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/compressor/types/compressor.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/compressor/types/compressor.types",
                  "@/app/pixel/features/compressor/schemas/compressor.schema"]
exports:         ["UseCompressorReturn", "useCompressor"]
useBy:           ["@/app/pixel/features/compressor/components/compressor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux compresser mes images sans changer de format"]
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
import type { ResultImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_COMPRESSOR_OPTIONS,
  type CompressionErrorItem,
  type CompressionOutcome,
  type CompressionSuccessItem,
  type CompressorOptions,
  type CompressorStage,
} from "@/app/pixel/features/compressor/types/compressor.types";
import { compressorFormSchema } from "@/app/pixel/features/compressor/schemas/compressor.schema";

export interface UseCompressorReturn {
  readonly options: CompressorOptions;
  readonly setOptions: (next: CompressorOptions) => void;
  readonly stage: CompressorStage;
  readonly outcome: CompressionOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

export function useCompressor(): UseCompressorReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<CompressorOptions>(DEFAULT_COMPRESSOR_OPTIONS);
  const [stage, setStage] = useState<CompressorStage>("idle");
  const [outcome, setOutcome] = useState<CompressionOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: CompressorOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = compressorFormSchema.safeParse(options);
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
    const success: CompressionSuccessItem[] = [];
    const errors: CompressionErrorItem[] = [];

    setStage("running");
    setOutcome(null);

    for (const item of targets) setStatus(item.source.id, "running");

    const multi = targets.length > 1;

    try {
      if (!multi) {
        const single = targets[0]!;
        const form = new FormData();
        form.append("files", single.source.file, single.source.filename);
        form.append(
          "options",
          JSON.stringify({
            format: null,
            quality: options.quality,
            palette: options.palette,
            stripMetadata: options.stripMetadata,
          }),
        );

        const res = await fetch("/api/images/compress", {
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
            disposition?.match(/filename="(.+)"/)?.[1] ?? "compressed";
          const downloadUrl = URL.createObjectURL(blob);
          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: single.source.format ?? "jpeg",
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
        form.append(
          "options",
          JSON.stringify({
            format: null,
            quality: options.quality,
            palette: options.palette,
            stripMetadata: options.stripMetadata,
          }),
        );

        const res = await fetch("/api/images/compress", {
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
  }, [items, options, pendingCount, setError, setResult, setStatus]);

  return { options, setOptions, stage, outcome, pendingCount, submit };
}