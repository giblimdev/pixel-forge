/*
path:            app/pixel/components/feedback/error-message.tsx
tag:             ["pixel", "component", "feedback", "error"]
projectId:       <Pixel-fotgen>
type:            component
generic:         true

role:            Affichage d'une ProcessingError structuree
                 ({ code, message, details? }). Rend un bloc
                 d'alerte avec icone, code stable (monospace) et
                 message lisible. Optionnellement, un bouton Reessayer
                 peut etre fourni via `onRetry` (Client Component
                 requis alors, mais le composant lui-meme reste
                 neutre : c'est le parent qui decide s'il est client
                 ou server).

flow:            Recoit { error, onRetry?, className? } -> rend un
                 <div role="alert"> avec code + message, plus un bouton
                 Reessayer si onRetry est fourni.

ecosystem:       Feedback = [
                   "@/app/pixel/components/feedback/empty-state.tsx",
                   "@/app/pixel/components/feedback/error-message.tsx",
                   "@/app/pixel/components/feedback/processing-progress.tsx",
                   "@/app/pixel/components/feedback/processing-status.tsx",
                 ]
relatedFiles:    ["@/app/pixel/types/processing.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/types/processing",
                  "@/components/ui/button"]
exports:         ["ErrorMessage", "ErrorMessageProps"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux comprendre pourquoi mon traitement a echoue"]
status:          done
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import { AlertCircle, RefreshCw } from "lucide-react";

import type { ProcessingError } from "@/app/pixel/types/processing";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorMessageProps {
  readonly error: ProcessingError;
  readonly onRetry?: () => void;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 ${className ?? ""}`}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0 flex-1 space-y-0.5">
          <code className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-destructive">
            {error.code}
          </code>
          <p className="text-sm leading-relaxed text-foreground">
            {error.message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Reessayer
          </Button>
        </div>
      )}
    </div>
  );
}