/*
path:            app/pixel/features/crop-editor/components/crop-toolbar.tsx
tag:             ["pixel", "feature", "crop-editor", "component", "toolbar"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Barre d'outils de l'editeur : rotation 0/90/180/270
                 (bouton cycle) + flip horizontal. Les modifications
                 remontent au parent via onChange (le hook les stocke
                 dans options.rotation et options.flipHorizontal). Le
                 flip est applique cote client (aperçu) et cote serveur
                 (via sharp.flip dans l'adaptateur — a brancher plus
                 tard dans l'adaptateur si necessaire).

flow:            Props { rotation, flipHorizontal, onChange, disabled? }
                 -> bouton rotation (cycle) + bouton flip.

ecosystem:       CropEditor = [
                   "@/app/pixel/features/crop-editor/types/crop-editor.types.ts",
                   "@/app/pixel/features/crop-editor/schemas/crop-editor.schema.ts",
                   "@/app/pixel/features/crop-editor/hooks/use-crop-editor.ts",
                   "@/app/pixel/features/crop-editor/components/crop-canvas.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-toolbar.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-controls.tsx",
                   "@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                   "@/app/pixel/features/crop-editor/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types.ts"]
imports:         ["lucide-react",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types"]
exports:         ["CropToolbar", "CropToolbarProps"]
useBy:           ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux faire pivoter et retourner mon image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : boutons interactifs.

import { FlipHorizontal, RotateCw } from "lucide-react";

import type { CropEditorOptions } from "@/app/pixel/features/crop-editor/types/crop-editor.types";

export interface CropToolbarProps {
  readonly rotation: CropEditorOptions["rotation"];
  readonly flipHorizontal: boolean;
  readonly onChange: (next: Partial<Pick<CropEditorOptions, "rotation" | "flipHorizontal">>) => void;
  readonly disabled?: boolean;
}

const ROTATION_CYCLE: readonly CropEditorOptions["rotation"][] = [0, 90, 180, 270];

export function CropToolbar({
  rotation,
  flipHorizontal,
  onChange,
  disabled = false,
}: CropToolbarProps) {
  function handleRotate() {
    const index = ROTATION_CYCLE.indexOf(rotation);
    const next = ROTATION_CYCLE[(index + 1) % ROTATION_CYCLE.length]!;
    onChange({ rotation: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleRotate}
        disabled={disabled}
        aria-label={`Rotation ${rotation} degres`}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 px-2.5 py-1.5 text-xs font-medium text-[var(--pf-foreground)] transition-colors hover:bg-[var(--pf-surface)]/60"
      >
        <RotateCw className="size-3.5" aria-hidden />
        Rotation {rotation}°
      </button>
      <button
        type="button"
        onClick={() => onChange({ flipHorizontal: !flipHorizontal })}
        disabled={disabled}
        aria-pressed={flipHorizontal}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
          flipHorizontal
            ? "border-[var(--pf-primary)]/40 bg-[var(--pf-primary)]/10 text-[var(--pf-primary)]"
            : "border-[var(--pf-border)]/60 bg-[var(--pf-surface)]/40 text-[var(--pf-foreground)] hover:bg-[var(--pf-surface)]/60"
        }`}
      >
        <FlipHorizontal className="size-3.5" aria-hidden />
        Flip H
      </button>
    </div>
  );
}