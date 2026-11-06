/*
path :           app/genesis/components/HeaderCheckRow.tsx
tag :            ["genesis", "check-headers", "row", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Ligne de résultat du check-headers. Affiche le statut
                 (badge coloré), le path, et la liste des issues (field
                 + message, error en rouge, warning en ambre). Contrôlée
                 par le parent : aucun state local.

flow:            Reçoit result → rend une ligne avec badge de statut +
                 path en mono + issues groupées.

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/lib/header-rules.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-check.ts",
                   "@/app/genesis/lib/header-validations.ts",
                   "@/app/genesis/actions/header-check.ts",
                   "@/app/genesis/components/HeaderExclusionsDialog.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                   "@/app/genesis/components/HeaderCheckReport.tsx",
                   "@/app/genesis/components/HeaderCheckRow.tsx",
                   "@/app/genesis/check-headers/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-types.ts"]

imports:         ["@/app/genesis/lib/header-types"]

exports:         ["HeaderCheckRow", "HeaderCheckRowProps"]

useBy:           ["@/app/genesis/components/HeaderCheckReport.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le détail d'un fichier non conforme"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type {
  HeaderCheckResult,
  HeaderCheckStatus,
} from "@/app/genesis/lib/header-types";

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
  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");

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