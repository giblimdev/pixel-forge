/*
path:            app/pixel/components/feedback/processing-progress.tsx
tag:             ["pixel", "component", "feedback", "progress"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Barre de progression 0-100. Affiche la valeur en
                 pourcentage + un libelle optionnel. Server Component
                 pur (rendu CSS, pas d'etat). Le parent controle la
                 valeur via prop `value` (0-100). Si `value` est null
                 ou undefined, la barre est consideree indeterminee
                 (animation shimmer).

flow:            Recoit { value, label?, className? } -> clamp la
                 valeur 0-100 -> rend un <div> avec une barre coloree
                 (gradient pf-primary -> pf-info) proportionnelle.

ecosystem:       Feedback = [
                   "@/app/pixel/components/feedback/empty-state.tsx",
                   "@/app/pixel/components/feedback/error-message.tsx",
                   "@/app/pixel/components/feedback/processing-progress.tsx",
                   "@/app/pixel/components/feedback/processing-status.tsx",
                 ]
relatedFiles:    []
imports:         []
exports:         ["ProcessingProgress", "ProcessingProgressProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir la progression d'un traitement"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProcessingProgressProps {
  readonly value: number | null;
  readonly label?: string;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function ProcessingProgress({
  value,
  label,
  className,
}: ProcessingProgressProps) {
  const indeterminate = value === null;
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <div className="flex items-center justify-between text-xs text-[var(--pf-muted)]">
        {label && <span className="truncate">{label}</span>}
        <span className="font-mono tabular-nums">
          {indeterminate ? "..." : `${Math.round(clamped)}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={
          indeterminate ? "Indetermine" : `${Math.round(clamped)} pourcent`
        }
        className="relative h-1.5 overflow-hidden rounded-full bg-[var(--pf-surface-hover)]"
      >
        {indeterminate ? (
          <span className="absolute inset-y-0 left-0 w-1/3 animate-pulse rounded-full bg-gradient-to-r from-[var(--pf-primary)] to-[var(--pf-info)]" />
        ) : (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--pf-primary)] to-[var(--pf-info)] transition-all duration-300"
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  );
}