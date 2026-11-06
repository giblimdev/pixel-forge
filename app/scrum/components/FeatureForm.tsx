/*
path :           app/core/components/FeatureForm.tsx
tag :            ["scrum", "feature", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'une feature Scrum.
                 Structure 3 zones : corps scrollable + footer sticky.
                 Textareas description (max-h-56) et interest (max-h-48)
                 capées.

flow:            useForm → handleSubmit → FormData → onSubmit(formData).

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
                  "@/app/core/lib/scrum/validations.ts",
                  "@/app/core/components/scrum/FeatureList.tsx"]

imports:         ["react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["FeatureForm", "FeatureFormProps"]

useBy:           ["@/app/core/components/scrum/FeatureList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer une feature Scrum"]

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

import type { Feature } from "@/app/scrum/lib/types";
import {
  featureInputSchema,
  type FeatureInput,
} from "@/app/scrum/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface FeatureFormProps {
  readonly defaultValues?: Feature;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

export function FeatureForm({
  defaultValues,
  onSubmit,
  pending = false,
}: FeatureFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeatureInput>({
    resolver: zodResolver(featureInputSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      interest: defaultValues?.interest ?? "",
      personas: defaultValues?.personas ? [...defaultValues.personas] : [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: FeatureInput) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("interest", values.interest);
    formData.set("personas", (values.personas ?? []).join(","));
    void onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex min-h-0 flex-1 flex-col gap-5"
      noValidate
    >
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <Field data-invalid={errors.title ? "" : undefined}>
          <FieldLabel htmlFor="feature-title">Titre</FieldLabel>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                id="feature-title"
                placeholder="Ex: Notifications en temps réel"
                aria-invalid={errors.title ? true : undefined}
              />
            )}
          />
          {errors.title?.message && (
            <FieldError errors={[{ message: errors.title.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.description ? "" : undefined}>
          <FieldLabel htmlFor="feature-description">Description</FieldLabel>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                {...field}
                id="feature-description"
                rows={4}
                placeholder="Que fait cette feature ?"
                aria-invalid={errors.description ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.description?.message && (
            <FieldError errors={[{ message: errors.description.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.interest ? "" : undefined}>
          <FieldLabel htmlFor="feature-interest">Intérêt</FieldLabel>
          <Controller
            control={control}
            name="interest"
            render={({ field }) => (
              <Textarea
                {...field}
                id="feature-interest"
                rows={3}
                placeholder="Quelle valeur apporte-t-elle ? À qui ?"
                aria-invalid={errors.interest ? true : undefined}
                className="max-h-48 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.interest?.message && (
            <FieldError errors={[{ message: errors.interest.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.personas ? "" : undefined}>
          <FieldLabel htmlFor="feature-personas">
            Personas (séparés par des virgules)
          </FieldLabel>
          <Controller
            control={control}
            name="personas"
            render={({ field }) => (
              <Input
                id="feature-personas"
                value={(field.value ?? []).join(", ")}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  )
                }
                onBlur={field.onBlur}
                placeholder="Ex: Développeur, Manager"
                aria-invalid={errors.personas ? true : undefined}
              />
            )}
          />
          {errors.personas?.message && (
            <FieldError errors={[{ message: errors.personas.message }]} />
          )}
        </Field>
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
