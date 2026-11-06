/*
path :           app/genesis/components/HeaderExclusionsDialog.tsx
tag :            ["genesis", "check-headers", "exclusions", "dialog", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Dialog de gestion des exclusions pour check-headers.
                 Copie conforme d'ExclusionsDialog.tsx existant, avec
                 setHeaderExclusionsAction au lieu de setExclusionsAction.
                 L'original reste intact → zéro régression sur SelectFiles.
                 Même UX, même contrainte de hauteur (flex-col +
                 max-h-[85dvh] + field-sizing-fixed), même validation Zod
                 côté serveur.

flow:            Reçoit open + onOpenChange + exclusions courantes →
                 useState draft → Enregistrer → setHeaderExclusionsAction
                 (draft) → toast succès/erreur → si succès, onSaved() et
                 ferme.

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

relatedFiles:    ["@/app/genesis/actions/header-check.ts",
                  "@/app/genesis/components/ExclusionsDialog.tsx"]

imports:         ["react", "sonner",
                  "@/app/genesis/actions/header-check",
                  "@/app/genesis/lib/header-types",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/textarea"]

exports:         ["HeaderExclusionsDialog", "HeaderExclusionsDialogProps"]

useBy:           ["@/app/genesis/components/HeaderCheckPanel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer les exclusions du check-headers"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setHeaderExclusionsAction } from "@/app/genesis/actions/header-check";
import { DEFAULT_HEADER_EXCLUSIONS } from "@/app/genesis/lib/header-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface HeaderExclusionsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly exclusions: readonly string[];
  readonly onSaved: () => void;
}

export function HeaderExclusionsDialog({
  open,
  onOpenChange,
  exclusions,
  onSaved,
}: HeaderExclusionsDialogProps) {
  const [draft, setDraft] = useState<string>(exclusions.join("\n"));
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setDraft(exclusions.join("\n"));
    }
    onOpenChange(next);
  }

  function parseDraft(): string[] {
    return draft
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function handleReset() {
    setDraft(DEFAULT_HEADER_EXCLUSIONS.join("\n"));
  }

  function handleSave() {
    const next = parseDraft();
    startTransition(async () => {
      const result = await setHeaderExclusionsAction(next);
      if (result.ok) {
        toast.success(
          `Exclusions enregistrées (${result.data.exclusions.length}).`,
        );
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85dvh] max-w-2xl flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Exclusions — Check en-têtes</DialogTitle>
          <DialogDescription>
            Une entrée par ligne. Un nom seul exclut un dossier/fichier
            (<code>components/ui</code>) ; un pattern <code>*.ext</code> exclut
            une extension (<code>*.json</code>).
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          rows={16}
          className="field-sizing-fixed min-h-0 flex-1 resize-none overflow-y-auto font-mono text-xs"
          aria-label="Liste des exclusions check-headers"
        />

        <DialogFooter className="shrink-0 flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
          >
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}