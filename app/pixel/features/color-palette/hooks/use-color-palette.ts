/*
path:            app/pixel/features/color-palette/hooks/use-color-palette.ts
tag:             ["pixel", "feature", "color-palette", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module color-palette. Meme pattern
                 que use-favicon-generator et use-placeholder-generator :
                 lit la file, valide, POST /api/images/palette, met a
                 jour le store (status success), expose outcome.

flow:            useState(options, stage, outcome) -> submit() ->
                 pending items -> FormData(files, options) -> fetch
                 /api/images/palette -> json { results[], errors[] }
                 -> setStatus + outcome.

ecosystem:       ColorPalette = [
                   "@/app/api/images/palette/route.ts",
                   "@/app/pixel/features/color-palette/components/palette-export.tsx",
                   "@/app/pixel/features/color-palette/components/palette-panel.tsx",
                   "@/app/pixel/features/color-palette/components/palette-preview.tsx",
                   "@/app/pixel/features/color-palette/hooks/use-color-palette.ts",
                   "@/app/pixel/features/color-palette/index.ts",
                   "@/app/pixel/features/color-palette/schemas/palette.schema.ts",
                   "@/app/pixel/features/color-palette/types/palette.types.ts",
                   "@/app/pixel/types/image.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/color-palette/types/palette.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/color-palette/types/palette.types",
                  "@/app/pixel/features/color-palette/schemas/palette.schema"]
exports:         ["UseColorPaletteReturn", "useColorPalette"]
useBy:           ["@/app/pixel/features/color-palette/components/palette-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux extraire les couleurs dominantes"]
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
  DEFAULT_PALETTE_OPTIONS,
  type PaletteColor,
  type PaletteErrorItem,
  type PaletteGeneratorOptions,
  type PaletteOutcome,
  type PaletteResult,
  type PaletteStage,
} from "@/app/pixel/features/color-palette/types/palette.types";
import { paletteFormSchema } from "@/app/pixel/features/color-palette/schemas/palette.schema";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface UseColorPaletteReturn {
  readonly options: PaletteGeneratorOptions;
  readonly setOptions: (next: PaletteGeneratorOptions) => void;
  readonly stage: PaletteStage;
  readonly outcome: PaletteOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers internes
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

export function useColorPalette(): UseColorPaletteReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<PaletteGeneratorOptions>(DEFAULT_PALETTE_OPTIONS);
  const [stage, setStage] = useState<PaletteStage>("idle");
  const [outcome, setOutcome] = useState<PaletteOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: PaletteGeneratorOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    const parsed = paletteFormSchema.safeParse(options);
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
    const success: PaletteResult[] = [];
    const errors: PaletteErrorItem[] = [];

    setStage("running");
    setOutcome(null);
    for (const item of targets) setStatus(item.source.id, "running");

    try {
      const form = new FormData();
      for (const item of targets) {
        form.append("files", item.source.file, item.source.filename);
      }
      // On envoie les sourceIds pour que la route puisse relier chaque
      // resultat a son image source (contrat coherent avec les autres
      // routes).
      const sourceIds = targets.map((t) => t.source.id);
      form.append("sourceIds", JSON.stringify(sourceIds));
      form.append("options", JSON.stringify(options));

      const res = await fetch("/api/images/palette", {
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
            sourceFilename: string;
            colors: readonly PaletteColor[];
            totalPixels: number;
          }[];
          errors: readonly { filename: string; message: string }[];
        };

        for (const r of json.results) {
          // Marque l'item en "success" (le store attend un statut
          // standard : pas de ResultImage car la palette n'est pas
          // une image — c'est un ensemble de couleurs).
          setStatus(r.sourceId, "success");
          success.push({
            sourceId: r.sourceId,
            sourceFilename: r.sourceFilename,
            colors: r.colors,
            totalPixels: r.totalPixels,
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