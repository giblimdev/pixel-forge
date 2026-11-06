/*
path :           app/genesis/components/HeaderFileViewerDialog.tsx
tag :            ["genesis", "check-headers", "viewer", "dialog", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Dialog d'affichage d'un fichier signalé. Charge le contenu
                 via getFileContentAction, affiche l'en-tête extrait en
                 évidence + le contenu complet dans une <pre> scrollable.
                 Deux boutons : Copier l'en-tête / Copier le fichier complet.

flow:            Reçoit open + onOpenChange + path → useEffect → charge
                 getFileContentAction(path) → affiche → boutons Copier
                 → navigator.clipboard + toast.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderFileViewerDialog.tsx",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/actions/header-check.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/header-check",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/skeleton"]

exports:         ["HeaderFileViewerDialog", "HeaderFileViewerDialogProps"]

useBy:           ["@/app/genesis/components/HeaderCheckRow.tsx",
                  "@/app/genesis/components/HeaderReciprocityReport.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir et copier le fichier signalé"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getFileContentAction } from "@/app/genesis/actions/header-check";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export interface HeaderFileViewerDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly path: string | null;
}

interface LoadedFile {
  readonly path: string;
  readonly content: string;
  readonly headerRaw: string | null;
}

export function HeaderFileViewerDialog({
  open,
  onOpenChange,
  path,
}: HeaderFileViewerDialogProps) {
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  useEffect(() => {
    if (!open || !path) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFile(null);

    getFileContentAction(path)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setFile(res.data);
        else setError(res.error);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger le fichier.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, path]);

  async function copy(text: string, which: "header" | "full") {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (which === "header") {
        setCopiedHeader(true);
        setTimeout(() => setCopiedHeader(false), 2000);
      } else {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
      }
      toast.success(which === "header" ? "En-tête copié." : "Fichier copié.");
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] flex-col gap-3 p-4 sm:max-w-2xl sm:p-6 md:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate font-mono text-sm">
            {path ?? "Fichier"}
          </DialogTitle>
          <DialogDescription>
            En-tête extrait et contenu complet du fichier signalé.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </p>
        )}

        {file && !loading && (
          <>
            <section className="shrink-0 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  En-tête extrait
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(file.headerRaw ?? "", "header")}
                  disabled={!file.headerRaw}
                >
                  {copiedHeader ? (
                    <Check className="size-3.5 text-chart-4" aria-hidden />
                  ) : (
                    <Copy className="size-3.5" aria-hidden />
                  )}
                  Copier l'en-tête
                </Button>
              </div>
              <pre className="max-h-[20vh] overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 font-mono text-[11px] leading-relaxed">
                <code>{file.headerRaw ?? "(aucun en-tête détecté)"}</code>
              </pre>
            </section>

            <section className="flex min-h-0 flex-1 flex-col space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contenu complet
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(file.content, "full")}
                >
                  {copiedFull ? (
                    <Check className="size-3.5 text-chart-4" aria-hidden />
                  ) : (
                    <Copy className="size-3.5" aria-hidden />
                  )}
                  Copier le fichier
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                <pre className="h-full overflow-auto p-4 font-mono text-xs leading-relaxed">
                  <code>{file.content}</code>
                </pre>
              </div>
            </section>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Chargement…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}