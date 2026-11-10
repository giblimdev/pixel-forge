/*
path:            app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts
tag:             ["pixel", "feature", "placeholder-generator", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module placeholder-generator. Meme
                 pattern que use-favicon-generator : lit la file, valide,
                 POST /api/images/placeholder, expose outcome.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/placeholder -> json { results[], errors[] }
                 -> setStatus + outcome.

ecosystem:       PlaceholderGenerator = [
                   "@/app/api/images/placeholder/route.ts",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-output.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx",
                   "@/app/pixel/features/placeholder-generator/components/placeholder-preview.tsx",
                   "@/app/pixel/features/placeholder-generator/hooks/use-placeholder-generator.ts",
                   "@/app/pixel/features/placeholder-generator/index.ts",
                   "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema.ts",
                   "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/placeholder-generator/types/placeholder.types",
                  "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema"]
exports:         ["UsePlaceholderGeneratorReturn", "usePlaceholderGenerator"]
useBy:           ["@/app/pixel/features/placeholder-generator/components/placeholder-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux generer un placeholder LQIP ou BlurHash"]
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
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_PLACEHOLDER_OPTIONS,
  type PlaceholderErrorItem,
  type PlaceholderGeneratorOptions,
  type PlaceholderOutcome,
  type PlaceholderResult,
  type PlaceholderStage,
} from "@/app/pixel/features/placeholder-generator/types/placeholder.types";
import { placeholderFormSchema } from "@/app/pixel/features/placeholder-generator/schemas/placeholder.schema";

export interface UsePlaceholderGeneratorReturn {
  readonly options: PlaceholderGeneratorOptions;
  readonly setOptions: (next: PlaceholderGeneratorOptions) => void;
  readonly stage: PlaceholderStage;
  readonly outcome: PlaceholderOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(
  code: ProcessingErrorCode,
  message: string,
): ProcessingError {
  return { code, message };
}

export function usePlaceholderGenerator(): UsePlaceholderGeneratorReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<PlaceholderGeneratorOptions>(DEFAULT_PLACEHOLDER_OPTIONS);
  const [stage, setStage] = useState<PlaceholderStage>("idle");
  const [outcome, setOutcome] = useState<PlaceholderOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: PlaceholderGeneratorOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = placeholderFormSchema.safeParse(options);
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
    const success: PlaceholderResult[] = [];
    const errors: PlaceholderErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    try {
      const form = new FormData();
      for (const item of targets) {
        form.append("files", item.source.file, item.source.filename);
      }
      form.append("options", JSON.stringify(options));

      const res = await fetch("/api/images/placeholder", {
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
          results: readonly {
            sourceId: string;
            code: string;
            width: number;
            height: number;
            description: string;
          }[];
          errors: readonly { filename: string; message: string }[];
        };

        for (const r of json.results) {
          const match = targets.find((t) => t.source.id === r.sourceId);
          const sourceId = r.sourceId;
          if (match) setStatus(sourceId, "success");
          success.push({
            code: r.code,
            width: r.width,
            height: r.height,
            description: r.description,
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
  }, [items, options, pendingCount, setError, setStatus]);

  return { options, setOptions, stage, outcome, pendingCount, submit };
}