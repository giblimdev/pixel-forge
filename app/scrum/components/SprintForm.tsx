/*
path :           app/core/components/SprintForm.tsx
tag :            ["scrum", "sprint", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création rapide d'un sprint Scrum (nom,
                 objectif, dates). Depuis la refonte Sprint, le champ
                 `storyIds` a été RETIRÉ : la liste des US est pilotée
                 exclusivement par le board DnD de la page d'édition
                 /core/[flow]/sprint/[sprintId]/edit. Structure 3 zones :
                 corps scrollable + footer sticky. Textarea goal capée
                 (max-h-56).

flow:            useForm → handleSubmit → FormData (sans storyIds) →
                 onSubmit(formData). Le service createSprint utilisera
                 storyIds = [] par défaut.

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
                   "@/app/core/components/scrum/SortableItem.tsx",
                   "@/app/core/components/scrum/SortableList.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintEditor.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/SprintStoriesBoard.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                   "@/app/core/components/scrum/UserStoryMiniCard.tsx",
                 ]

relatedFiles:    ["@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/components/scrum/SprintList.tsx"]

imports:         ["react", "react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["SprintForm", "SprintFormProps"]

useBy:           ["@/app/core/components/scrum/SprintList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer un sprint Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useForm, interactions utilisateur.

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import type { Sprint } from "@/app/scrum/lib/types";
import {
  sprintMetaInputSchema,
  type SprintMetaInput,
} from "@/app/scrum/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface SprintFormProps {
  readonly defaultValues?: Sprint;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function SprintForm({
  defaultValues,
  onSubmit,
  pending = false,
}: SprintFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintMetaInput>({
    resolver: zodResolver(sprintMetaInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      goal: defaultValues?.goal ?? "",
      startDate: defaultValues?.startDate ?? "",
      endDate: defaultValues?.endDate ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: SprintMetaInput) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("goal", values.goal);
    formData.set("startDate", values.startDate ?? "");
    formData.set("endDate", values.endDate ?? "");
    void onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex min-h-0 flex-1 flex-col gap-5"
      noValidate
    >
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <Field data-invalid={errors.name ? "" : undefined}>
          <FieldLabel htmlFor="sprint-name">Nom</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                id="sprint-name"
                placeholder="Ex: Sprint 1 — MVP"
                aria-invalid={errors.name ? true : undefined}
              />
            )}
          />
          {errors.name?.message && (
            <FieldError errors={[{ message: errors.name.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.goal ? "" : undefined}>
          <FieldLabel htmlFor="sprint-goal">Objectif</FieldLabel>
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <Textarea
                {...field}
                id="sprint-goal"
                rows={4}
                placeholder="Quel est l'objectif de ce sprint ?"
                aria-invalid={errors.goal ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.goal?.message && (
            <FieldError errors={[{ message: errors.goal.message }]} />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field data-invalid={errors.startDate ? "" : undefined}>
            <FieldLabel htmlFor="sprint-start">Début (optionnel)</FieldLabel>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="sprint-start"
                  type="date"
                  aria-invalid={errors.startDate ? true : undefined}
                />
              )}
            />
            {errors.startDate?.message && (
              <FieldError errors={[{ message: errors.startDate.message }]} />
            )}
          </Field>

          <Field data-invalid={errors.endDate ? "" : undefined}>
            <FieldLabel htmlFor="sprint-end">Fin (optionnel)</FieldLabel>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="sprint-end"
                  type="date"
                  aria-invalid={errors.endDate ? true : undefined}
                />
              )}
            />
            {errors.endDate?.message && (
              <FieldError errors={[{ message: errors.endDate.message }]} />
            )}
          </Field>
        </div>

        <p className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
          Les user stories seront ajoutées après création, via la page
          d&apos;édition du sprint.
        </p>
      </div>

      <div className="flex shrink-0 justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
