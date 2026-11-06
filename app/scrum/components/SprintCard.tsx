/*
path :           app/core/components/SprintCard.tsx
tag :            ["scrum", "sprint", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte de présentation d'un sprint Scrum. Affiche le nom, l'objectif,
                 la liste complète des user stories rattachées (titres résolus côté
                 List, avec estimation si disponible) et les dates. Les storyIds
                 sans correspondance sont signalés discrètement (US orphelines).

flow:            Reçoit un Sprint + stories (UserStory[] résolues) + callbacks
                 (onEdit, onDelete) → rend une carte animée avec icône, contenu
                 et actions.

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
                  "@/app/core/components/scrum/SprintList.tsx"]

imports:         ["lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/components/ui/button"]

exports:         ["SprintCard", "SprintCardProps"]

useBy:           ["@/app/core/components/scrum/SprintList.tsx"]

userStories:     ["*en tant que développeur je veux afficher un sprint sous forme de carte"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : boutons interactifs (onEdit, onDelete).

import { Rocket, Pencil, Trash2, Calendar } from "lucide-react";

import type { Sprint, UserStory } from "@/app/scrum/lib/types";
import { Button } from "@/components/ui/button";

export interface SprintCardProps {
  readonly sprint: Sprint;
  /**
   * User stories résolues côté SprintList (via Map<storyId, UserStory>).
   * Peut être vide même si sprint.storyIds ne l'est pas : dans ce cas les
   * storyIds sont orphelins (US supprimées) et la carte le signale.
   */
  readonly stories: readonly UserStory[];
  readonly onEdit: (sprint: Sprint) => void;
  readonly onDelete: (sprint: Sprint) => void;
}

export function SprintCard({
  sprint,
  stories,
  onEdit,
  onDelete,
}: SprintCardProps) {
  const totalCount = sprint.storyIds.length;
  const orphanCount = totalCount - stories.length;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={{ "--accent": "var(--chart-1)" } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: "linear-gradient(90deg, var(--chart-1), transparent)",
        }}
      />

      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--chart-1), color-mix(in oklab, var(--chart-1) 60%, black))",
          }}
        >
          <Rocket className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground">
            {sprint.name}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-1">
            Sprint
          </p>
        </div>
      </header>

      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Objectif
          </dt>
          <dd className="mt-0.5 line-clamp-3 text-foreground/80">
            {sprint.goal}
          </dd>
        </div>

        {(sprint.startDate || sprint.endDate) && (
          <div className="flex items-center gap-2 text-foreground/80">
            <Calendar className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="text-xs">
              {sprint.startDate ?? "?"} → {sprint.endDate ?? "?"}
            </span>
          </div>
        )}

        {totalCount > 0 && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              User stories ({totalCount})
            </dt>
            <dd className="mt-1">
              {stories.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  {orphanCount} US introuvable{orphanCount > 1 ? "s" : ""}
                </p>
              ) : (
                <ul className="space-y-1">
                  {stories.map((story) => (
                    <li
                      key={story.id}
                      className="flex items-baseline gap-1.5 text-foreground/80"
                    >
                      <span aria-hidden className="text-chart-1">
                        •
                      </span>
                      <span
                        className="min-w-0 flex-1 truncate text-sm"
                        title={story.title}
                      >
                        {story.title}
                      </span>
                      {story.estimate && (
                        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                          {story.estimate}
                        </span>
                      )}
                    </li>
                  ))}
                  {orphanCount > 0 && (
                    <li className="text-xs italic text-muted-foreground">
                      + {orphanCount} US introuvable{orphanCount > 1 ? "s" : ""}
                    </li>
                  )}
                </ul>
              )}
            </dd>
          </div>
        )}
      </dl>

      <footer className="mt-4 flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(sprint)}
        >
          <Pencil className="size-3.5" aria-hidden />
          Éditer
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(sprint)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Supprimer
        </Button>
      </footer>
    </article>
  );
}
