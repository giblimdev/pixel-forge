/*
path:            app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts
tag:             ["pixel", "feature", "favicon-generator", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module favicon-generator. Meme pattern
                 que les autres hooks : lit la file, valide, POST
                 /api/images/favicon, met a jour le store, expose
                 outcome.

                 ATTENTION : le ZIP genere n'est PAS une image, il ne
                 peut donc PAS etre stocke dans ResultImage (dont le
                 mime est ImageMimeType). On marque simplement le statut
                 "success" via setStatus, et on expose le ZIP via
                 outcome.success[0].downloadUrl. Le panel
                 <FaviconPreview /> lit directement downloadUrl, pas le
                 store.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/favicon -> json { icoBase64, pngFiles,
                 manifestJson, zipUrl } -> setStatus("success") +
                 outcome.success.

ecosystem:       FaviconGenerator = [
                   "@/app/pixel/features/favicon-generator/types/favicon.types.ts",
                   "@/app/pixel/features/favicon-generator/schemas/favicon.schema.ts",
                   "@/app/pixel/features/favicon-generator/hooks/use-favicon-generator.ts",
                   "@/app/pixel/features/favicon-generator/components/favicon-options.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-preview.tsx",
                   "@/app/pixel/features/favicon-generator/components/favicon-panel.tsx",
                   "@/app/pixel/features/favicon-generator/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/favicon-generator/types/favicon.types",
                  "@/app/pixel/features/favicon-generator/schemas/favicon.schema"]
exports:         ["UseFaviconGeneratorReturn", "useFaviconGenerator"]
useBy:           ["@/app/pixel/features/favicon-generator/components/favicon-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux generer tous les favicons d'un site"]
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
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_FAVICON_OPTIONS,
  type FaviconErrorItem,
  type FaviconGeneratorOptions,
  type FaviconOutcome,
  type FaviconStage,
  type FaviconSuccessItem,
} from "@/app/pixel/features/favicon-generator/types/favicon.types";
import { faviconFormSchema } from "@/app/pixel/features/favicon-generator/schemas/favicon.schema";

export interface UseFaviconGeneratorReturn {
  readonly options: FaviconGeneratorOptions;
  readonly setOptions: (next: FaviconGeneratorOptions) => void;
  readonly stage: FaviconStage;
  readonly outcome: FaviconOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

export function useFaviconGenerator(): UseFaviconGeneratorReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<FaviconGeneratorOptions>(DEFAULT_FAVICON_OPTIONS);
  const [stage, setStage] = useState<FaviconStage>("idle");
  const [outcome, setOutcome] = useState<FaviconOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: FaviconGeneratorOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = faviconFormSchema.safeParse(options);
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
    const success: FaviconSuccessItem[] = [];
    const errors: FaviconErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    try {
      const single = targets[0]!;
      const form = new FormData();
      form.append("files", single.source.file, single.source.filename);
      form.append("options", JSON.stringify(options));

      const res = await fetch("/api/images/favicon", {
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
        const json = (await res.json()) as {
          icoBase64: string;
          pngFiles: readonly { filename: string; base64: string }[];
          manifestJson: string;
          zipUrl: string;
        };

        const icoBuffer = base64ToBuffer(json.icoBase64);
        const pngFiles = json.pngFiles.map((p) => ({
          filename: p.filename,
          buffer: base64ToBuffer(p.base64),
        }));

        // Le ZIP n'est pas un ImageMimeType : on ne peut pas creer
        // de ResultImage. On marque juste le statut "success" et on
        // expose le ZIP via outcome.success[0].downloadUrl.
        setStatus(single.source.id, "success");

        success.push({
          sourceId: single.source.id,
          sourceFilename: single.source.filename,
          sourceSizeBytes: single.source.sizeBytes,
          icoBuffer,
          pngFiles,
          manifestJson: json.manifestJson,
          downloadUrl: json.zipUrl,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      const first = targets[0]!;
      const e = errorOf("PROCESSING_ERROR", message);
      errors.push({
        sourceId: first.source.id,
        sourceFilename: first.source.filename,
        error: e,
      });
      setError(first.source.id, e);
    }

    setStage("done");
    setOutcome({
      stage: "done",
      success,
      errors,
      durationMs: Date.now() - startedAt,
    });
  }, [items, options, pendingCount, setError, setStatus]);

  return { options, setOptions, stage, outcome, pendingCount, submit };
}

// ---------------------------------------------------------------------------
// Helper : base64 -> Buffer
// ---------------------------------------------------------------------------

function base64ToBuffer(base64: string): Buffer {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64");
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes as unknown as Buffer;
}