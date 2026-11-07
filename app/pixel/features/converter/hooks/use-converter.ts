/*
path:            app/pixel/features/converter/hooks/use-converter.ts
tag:             ["pixel", "feature", "converter", "hook"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         false

role:            Hook client du converter. Orchestre :
                 1. Lecture des items de la file via le store Zustand.
                 2. Etat local des options (ConversionOptions).
                 3. Soumission : pour chaque item "pending", POST
                    multipart a /api/images/convert avec le fichier
                    natif + les options JSON.
                 4. Traitement de la reponse : 1 fichier -> blob
                    response, 2+ -> JSON { results, errors }.
                 5. Mise a jour du store (setResult, setError) pour que
                    QueueItemRow affiche le bon statut.
                 6. Exposition d'un etat global (stage, outcome,
                    durationMs) pour que le panel affiche le resultat.

                 IMPORTANT : le hook n'invente aucun format. Il utilise
                 OUTPUT_FORMATS derive de FORMAT_CAPABILITIES. Les items
                 deja "success" ou en cours ("running") sont ignores a
                 la soumission : seule la file pending est traitee.

flow:            useState(options, stage, outcome) -> items du store
                 -> submit() -> conversionOptionsSchema.parse(options)
                 -> pour chaque pending :
                   - setStatus(id, "running")
                   - FormData(files=[file], options=JSON.stringify)
                   - fetch POST /api/images/convert
                   - si response.ok et 1 fichier : blob -> URL ->
                     setResult
                   - si response.ok et 2+ : json -> pour chaque result
                     setResult ; pour chaque error setError
                   - si !response.ok : setError
                 -> setOutcome({ stage, success, errors, durationMs,
                    format }).

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/api/images/convert/route.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/converter/types/converter.types",
                  "@/app/pixel/features/converter/schemas/converter.schema"]
exports:         ["UseConverterReturn", "useConverter"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux convertir toutes les images de ma file",
                  "*en tant que developpeur je veux un hook qui pilote POST /api/images/convert"]
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
import type { ConversionOptions } from "@/app/pixel/types/conversion";
import type { ImageFormat, ResultImage } from "@/app/pixel/types/image";
import type {
  ProcessingError,
  ProcessingErrorCode,
} from "@/app/pixel/types/processing";
import {
  DEFAULT_CONVERSION_OPTIONS,
  type ConversionErrorItem,
  type ConversionOutcome,
  type ConversionSuccessItem,
  type ConverterStage,
} from "@/app/pixel/features/converter/types/converter.types";
import { converterFormSchema } from "@/app/pixel/features/converter/schemas/converter.schema";

// ---------------------------------------------------------------------------
// Types exposes
// ---------------------------------------------------------------------------

export interface UseConverterReturn {
  readonly options: ConversionOptions;
  readonly setOptions: (next: ConversionOptions) => void;
  readonly stage: ConverterStage;
  readonly outcome: ConversionOutcome | null;
  readonly pendingCount: number;
  readonly submit: () => Promise<void>;
  readonly reset: () => void;
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

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Erreur inconnue.";
}

/**
 * Transforme un ResultImage JSON en ResultImage locale avec un
 * `downloadUrl` (URL blob pour 1 fichier, URL temporaire pour 2+).
 * Le champ `buffer` peut etre un ArrayBuffer ou une string base64
 * selon le mode de transport — ici on suppose le contrat de la route
 * (Buffer -> JSON via NextResponse.json, ce qui serialise en base64
 * ou en ArrayBuffer selon la version de Next ; on reste defensif).
 */
function toSuccessItem(
  sourceId: string,
  sourceFilename: string,
  result: ResultImage,
  downloadUrl: string,
): ConversionSuccessItem {
  return { sourceId, sourceFilename, result, downloadUrl };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConverter(): UseConverterReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] =
    useState<ConversionOptions>(DEFAULT_CONVERSION_OPTIONS);
  const [stage, setStage] = useState<ConverterStage>("idle");
  const [outcome, setOutcome] = useState<ConversionOutcome | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: ConversionOptions) => {
    setOptionsState(next);
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setOutcome(null);
  }, []);

  const submit = useCallback(async () => {
    if (pendingCount === 0) return;

    // 1. Validation locale des options (regles metier etendues).
    const parsed = converterFormSchema.safeParse(options);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setOutcome({
        stage: "done",
        success: [],
        errors: [
          {
            sourceId: "__form__",
            sourceFilename: "Options",
            error: errorOf(
              "INVALID_INPUT",
              first?.message ?? "Options de conversion invalides.",
            ),
          },
        ],
        durationMs: 0,
        format: options.format,
      });
      return;
    }

    const submittedFormat: ImageFormat = options.format;

    // 2. Snapshot des items pending a traiter.
    const targets = items.filter((i) => i.status === "pending");
    const startedAt = Date.now();
    const success: ConversionSuccessItem[] = [];
    const errors: ConversionErrorItem[] = [];

    setStage("running");
    setOutcome(null);

    // 3. Un fichier -> Blob response. 2+ -> JSON.
    const multi = targets.length > 1;
    const collected: { id: string; filename: string; file: File | Blob }[] = [];

    for (const item of targets) {
      setStatus(item.source.id, "running");
      collected.push({
        id: item.source.id,
        filename: item.source.filename,
        file: item.source.file,
      });
    }

    try {
      if (!multi) {
        // ---- Mode 1 fichier : Blob response --------------------------
        const single = collected[0]!;
        const form = new FormData();
        form.append("files", single.file, single.filename);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/convert", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const errBody: unknown = await res.json().catch(() => null);
          const message =
            (errBody as { error?: { message?: string } } | null)?.error
              ?.message ?? `Erreur HTTP ${res.status}.`;
          const code = (errBody as { error?: { code?: string } } | null)
            ?.error?.code;
          const typedCode: ProcessingErrorCode =
            code === "UNSUPPORTED_FORMAT" ||
            code === "LIMIT_EXCEEDED" ||
            code === "INVALID_INPUT" ||
            code === "NOT_FOUND" ||
            code === "EXPIRED"
              ? code
              : "PROCESSING_ERROR";
          errors.push({
            sourceId: single.id,
            sourceFilename: single.filename,
            error: errorOf(typedCode, message),
          });
          setError(single.id, errorOf(typedCode, message));
        } else {
          const blob = await res.blob();
          const mime = res.headers.get("Content-Type") ?? "application/octet-stream";
          const disposition = res.headers.get("Content-Disposition");
          const filename =
            disposition?.match(/filename="(.+)"/)?.[1] ?? `converted.${submittedFormat}`;
          const downloadUrl = URL.createObjectURL(blob);

          const resultImage: ResultImage = {
            id: single.id,
            filename,
            format: submittedFormat,
            mime: mime as ResultImage["mime"],
            sizeBytes: blob.size,
            dimensions: { width: 0, height: 0 }, // inconnu en mode blob
            url: null,
            buffer: null,
            expiresAt: null,
          };

          setResult(single.id, resultImage);
          success.push(
            toSuccessItem(single.id, single.filename, resultImage, downloadUrl),
          );
        }
      } else {
        // ---- Mode 2+ fichiers : JSON -------------------------------
        const form = new FormData();
        for (const c of collected) form.append("files", c.file, c.filename);
        form.append("options", JSON.stringify(options));

        const res = await fetch("/api/images/convert", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const errBody: unknown = await res.json().catch(() => null);
          const message =
            (errBody as { error?: { message?: string } } | null)?.error
              ?.message ?? `Erreur HTTP ${res.status}.`;
          for (const c of collected) {
            const err = errorOf("PROCESSING_ERROR", message);
            errors.push({
              sourceId: c.id,
              sourceFilename: c.filename,
              error: err,
            });
            setError(c.id, err);
          }
        } else {
          const json = (await res.json()) as {
            results: readonly ResultImage[];
            errors: readonly { filename: string; message: string }[];
            durationMs: number;
          };

          // Succes indexes par nom de fichier original (le serveur ne
          // renvoie pas l'id source).
          for (const r of json.results) {
            const match = collected.find(
              (c) => `${c.filename}`.startsWith(r.filename.split("-")[0]!) ||
                     c.filename === r.filename,
            );
            const sourceId = match?.id ?? r.id;
            const sourceFilename = match?.filename ?? r.filename;
            const downloadUrl = r.url ?? "";
            setResult(sourceId, r);
            success.push(
              toSuccessItem(sourceId, sourceFilename, r, downloadUrl),
            );
          }
          for (const e of json.errors) {
            const match = collected.find((c) => c.filename === e.filename);
            const sourceId = match?.id ?? e.filename;
            const err = errorOf("PROCESSING_ERROR", e.message);
            errors.push({
              sourceId,
              sourceFilename: e.filename,
              error: err,
            });
            setError(sourceId, err);
          }
        }
      }
    } catch (err) {
      const errItem = errorOf("PROCESSING_ERROR", safeErrorMessage(err));
      for (const c of collected) {
        errors.push({
          sourceId: c.id,
          sourceFilename: c.filename,
          error: errItem,
        });
        setError(c.id, errItem);
      }
    }

    const durationMs = Date.now() - startedAt;

    setStage("done");
    setOutcome({
      stage: "done",
      success,
      errors,
      durationMs,
      format: submittedFormat,
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