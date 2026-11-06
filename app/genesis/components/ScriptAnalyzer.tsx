/*
path :           app/genesis/components/ScriptAnalyzer.tsx
tag :            ["genesis", "create-files", "analysis", "ui", "client"]
projectId:       new-genesis
type:            component
generic:         false

role:            Affichage de l'analyse de complétude d'un script :
                 score (barre de progression colorée), statut (complet /
                 suspect / incomplet), liste des issues groupées par
                 sévérité. Purement présentationnel : reçoit l'analyse
                 déjà calculée (analyzeScript) et l'affiche. Aucun state.

flow:            Reçoit analysis → rend un bloc avec barre de score,
                 badge de statut, et liste d'issues (error en rouge,
                 warning en ambre, avec numéro de ligne si présent).

ecosystem:       CreateFiles = [
                   "@/app/genesis/components/ScriptAnalyzer.tsx",
                   "@/app/genesis/lib/analyze-script.ts",
                 ]

relatedFiles:    ["@/app/genesis/lib/analyze-script.ts"]

imports:         ["lucide-react",
                  "@/app/genesis/lib/analyze-script"]

exports:         ["ScriptAnalyzer", "ScriptAnalyzerProps"]

useBy:           ["@/app/genesis/components/ScriptInput.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la qualité de mon script avant de l'ajouter"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

import type { ScriptAnalysis } from "@/app/genesis/lib/analyze-script";

export interface ScriptAnalyzerProps {
  readonly analysis: ScriptAnalysis;
}

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return "bg-chart-4";
  if (score >= 50) return "bg-chart-3";
  return "bg-destructive";
};

const STATUS_BADGE = (complete: boolean, hasError: boolean): {
  label: string;
  className: string;
  icon: typeof CheckCircle2;
} => {
  if (complete) {
    return {
      label: "Complet",
      className: "bg-chart-4/15 text-chart-4",
      icon: CheckCircle2,
    };
  }
  if (hasError) {
    return {
      label: "Incomplet",
      className: "bg-destructive/10 text-destructive",
      icon: AlertCircle,
    };
  }
  return {
    label: "Suspect",
    className: "bg-chart-3/15 text-chart-3",
    icon: AlertTriangle,
  };
};

export function ScriptAnalyzer({ analysis }: ScriptAnalyzerProps) {
  const status = STATUS_BADGE(analysis.complete, analysis.hasError);
  const Icon = status.icon;

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
          >
            <Icon className="size-3" aria-hidden />
            {status.label}
          </span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {analysis.score}/100
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {analysis.issues.length} problème
          {analysis.issues.length > 1 ? "s" : ""} détecté
          {analysis.issues.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-300 ${SCORE_COLOR(analysis.score)}`}
          style={{ width: `${analysis.score}%` }}
        />
      </div>

      {analysis.issues.length > 0 && (
        <ul className="space-y-1">
          {analysis.issues.map((issue, index) => (
            <li
              key={`${issue.category}-${index}`}
              className={`flex gap-2 text-[11px] leading-relaxed ${
                issue.severity === "error"
                  ? "text-destructive"
                  : "text-chart-3"
              }`}
            >
              <span className="shrink-0 font-mono">
                {issue.severity === "error" ? "✘" : "⚠"}
              </span>
              <span>
                {issue.line !== undefined && (
                  <span className="font-mono">L.{issue.line} — </span>
                )}
                {issue.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <span>
          Accolades : <strong className="font-mono">{analysis.braceBalance}</strong>
        </span>
        <span>
          Parenthèses : <strong className="font-mono">{analysis.parenBalance}</strong>
        </span>
        <span>
          Crochets : <strong className="font-mono">{analysis.bracketBalance}</strong>
        </span>
        <span>
          Export : {analysis.hasExport ? "✅" : "❌"}
        </span>
        <span>
          Lignes : <strong className="font-mono">{analysis.lineCount}</strong>
        </span>
      </div>
    </div>
  );
}