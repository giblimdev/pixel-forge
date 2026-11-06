/*
path :           app/genesis/components/ContextOutput.tsx
tag :            ["genesis", "copy-to-ia", "output", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Affiche le texte Markdown final, éditable et copiable.
                 État local du texte (contrôlé par le parent via value/onChange).
                 En-tête : compteur de caractères, indicateur "édité
                 manuellement" si dirty, bouton Copier avec feedback.
                 Bouton Régénérer pour reconstruire depuis la sélection.

flow:            Reçoit value + dirty + onCopy + onRegenerate + onChange →
                 textarea contrôlé → bouton Copier → toast (géré côté parent).

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/components/CopyToIaPanel.tsx"]

imports:         ["react", "lucide-react",
                  "@/components/ui/button",
                  "@/components/ui/textarea"]

exports:         ["ContextOutput", "ContextOutputProps"]

useBy:           ["@/app/genesis/components/CopyToIaPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer et copier le contexte final"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : boutons interactifs (Copier, Régénérer).

import { Check, Copy, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ContextOutputProps {
  readonly value: string;
  readonly dirty: boolean;
  readonly copied: boolean;
  readonly onCopy: () => void;
  readonly onRegenerate: () => void;
  readonly onChange: (value: string) => void;
}

export function ContextOutput({
  value,
  dirty,
  copied,
  onCopy,
  onRegenerate,
  onChange,
}: ContextOutputProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Texte de sortie
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {value.length.toLocaleString("fr-FR")} caractères
            {dirty && " • édité manuellement"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onRegenerate}>
            <RotateCcw className="size-3.5" aria-hidden />
            Régénérer
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onCopy}
            disabled={value.trim().length === 0}
          >
            {copied ? (
              <>
                <Check className="size-3.5" aria-hidden />
                Copié
              </>
            ) : (
              <>
                <Copy className="size-3.5" aria-hidden />
                Copier
              </>
            )}
          </Button>
        </div>
      </header>

      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        rows={18}
        aria-label="Texte de sortie éditable"
        className="font-mono text-xs"
      />
    </section>
  );
}