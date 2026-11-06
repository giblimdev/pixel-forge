/*
path :           app/genesis/components/ContextFileEditor.tsx
tag :            ["genesis", "copy-to-ia", "editor", "accordion", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Éditeur d'un fichier de contexte. La ligne de tête (checkbox,
                 titre, path, badges) est TOUJOURS visible, hors accordion.
                 L'accordion ne contient que le champ éditable (Textarea avec
                 scrollbar interne) et le bouton Enregistrer. Utilise la prop
                 `multiple` de Base UI — pas de `type` (Radix).

flow:            Reçoit file + checked + saving + 3 callbacks → useState(draft)
                 → useEffect de resynchronisation quand file.content change →
                 header (checkbox + titre + badges) → Accordion (multiple,
                 un seul item) → Textarea + bouton Enregistrer → clic →
                 onSave(id, draft).

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

relatedFiles:    ["@/app/genesis/components/CopyToIaPanel.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react",
                  "@/app/genesis/lib/types",
                  "@/components/ui/accordion",
                  "@/components/ui/badge",
                  "@/components/ui/button",
                  "@/components/ui/checkbox",
                  "@/components/ui/label",
                  "@/components/ui/textarea"]

exports:         ["ContextFileEditor", "ContextFileEditorProps"]

useBy:           ["@/app/genesis/components/CopyToIaPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux sélectionner et éditer un fichier de contexte"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (draft), interactions (checkbox, boutons).

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import type { ContextFile } from "@/app/genesis/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ContextFileEditorProps {
  readonly file: ContextFile;
  readonly checked: boolean;
  readonly saving: boolean;
  readonly onToggleCheck: (id: ContextFile["id"], checked: boolean) => void;
  readonly onSave: (id: ContextFile["id"], content: string) => void;
}

export function ContextFileEditor({
  file,
  checked,
  saving,
  onToggleCheck,
  onSave,
}: ContextFileEditorProps) {
  const [draft, setDraft] = useState(file.content);

  // Resynchronise le draft quand le contenu serveur change après un save.
  useEffect(() => {
    setDraft(file.content);
  }, [file.content]);

  const dirty = draft !== file.content;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Header hors accordion : checkbox + titre + badges */}
      <div className="flex items-start gap-3 p-4">
        <Checkbox
          id={`include-${file.id}`}
          checked={checked}
          onCheckedChange={(value) => onToggleCheck(file.id, value === true)}
          className="mt-1 shrink-0"
        />
        <Label
          htmlFor={`include-${file.id}`}
          className="min-w-0 flex-1 cursor-pointer space-y-0.5"
        >
          <p className="truncate text-sm font-semibold text-foreground">
            {file.label}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {file.path}
          </p>
        </Label>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge variant={file.exists ? "secondary" : "outline"}>
            {file.exists ? "existe" : "absent"}
          </Badge>
          {checked && (
            <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/15">
              inclus
            </Badge>
          )}
          {dirty && (
            <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/15 dark:text-amber-500">
              non enregistré
            </Badge>
          )}
        </div>
      </div>

      {/* Accordion Base UI : `multiple` (pas de prop `type`). */}
      <Accordion
        multiple
        defaultValue={[]}
        className="border-t border-border/60"
      >
        <AccordionItem value="content" className="border-b-0">
          <AccordionTrigger className="px-4 py-2 text-xs font-medium text-muted-foreground hover:no-underline">
            Éditer le contenu
          </AccordionTrigger>
          <AccordionContent className="space-y-3 px-4 pb-4">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              rows={12}
              aria-label={`Contenu de ${file.path}`}
              className="h-[300px] w-full resize-none overflow-y-auto font-mono text-xs"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onSave(file.id, draft)}
                disabled={!dirty || saving}
              >
                {saving ? (
                  "Enregistrement…"
                ) : (
                  <>
                    <Save className="size-3.5" aria-hidden />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}