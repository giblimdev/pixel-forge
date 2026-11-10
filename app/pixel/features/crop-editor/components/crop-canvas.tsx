/*
path:            app/pixel/features/crop-editor/components/crop-canvas.tsx
tag:             ["pixel", "feature", "crop-editor", "component", "canvas"]
projectId:       <Pixel-fotgen>
type:            component
generic:         false

role:            Wrapper autour de <Cropper> de react-easy-crop. Le
                 Cropper se positionne en absolute : il DOIT etre
                 enveloppe dans un conteneur position relative avec une
                 taille stable (doc officielle react-easy-crop).
                 Le conteneur fait aspect-video (16:9) pour eviter les
                 sauts de layout. Emet onCropComplete(croppedAreaPixels)
                 au parent a chaque fin d'interaction.

flow:            Props { imageUrl, aspectRatio, onCropAreaChange } ->
                 useState(crop, zoom) -> <div relative aspect-video>
                 <Cropper image crop zoom aspect onCropChange
                 onZoomChange onCropComplete> -> onCropComplete extrait
                 croppedAreaPixels et le remonte.

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
imports:         ["react", "react-easy-crop",
                  "@/app/pixel/features/crop-editor/types/crop-editor.types"]
exports:         ["CropCanvas", "CropCanvasProps"]
useBy:           ["@/app/pixel/features/crop-editor/components/crop-editor-panel.tsx"]

userStories:     ["*en tant qu'utilisateur je veux recadrer visuellement une image"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

"use client";
// "use client" justifie : react-easy-crop + useState.

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import type { CropAreaPixels } from "@/app/pixel/features/crop-editor/types/crop-editor.types";

export interface CropCanvasProps {
  readonly imageUrl: string;
  readonly aspectRatio: number;
  readonly onCropAreaChange: (area: CropAreaPixels) => void;
}

export function CropCanvas({
  imageUrl,
  aspectRatio,
  onCropAreaChange,
}: CropCanvasProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropAreaChange({
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
      });
    },
    [onCropAreaChange],
  );

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--pf-border)]/60 bg-black">
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={aspectRatio}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}