/*
path:            app/pixel/lib/history/local-history.ts
tag:             ["pixel", "history", "local-storage", "helper"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Gestion de l'historique des traitements PixelForge
                 stocke dans localStorage. Aucune donnee ne quitte le
                 navigateur (coherent avec l'ethique "outil local" du
                 projet). Fonctions pures et defensives : jamais de
                 throw, silencieux en cas d'erreur (quota, JSON invalide,
                 mode prive Safari).

                 Structure : tableau circulaire borne a HISTORY_MAX
                 entrees (les plus recentes en tete). Chaque entree
                 reference uniquement les metadonnees (pas de Buffer,
                 pas d'URL blob — ceux-ci sont ephemeres).

flow:            Module TypeScript pur -> helpers purs + localStorage
                 access. Aucun effet de bord sauf saveHistory/clearHistory
                 qui ecrivent dans localStorage.

ecosystem:       History = [
                   "@/app/pixel/lib/history/local-history.ts",
                   "@/app/pixel/components/history/history-empty.tsx",
                   "@/app/pixel/components/history/history-list.tsx",
                   "@/app/pixel/components/history/history-toolbar.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/features/converter/hooks/use-converter.ts",
                  "@/app/pixel/features/optimizer/hooks/use-optimizer.ts",
                  "@/app/pixel/features/compressor/hooks/use-compressor.ts",
                  "@/app/pixel/features/resize/hooks/use-resize.ts",
                  "@/app/pixel/features/smart-crop/hooks/use-smart-crop.ts",
                  "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                  "@/app/pixel/features/image-editor/hooks/use-image-editor.ts"]
imports:         []
exports:         ["HISTORY_MAX", "HISTORY_STORAGE_KEY",
                  "HistoryType", "HistoryEntry",
                  "saveHistory", "listHistory", "clearHistory"]
useBy:           ["@/app/pixel/components/history/history-list.tsx",
                  "@/app/pixel/components/history/history-toolbar.tsx",
                  "@/app/pixel/dashboard/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux retrouver mes derniers traitements",
                  "*en tant qu'utilisateur je veux que mon historique reste prive (localStorage)"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Nombre maximum d'entrees conservees (au-dela, les plus anciennes
 *  sont supprimees). */
export const HISTORY_MAX = 50;

/** Cle localStorage. Le suffixe ".v1" permet de versionner le schema
 *  et d'invalider les anciennes entrees si le format change. */
export const HISTORY_STORAGE_KEY = "pixel-forge.history.v1";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Type de traitement — aligne sur les 12 outils de PixelForge. */
export type HistoryType =
  | "convert"
  | "optimize"
  | "compress"
  | "resize"
  | "smart-crop"
  | "crop-manual"
  | "background-removal"
  | "retouch"
  | "favicon"
  | "placeholder"
  | "palette"
  | "metadata";

/**
 * Entree d'historique. Ne contient QUE des metadonnees serialisables :
 * pas de File, pas de Blob, pas de Buffer, pas d'URL blob (ephemere).
 */
export interface HistoryEntry {
  readonly id: string;
  readonly type: HistoryType;
  readonly createdAt: string;
  readonly toolHref: string;
  readonly sourceFilename: string;
  readonly sourceSizeBytes: number;
  readonly resultFilename: string | null;
  readonly resultSizeBytes: number | null;
  readonly savedBytes: number | null;
  readonly itemCount: number;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function isHistoryType(value: unknown): value is HistoryType {
  return (
    value === "convert" ||
    value === "optimize" ||
    value === "compress" ||
    value === "resize" ||
    value === "smart-crop" ||
    value === "crop-manual" ||
    value === "background-removal" ||
    value === "retouch" ||
    value === "favicon" ||
    value === "placeholder" ||
    value === "palette" ||
    value === "metadata"
  );
}

function isValidEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    isHistoryType(v.type) &&
    typeof v.createdAt === "string" &&
    typeof v.toolHref === "string" &&
    typeof v.sourceFilename === "string" &&
    typeof v.sourceSizeBytes === "number" &&
    (v.resultFilename === null || typeof v.resultFilename === "string") &&
    (v.resultSizeBytes === null || typeof v.resultSizeBytes === "number") &&
    (v.savedBytes === null || typeof v.savedBytes === "number") &&
    typeof v.itemCount === "number"
  );
}

function safeParse(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Ajoute une entree en tete de l'historique. Si HISTORY_MAX est depasse,
 * les entrees les plus anciennes sont supprimees. Ne leve jamais.
 */
export function saveHistory(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = safeParse(
      window.localStorage.getItem(HISTORY_STORAGE_KEY),
    );
    const next = [entry, ...existing].slice(0, HISTORY_MAX);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Silencieux : quota depasse, mode prive Safari, etc.
  }
}

/**
 * Lit l'historique. Retourne [] si vide ou invalide. Ne leve jamais.
 */
export function listHistory(): readonly HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(window.localStorage.getItem(HISTORY_STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Vide l'historique. Ne leve jamais.
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Silencieux
  }
}