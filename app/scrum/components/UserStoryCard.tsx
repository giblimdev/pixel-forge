/*
path :           app/core/components/UserStoryCard.tsx
tag :            ["scrum", "user-story", "card", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Carte de présentation d'une user story Scrum. Affiche le titre,
                 le récit « En tant que… », les critères d'acceptation, l'estimation
                 et le nom de l'epic de rattachement (fallback sur epicId si
                 l'epic a été supprimé entre-temps, pour repérer les US orphelines).

flow:            Reçoit une UserStory + epicName (résolu côté List) + callbacks
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
                  "@/app/core/components/scrum/UserStoryList.tsx"]

imports:         ["lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/components/ui/button"]

exports:         ["UserStoryCard", "UserStoryCardProps"]

useBy:           ["@/app/core/components/scrum/UserStoryList.tsx"]

userStories:     ["*en tant que développeur je veux afficher une user story sous forme de carte"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : boutons interactifs (onEdit, onDelete).

import { ListChecks, Pencil, Trash2 } from "lucide-react";

import type { UserStory } from "@/app/scrum/lib/types";
import { Button } from "@/components/ui/button";

export interface UserStoryCardProps {
  readonly story: UserStory;
  /**
   * Nom de l'epic résolu côté UserStoryList (via Map<epicId, epic.name>).
   * undefined si story.epicId est absent ou si l'epic a été supprimé :
   * dans le second cas, la carte retombe sur story.epicId pour signaler
   * l'orphelin.
   */
  readonly epicName?: string;
  readonly onEdit: (story: UserStory) => void;
  readonly onDelete: (story: UserStory) => void;
}

export function UserStoryCard({
  story,
  epicName,
  onEdit,
  onDelete,
}: UserStoryCardProps) {
  // Affichage de l'epic : nom si résolu, sinon l'id brut (orphelin).
  const epicLabel = epicName ?? story.epicId;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={{ "--accent": "var(--chart-5)" } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 opacity-70"
        style={{
          background: "linear-gradient(90deg, var(--chart-5), transparent)",
        }}
      />

      <header className="mb-3 flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--chart-5), color-mix(in oklab, var(--chart-5) 60%, black))",
          }}
        >
          <ListChecks className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight text-foreground">
            {story.title}
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chart-5">
            User story
          </p>
        </div>
      </header>

      <dl className="space-y-2.5 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Récit
          </dt>
          <dd className="mt-0.5 line-clamp-3 text-foreground/80">
            {story.story}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Critères d&apos;acceptation
          </dt>
          <dd className="mt-0.5 line-clamp-3 text-foreground/80">
            {story.acceptance}
          </dd>
        </div>

        {(story.estimate || epicLabel) && (
          <div className="flex flex-wrap gap-3 pt-1">
            {story.estimate && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimation
                </dt>
                <dd className="text-sm font-medium text-foreground/80">
                  {story.estimate}
                </dd>
              </div>
            )}
            {epicLabel && (
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Epic
                </dt>
                <dd
                  className="truncate text-sm font-medium text-foreground/80"
                  title={epicName ?? story.epicId}
                >
                  {epicLabel}
                </dd>
              </div>
            )}
          </div>
        )}
      </dl>

      <footer className="mt-4 flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(story)}
        >
          <Pencil className="size-3.5" aria-hidden />
          Éditer
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(story)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Supprimer
        </Button>
      </footer>
    </article>
  );
}
