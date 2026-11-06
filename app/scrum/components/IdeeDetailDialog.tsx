/*
path :           app/core/components/IdeeDetailDialog.tsx
tag :            ["scrum", "idee", "detail", "dialog", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Modale de lecture pure d'une idée Scrum. Affiche le titre,
                 le problème, les hypothèses et le contexte SANS troncature,
                 avec préservation des sauts de ligne (whitespace-pre-wrap).
                 Aucun formulaire, aucune mutation. DialogContent en
                 `flex h-[85vh] flex-col overflow-hidden` (hauteur définie,
                 pas max-h-*), header et footer en shrink-0, corps en
                 flex-1 min-h-0 overflow-y-auto.

flow:            Reçoit idee (nullable) + open + onOpenChange → rend Dialog
                 avec header (icône + titre + badge "Idée") + corps scrollable
                 (dl problem/hypotheses/context) + footer avec bouton Fermer.

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
                   "@/app/core/components/scrum/IdeeDetailDialog.tsx",
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
                  "@/app/core/components/scrum/IdeeCard.tsx",
                  "@/app/core/components/scrum/IdeeList.tsx"]

imports:         ["lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/components/ui/button",
                  "@/components/ui/dialog"]

exports:         ["IdeeDetailDialog", "IdeeDetailDialogProps"]

useBy:           ["@/app/core/components/scrum/IdeeList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lire une idée en entier"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : Dialog (interaction ouverture/fermeture).

import { Lightbulb } from "lucide-react";

import type { Idee } from "@/app/scrum/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface IdeeDetailDialogProps {
  readonly idee: Idee | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function IdeeDetailDialog({
  idee,
  open,
  onOpenChange,
}: IdeeDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0 min-w-0">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-chart-1 to-chart-2 text-white shadow-md">
              <Lightbulb className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
                Idée
              </p>
              <DialogTitle className="mt-0.5 break-words text-lg font-bold">
                {idee?.title ?? "—"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs">
            Lecture complète — cliquez sur Éditer depuis la liste pour modifier.
          </DialogDescription>
        </DialogHeader>

        {idee && (
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            <Section label="Problème" tone="chart-1">
              {idee.problem}
            </Section>

            <Section label="Hypothèses" tone="chart-2">
              {idee.hypotheses}
            </Section>

            {idee.context && idee.context.length > 0 && (
              <Section label="Contexte" tone="chart-3">
                {idee.context}
              </Section>
            )}
          </div>
        )}

        <DialogFooter className="shrink-0">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composant : section de lecture                                */
/* ------------------------------------------------------------------ */

function Section({
  label,
  tone,
  children,
}: {
  readonly label: string;
  readonly tone: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section>
      <h4
        className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: `var(--${tone})` }}
      >
        {label}
      </h4>
      <div className="whitespace-pre-wrap break-words rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
