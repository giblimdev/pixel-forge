/*
path :           app/core/components/PersonaForm.tsx
tag :            ["scrum", "persona", "form", "ui"]
projectId:       new-genesis
type:            component
generic:         false

role:            Formulaire de création / édition d'un persona Scrum.
                 Structure 3 zones : corps scrollable + footer sticky.
                 Textarea need capée (max-h-56).

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
                  "@/app/core/components/scrum/PersonaList.tsx"]

imports:         ["react-hook-form", "@hookform/resolvers/zod",
                  "lucide-react",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/validations",
                  "@/components/ui/button",
                  "@/components/ui/field",
                  "@/components/ui/input",
                  "@/components/ui/textarea"]

exports:         ["PersonaForm", "PersonaFormProps"]

useBy:           ["@/app/core/components/scrum/PersonaList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou éditer un persona Scrum"]

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

import type { Persona } from "@/app/scrum/lib/types";
import {
  personaInputSchema,
  type PersonaInput,
} from "@/app/scrum/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface PersonaFormProps {
  readonly defaultValues?: Persona;
  readonly onSubmit: (formData: FormData) => void | Promise<void>;
  readonly pending?: boolean;
}

export function PersonaForm({
  defaultValues,
  onSubmit,
  pending = false,
}: PersonaFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonaInput>({
    resolver: zodResolver(personaInputSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      kind: defaultValues?.kind ?? "",
      need: defaultValues?.need ?? "",
      relatedFeatures: defaultValues?.relatedFeatures
        ? [...defaultValues.relatedFeatures]
        : [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function submit(values: PersonaInput) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("kind", values.kind);
    formData.set("need", values.need);
    formData.set("relatedFeatures", (values.relatedFeatures ?? []).join(","));
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
          <FieldLabel htmlFor="persona-name">Nom</FieldLabel>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                id="persona-name"
                placeholder="Ex: Marie, développeuse"
                aria-invalid={errors.name ? true : undefined}
              />
            )}
          />
          {errors.name?.message && (
            <FieldError errors={[{ message: errors.name.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.kind ? "" : undefined}>
          <FieldLabel htmlFor="persona-kind">Type</FieldLabel>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <Input
                {...field}
                id="persona-kind"
                placeholder="Ex: utilisateur, développeur, business, DPO"
                aria-invalid={errors.kind ? true : undefined}
              />
            )}
          />
          {errors.kind?.message && (
            <FieldError errors={[{ message: errors.kind.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.need ? "" : undefined}>
          <FieldLabel htmlFor="persona-need">Besoin</FieldLabel>
          <Controller
            control={control}
            name="need"
            render={({ field }) => (
              <Textarea
                {...field}
                id="persona-need"
                rows={5}
                placeholder="Quel besoin réel ce persona a-t-il ?"
                aria-invalid={errors.need ? true : undefined}
                className="max-h-56 resize-none overflow-y-auto"
              />
            )}
          />
          {errors.need?.message && (
            <FieldError errors={[{ message: errors.need.message }]} />
          )}
        </Field>

        <Field data-invalid={errors.relatedFeatures ? "" : undefined}>
          <FieldLabel htmlFor="persona-features">
            Features liées (séparées par des virgules)
          </FieldLabel>
          <Controller
            control={control}
            name="relatedFeatures"
            render={({ field }) => (
              <Input
                id="persona-features"
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
                placeholder="Ex: Notifications, Recherche"
                aria-invalid={errors.relatedFeatures ? true : undefined}
              />
            )}
          />
          {errors.relatedFeatures?.message && (
            <FieldError
              errors={[{ message: errors.relatedFeatures.message }]}
            />
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
