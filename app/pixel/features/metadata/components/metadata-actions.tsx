/*
path:            app/pixel/features/metadata/components/metadata-actions.tsx
tag:             ["pixel", "feature", "metadata", "component", "actions"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Boutons d'action : "Analyser" et "Supprimer les
                 metadonnees". Le parent (MetadataPanel) decide de
                 l'action via onChange. Les boutons sont desactives
                 pendant running.

flow:            Props { action, onChange, onAnalyze, onStrip,
                 disabled, pendingCount } -> 2 boutons colores
                 differemment (info / warning).

ecosystem:       Metadata = [
                   "@/app/api/images/metadata/route.ts",
                   "@/app/pixel/analyze/metadata/page.tsx",
                   "@/app/pixel/analyze/page.tsx",
                   "@/app/pixel/features/metadata/components/metadata-actions.tsx",
                   "@/app/pixel/features/metadata/components/metadata-details.tsx",
                   "@/app/pixel/features/metadata/components/metadata-panel.tsx",
                   "@/app/pixel/features/metadata/hooks/use-image-metadata.ts",
                   "@/app/pixel/features/metadata/index.ts",
                   "@/app/pixel/features/metadata/schemas/metadata.schema.ts",
                   "@/app/pixel/features/metadata/types/metadata.types.ts",
                   "@/app/pixel/lib/image-engine/metadata-stripper.ts",
                   "@/app/pixel/lib/image-engine/sharp.adapter.ts",
                   "@/app/pixel/types/processing.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/metadata/components/metadata-panel.tsx",
                  "@/app/pixel/features/metadata/types/metadata.types.ts",
                  "@/components/ui/button.tsx"]
imports:         ["lucide-react",
                  "@/app/pixel/features/metadata/types/metadata.types",
                  "@/components/ui/button"]
exports:         ["MetadataActions", "MetadataActionsProps"]
useBy:           ["@/app/pixel/features/metadata/components/metadata-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux analyser ou supprimer les metadonnees"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifie : boutons interactifs.

import { Eye, Loader2, ShieldOff } from "lucide-react";

import type { MetadataOptions } from "@/app/pixel/features/metadata/types/metadata.types";
import { Button } from "@/components/ui/button";

export interface MetadataActionsProps {
  readonly action: MetadataOptions["action"];
  readonly onAnalyze: () => void;
  readonly onStrip: () => void;
  readonly disabled?: boolean;
  readonly pendingCount: number;
  readonly running: boolean;
}

export function MetadataActions({
  action,
  onAnalyze,
  onStrip,
  disabled = false,
  pendingCount,
  running,
}: MetadataActionsProps) {
  const hasPending = pendingCount > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--pf-border)]/60 pt-3">
      <p className="text-xs text-[var(--pf-muted)]">
        {hasPending
          ? `${pendingCount} image(s) prete(s). Action : ${action === "analyze" ? "Analyse" : "Suppression"}.`
          : "Ajoutez une image a la file pour commencer."}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onAnalyze}
          disabled={disabled || running || !hasPending}
          className="gap-1.5 border-[var(--pf-info)]/40 text-[var(--pf-info)] hover:bg-[var(--pf-info)]/10"
        >
          {running && action === "analyze" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Analyse...
            </>
          ) : (
            <>
              <Eye className="size-3.5" aria-hidden />
              Analyser
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onStrip}
          disabled={disabled || running || !hasPending}
          className="gap-1.5 bg-gradient-to-r from-[var(--pf-warning)] to-[var(--pf-primary)] text-white"
        >
          {running && action === "strip" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Suppression...
            </>
          ) : (
            <>
              <ShieldOff className="size-3.5" aria-hidden />
              Supprimer les metadonnees
            </>
          )}
        </Button>
      </div>
    </div>
  );
}