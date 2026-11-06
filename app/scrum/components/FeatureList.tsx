/*
path :           app/core/components/FeatureList.tsx
tag :            ["scrum", "feature", "list", "ui", "dnd"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste des features d'un flux Scrum avec DnD. État optimiste.
                 DialogContent : `flex h-[85vh] flex-col overflow-hidden` +
                 `sm:max-w-2xl`.

flow:            flow + features → useState(optimistic) → useEffect resync →
                 SortableList + SortableItem → handleReorder → Server Action
                 → refresh ou rollback.

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

relatedFiles:    ["@/app/core/components/scrum/FeatureCard.tsx",
                  "@/app/core/components/scrum/FeatureForm.tsx",
                  "@/app/core/components/scrum/SortableItem.tsx",
                  "@/app/core/components/scrum/SortableList.tsx",
                  "@/app/core/lib/scrum/types.ts",
                  "@/app/core/lib/scrum/actions/feature.ts"]

imports:         ["react", "next/navigation", "lucide-react", "sonner",
                  "@/app/core/lib/scrum/types",
                  "@/app/core/lib/scrum/actions/feature",
                  "@/app/core/components/scrum/FeatureCard",
                  "@/app/core/components/scrum/FeatureForm",
                  "@/app/core/components/scrum/SortableItem",
                  "@/app/core/components/scrum/SortableList",
                  "@/components/ui/button",
                  "@/components/ui/dialog",
                  "@/components/ui/alert-dialog"]

exports:         ["FeatureList", "FeatureListProps"]

useBy:           ["@/app/core/[flow]/feature/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux lister et réorganiser les features Scrum"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (dialogs + optimiste), useEffect, DnD, toast.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { Feature, ScrumFlow } from "@/app/scrum/lib/types";
import {
  createFeatureAction,
  deleteFeatureAction,
  reorderFeaturesAction,
  updateFeatureAction,
} from "@/app/scrum/lib/actions/feature";
import { FeatureCard } from "@/app/scrum/components/FeatureCard";
import { FeatureForm } from "@/app/scrum/components/FeatureForm";
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

export interface FeatureListProps {
  readonly flow: ScrumFlow;
  readonly features: readonly Feature[];
}

export function FeatureList({ flow, features }: FeatureListProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<readonly Feature[]>(features);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [deleting, setDeleting] = useState<Feature | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setOptimistic(features);
  }, [features]);

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createFeatureAction(flow, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Feature créée.");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setPending(true);
    const result = await updateFeatureAction(flow, editing.id, formData);
    setPending(false);
    if (result.ok) {
      toast.success("Feature mise à jour.");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const result = await deleteFeatureAction(flow, deleting.id);
    setPending(false);
    if (result.ok) {
      toast.success("Feature supprimée.");
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
      .filter((item): item is Feature => item !== undefined);

    setOptimistic(reordered);
    setPending(true);
    const result = await reorderFeaturesAction(flow, orderedIds);
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
            Features
          </h2>
          <p className="text-sm text-muted-foreground">
            {optimistic.length} feature{optimistic.length > 1 ? "s" : ""}
            {optimistic.length > 1 && " — glissez la poignée pour réordonner"}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Nouvelle feature
        </Button>
      </div>

      {optimistic.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-chart-2/10 text-chart-2">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Aucune feature pour l&apos;instant
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Explorez le problème et listez les features candidates issues du
            brainstorming.
          </p>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-2"
          >
            <Plus className="size-4" aria-hidden />
            Créer la première feature
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
            {optimistic.map((feature) => (
              <SortableItem key={feature.id} id={feature.id} disabled={pending}>
                <FeatureCard
                  feature={feature}
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
            <DialogTitle>Nouvelle feature</DialogTitle>
            <DialogDescription>
              Décrivez la feature, son intérêt et les personas associés.
            </DialogDescription>
          </DialogHeader>
          <FeatureForm onSubmit={handleCreate} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="flex h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>Éditer la feature</DialogTitle>
            <DialogDescription>
              Mettez à jour la description, l&apos;intérêt ou les personas.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <FeatureForm
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
            <AlertDialogTitle>Supprimer cette feature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. La feature « {deleting?.title} » sera
              retirée du flux {flow}.
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
