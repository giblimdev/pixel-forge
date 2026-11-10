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
                    Le bouton du ConverterPanel est deja disabled quand
                    stage === "running", mais entre deux clics rapides
                    React peut ne pas avoir encore flush setStage ; le
                    verrou ferme cette fenetre. Pose AVANT le premier
                    await, relache dans un finally.
                 2. DEDUP DEFENSIVE de success avant setOutcome et
                    recordHistory. Si un futur appelant ou une route
                    serveur produisait des sourceId dupliques, ils ne
                    sortiraient JAMAIS du hook. Garantit l'unicite de la
                    key React `success-${sourceId}` cote
                    ConversionResults.
                 3. MATCHING MULTI REECRIT : un Map<filename, collected>
                    construit UNE fois (au lieu d'un .find() O(n) par
                    resultat). Match exact en priorite, puis fallback
                    sur prefixe ANCRE (`^basename-`) — l'ancien
                    `startsWith(r.filename.split("-")[0])` pouvait
                    matcher le mauvais fichier si deux noms partageaient
                    un prefixe. Et dedup par sourceId dans la boucle : si
                    deux json.results matchent le meme item, le second
                    est ignore au lieu d'ecraser le premier.

flow:            useState(options, stage, outcome) + useRef(submitting)
                 -> items du store -> submit() -> si submitting : return
                 -> submittingRef.current = true -> conversionFormSchema
                 -> pour chaque pending : setStatus(id, "running"),
                    FormData, fetch POST /api/images/convert
                   - 1 fichier  : blob -> URL -> setResult
                   - 2+ fichiers: json -> Map match -> setResult +
                     dedup par sourceId
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
 * Extrait le basename d'un nom de fichier (sans extension).
 * Utilise pour construire un prefixe ANCRE de matching en mode multi.
 * Exemple : "photo.webp" -> "photo" ; "a.b.c.png" -> "a.b.c".
 */
function basenameOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? filename : filename.slice(0, dot);
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
    // 0. Verrou anti double-submit. Pose en PREMIER, avant tout await,
    //    pour fermer la fenetre entre deux clics rapides (React peut ne
    //    pas avoir encore flush setStage("running") quand le 2e clic
    //    arrive). Relache dans le finally plus bas.
    if (submittingRef.current) return;
    if (pendingCount === 0) return;

    submittingRef.current = true;

    try {
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

            // Index par nom original, construit UNE fois (O(n) au lieu
            // d'un .find() O(n) par resultat).
            const collectedByName = new Map(
              collected.map((c) => [c.filename, c] as const),
            );

            // Dedup : si deux json.results matchent le meme item,
            // on garde le PREMIER et on ignore le suivant. Cela
            // garantit qu'aucun sourceId n'apparait deux fois.
            const handledSourceIds = new Set<string>();

            for (const r of json.results) {
              // Priorite au match exact (le serveur renvoie le nom
              // original dans Content-Disposition, mais en mode JSON
              // on n'a que le filename transforme par la route).
              // Fallback : prefixe ANCRE par le basename — pas de
              // faux positif type "photo-vacances.jpg" matche par
              // "photo.jpg".
              const match =
                collectedByName.get(r.filename) ??
                collected.find((c) => {
                  const base = basenameOf(c.filename);
                  return r.filename.startsWith(`${base}-`);
                });

              const sourceId = match?.id ?? r.id;

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

      // Dedup finale : ceinture-bretelles. Meme si un futur chemin de
      // code poussait des doublons, on ne les expose JAMAIS a l'UI ni
      // a l'historique.
      const dedupedSuccess = dedupeSuccess(success);

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
      // Toujours relache, y compris sur throw inattendu dans le try
      // externe (peu probable, mais ceinture-bretelles).
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
