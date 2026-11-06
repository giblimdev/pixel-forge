/*
path :           app/core/components/PersonaCard.tsx
tag :            ["scrum", "persona", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte de présentation d'un persona Scrum. Affiche le nom, le type,
                 le besoin et les features liées. Boutons d'action (éditer, supprimer)
                 fournis par props.

flow:            Reçoit un Persona + callbacks (onEdit, onDelete) → rend une carte
                 animée avec icône, contenu et actions.

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
                  "@/app/core/components/scrum/PersonaList.tsx"]

imports:         ["lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/components/ui/button"]

exports:         ["PersonaCard", "PersonaCardProps"]

useBy:           ["@/app/core/components/scrum/PersonaList.tsx"]

userStories:     ["*en tant que développeur je veux afficher un persona sous forme de carte"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : boutons interactifs (onEdit, onDelete).

import { Users, Pencil, Trash2 } from "lucide-react";

import type { Persona } from "@/app/scrum/lib/types";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PersonaCardProps {
  readonly persona: Persona;
  readonly onEdit: (persona: Persona) => void;
  readonly onDelete: (persona: Persona) => void;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={{ "--accent": "var(--chart-3)" } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: "linear-gradient(90deg, var(--chart-3), transparent)",
        }}
      />

      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--chart-3), color-mix(in oklab, var(--chart-3) 60%, black))",
          }}
        >
          <Users className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground">
            {persona.name}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-3">
            {persona.kind}
          </p>
        </div>
      </header>

      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Besoin
          </dt>
          <dd className="mt-0.5 line-clamp-3 text-foreground/80">
            {persona.need}
          </dd>
        </div>

        {persona.relatedFeatures.length > 0 && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Features liées
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {persona.relatedFeatures.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center rounded-full bg-chart-3/10 px-2 py-0.5 text-[11px] font-medium text-chart-3"
                >
                  {feature}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      <footer className="mt-4 flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(persona)}
          aria-label={`Éditer ${persona.name}`}
        >
          <Pencil className="size-3.5" aria-hidden />
          Éditer
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(persona)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Supprimer ${persona.name}`}
        >
          <Trash2 className="size-3.5" aria-hidden />
          Supprimer
        </Button>
      </footer>
    </article>
  );
}
