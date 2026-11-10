/*
path:            app/pixel/features/crop-editor/hooks/use-crop-editor.ts
tag:             ["pixel", "feature", "crop-editor", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module crop-editor. Stocke la zone de
                 recadrage (pixels) emise par react-easy-crop via
                 onCropComplete, puis POST /api/images/crop en mode
                 manual avec ces coordonnees. Meme pattern que les
                 hooks use-resize et use-smart-crop.

                 Phase 19 : ajout d'une entree d'historique locale
                 (localStorage) a la fin de submit() si au moins un
                 fichier a ete traite avec succes.

flow:            useState(options, cropArea, stage, outcome) ->
                 setCropArea(area) appele par CropCanvas ->
                 submit() -> pending items -> FormData(files, options
                 + cropArea) -> fetch /api/images/crop -> blob ou json
                 -> setResult / setError par fichier -> outcome ->
                 recordHistory().

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                  "@/app/pixel/lib/history/local-history.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types",
                  "@/app/pixel/features/crop-editor/schemas/crop-editor.schema",
                  "@/app/pixel/lib/history/local-history"]
exports:         ["UseCropEditorReturn", "useCropEditor"]
useBy:           ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux recadrer manuellement une image",
                  "*en tant qu'utilisateur je veux retrouver mes recadrages dans mon historique"]
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
  DEFAULT_CROP_EDITOR_OPTIONS,
  type CropAreaPixels,
  type CropEditorErrorItem,
  type CropEditorOptions,
  type CropEditorOutcome,
  type CropEditorStage,
  type CropEditorSuccessItem,
} from "@/app/pixel/features/crop-editor/types/crop-editor.types";
import { cropEditorFormSchema } from "@/app/pixel/features/crop-editor/schemas/crop-editor.schema";
import { saveHistory } from "@/app/pixel/lib/history/local-history";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface UseCropEditorReturn {
  readonly options: CropEditorOptions;
  readonly setOptions: (next: CropEditorOptions) => void;
  readonly cropArea: CropAreaPixels | null;
  readonly setCropArea: (area: CropAreaPixels) => void;
  readonly stage: CropEditorStage;
  readonly outcome: CropEditorOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

function recordHistory(success: readonly CropEditorSuccessItem[]): void {
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
    type: "crop-manual",
    createdAt: new Date().toISOString(),
    toolHref: "/pixel/edit/crop",
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

export function useCropEditor(): UseCropEditorReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<CropEditorOptions>(DEFAULT_CROP_EDITOR_OPTIONS);
  const [cropArea, setCropAreaState] = useState<CropAreaPixels | null>(null);
  const [stage, setStage] = useState<CropEditorStage>("idle");
  const [outcome, setOutcome] = useState<CropEditorOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: CropEditorOptions) => {
    setOptionsState(next);
  }, []);

  const setCropArea = useCallback((area: CropAreaPixels) => {
    setCropAreaState(area);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0 || cropArea === null) return;

    const parsed = cropEditorFormSchema.safeParse({
      ...options,
      cropArea,
    });
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
    const success: CropEditorSuccessItem[] = [];
    const errors: CropEditorErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    const multi = targets.length > 1;
    const payload = {
      mode: "manual" as const,
      left: cropArea.x,
      top: cropArea.y,
      width: cropArea.width,
      height: cropArea.height,
      format: options.format,
      quality: options.quality,
    };

    try {
      if (!multi) {
        const single = targets[0]!;
        const form = new FormData();
        form.append("files", single.source.file, single.source.filename);
        form.append("options", JSON.stringify(payload));

        const res = await fetch("/api/images/crop", {
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
            disposition?.match(/filename="(.+?)"/)?.[1] ?? "cropped";
          const downloadUrl = URL.createObjectURL(blob);
          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: options.format,
            mime: mime as ResultImage["mime"],
            sizeBytes: blob.size,
            dimensions: { width: cropArea.width, height: cropArea.height },
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
        form.append("options", JSON.stringify(payload));

        const res = await fetch("/api/images/crop", {
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
  }, [items, options, cropArea, pendingCount, setError, setResult, setStatus]);

  return {
    options,
    setOptions,
    cropArea,
    setCropArea,
    stage,
    outcome,
    pendingCount,
    submit,
  };
}