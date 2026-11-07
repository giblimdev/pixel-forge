/*
path:            app/pixel/components/feedback/empty-state.tsx
tag:             ["pixel", "component", "feedback", "empty"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Etat vide generique reutilisable : icone, titre,
                 description, action optionnelle. Server Component
                 pur. Consomme la charte PixelForge (tokens pf-*).
                 Utilise pour les files vides, les historiques vides,
                 les recherches sans resultat.

flow:            Recoit { icon, title, description, action?,
                 className? } -> rend un <div> centre avec icone
                 dans une pastille, titre, description et action
                 eventuelle (children ou ReactNode passe via `action`).

ecosystem:       Feedback = [
                   "@/app/pixel/components/feedback/empty-state.tsx",
                   "@/app/pixel/components/feedback/error-message.tsx",
                   "@/app/pixel/components/feedback/processing-progress.tsx",
                   "@/app/pixel/components/feedback/processing-status.tsx",
                 ]
relatedFiles:    []
imports:         ["lucide-react"]
exports:         ["EmptyState", "EmptyStateProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux un etat vide clair et actionnable"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/20 px-6 py-12 text-center ${className ?? ""}`}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-[var(--pf-surface-hover)]/60 text-[var(--pf-muted)]">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--pf-foreground)]">
          {title}
        </h3>
        {description && (
          <p className="max-w-sm text-xs leading-relaxed text-[var(--pf-muted)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}