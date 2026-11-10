/*
path:            app/pixel/features/export-manager/hooks/use-export-manager.ts
tag:             ["pixel", "feature", "export-manager", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du module export-manager. Collecte les URLs
                 des resultats (result.url ou buffer converti en data URL)
                 depuis le store Zustand, envoie POST /api/images/export,
                 recupere l'URL du ZIP et l'expose dans outcome.

                 Le hook ne traite PAS les fichiers localement : il
                 delegue au serveur (route export). Il gere les deux
                 modes de resultat (URL @vercel/blob et buffer blob).

flow:            useState(options, stage, outcome) -> submit() ->
                 collecte des items "success" du store -> FormData
                 (files=url|filename + options) -> fetch
                 /api/images/export -> JSON { url, filename, sizeBytes,
                 entryCount, expiresAt } -> outcome.success.

ecosystem:       ExportManager = [
                   "@/app/pixel/features/export-manager/types/export-manager.types.ts",
                   "@/app/pixel/features/export-manager/schemas/export-manager.schema.ts",
                   "@/app/pixel/features/export-manager/hooks/use-export-manager.ts",
                   "@/app/pixel/features/export-manager/components/export-options.tsx",
                   "@/app/pixel/features/export-manager/components/export-item.tsx",
                   "@/app/pixel/features/export-manager/components/export-progress.tsx",
                   "@/app/pixel/features/export-manager/components/export-manager.tsx",
                   "@/app/pixel/features/export-manager/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/export.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/pixel/features/export-manager/types/export-manager.types.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/export",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/export-manager/types/export-manager.types",
                  "@/app/pixel/features/export-manager/schemas/export-manager.schema"]
exports:         ["UseExportManagerReturn", "useExportManager"]
useBy:           ["@/app/pixel/features/export-manager/components/export-manager.tsx"]

userStories:     ["*en tant qu'utilisateur je veux telecharger tous mes resultats en un ZIP"]
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
import type { ExportOptions } from "@/app/pixel/types/export";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_EXPORT_OPTIONS,
  type ExportOutcome,
  type ExportStage,
  type ExportSuccessPayload,
} from "@/app/pixel/features/export-manager/types/export-manager.types";
import { exportFormSchema } from "@/app/pixel/features/export-manager/schemas/export-manager.schema";

export interface UseExportManagerReturn {
  readonly options: ExportOptions;
  readonly setOptions: (next: ExportOptions) => void;
  readonly stage: ExportStage;
  readonly outcome: ExportOutcome | null;
  readonly exportableCount: number;
  readonly submit: () => Promise<void>;
}

function errorOf(
  code: ProcessingErrorCode,
  message: string,
): ProcessingError {
  return { code, message };
}

export function useExportManager(): UseExportManagerReturn {
  const items = useImageQueueStore(selectItems);

  const [options, setOptionsState] =
    useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [stage, setStage] = useState<ExportStage>("idle");
  const [outcome, setOutcome] = useState<ExportOutcome | null>(null);

  // Items exportables : resultat defini (URL blob ou buffer).
  const exportables = items.filter(
    (i) => i.status === "success" && i.result !== null,
  );
  const exportableCount = exportables.length;

  const setOptions = useCallback((next: ExportOptions) => {
    setOptionsState(next);
  }, []);

  const submit = useCallback(async () => {
    if (exportableCount === 0) return;

    const parsed = exportFormSchema.safeParse(options);
    if (!parsed.success) {
      setOutcome({
        stage: "done",
        success: null,
        error: errorOf(
          "INVALID_INPUT",
          parsed.error.issues[0]?.message ?? "Options invalides.",
        ),
      });
      return;
    }

    setStage("running");
    setOutcome(null);

    try {
      const form = new FormData();
      for (const item of exportables) {
        const result = item.result!;
        // Priorite a result.url (@vercel/blob). Sinon, on convertit le
        // buffer en data URL pour que la route puisse le recuperer.
        let url: string;
        if (result.url) {
          url = result.url;
        } else if (result.buffer) {
          const blob = new Blob([result.buffer], { type: result.mime });
          url = await blobToDataUrl(blob);
        } else {
          continue;
        }
        form.append("files", `${url}|${result.filename}`);
      }
      form.append("options", JSON.stringify(options));

      const res = await fetch("/api/images/export", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          (body as { error?: { message?: string } } | null)?.error?.message ??
          `Erreur HTTP ${res.status}.`;
        const code = (body as { error?: { code?: string } } | null)?.error
          ?.code;
        const typedCode: ProcessingErrorCode =
          code === "UNSUPPORTED_FORMAT" ||
          code === "LIMIT_EXCEEDED" ||
          code === "INVALID_INPUT" ||
          code === "NOT_FOUND" ||
          code === "EXPIRED"
            ? code
            : "PROCESSING_ERROR";
        setOutcome({
          stage: "done",
          success: null,
          error: errorOf(typedCode, message),
        });
        setStage("done");
        return;
      }

      const payload = (await res.json()) as ExportSuccessPayload;
      setOutcome({
        stage: "done",
        success: payload,
        error: null,
      });
      setStage("done");
    } catch (err) {
      setOutcome({
        stage: "done",
        success: null,
        error: errorOf(
          "PROCESSING_ERROR",
          err instanceof Error ? err.message : "Erreur inconnue.",
        ),
      });
      setStage("done");
    }
  }, [exportables, exportableCount, options]);

  return { options, setOptions, stage, outcome, exportableCount, submit };
}

// ---------------------------------------------------------------------------
// Helper : convertit un Blob en data URL
// ---------------------------------------------------------------------------

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Lecture blob impossible."));
    };
    reader.onerror = () => reject(new Error("Lecture blob impossible."));
    reader.readAsDataURL(blob);
  });
}