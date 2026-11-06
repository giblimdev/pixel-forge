/*
path :           app/core/components/SortableItem.tsx
tag :            ["scrum", "dnd", "sortable", "ui", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Wrapper drag-and-drop pour une carte Scrum. Ajoute une
                 poignée de drag en haut à droite de la carte, une animation
                 de déplacement et un retour visuel pendant le drag. Le
                 listener est attaché UNIQUEMENT à la poignée pour ne pas
                 interférer avec les boutons Lire/Éditer/Supprimer de la
                 carte. Accessible au clavier (Tab → poignée → Space →
                 flèches → Space).

flow:            Reçoit id + children → useSortable({ id, disabled }) →
                 wrapper div avec setNodeRef + transform/transition + opacité
                 réduite si isDragging → poignée button avec listeners.
                 Consommé dans SortableList.

ecosystem:       ScrumDnD = [
                   "@/app/core/components/scrum/SortableItem.tsx",
                   "@/app/core/components/scrum/SortableList.tsx",
                 ]

relatedFiles:    ["@/app/core/components/scrum/SortableList.tsx"]

imports:         ["@dnd-kit/sortable", "@dnd-kit/utilities", "lucide-react"]

exports:         ["SortableItem", "SortableItemProps"]

useBy:           ["@/app/core/components/scrum/IdeeList.tsx",
                  "@/app/core/components/scrum/EpicList.tsx",
                  "@/app/core/components/scrum/FeatureList.tsx",
                  "@/app/core/components/scrum/PersonaList.tsx",
                  "@/app/core/components/scrum/SprintList.tsx",
                  "@/app/core/components/scrum/UserStoryList.tsx"]

userStories:     ["*en tant qu'utilisateur je veux réorganiser les cartes par glisser-déposer"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useSortable (interaction DnD côté client).

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface SortableItemProps {
  readonly id: string;
  readonly children: React.ReactNode;
  /** Désactive le drag (utile pendant une mutation en cours). */
  readonly disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function SortableItem({
  id,
  children,
  disabled = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 20 : undefined,
      }}
      className="relative"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label="Réorganiser"
        className="absolute right-2 top-2 z-10 grid size-7 cursor-grab place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      {children}
    </div>
  );
}
