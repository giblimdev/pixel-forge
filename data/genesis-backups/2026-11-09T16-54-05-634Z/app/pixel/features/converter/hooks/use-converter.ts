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
                 7. Persistance locale de l'historique (Phase 19) via
                    saveHistory() — 1 entree par soumission reussie.

                 IMPORTANT : le hook n'invente aucun format. Il utilise
                 OUTPUT_FORMATS derive de FORMAT_CAPABILITIES. Les items
                 deja "success" ou en cours ("running") sont ignores a
                 la soumission : seule la file pending est traitee.

                 ⚠️ CORRECTIFS v2 (fix warning React "two children with
                 the same key") :
                 1. VERROU ANTI DOUBLE-SUBMIT via submittingRef (useRef).
                 2. DEDUP DEFENSIVE de success avant setOutcome et
                    recordHistory.
                 3. MATCHING MULTI avec Map<filename, collected>.

                 ⚠️ CORRECTIF v3 (sourceId E2E) :
                 Le hook ENVOIE desormais le champ multipart "sourceIds"
                 (un append par fichier, meme ordre que "files"). La
                 route le lit via readSourceIds() et le propage dans
                 chaque ResultImage. Le hook matche donc par r.sourceId
                 en priorite (fiable, independant du nom), et ne
                 retombe sur le matching par nom QUE si le serveur ne
                 propage pas sourceId.
                   - MONO  : form.append("sourceIds", single.id)
                   - MULTI : for (c of collected) form.append("sourceIds", c.id)
                 Consequence : chaque ResultImage porte son sourceId,
                 le matching est O(1) par id, plus de faux positif
                 possible.

                 ⚠️ CORRECTIF v3b (fallback par nom robuste) :
                 L'ancien basenameOf("Capture d'écran 210123.png")
                 renvoyait "Capture d'écran 210123" (espaces + accents
                 preserves) alors que la route renomme le fichier en
                 "Capture-d-cran-210123-converted.webp" via
                 safeBasename() (regex [^\w.-]+ -> "-"). Donc le
                 prefixe ANCRE ne matchait JAMAIS pour les noms avec
                 espaces/apostrophes/accents. basenameOf applique
                 desormais la MEME normalisation que safeBasename de
                 la route (regex + trim tirets + slice 200). Fallback
                 fiable meme si sourceId est absent.

                 ⚠️ DIAGNOSTIC (logs temporaires) :
                 console.log prefixes [converter] ajoutes aux points
                 strategiques. Filtre la console sur "converter".
                 A SUPPRIMER une fois le bug valide resolu.

flow:            useState(options, stage, outcome) + useRef(submitting)
                 -> items du store -> submit() -> si submitting : return
                 -> submittingRef.current = true -> conversionFormSchema
                 -> pour chaque pending : setStatus(id, "running"),
                    FormData (files + sourceIds + options),
                    fetch POST /api/images/convert
                   - 1 fichier  : blob -> URL -> setResult
                   - 2+ fichiers: json -> match par sourceId (fallback
                     nom normalise) -> setResult + dedup par sourceId
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
                  "*en tant qu'utilisateur je veux retrouver mes conversions dans mon historique"]

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
 *
 * Defensif : meme si le serveur renvoyait deux fois le meme ResultImage,
 * ou si un futur appelant poussait deux items pour le meme fichier,
 * le hook ne propagerait jamais de cle React dupliquee a l'UI.
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
 * debut/fin, slice 200. Indispensable pour que
 * "Capture d'écran 210123" (nom original) et
 * "Capture-d-cran-210123-converted.webp" (nom route) matchent via
 * le prefixe ANCRE.
 */
function normalizeForMatch(filename: string): string {
  return filename
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * Extrait le basename NORMALISE d'un nom de fichier (sans extension).
 * Exemple : "Capture d'écran 210123.png"
 *        -> "Capture-d-cran-210123"
 */
function basenameOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return normalizeForMatch(base);
}

/**
 * Enregistre l'historique local (localStorage) pour une soumission
 * reussie. Agrege les tailles de tous les fichiers du lot.
 *
 * `sourceSizeBytes` est desormais disponible directement sur chaque
 * ConversionSuccessItem (cf. types/converter.types.ts) : pas besoin
 * de le recuperer depuis `collected`.
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

  // Verrou anti double-submit. Un useRef (et non un state) car on ne
  // veut AUCUN re-render : on veut juste un flag synchrone lu/ecrit
  // dans le meme tick, independamment du cycle de rendu React.
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
    // ⚠️ DEBUG #1 — entree de submit
    console.log("[converter] #1 submit() appele", {
      submitting: submittingRef.current,
      pendingCount,
      itemsLength: items.length,
      stage,
      itemStatuses: items.map((i) => ({
        id: i.source.id,
        name: i.source.filename,
        status: i.status,
      })),
    });

    if (submittingRef.current) {
      console.warn("[converter] #1b EARLY RETURN : deja en cours (verrou)");
      return;
    }
    if (pendingCount === 0) {
      console.warn(
        "[converter] #1c EARLY RETURN : pendingCount === 0 — les images ne sont pas en statut 'pending'. Verifie le store.",
        items.map((i) => ({ name: i.source.filename, status: i.status })),
      );
      return;
    }

    submittingRef.current = true;

    try {
      // 1. Validation locale des options (regles metier etendues).
      const parsed = converterFormSchema.safeParse(options);
      console.log("[converter] #2 validation options", {
        success: parsed.success,
        issues: parsed.success
          ? null
          : parsed.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
        options,
      });

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

      if (targets.length < items.length) {
        const notPending = items.filter((i) => i.status !== "pending");
        console.warn(
          "[converter] ATTENTION : certains fichiers de la file ne seront PAS traites (statut non-pending).",
          notPending.map((i) => ({
            name: i.source.filename,
            status: i.status,
          })),
        );
      }

      setStage("running");
      setOutcome(null);

      // 3. Un fichier -> Blob response. 2+ -> JSON.
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

      console.log("[converter] #3 mode de traitement", {
        multi,
        targetsLength: targets.length,
        collected: collected.map((c) => ({
          id: c.id,
          filename: c.filename,
          size: c.size,
          fileType:
            c.file instanceof File
              ? `File(${c.file.type})`
              : c.file instanceof Blob
                ? `Blob(${c.file.type})`
                : "unknown",
        })),
        submittedFormat,
      });

      try {
        if (!multi) {
          // ---- Mode 1 fichier : Blob response --------------------------
          const single = collected[0]!;
          const form = new FormData();
          form.append("files", single.file, single.filename);
          form.append("sourceIds", single.id); // ✅ sourceId E2E
          form.append("options", JSON.stringify(options));

          console.log("[converter] #4a fetch MONO", {
            url: "/api/images/convert",
            filename: single.filename,
            size: single.size,
            sourceId: single.id,
            optionsJson: JSON.stringify(options),
          });

          const res = await fetch("/api/images/convert", {
            method: "POST",
            body: form,
          });

          console.log("[converter] #5a reponse MONO", {
            status: res.status,
            ok: res.ok,
            contentType: res.headers.get("Content-Type"),
            contentLength: res.headers.get("Content-Length"),
            sourceIdHeader: res.headers.get("X-PixelForge-Source-Id"),
            resultIdHeader: res.headers.get("X-PixelForge-Result-Id"),
          });

          if (!res.ok) {
            const errBody: unknown = await res.json().catch(() => null);
            const message =
              (errBody as { error?: { message?: string } } | null)?.error
                ?.message ?? `Erreur HTTP ${res.status}.`;
            const code = (errBody as { error?: { code?: string } } | null)
              ?.error?.code;

            console.error("[converter] #6a ERREUR MONO", {
              status: res.status,
              message,
              code,
              errBody,
            });

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
              dimensions: { width: 0, height: 0 }, // inconnu en mode blob
              url: null,
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
          for (const c of collected) form.append("sourceIds", c.id); // ✅ E2E
          form.append("options", JSON.stringify(options));

          console.log("[converter] #4b fetch MULTI", {
            url: "/api/images/convert",
            fileCount: collected.length,
            filenames: collected.map((c) => c.filename),
            sourceIds: collected.map((c) => c.id),
            sizes: collected.map((c) => c.size),
            totalSize: collected.reduce((s, c) => s + c.size, 0),
            optionsJson: JSON.stringify(options),
          });

          const res = await fetch("/api/images/convert", {
            method: "POST",
            body: form,
          });

          console.log("[converter] #5b reponse MULTI", {
            status: res.status,
            ok: res.ok,
            contentType: res.headers.get("Content-Type"),
            contentLength: res.headers.get("Content-Length"),
          });

          if (!res.ok) {
            const errBody: unknown = await res.json().catch(() => null);
            const message =
              (errBody as { error?: { message?: string } } | null)?.error
                ?.message ?? `Erreur HTTP ${res.status}.`;

            console.error("[converter] #6b ERREUR MULTI", {
              status: res.status,
              message,
              errBody,
            });

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

            console.log("[converter] #7 JSON recu", {
              resultsCount: json.results.length,
              errorsCount: json.errors.length,
              durationMs: json.durationMs,
              results: json.results.map((r) => ({
                id: r.id,
                sourceId: r.sourceId,
                filename: r.filename,
                sizeBytes: r.sizeBytes,
                mime: r.mime,
                format: r.format,
                url: r.url,
              })),
              errors: json.errors,
            });

            // Index par nom original, construit UNE fois (O(n) au lieu
            // d'un .find() O(n) par resultat). Sert uniquement de
            // FALLBACK quand la route ne propage pas sourceId.
            const collectedByName = new Map(
              collected.map((c) => [c.filename, c] as const),
            );

            // Dedup : si deux json.results matchent le meme item,
            // on garde le PREMIER et on ignore le suivant. Cela
            // garantit qu'aucun sourceId n'apparait deux fois.
            const handledSourceIds = new Set<string>();

            for (const r of json.results) {
              // ---- Matching en 2 temps --------------------------------
              //
              // 1. Si le serveur propage sourceId (contrat ideal via
              //    readSourceIds + form.append("sourceIds", ...)) :
              //    match DIRECT par id. Fiable, independant du nom.
              //
              // 2. Sinon : fallback sur le nom.
              //    a) match exact du filename original.
              //    b) prefixe ANCRE par le basename NORMALISE (meme
              //       regex que safeBasename cote route).
              const match = r.sourceId
                ? collected.find((c) => c.id === r.sourceId)
                : (collectedByName.get(r.filename) ??
                  collected.find((c) => {
                    const base = basenameOf(c.filename);
                    return r.filename.startsWith(`${base}-`);
                  }));

              // Priorite : match par id > sourceId serveur > id resultat
              const sourceId = match?.id ?? r.sourceId ?? r.id;

              console.log("[converter] #7b matching", {
                resultFilename: r.filename,
                resultId: r.id,
                resultSourceId: r.sourceId,
                matchedSourceId: match?.id,
                matchedSourceFilename: match?.filename,
                finalSourceId: sourceId,
                alreadyHandled: handledSourceIds.has(sourceId),
              });

              // Dedup : deja traite -> on ignore silencieusement.
              if (handledSourceIds.has(sourceId)) continue;
              handledSourceIds.add(sourceId);

              const sourceFilename = match?.filename ?? r.filename;
              const sourceSizeBytes = match?.size ?? 0;
              const downloadUrl = r.url ?? "";
              setResult(sourceId, r);
              success.push(
                toSuccessItem(
                  sourceId,
                  sourceFilename,
                  sourceSizeBytes,
                  r,
                  downloadUrl,
                ),
              );
            }
            for (const e of json.errors) {
              const match = collectedByName.get(e.filename);
              const sourceId = match?.id ?? e.filename;

              console.warn("[converter] #7c erreur serveur unitaire", {
                filename: e.filename,
                message: e.message,
                matchedSourceId: match?.id,
                finalSourceId: sourceId,
              });

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
        console.error("[converter] EXCEPTION dans try interne", err);
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

      // Dedup finale : ceinture-bretelles. Meme si un futur chemin de
      // code poussait des doublons, on ne les expose JAMAIS a l'UI ni
      // a l'historique.
      const dedupedSuccess = dedupeSuccess(success);

      console.log("[converter] #8 resume avant setOutcome", {
        durationMs,
        successRaw: success.length,
        successDeduped: dedupedSuccess.length,
        errorsCount: errors.length,
        successIds: dedupedSuccess.map((s) => s.sourceId),
        errorIds: errors.map((e) => e.sourceId),
      });

      setStage("done");
      setOutcome({
        stage: "done",
        success: dedupedSuccess,
        errors,
        durationMs,
        format: submittedFormat,
      });

      // -------------------------------------------------------------------
      // Phase 19 — Historique local (localStorage)
      // -------------------------------------------------------------------
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
