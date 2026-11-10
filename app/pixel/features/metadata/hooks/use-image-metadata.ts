/*
path:            app/pixel/features/metadata/hooks/use-image-metadata.ts
tag:             ["pixel", "feature", "metadata", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module metadata. Gere deux actions :
                 - "analyze" : POST /api/images/metadata?action=analyze
                   -> analyses
                 - "strip"   : POST /api/images/metadata?action=strip
                   -> telechargements (mode hybride B+C)

                 Meme pattern que les autres hooks : lit la file, valide,
                 POST, met a jour le store, expose outcome.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, sourceIds) -> fetch
                 avec ?action=analyze|strip -> traite la reponse
                 (JSON ou Blob selon l'action) -> setStatus + outcome.

ecosystem:       Metadata = [
                   "@/app/api/images/metadata/route.ts",
                   "@/app/pixel/analyze/metadata/page.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                   "@/app/pixel/features/metadata/components/metadata-details.tsx",
                   "@/app/pixel/features/metadata/components/metadata-panel.tsx",
                   "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                   "@/app/pixel/features/metadata/index.ts",
                   "@/app/pixel/features/metadata/schemas/metadata.schema.ts",
                   "@/app/pixel/features/metadata/types/metadata.types.ts",
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/metadata/types/metadata.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/metadata/types/metadata.types",
                  "@/app/pixel/features/metadata/schemas/metadata.schema"]
exports:         ["UseImageMetadataReturn", "useImageMetadata"]
useBy:           ["@/app/pixel/features/metadata/components/metadata-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux analyser et supprimer les metadonnees"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
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
  DEFAULT_METADATA_OPTIONS,
  type MetadataAnalysis,
  type MetadataErrorItem,
  type MetadataOptions,
  type MetadataOutcome,
  type MetadataStage,
} from "@/app/pixel/features/metadata/types/metadata.types";
import { metadataFormSchema } from "@/app/pixel/features/metadata/schemas/metadata.schema";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface UseImageMetadataReturn {
  readonly options: MetadataOptions;
  readonly setOptions: (next: MetadataOptions) => void;
  readonly stage: MetadataStage;
  readonly outcome: MetadataOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
  readonly reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorOf(
  code: ProcessingErrorCode,
  message: string,
): ProcessingError {
  return { code, message };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useImageMetadata(): UseImageMetadataReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<MetadataOptions>(DEFAULT_METADATA_OPTIONS);
  const [stage, setStage] = useState<MetadataStage>("idle");
  const [outcome, setOutcome] = useState<MetadataOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: MetadataOptions) => {
    setOptionsState(next);
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setOutcome(null);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = metadataFormSchema.safeParse(options);
    if (!parsed.success) {
      setOutcome({
        stage: "done",
        analyses: [],
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
        action: options.action,
      });
      return;
    }

    const targets = items.filter((i) => i.status === "pending");
    const startedAt = Date.now();
    const analyses: MetadataAnalysis[] = [];
    const errors: MetadataErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    try {
      const form = new FormData();
      for (const item of targets) {
        form.append("files", item.source.file, item.source.filename);
      }
      form.append(
        "sourceIds",
        JSON.stringify(targets.map((t) => t.source.id)),
      );

      const url = `/api/images/metadata?action=${options.action}`;
      const res = await fetch(url, { method: "POST", body: form });

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
      } else if (options.action === "analyze") {
        // Reponse JSON pour analyze.
        const json = (await res.json()) as {
          results: readonly MetadataAnalysis[];
          errors: readonly { filename: string; message: string }[];
        };

        for (const r of json.results) {
          setStatus(r.sourceId, "success");
          analyses.push(r);
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
      } else {
        // Reponse hybride B+C pour strip (Blob si 1 fichier, JSON si 2+).
        const contentType = res.headers.get("Content-Type") ?? "";

        if (contentType.includes("application/json")) {
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
            setResult(sourceId, r);
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
        } else {
          // Mode Blob (1 fichier).
          const single = targets[0]!;
          const blob = await res.blob();
          const disposition = res.headers.get("Content-Disposition");
          const filename =
            disposition?.match(/filename="(.+?)"/)?.[1] ?? "clean";
          const mime =
            (res.headers.get("Content-Type") as ResultImage["mime"]) ??
            "application/octet-stream";
          const downloadUrl = URL.createObjectURL(blob);

          const result: ResultImage = {
            id: single.source.id,
            filename,
            format: single.source.format ?? "jpeg",
            mime,
            sizeBytes: blob.size,
            dimensions: single.source.dimensions ?? { width: 0, height: 0 },
            url: downloadUrl,
            buffer: null,
            expiresAt: null,
          };
          setResult(single.source.id, result);
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
      analyses,
      errors,
      durationMs: Date.now() - startedAt,
      action: options.action,
    });
  }, [items, options, pendingCount, setError, setResult, setStatus]);

  return {
    options,
    setOptions,
    stage,
    outcome,
    pendingCount,
    submit,
    reset,
  };
}