/*
path :           app/genesis/components/HeaderReciprocityReport.tsx
tag :            ["genesis", "check-headers", "reciprocity", "report", "ui", "copy", "defensive"]
projectId:       new-genesis
type:            component
generic:         false

role:            Rapport de réciprocité simplifié (2 boutons par anomalie :
                 « Copier les deux fichiers » + « Copier le message »).
                 Défensif : si `report` ou `reciprocity` est undefined, le
                 composant retourne null au lieu de crasher. Le contenu
                 vient de report.results[].content (déjà chargé côté
                 serveur). Aucun appel réseau supplémentaire.

flow:            Reçoit reciprocity + report → garde défensif (return
                 null si l'un des deux manque) → useMemo(contentByPath)
                 → pour chaque issue, carte avec 2 boutons → handleCopy
                 (text, key) → navigator.clipboard + toast + setCopiedKey
                 (reset 2 s).

ecosystem:       CheckHeaders = [
                   "@/app/genesis/lib/header-types.ts",
                   "@/app/genesis/components/HeaderReciprocityReport.tsx",
                   "@/app/genesis/components/HeaderCheckPanel.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/header-types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/header-types",
                  "@/components/ui/button"]

exports:         ["HeaderReciprocityReportView", "HeaderReciprocityReportViewProps"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux copier les deux fichiers concernés ou le message d'erreur"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileWarning } from "lucide-react";
import { toast } from "sonner";

import type {
  HeaderCheckReport,
  HeaderReciprocityReport,
} from "@/app/genesis/lib/header-types";
import { Button } from "@/components/ui/button";

export interface HeaderReciprocityReportViewProps {
  readonly reciprocity: HeaderReciprocityReport;
  readonly report: HeaderCheckReport;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildTwoFilesBlock(
  sourcePath: string,
  sourceContent: string,
  targetPath: string,
  targetContent: string,
): string {
  return [
    `// ===== FICHIER 1 : ${sourcePath} =====`,
    sourceContent,
    "",
    `// ===== FICHIER 2 : ${targetPath} =====`,
    targetContent,
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function HeaderReciprocityReportView({
  reciprocity,
  report,
}: HeaderReciprocityReportViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Défense en profondeur : résultats undefined-safe.
  const results = report?.results ?? [];

  const contentByPath = useMemo(() => {
    const map = new Map<string, string>();
    for (const result of results) {
      map.set(result.path, result.content);
    }
    return map;
  }, [results]);

  async function copy(text: string, key: string, label: string) {
    if (!text) {
      toast.error("Contenu indisponible pour ce fichier.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(label);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Impossible de copier.");
    }
  }

  // Garde défensif : si l'un des deux props manque, on ne rend rien.
  if (!report || !reciprocity) {
    return null;
  }

  const totalIssues =
    reciprocity.issues.length + reciprocity.missingTargets.length;

  if (totalIssues === 0) {
    return (
      <section className="rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Réciprocité des relations
        </h3>
        <p className="mt-2 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Aucune anomalie de réciprocité détectée.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Réciprocité — {totalIssues} anomalie(s)
        </h3>
        <p className="text-[11px] text-muted-foreground">
          {reciprocity.checkedPairs} paire(s) vérifiée(s) ·{" "}
          {reciprocity.skippedPairs} ignorée(s)
        </p>
      </header>

      <ul className="space-y-3">
        {reciprocity.issues.map((issue, index) => {
          const sourceContent = contentByPath.get(issue.sourcePath) ?? "";
          const targetContent = contentByPath.get(issue.targetPath) ?? "";
          const cardKey = `issue-${index}`;
          const copyBothKey = `${cardKey}-both`;
          const copyMsgKey = `${cardKey}-msg`;

          const message = [
            `Problème de réciprocité :`,
            `  ${issue.sourcePath}.${issue.sourceField} référence ${issue.targetPath}`,
            `  mais ${issue.targetPath}.${issue.expectedField} ne référence pas ${issue.sourcePath}`,
            ``,
            `Message brut : ${issue.message}`,
          ].join("\n");

          return (
            <li
              key={cardKey}
              className="space-y-2 rounded-xl border border-chart-3/30 bg-chart-3/5 p-3"
            >
              <p className="text-xs leading-relaxed text-foreground">
                <code className="font-mono">{issue.sourcePath}</code>
                {". "}
                <span className="font-mono">{issue.sourceField}</span>
                {" référence "}
                <code className="font-mono">{issue.targetPath}</code>
                {", mais "}
                <code className="font-mono">{issue.targetPath}</code>
                {"."}
                <span className="font-mono">{issue.expectedField}</span>
                {" ne référence pas "}
                <code className="font-mono">{issue.sourcePath}</code>.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    copy(
                      buildTwoFilesBlock(
                        issue.sourcePath,
                        sourceContent,
                        issue.targetPath,
                        targetContent,
                      ),
                      copyBothKey,
                      "Les deux fichiers copiés.",
                    )
                  }
                  disabled={!sourceContent || !targetContent}
                  title="Copier les deux fichiers concaténés"
                >
                  {copiedKey === copyBothKey ? (
                    <Check className="size-3.5 text-chart-4" aria-hidden />
                  ) : (
                    <Copy className="size-3.5" aria-hidden />
                  )}
                  Copier les deux fichiers
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(message, copyMsgKey, "Message copié.")}
                  title="Copier le message du problème"
                >
                  {copiedKey === copyMsgKey ? (
                    <Check className="size-3.5 text-chart-4" aria-hidden />
                  ) : (
                    <FileWarning className="size-3.5" aria-hidden />
                  )}
                  Copier le message
                </Button>
              </div>
            </li>
          );
        })}

        {reciprocity.missingTargets.map((missing, index) => {
          const cardKey = `missing-${index}`;
          const copyMsgKey = `${cardKey}-msg`;

          const message = [
            `Problème :`,
            `  ${missing.sourcePath}.${missing.sourceField} référence ${missing.targetPath}`,
            `  mais ce fichier est introuvable.`,
          ].join("\n");

          return (
            <li
              key={cardKey}
              className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3"
            >
              <p className="text-xs leading-relaxed text-destructive">
                <code className="font-mono">{missing.sourcePath}</code>
                {". "}
                <span className="font-mono">{missing.sourceField}</span>
                {" référence "}
                <code className="font-mono">{missing.targetPath}</code>
                {" — fichier introuvable."}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(message, copyMsgKey, "Message copié.")}
                >
                  {copiedKey === copyMsgKey ? (
                    <Check className="size-3.5 text-chart-4" aria-hidden />
                  ) : (
                    <FileWarning className="size-3.5" aria-hidden />
                  )}
                  Copier le message
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}