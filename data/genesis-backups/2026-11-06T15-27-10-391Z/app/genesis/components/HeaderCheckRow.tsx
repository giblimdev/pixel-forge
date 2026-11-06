/*
path :           app/genesis/components/HeaderCheckRow.tsx
tag :            ["genesis", "check-headers", "row", "ui", "copy"]
projectId:       new-genesis
type:            component
generic:         false

role:            Ligne de résultat du check-headers. Affiche le statut
                 (badge coloré), le path, la liste des issues, et un
                 bouton « Copier le fichier » qui copie le contenu complet
                 dans le presse-papier (result.content est déjà chargé
                 côté serveur). Aucune modale, aucun appel réseau
                 supplémentaire.

flow:            Reçoit result → useState(copied) → rend badge + path
                 + issues + bouton Copier → clic → navigator.clipboard
                 .writeText(result.content) → toast + setCopied(true)
                 → reset 2 s.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/components/ui/button"]

exports:         ["HeaderCheckRow", "HeaderCheckRowProps"]

useBy:           ["@/app/genesis/components/HeaderCheckReport.tsx"]

userStories:     ["*en tant qu'utilisateur je veux copier le fichier signalé en un clic"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import type {
  HeaderCheckResult,
  HeaderCheckStatus,
} from "@/app/genesis/lib/header-types";
import { Button } from "@/components/ui/button";

export interface HeaderCheckRowProps {
  readonly result: HeaderCheckResult;
}

const STATUS_LABEL: Record<HeaderCheckStatus, string> = {
  ok: "OK",
  missing: "Manquant",
  incomplete: "Incomplet",
  invalid: "Invalide",
  skipped: "Ignoré",
};

const STATUS_CLASS: Record<HeaderCheckStatus, string> = {
  ok: "bg-chart-4/15 text-chart-4",
  missing: "bg-destructive/10 text-destructive",
  incomplete: "bg-chart-3/15 text-chart-3",
  invalid: "bg-chart-5/15 text-chart-5",
  skipped: "bg-muted text-muted-foreground",
};

export function HeaderCheckRow({ result }: HeaderCheckRowProps) {
  const [copied, setCopied] = useState(false);

  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      toast.success("Fichier copié.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le fichier.");
    }
  }

  return (
    <li className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[result.status]}`}
        >
          {STATUS_LABEL[result.status]}
        </span>
        <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">
          {result.path}
        </code>
        {errors.length > 0 && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
            {errors.length} erreur{errors.length > 1 ? "s" : ""}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="shrink-0 rounded-full bg-chart-3/15 px-1.5 py-0.5 text-[10px] font-medium text-chart-3">
            {warnings.length} warning{warnings.length > 1 ? "s" : ""}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          disabled={result.content.length === 0}
          aria-label={`Copier le fichier ${result.path}`}
          title="Copier le fichier en entier"
          className="shrink-0"
        >
          {copied ? (
            <Check className="size-3.5 text-chart-4" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>

      {result.issues.length > 0 && (
        <ul className="mt-2 space-y-1">
          {result.issues.map((issue, index) => (
            <li
              key={`${issue.field}-${index}`}
              className={`flex gap-2 text-[11px] leading-relaxed ${
                issue.severity === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              <span className="shrink-0 font-mono">
                {issue.severity === "error" ? "✘" : "⚠"}
              </span>
              <span>
                <span className="font-mono">{issue.field}</span> — {issue.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}