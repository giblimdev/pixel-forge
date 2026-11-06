/*
path :           app/genesis/components/ScriptInput.tsx
tag :            ["genesis", "create-files", "input", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Zone de collage d'un script. Textarea de hauteur FIXE
                 (h-[280px]) avec scrollbar interne et resize désactivé : le
                 bouton Ajouter garde une position fixe quel que soit le volume
                 collé. Au clic, parseScriptHeader extrait le path :
                 - succès → onAdd(path, content) + vide le textarea
                 - échec → toast d'erreur avec la raison, textarea conservé
                 Aucun state métier local (juste le textarea draft).

flow:            useState(draft) → clic Ajouter → parseScriptHeader(draft)
                 → si path : onAdd(path, draft) + setDraft("") + toast succès
                 → sinon : toast.error(parsed.error).

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

relatedFiles:    ["@/app/genesis/lib/parse-script.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/parse-script",
                  "@/components/ui/button",
                  "@/components/ui/textarea"]

exports:         ["ScriptInput", "ScriptInputProps"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux coller un script et voir son path extrait"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (draft), toast.

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { parseScriptHeader } from "@/app/genesis/lib/parse-script";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ScriptInputProps {
  readonly onAdd: (path: string, content: string) => void;
}

export function ScriptInput({ onAdd }: ScriptInputProps) {
  const [draft, setDraft] = useState("");

  function handleAdd() {
    if (draft.trim().length === 0) {
      toast.error("Colle un script avant d'ajouter.");
      return;
    }

    const parsed = parseScriptHeader(draft);
    if (!parsed.path) {
      toast.error(parsed.error ?? "En-tête invalide.");
      return;
    }

    onAdd(parsed.path, draft);
    setDraft("");
    toast.success(`Script ajouté : ${parsed.path}`);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="script-input"
        className="text-sm font-medium text-foreground"
      >
        Coller un script
      </label>

      <Textarea
        id="script-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
        placeholder={`/*\npath :           app/mon-fichier.ts\n…\n*/\n\nexport function …`}
        className="h-[280px] w-full resize-none overflow-y-auto font-mono text-xs"
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleAdd}>
          <Plus className="size-4" aria-hidden />
          Ajouter
        </Button>
      </div>
    </div>
  );
}