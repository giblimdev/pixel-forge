/*
path :           app/core/components/IdeeForm.tsx
tag :            ["scrum", "idee", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'une idée Scrum. Utilise
                 react-hook-form + zodResolver(ideeInputSchema). Structure en
                 3 zones : corps scrollable (flex-1 min-h-0 overflow-y-auto
                 overscroll-contain) + footer sticky (shrink-0). Les textareas
                 sont capées (`max-h-56` / `max-h-40 resize-none
                 overflow-y-auto`) pour empêcher `field-sizing-content` de
                 les faire grandir à l'infini. Scrollbar custom toujours
                 visible. Le form prend `flex-1 min-h-0` pour remplir la
                 DialogContent flex `h-[85vh]`.

flow:            useForm({ resolver: zodResolver(ideeInputSchema) }) →
                 handleSubmit → construit un FormData → appelle onSubmit.

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
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/components/scrum/IdeeList.tsx"]

imports:         ["react", "react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["IdeeForm", "IdeeFormProps"]

useBy:           ["@/app/core/components/scrum/IdeeList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer une idée Scrum"]

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

import type { Idee } from "@/app/scrum/lib/types";
import { ideeInputSchema, type IdeeInput } from "@/app/scrum/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface IdeeFormProps {
  readonly defaultValues?: Idee;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function IdeeForm({
  defaultValues,
  onSubmit,
  pending = false,
}: IdeeFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IdeeInput>({
    resolver: zodResolver(ideeInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      problem: defaultValues?.problem ?? "",
      hypotheses: defaultValues?.hypotheses ?? "",
      context: defaultValues?.context ?? "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: IdeeInput) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("problem", values.problem);
    formData.set("hypotheses", values.hypotheses);
    formData.set("context", values.context ?? "");
    void onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex min-h-0 flex-1 flex-col gap-5"
      noValidate
    >
      {/* Corps scrollable — scrollbar toujours visible */}
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        {/* Titre */}
        <Field data-invalid={errors.title ? "" : undefined}>
          <FieldLabel htmlFor="idee-title">Titre</FieldLabel>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                id="idee-title"
                placeholder="Ex: Améliorer l'onboarding"
                aria-invalid={errors.title ? true : undefined}
              />
            )}
          />
          {errors.title?.message && (
            <FieldError errors={[{ message: errors.title.message }]} />
          )}
        </Field>

        {/* Problème */}
        <Field data-invalid={errors.problem ? "" : undefined}>
          <FieldLabel htmlFor="idee-problem">Problème</FieldLabel>
          <Controller
            control={control}
            name="problem"
            render={({ field }) => (
              <Textarea
                {...field}
                id="idee-problem"
                rows={6}
                placeholder="Quel problème cherche-t-on à résoudre ?"
                aria-invalid={errors.problem ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.problem?.message && (
            <FieldError errors={[{ message: errors.problem.message }]} />
          )}
        </Field>

        {/* Hypothèses */}
        <Field data-invalid={errors.hypotheses ? "" : undefined}>
          <FieldLabel htmlFor="idee-hypotheses">Hypothèses</FieldLabel>
          <Controller
            control={control}
            name="hypotheses"
            render={({ field }) => (
              <Textarea
                {...field}
                id="idee-hypotheses"
                rows={6}
                placeholder="Quelles hypothèses sous-tendent ce problème ?"
                aria-invalid={errors.hypotheses ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.hypotheses?.message && (
            <FieldError errors={[{ message: errors.hypotheses.message }]} />
          )}
        </Field>

        {/* Contexte (optionnel) */}
        <Field data-invalid={errors.context ? "" : undefined}>
          <FieldLabel htmlFor="idee-context">Contexte (optionnel)</FieldLabel>
          <Controller
            control={control}
            name="context"
            render={({ field }) => (
              <Textarea
                {...field}
                id="idee-context"
                rows={4}
                placeholder="Source, contexte, remarques…"
                aria-invalid={errors.context ? true : undefined}
                className="max-h-40 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.context?.message && (
            <FieldError errors={[{ message: errors.context.message }]} />
          )}
        </Field>
      </div>

      {/* Footer sticky — toujours visible */}
      <div className="flex shrink-0 justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
