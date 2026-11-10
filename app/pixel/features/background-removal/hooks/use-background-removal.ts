/*
path:            app/pixel/features/background-removal/hooks/use-background-removal.ts
tag:             ["pixel", "feature", "background-removal", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module background-removal. Meme pattern
                 que les autres hooks : lit la file, valide, POST
                 /api/images/background, met a jour le store, expose
                 outcome.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/background -> blob ou json -> setResult /
                 setError par fichier -> outcome.

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/background-removal/types/background.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/background-removal/types/background.types",
                  "@/app/pixel/features/background-removal/schemas/background.schema"]
exports:         ["UseBackgroundRemovalReturn", "useBackgroundRemoval"]
useBy:           ["@/app/pixel/features/background-removal/components/background-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux detourer toutes mes images"]
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
  DEFAULT_BACKGROUND_OPTIONS,
  type BackgroundRemovalErrorItem,
  type BackgroundRemovalOptions,
  type BackgroundRemovalOutcome,
  type BackgroundRemovalStage,
  type BackgroundRemovalSuccessItem,
} from "@/app/pixel/features/background-removal/types/background.types";
import { backgroundFormSchema } from "@/app/pixel/features/background-removal/schemas/background.schema";

export interface UseBackgroundRemovalReturn {
  readonly options: BackgroundRemovalOptions;
  readonly setOptions: (next: BackgroundRemovalOptions) => void;
  readonly stage: BackgroundRemovalStage;
  readonly outcome: BackgroundRemovalOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

export function useBackgroundRemoval(): UseBackgroundRemovalReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<BackgroundRemovalOptions>(DEFAULT_BACKGROUND_OPTIONS);
  const [stage, setStage] = useState<BackgroundRemovalStage>("idle");
  const [outcome, setOutcome] = useState<BackgroundRemovalOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: BackgroundRemovalOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = backgroundFormSchema.safeParse(options);
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
    const success: BackgroundRemovalSuccessItem[] = [];
    const errors: BackgroundRemovalErrorItem[] = [];

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

        const res = await fetch("/api/images/background", { method: "POST", body: form });

        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            (body as { error?: { message?: string } } | null)?.error?.message ??
            `Erreur HTTP ${res.status}.`;
          const err = errorOf("PROCESSING_ERROR", message);
          errors.push({ sourceId: single.source.id, sourceFilename: single.source.filename, error: err });
          setError(single.source.id, err);
        } else {
          const blob = await res.blob();
          const mime = res.headers.get("Content-Type") ?? "image/png";
          const disposition = res.headers.get("Content-Disposition");
          const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? "detoured.png";
          const downloadUrl = URL.createObjectURL(blob);
          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: "png",
            mime: "image/png",
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
        for (const item of targets) form.append("files", item.source.file, item.source.filename);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/background", { method: "POST", body: form });

        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          const message =
            (body as { error?: { message?: string } } | null)?.error?.message ??
            `Erreur HTTP ${res.status}.`;
          for (const item of targets) {
            const err = errorOf("PROCESSING_ERROR", message);
            errors.push({ sourceId: item.source.id, sourceFilename: item.source.filename, error: err });
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
            errors.push({ sourceId: match?.source.id ?? e.filename, sourceFilename: e.filename, error: err });
            setError(match?.source.id ?? e.filename, err);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      for (const item of targets) {
        const e = errorOf("PROCESSING_ERROR", message);
        errors.push({ sourceId: item.source.id, sourceFilename: item.source.filename, error: e });
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