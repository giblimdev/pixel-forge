/*
path :           app/core/components/GlobalJsonExport.tsx
tag :            ["scrum", "global-json", "export", "edit", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Composant d'export et d'édition du Global JSON. Affiche le JSON
                 complet du flux dans un <textarea> éditable et propose quatre
                 actions : copier, télécharger (.json), annuler (retour à la
                 baseline) et enregistrer (Server Action). Bandeau d'erreur
                 persistant en cas de JSON invalide, indicateur de modifications
                 non enregistrées.

flow:            Reçoit flow + json (server) → state draft/baseline → édition
                 libre → bouton Enregistrer → updateGlobalJsonAction(flow, draft)
                 → succès : réaligne baseline + draft sur la réponse serveur →
                 toast. Échec : bandeau d'erreur + toast. Copier et Télécharger
                 utilisent toujours draft (ce que l'utilisateur voit).

ecosystem:       ScrumUI = [
                   "@/app/core/components/scrum/EpicCard.tsx",
                   "@/app/core/components/scrum/EpicForm.tsx",
                   "@/app/core/components/scrum/EpicList.tsx",
                   "@/app/core/components/scrum/FeatureCard.tsx",
                   "@/app/core/components/scrum/FeatureForm.tsx",
                   "@/app/core/components/scrum/FeatureList.tsx",
                   "@/app/core/components/scrum/FlowSelector.tsx",
                   "@/app/core/components/scrum/GlobalJsonExport.tsx",
                   "@/app/core/components/scrum/IdeeCard.tsx",
                   "@/app/core/components/scrum/IdeeForm.tsx",
                   "@/app/core/components/scrum/IdeeList.tsx",
                   "@/app/core/components/scrum/PersonaCard.tsx",
                   "@/app/core/components/scrum/PersonaForm.tsx",
                   "@/app/core/components/scrum/PersonaList.tsx",
                   "@/app/core/components/scrum/ScrumNav.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/global-json.ts",
                  "@/app/core/[flow]/global-json/page.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/global-json",
                  "@/components/ui/button"]

exports:         ["GlobalJsonExport", "GlobalJsonExportProps"]

useBy:           ["@/app/core/[flow]/global-json/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer, copier ou télécharger le JSON complet"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : navigator.clipboard, Blob, toast, useTransition, interactions.

import { useState, useTransition } from "react";
import { Check, Copy, Download, FileJson, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import type { ScrumFlow } from "@/app/scrum/lib/types";
import { updateGlobalJsonAction } from "@/app/scrum/lib/actions/global-json";
import { Button } from "@/components/ui/button";

export interface GlobalJsonExportProps {
  readonly flow: ScrumFlow;
  readonly json: string;
}

export function GlobalJsonExport({ flow, json }: GlobalJsonExportProps) {
  const [copied, setCopied] = useState(false);
  const [baseline, setBaseline] = useState(json);
  const [draft, setDraft] = useState(json);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = draft !== baseline;

  /* ----------------------------- Actions ---------------------------- */

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      toast.success("JSON copié dans le presse-papier.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le JSON.");
    }
  }

  function handleDownload() {
    try {
      const blob = new Blob([draft], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${flow}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Téléchargement lancé.");
    } catch {
      toast.error("Impossible de télécharger le JSON.");
    }
  }

  function handleReset() {
    setDraft(baseline);
    setError(null);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateGlobalJsonAction(flow, draft);
      if (!result.ok) {
        setError(result.error);
        toast.error("Échec de l'enregistrement.");
        return;
      }
      // writeScrumFile a rafraîchi meta.updatedAt / schemaVersion :
      // on réaligne baseline ET draft sur la forme canonique serveur.
      setBaseline(result.data);
      setDraft(result.data);
      toast.success("JSON enregistré.");
    });
  }

  /* ------------------------------ Rendu ----------------------------- */

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--chart-2), color-mix(in oklab, var(--chart-2) 60%, black))",
            }}
          >
            <FileJson className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Global JSON
            </h2>
            <p className="text-sm text-muted-foreground">
              Document complet du flux <code>{flow}</code>
              {dirty && (
                <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-500">
                  • modifications non enregistrées
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="size-4" aria-hidden />
                Copié
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden />
                Copier
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" aria-hidden />
            Télécharger
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!dirty || isPending}
          >
            <RotateCcw className="size-4" aria-hidden />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isPending}
          >
            <Save className="size-4" aria-hidden />
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="whitespace-pre-wrap rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          aria-label={`JSON du flux ${flow}`}
          className="block max-h-[70vh] min-h-[40vh] w-full resize-y overflow-auto bg-transparent p-5 font-mono text-xs leading-relaxed text-foreground/90 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
