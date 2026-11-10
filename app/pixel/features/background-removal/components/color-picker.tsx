/*
path:            app/pixel/features/background-removal/components/color-picker.tsx
tag:             ["pixel", "feature", "background-removal", "component", "color-picker"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Pipette couleur sur l'image source. Affiche l'image
                 source dans un canvas, ecoute le clic, extrait la
                 couleur RGB du pixel clique via getImageData() et
                 remonte la couleur au parent.

                 Utilise un <canvas> HTML natif (pas de lib) :
                 drawImage de l'image source, puis onClick calcule les
                 coordonnees canvas -> coordonnees image (ratio) et
                 lit pixel.

flow:            Props { imageUrl, onColorPick, disabled? } ->
                 useRef(canvas) + useEffect(drawImage) -> onClick ->
                 getImageData -> onColorPick({ r, g, b }).

ecosystem:       BackgroundRemoval = [
                   "@/app/pixel/features/background-removal/types/background.types.ts",
                   "@/app/pixel/features/background-removal/schemas/background.schema.ts",
                   "@/app/pixel/features/background-removal/hooks/use-background-removal.ts",
                   "@/app/pixel/features/background-removal/components/color-picker.tsx",
                   "@/app/pixel/features/background-removal/components/background-settings.tsx",
                   "@/app/pixel/features/background-removal/components/background-preview.tsx",
                   "@/app/pixel/features/background-removal/components/background-panel.tsx",
                   "@/app/pixel/features/background-removal/index.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/background-removal/components/background-panel.tsx",
                  "@/app/pixel/features/background-removal/types/background.types.ts"]
imports:         ["react",
                  "@/app/pixel/features/background-removal/types/background.types"]
exports:         ["ColorPicker", "ColorPickerProps"]
useBy:           ["@/app/pixel/features/background-removal/components/background-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir la couleur de fond a supprimer"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : useRef + useEffect + canvas + click.

import { useEffect, useRef, useState } from "react";

import type { RgbColor } from "@/app/pixel/features/background-removal/types/background.types";

export interface ColorPickerProps {
  readonly imageUrl: string;
  readonly onColorPick: (color: RgbColor) => void;
  readonly disabled?: boolean;
}

export function ColorPicker({ imageUrl, onColorPick, disabled = false }: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 600;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (disabled || !loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const data = ctx.getImageData(x, y, 1, 1).data;

    onColorPick({
      r: data[0] ?? 255,
      g: data[1] ?? 255,
      b: data[2] ?? 255,
    });
  }

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-muted)]">
        Pipette - cliquez sur le fond a supprimer
      </span>
      <div className="overflow-hidden rounded-lg border border-[var(--pf-border)]/60">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className={`w-full ${disabled ? "opacity-50" : "cursor-crosshair"}`}
          aria-label="Pipette couleur"
        />
      </div>
    </div>
  );
}