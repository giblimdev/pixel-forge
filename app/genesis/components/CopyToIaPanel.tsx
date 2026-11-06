/*
path :           app/genesis/components/CopyToIaPanel.tsx
tag :            ["genesis", "copy-to-ia", "panel", "orchestrator"]
projectId:       new-genesis
type:            component
generic:         false

role:            Orchestrateur de l'outil copy-to-ia. Présente le prompt et
                 les 3 fichiers avec la même structure : header fixe (checkbox +
                 titre + badges, hors accordion) + accordion (champ éditable).
                 Utilise la prop `multiple` de Base UI — pas de `type` (Radix).
                 Le texte final est dérivé via useMemo : régénéré à CHAQUE
                 changement de contrôle tant que l'utilisateur n'a pas édité
                 manuellement le textarea de sortie.

flow:            Reçoit initialFiles → useState(files, selectedIds,
                 includePrompt, prompt, manualOutput, savingId, copied) →
                 useMemo(computedOutput, [files, selectedIds, prompt,
                 includePrompt]) → outputText = manualOutput ?? computedOutput
                 → outputDirty = manualOutput !== null → header + accordion
                 (prompt + 3 ContextFileEditor) + ContextOutput.

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

relatedFiles:    ["@/app/genesis/actions/context-files.ts",
                  "@/app/genesis/lib/context-files.ts",
                  "@/app/genesis/components/ContextFileEditor.tsx",
                  "@/app/genesis/components/ContextOutput.tsx",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/context-files",
                  "@/app/genesis/actions/context-files",
                  "@/app/genesis/components/ContextFileEditor",
                  "@/app/genesis/components/ContextOutput",
                  "@/components/ui/accordion",
                  "@/components/ui/badge",
                  "@/components/ui/checkbox",
                  "@/components/ui/label",
                  "@/components/ui/textarea"]

exports:         ["CopyToIaPanel", "CopyToIaPanelProps"]

useBy:           ["@/app/genesis/copy-to-ia/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux assembler et copier un contexte IA"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState, useMemo, useTransition, clipboard, toast.

import { useMemo, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { ContextFile, ContextFileId } from "@/app/genesis/lib/types";
import { assembleContext } from "@/app/genesis/lib/context-files";
import { saveContextFileAction } from "@/app/genesis/actions/context-files";
import { ContextFileEditor } from "@/app/genesis/components/ContextFileEditor";
import { ContextOutput } from "@/app/genesis/components/ContextOutput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CopyToIaPanelProps {
  readonly initialFiles: readonly ContextFile[];
}

export function CopyToIaPanel({ initialFiles }: CopyToIaPanelProps) {
  const [files, setFiles] = useState<readonly ContextFile[]>(initialFiles);
  const [selectedIds, setSelectedIds] = useState<Set<ContextFileId>>(
    () => new Set(initialFiles.map((file) => file.id)),
  );
  const [includePrompt, setIncludePrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [manualOutput, setManualOutput] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<ContextFileId | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  /* ---------------------- Dérivation du texte --------------------- */

  const computedOutput = useMemo(() => {
    const checked = files.filter((file) => selectedIds.has(file.id));
    return assembleContext(checked, prompt, includePrompt);
  }, [files, selectedIds, prompt, includePrompt]);

  const outputText = manualOutput ?? computedOutput;
  const outputDirty = manualOutput !== null;

  /* ------------------------- Sélection / prompt ------------------- */

  function handleToggleCheck(id: ContextFileId, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /* ---------------------------- Save fichier ---------------------- */

  function handleSaveFile(id: ContextFileId, content: string) {
    setSavingId(id);
    startTransition(async () => {
      const response = await saveContextFileAction(id, content);
      setSavingId(null);
      if (response.ok) {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === id ? { ...file, content, exists: true } : file,
          ),
        );
        toast.success("Fichier enregistré.");
      } else {
        toast.error(response.error);
      }
    });
  }

  /* ------------------------ Régénération forcée ------------------- */

  function handleRegenerate() {
    setManualOutput(null);
    toast.success("Texte régénéré.");
  }

  function handleOutputChange(value: string) {
    setManualOutput(value);
  }

  /* ---------------------------- Copier ---------------------------- */

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success("Contexte copié dans le presse-papier.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le contexte.");
    }
  }

  /* ------------------------------ Rendu --------------------------- */

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {/* Prompt : header fixe (hors accordion) + accordion (champ éditable) */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="flex items-start gap-3 p-4">
            <Checkbox
              id="include-prompt"
              checked={includePrompt}
              onCheckedChange={(value) => setIncludePrompt(value === true)}
              className="mt-1 shrink-0"
            />
            <Label
              htmlFor="include-prompt"
              className="min-w-0 flex-1 cursor-pointer space-y-0.5"
            >
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                <Sparkles className="size-3.5 text-chart-2" aria-hidden />
                Prompt
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Instruction libre ajoutée en tête du texte
              </p>
            </Label>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {includePrompt && (
                <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/15">
                  inclus
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
                Éditer le prompt
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={4}
                  aria-label="Prompt libre"
                  placeholder="Ex. Ajoute une page de contact en respectant les conventions du projet…"
                  className="h-[120px] w-full resize-none overflow-y-auto text-sm"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {files.map((file) => (
          <ContextFileEditor
            key={file.id}
            file={file}
            checked={selectedIds.has(file.id)}
            saving={savingId === file.id}
            onToggleCheck={handleToggleCheck}
            onSave={handleSaveFile}
          />
        ))}
      </div>

      <ContextOutput
        value={outputText}
        dirty={outputDirty}
        copied={copied}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        onChange={handleOutputChange}
      />
    </div>
  );
}