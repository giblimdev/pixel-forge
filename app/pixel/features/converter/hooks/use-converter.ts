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
                 5. Mise a jour du store (setResult, setError).
                 6. Exposition d'un etat global (stage, outcome).
                 7. Persistance locale de l'historique (Phase 19).

                 ⚠️ CORRECTIFS v2 :
                 1. VERROU ANTI DOUBLE-SUBMIT via submittingRef (useRef).
                 2. DEDUP DEFENSIVE de success avant setOutcome.
                 3. MATCHING MULTI avec Map<filename, collected>.

                 ⚠️ CORRECTIF v3 (sourceId E2E) :
                 Le hook ENVOIE le champ multipart "sourceIds". La route
                 le propage dans chaque ResultImage. Le hook matche par
                 r.sourceId en priorite (fallback nom normalise).

                 ⚠️ CORRECTIF v4 (telechargement en mode multi) :
                 En mode JSON, le serveur renvoie `bufferBase64` en plus
                 des metadonnees (car JSON ne serialise pas ArrayBuffer).
                 Le hook decode ce base64 en Uint8Array, cree un Blob du
                 bon mime, puis URL.createObjectURL() pour alimenter
                 downloadUrl. Le bouton "Telecharger" de
                 ConversionResults apparait donc pour chaque fichier en
                 mode multi (le composant teste `item.downloadUrl`).
                 Le mode mono reste INCHANGE : Blob binaire direct ->
                 URL.createObjectURL(blob), sans base64, sans surcout.

flow:            useState(options, stage, outcome) + useRef(submitting)
                 -> items du store -> submit() -> si submitting : return
                 -> submittingRef.current = true -> conversionFormSchema
                 -> pour chaque pending : setStatus(id, "running"),
                    FormData (files + sourceIds + options),
                    fetch POST /api/images/convert
                   - 1 fichier  : blob -> URL -> setResult
                   - 2+ fichiers: json -> match sourceId (fallback nom)
                     -> decode bufferBase64 -> Blob -> URL -> setResult
                     -> dedup par sourceId
                   - !response.ok : setError
                 -> dedupeSuccess(success) -> setOutcome
                 -> recordHistory(deduped) -> finally submitting = false.

ecosystem:       Converter = [
                   "@/app/pixel/features/converter/types/converter.types.ts",
                   "@/app/pixel/features/converter/schemas/converter.schema.ts",
                   "@/app/pixel/features/converter/hooks/use-converter.ts",
                   "@/app/pixel/features/converter/components/format-selector.tsx",
                   "@/app/pixel/features/converter/components/quality-control.tsx",
                   "@/app/pixel/features/converter/components/conversion-results.tsx",
                   "@/app/pixel/features/converter/components/converter-panel.tsx",
                   "@/app/pixel/features/converter/index.ts",
                   "@/app/pixel/lib/history/local-history.ts",
                 ]
relatedFiles:    ["@/app/pixel/stores/image-queue.store.ts",
                  "@/app/pixel/types/conversion.ts",
                  "@/app/pixel/types/image.ts",
                  "@/app/pixel/types/processing.ts",
                  "@/app/api/images/convert/route.ts",
                  "@/app/pixel/lib/history/local-history.ts"]
imports:         ["react",
                  "@/app/pixel/stores/image-queue.store",
                  "@/app/pixel/types/conversion",
                  "@/app/pixel/types/image",
                  "@/app/pixel/types/processing",
                  "@/app/pixel/features/converter/types/converter.types",
                  "@/app/pixel/features/converter/schemas/converter.schema",
                  "@/app/pixel/lib/history/local-history"]
exports:         ["UseConverterReturn", "useConverter"]
useBy:           ["@/app/pixel/features/converter/components/converter-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux convertir toutes les images de ma file",
                  "*en tant que developpeur je veux un hook qui pilote POST /api/images/convert",
                  "*en tant qu'utilisateur je veux retrouver mes conversions dans mon historique",
                  "*en tant qu'utilisateur je veux telecharger chaque fichier converti"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useState + useRef + fetch + store Zustand + localStorage.

import { useCallback, useRef, useState } from "react";

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
import { saveHistory } from "@/app/pixel/lib/history/local-history";

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

/**
 * ResultImage recu en mode JSON : le serveur y ajoute `bufferBase64`
 * (string) car JSON ne serialise pas ArrayBuffer. Le champ `buffer`
 * est absent en JSON (supprime par JSON.stringify).
 */
type ResultImageFromJson = ResultImage & {
  readonly bufferBase64?: string | null;
};

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function errorOf(code: ProcessingErrorCode, message: string): ProcessingError {
  return { code, message };
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Erreur inconnue.";
}

/**
 * Decode un base64 en Uint8Array, puis cree un Blob du mime fourni et
 * retourne un objectURL. Utilise en mode multi pour alimenter
 * downloadUrl (le serveur ne renvoie ni URL ni buffer brut).
 */
function base64ToObjectUrl(base64: string, mime: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

/**
 * Transforme un ResultImage JSON en ConversionSuccessItem enrichi
 * avec `sourceSizeBytes` (poids du fichier source, avant conversion).
 */
function toSuccessItem(
  sourceId: string,
  sourceFilename: string,
  sourceSizeBytes: number,
  result: ResultImage,
  downloadUrl: string,
): ConversionSuccessItem {
  return { sourceId, sourceFilename, sourceSizeBytes, result, downloadUrl };
}

/**
 * Dedoublonne une liste de ConversionSuccessItem par `sourceId`.
 * Garde la PREMIERE occurrence (ordre d'apparition preserve).
 */
function dedupeSuccess(
  success: readonly ConversionSuccessItem[],
): ConversionSuccessItem[] {
  const seen = new Set<string>();
  const out: ConversionSuccessItem[] = [];
  for (const item of success) {
    if (seen.has(item.sourceId)) continue;
    seen.add(item.sourceId);
    out.push(item);
  }
  return out;
}

/**
 * Normalise un nom pour le matching par fallback : MEME regex que
 * safeBasename() cote route ([^\w.-]+ -> "-"), trim des tirets en
 * debut/fin, slice 200.
 */
function normalizeForMatch(filename: string): string {
  return filename
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * Extrait le basename NORMALISE d'un nom de fichier (sans extension).
 * Exemple : "Capture d'écran 210123.png" -> "Capture-d-cran-210123"
 */
function basenameOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return normalizeForMatch(base);
}

/**
 * Enregistre l'historique local (localStorage) pour une soumission
 * reussie. Agrege les tailles de tous les fichiers du lot.
 */
function recordHistory(success: readonly ConversionSuccessItem[]): void {
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
    type: "convert",
    createdAt: new Date().toISOString(),
    toolHref: "/pixel/convert",
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

export function useConverter(): UseConverterReturn {
  const items = useImageQueueStore(selectItems);
  const setStatus = useImageQueueStore((s) => s.setStatus);
  const setResult = useImageQueueStore((s) => s.setResult);
  const setError = useImageQueueStore((s) => s.setError);

  const [options, setOptionsState] = useState<ConversionOptions>(
    DEFAULT_CONVERSION_OPTIONS,
  );
  const [stage, setStage] = useState<ConverterStage>("idle");
  const [outcome, setOutcome] = useState<ConversionOutcome | null>(null);

  const submittingRef = useRef(false);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const setOptions = useCallback((next: ConversionOptions) => {
    setOptionsState(next);
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setOutcome(null);
  }, []);

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    if (pendingCount === 0) return;

    submittingRef.current = true;

    try {
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

      const targets = items.filter((i) => i.status === "pending");
      const startedAt = Date.now();
      const success: ConversionSuccessItem[] = [];
      const errors: ConversionErrorItem[] = [];

      setStage("running");
      setOutcome(null);

      const multi = targets.length > 1;
      const collected: {
        id: string;
        filename: string;
        size: number;
        file: File | Blob;
      }[] = [];

      for (const item of targets) {
        setStatus(item.source.id, "running");
        collected.push({
          id: item.source.id,
          filename: item.source.filename,
          size: item.source.sizeBytes,
          file: item.source.file,
        });
      }

      try {
        if (!multi) {
          // ---- Mode 1 fichier : Blob response --------------------------
          const single = collected[0]!;
          const form = new FormData();
          form.append("files", single.file, single.filename);
          form.append("sourceIds", single.id);
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
            const mime =
              res.headers.get("Content-Type") ?? "application/octet-stream";
            const disposition = res.headers.get("Content-Disposition");
            const filename =
              disposition?.match(/filename="(.+?)"/)?.[1] ??
              `converted.${submittedFormat}`;
            const downloadUrl = URL.createObjectURL(blob);

            const resultImage: ResultImage = {
              id: single.id,
              sourceId: single.id,
              filename,
              format: submittedFormat,
              mime: mime as ResultImage["mime"],
              sizeBytes: blob.size,
              dimensions: { width: 0, height: 0 },
              url: downloadUrl,
              buffer: null,
              expiresAt: null,
            };

            setResult(single.id, resultImage);
            success.push(
              toSuccessItem(
                single.id,
                single.filename,
                single.size,
                resultImage,
                downloadUrl,
              ),
            );
          }
        } else {
          // ---- Mode 2+ fichiers : JSON -------------------------------
          const form = new FormData();
          for (const c of collected) form.append("files", c.file, c.filename);
          for (const c of collected) form.append("sourceIds", c.id);
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
              results: readonly ResultImageFromJson[];
              errors: readonly { filename: string; message: string }[];
              durationMs: number;
            };

            const collectedByName = new Map(
              collected.map((c) => [c.filename, c] as const),
            );
            const handledSourceIds = new Set<string>();

            for (const r of json.results) {
              // Matching : sourceId prioritaire, fallback nom exact,
              // puis fallback prefixe ANCRE (basename normalise).
              const match = r.sourceId
                ? collected.find((c) => c.id === r.sourceId)
                : (collectedByName.get(r.filename) ??
                  collected.find((c) => {
                    const base = basenameOf(c.filename);
                    return r.filename.startsWith(`${base}-`);
                  }));

              const sourceId = match?.id ?? r.sourceId ?? r.id;

              if (handledSourceIds.has(sourceId)) continue;
              handledSourceIds.add(sourceId);

              // Reconstruction de downloadUrl :
              //   1. r.url (si Vercel Blob configure un jour)
              //   2. r.bufferBase64 -> Blob -> objectURL
              //   3. "" (pas de telechargement possible)
              let downloadUrl = r.url ?? "";
              if (!downloadUrl && r.bufferBase64) {
                try {
                  downloadUrl = base64ToObjectUrl(r.bufferBase64, r.mime);
                } catch (err) {
                  console.warn(
                    "[converter] echec decodage bufferBase64",
                    r.filename,
                    err,
                  );
                }
              }

              // Le buffer brut n'existe pas en JSON : on force `buffer`
              // a null pour que le ResultImage envoye au store soit
              // coherent (le contrat accepte null).
              const resultForStore: ResultImage = {
                ...r,
                buffer: null,
                url: downloadUrl || null,
              };

              const sourceFilename = match?.filename ?? r.filename;
              const sourceSizeBytes = match?.size ?? 0;

              setResult(sourceId, resultForStore);
              success.push(
                toSuccessItem(
                  sourceId,
                  sourceFilename,
                  sourceSizeBytes,
                  resultForStore,
                  downloadUrl,
                ),
              );
            }
            for (const e of json.errors) {
              const match = collectedByName.get(e.filename);
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
      const dedupedSuccess = dedupeSuccess(success);

      setStage("done");
      setOutcome({
        stage: "done",
        success: dedupedSuccess,
        errors,
        durationMs,
        format: submittedFormat,
      });

      recordHistory(dedupedSuccess);
    } finally {
      submittingRef.current = false;
    }
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