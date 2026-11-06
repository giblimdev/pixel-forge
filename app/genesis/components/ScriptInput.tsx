/*
path :           app/genesis/components/ScriptInput.tsx
tag :            ["genesis", "create-files", "input", "ui", "analysis", "guard"]
projectId:       new-genesis
type:            component
generic:         false

role:            Zone de collage d'un script. Textarea de hauteur FIXE
                 (h-[280px]) avec scrollbar interne et resize désactivé.
                 Analyse de complétude en temps réel via analyzeScript
                 (nouveau helper). Si des erreurs sont détectées, le bouton
                 « Ajouter » est DÉSACTIVÉ et un lien « Forcer l'ajout malgré
                 les problèmes » apparaît. Cliquer dessus remplace le bouton
                 par « Annuler » + « Forcer l'ajout » (destructif). Au clic
                 sur « Ajouter » (ou « Forcer »), parseScriptHeader extrait
                 le path : succès → onAdd + vide le textarea ; échec → toast
                 d'erreur avec la raison, textarea conservé. Aucun state
                 métier local (draft + forceRequested uniquement).

flow:            useState(draft, forceRequested) → useMemo(analysis, [draft])
                 → rend Textarea + ScriptAnalyzer (si draft non vide) +
                 boutons (Ajouter désactivé si analysis.hasError, sinon
                 actif). handleAdd(force) → validations (vide, en-tête) →
                 si bloqué et !force : setForceRequested(true) sinon onAdd
                 + reset. Toute modification du draft remet forceRequested
                 à false (sécurité).

ecosystem:       Genesis = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptAnalyzer.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/analyze-script.ts",
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
                  "@/app/genesis/lib/analyze-script.ts",
                  "@/app/genesis/components/ScriptAnalyzer.tsx",
                  "@/app/genesis/components/CreateFilesPanel.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/textarea.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/lib/parse-script",
                  "@/app/genesis/lib/analyze-script",
                  "@/app/genesis/components/ScriptAnalyzer",
                  "@/components/ui/button",
                  "@/components/ui/textarea"]

exports:         ["ScriptInput", "ScriptInputProps"]

useBy:           ["@/app/genesis/components/CreateFilesPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux coller un script et voir s'il est complet",
                  "*en tant qu'utilisateur je veux pouvoir forcer l'ajout d'un script suspect"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useMemo, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { parseScriptHeader } from "@/app/genesis/lib/parse-script";
import { analyzeScript } from "@/app/genesis/lib/analyze-script";
import { ScriptAnalyzer } from "@/app/genesis/components/ScriptAnalyzer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ScriptInputProps {
  readonly onAdd: (path: string, content: string) => void;
}

export function ScriptInput({ onAdd }: ScriptInputProps) {
  const [draft, setDraft] = useState("");
  const [forceRequested, setForceRequested] = useState(false);

  const analysis = useMemo(() => analyzeScript(draft), [draft]);
  const hasDraft = draft.trim().length > 0;
  const blocked = hasDraft && analysis.hasError;

  function handleAdd(force = false) {
    if (!hasDraft) {
      toast.error("Colle un script avant d'ajouter.");
      return;
    }

    const parsed = parseScriptHeader(draft);
    if (!parsed.path) {
      toast.error(parsed.error ?? "En-tête invalide.");
      return;
    }

    if (blocked && !force) {
      setForceRequested(true);
      return;
    }

    onAdd(parsed.path, draft);
    setDraft("");
    setForceRequested(false);
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
        onChange={(event) => {
          setDraft(event.target.value);
          if (forceRequested) setForceRequested(false);
        }}
        spellCheck={false}
        placeholder={`/*\npath :           app/mon-fichier.ts\n…\n*/\n\nexport function …`}
        className="h-[280px] w-full resize-none overflow-y-auto font-mono text-xs"
      />

      {hasDraft && <ScriptAnalyzer analysis={analysis} />}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {forceRequested ? (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForceRequested(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleAdd(true)}
            >
              <ShieldAlert className="size-4" aria-hidden />
              Forcer l&apos;ajout
            </Button>
          </>
        ) : (
          <>
            {blocked && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForceRequested(true)}
                className="text-chart-3 hover:bg-chart-3/10 hover:text-chart-3"
              >
                <ShieldAlert className="size-3.5" aria-hidden />
                Forcer l&apos;ajout malgré les problèmes
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleAdd(false)}
              disabled={blocked}
              title={
                blocked
                  ? "Script incomplet : corrigez les erreurs ou forcez l'ajout."
                  : undefined
              }
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          </>
        )}
      </div>
    </div>
  );
}