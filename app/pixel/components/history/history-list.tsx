/*
path:            app/pixel/components/history/history-list.tsx
tag:             ["pixel", "component", "history", "list"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Liste des entrees d'historique. Client Component car
                 lit localStorage dans un useEffect. Affiche une carte
                 par entree avec :
                 - icone du type d'outil
                 - nom + poids source -> nom + poids resultat
                 - economie en % et Ko (si positif)
                 - date relative (il y a X min/h/j)
                 - lien vers l'outil correspondant.

                 Compose HistoryToolbar (compteur + vider) et
                 HistoryEmpty (etat vide). La liste est bornee a
                 HISTORY_MAX par local-history.ts.

flow:            useEffect -> listHistory() -> setEntries ->
                 si vide : HistoryEmpty -> sinon : HistoryToolbar +
                 liste de cartes.

ecosystem:       History = [
                   "@/app/pixel/lib/history/local-history.ts",
                   "@/app/pixel/components/history/history-empty.tsx",
                   "@/app/pixel/components/history/history-list.tsx",
                   "@/app/pixel/components/history/history-toolbar.tsx",
                   "@/app/pixel/dashboard/page.tsx",
                 ]
relatedFiles:    ["@/app/pixel/lib/history/local-history.ts",
                  "@/app/pixel/components/history/history-empty.tsx",
                  "@/app/pixel/components/history/history-toolbar.tsx"]
imports:         ["react", "next/link", "lucide-react",
                  "@/app/pixel/lib/history/local-history",
                  "@/app/pixel/components/history/history-empty",
                  "@/app/pixel/components/history/history-toolbar"]
exports:         ["HistoryList", "HistoryListProps"]
useBy:           ["@/app/pixel/dashboard/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir mes derniers traitements",
                  "*en tant qu'utilisateur je veux cliquer sur une entree pour retourner a l'outil"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : useEffect + localStorage + bouton vider.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Palette,
  Scissors,
  ShieldOff,
  Sparkles,
  Star,
  Wand2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  clearHistory,
  listHistory,
  type HistoryEntry,
  type HistoryType,
} from "@/app/pixel/lib/history/local-history";
import { HistoryEmpty } from "@/app/pixel/components/history/history-empty";
import { HistoryToolbar } from "@/app/pixel/components/history/history-toolbar";

// ---------------------------------------------------------------------------
// Config visuelle par type
// ---------------------------------------------------------------------------

const TYPE_META: Readonly<
  Record<HistoryType, { readonly label: string; readonly icon: LucideIcon }>
> = {
  convert: { label: "Convertir", icon: Wand2 },
  optimize: { label: "Optimiser", icon: Wrench },
  compress: { label: "Compresser", icon: ShieldOff },
  resize: { label: "Redimensionner", icon: Wrench },
  "smart-crop": { label: "Recadrage intelligent", icon: Scissors },
  "crop-manual": { label: "Recadrage manuel", icon: Scissors },
  "background-removal": { label: "Détourer", icon: Scissors },
  retouch: { label: "Retoucher", icon: Palette },
  favicon: { label: "Favicons", icon: Star },
  placeholder: { label: "Placeholders", icon: Sparkles },
  palette: { label: "Palettes", icon: Palette },
  metadata: { label: "Métadonnées", icon: Wrench },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "date inconnue";
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / (60 * 1000));
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

function savedPercent(entry: HistoryEntry): number | null {
  if (entry.savedBytes === null || entry.sourceSizeBytes <= 0) return null;
  return Math.round((entry.savedBytes / entry.sourceSizeBytes) * 100);
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export interface HistoryListProps {
  readonly className?: string;
}

export function HistoryList({ className }: HistoryListProps) {
  const [entries, setEntries] = useState<readonly HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(listHistory());
    setMounted(true);
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  // Evite le flash "vide" avant que localStorage ne soit lu.
  if (!mounted) {
    return (
      <div className={`space-y-3 ${className ?? ""}`}>
        <div className="h-6 w-48 animate-pulse rounded bg-[var(--pf-surface-hover)]" />
        <div className="h-20 w-full animate-pulse rounded-xl bg-[var(--pf-surface-hover)]" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <HistoryEmpty className={className} />;
  }

  return (
    <section
      aria-label="Historique des traitements"
      className={`space-y-3 ${className ?? ""}`}
    >
      <HistoryToolbar count={entries.length} onClear={handleClear} />

      <ul className="space-y-2">
        {entries.map((entry) => {
          const meta = TYPE_META[entry.type];
          const Icon = meta.icon;
          const percent = savedPercent(entry);
          return (
            <li
              key={entry.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 p-3 backdrop-blur-xl"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]">
                <Icon className="size-4" aria-hidden />
              </span>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium text-[var(--pf-foreground)]">
                  {entry.sourceFilename}
                  {entry.itemCount > 1 && (
                    <span className="ml-1.5 text-[10px] text-[var(--pf-muted)]">
                      +{entry.itemCount - 1}
                    </span>
                  )}
                </p>
                <p className="font-mono text-[10px] text-[var(--pf-muted)]">
                  {formatSize(entry.sourceSizeBytes)}
                  {entry.resultSizeBytes !== null && (
                    <>
                      {" → "}
                      {formatSize(entry.resultSizeBytes)}
                    </>
                  )}
                  {percent !== null && percent > 0 && (
                    <span className="ml-1 text-[var(--pf-success)]">
                      (-{percent} %)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-[10px] text-[var(--pf-muted)]">
                  {meta.label}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--pf-muted)]">
                  <Clock className="size-2.5" aria-hidden />
                  {formatRelative(entry.createdAt)}
                </span>
              </div>

              <Link
                href={entry.toolHref}
                className="shrink-0 rounded-md bg-[var(--pf-primary)]/10 px-2 py-1 text-[11px] font-medium text-[var(--pf-primary)] hover:bg-[var(--pf-primary)]/20"
              >
                Rouvrir
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}