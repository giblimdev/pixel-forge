/*
path:            app/pixel/components/feedback/processing-status.tsx
tag:             ["pixel", "component", "feedback", "status"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Badge de statut du pipeline (pending, running,
                 success, partial, error). Consomme le type
                 ProcessingStatus de Phase 1. Server Component pur :
                 aucun etat, aucune interaction, aucun effet. Affiche
                 une icone + libelle, colore selon le statut.

flow:            Recoit { status, className? } -> rend un <span> badge
                 avec icone Lucide + libelle mappe sur STATUS_META.

ecosystem:       Feedback = [
                   "@/app/pixel/components/feedback/empty-state.tsx",
                   "@/app/pixel/components/feedback/error-message.tsx",
                   "@/app/pixel/components/feedback/processing-progress.tsx",
                   "@/app/pixel/components/feedback/processing-status.tsx",
                 ]
relatedFiles:    ["@/app/pixel/types/processing.ts"]
imports:         ["lucide-react", "@/app/pixel/types/processing"]
exports:         ["ProcessingStatusBadge", "ProcessingStatusBadgeProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir l'etat d'un traitement en un coup d'oeil"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { ProcessingStatus } from "@/app/pixel/types/processing";

// ---------------------------------------------------------------------------
// Mapping statut -> meta
// ---------------------------------------------------------------------------

interface StatusMeta {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly className: string;
}

const STATUS_META: Readonly<Record<ProcessingStatus, StatusMeta>> = {
  pending: {
    label: "En attente",
    icon: CircleDashed,
    className: "bg-muted text-muted-foreground",
  },
  running: {
    label: "En cours",
    icon: Loader2,
    className: "bg-[var(--pf-info)]/15 text-[var(--pf-info)]",
  },
  success: {
    label: "Reussi",
    icon: CheckCircle2,
    className: "bg-[var(--pf-success)]/15 text-[var(--pf-success)]",
  },
  partial: {
    label: "Partiel",
    icon: AlertTriangle,
    className: "bg-[var(--pf-warning)]/15 text-[var(--pf-warning)]",
  },
  error: {
    label: "Erreur",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProcessingStatusBadgeProps {
  readonly status: ProcessingStatus;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function ProcessingStatusBadge({
  status,
  className,
}: ProcessingStatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const spinning = status === "running";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.className} ${className ?? ""}`}
    >
      <Icon className={`size-3 ${spinning ? "animate-spin" : ""}`} aria-hidden />
      {meta.label}
    </span>
  );
}