/*
path :           app/core/components/PersonaList.tsx
tag :            ["scrum", "persona", "list", "ui", "dnd"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des personas d'un flux Scrum avec DnD. État optimiste.
                 DialogContent : `flex h-[85vh] flex-col overflow-hidden` +
                 `sm:max-w-2xl`.

flow:            flow + personas → useState(optimistic) → useEffect resync
                 → SortableList + SortableItem → handleReorder → Server
                 Action → refresh ou rollback.

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
                   "@/app/core/components/scrum/SortableItem.tsx",
                   "@/app/core/components/scrum/SortableList.tsx",
                   "@/app/core/components/scrum/SprintCard.tsx",
                   "@/app/core/components/scrum/SprintForm.tsx",
                   "@/app/core/components/scrum/SprintList.tsx",
                   "@/app/core/components/scrum/UserStoryCard.tsx",
                   "@/app/core/components/scrum/UserStoryForm.tsx",
                   "@/app/core/components/scrum/UserStoryList.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/PersonaCard.tsx",
                  "@/app/core/components/scrum/PersonaForm.tsx",
                  "@/app/core/components/scrum/SortableItem.tsx",
                  "@/app/core/components/scrum/SortableList.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/persona.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/persona",
                  "@/app/core/components/scrum/PersonaCard",
                  "@/app/core/components/scrum/PersonaForm",
                  "@/app/core/components/scrum/SortableItem",
                  "@/app/core/components/scrum/SortableList",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["PersonaList", "PersonaListProps"]

useBy:           ["@/app/core/[flow]/persona/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister et réorganiser les personas Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs + optimiste), useEffect, DnD, toast.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

import type { Persona, ScrumFlow } from "@/app/scrum/lib/types";
import {
  createPersonaAction,
  deletePersonaAction,
  reorderPersonasAction,
  updatePersonaAction,
} from "@/app/scrum/lib/actions/persona";
import { PersonaCard } from "@/app/scrum/components/PersonaCard";
import { PersonaForm } from "@/app/scrum/components/PersonaForm";
import { SortableItem } from "@/app/scrum/components/SortableItem";
import { SortableList } from "@/app/scrum/components/SortableList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface PersonaListProps {
  readonly flow: ScrumFlow;
  readonly personas: readonly Persona[];
}

export function PersonaList({ flow, personas }: PersonaListProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<readonly Persona[]>(personas);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [deleting, setDeleting] = useState<Persona | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setOptimistic(personas);
  }, [personas]);

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createPersonaAction(flow, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Persona créé.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updatePersonaAction(flow, editing.id, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Persona mis à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deletePersonaAction(flow, deleting.id);
    setPending(false);
    if (result.ok) {
      toast.success("Persona supprimé.");
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReorder(orderedIds: string[]) {
    const previous = optimistic;
    const reordered = orderedIds
      .map((id) => previous.find((item) => item.id === id))
      .filter((item): item is Persona => item !== undefined);

    setOptimistic(reordered);
    setPending(true);
    const result = await reorderPersonasAction(flow, orderedIds);
    setPending(false);

    if (result.ok) {
      router.refresh();
    } else {
      setOptimistic(previous);
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Personas
          </h2>
          <p className="text-sm text-muted-foreground">
            {optimistic.length} persona{optimistic.length > 1 ? "s" : ""}
            {optimistic.length > 1 && " — glissez la poignée pour réordonner"}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouveau persona
        </Button>
      </div>

      {optimistic.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-3/10 text-chart-3">
            <Users className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucun persona pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Transformez les hypothèses en personas validés, reliés à des besoins
            réels.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="size-4" aria-hidden />
            Créer le premier persona
          </Button>
        </div>
      )}

      {optimistic.length > 0 && (
        <SortableList
          items={optimistic}
          onReorder={handleReorder}
          disabled={pending}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {optimistic.map((persona) => (
              <SortableItem key={persona.id} id={persona.id} disabled={pending}>
                <PersonaCard
                  persona={persona}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>Nouveau persona</DialogTitle>
            <DialogDescription>
              Décrivez le persona, son type, son besoin et les features liées.
            </DialogDescription>
          </DialogHeader>
          <PersonaForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="flex h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>Éditer le persona</DialogTitle>
            <DialogDescription>
              Mettez à jour le besoin ou les features liées.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <PersonaForm
              defaultValues={editing}
              onSubmit={handleUpdate}
              pending={pending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce persona ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le persona « {deleting?.name} » sera
              retiré du flux {flow}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
