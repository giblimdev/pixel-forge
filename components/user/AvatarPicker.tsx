/*
path :           components/user/AvatarPicker.tsx
tag :            ["user", "avatar", "picker", "client", "form", "generic"]
projectId:       new-genesis
type:            component
generic:         true

role:            Sélecteur d'avatar réutilisable (Client Component).
                 Factorise l'UX qui était inline dans RegisterForm :
                 avatar cliquable, overlay ImagePlus au survol, bouton
                 Choisir/Changer, bouton Retirer, input file caché,
                 validation MIME + taille, lecture FileReader →
                 data URL base64, initiales en fallback, erreur inline.
                 Contrôlé par le parent (value / onChange), donc
                 compatible react-hook-form via <Controller> aussi
                 bien qu'avec un useState local (ProfileForm).

                 Le composant NE fait AUCUNE mutation : il produit une
                 data URL ou "" et appelle onChange. La persistance
                 (Server Action → Prisma) est entièrement de la
                 responsabilité du parent. C'est ce qui permet de le
                 réutiliser dans Auth (register) ET UserProfile (profile).

                 Accepte en `value` aussi bien une data URL (produit
                 par le picker) qu'une URL http(s) (rétrocompat : un
                 avatar déjà enregistré peut être une URL distante).
                 Le regex de prévisualisation accepte les deux.

flow:            Props { value, onChange, name, disabled?, helperText? }
                 → useState(error, isReading) → click avatar / bouton →
                 fileInputRef.click() → onChange du file input →
                 validateAvatarFile(file) → si erreur : setError +
                 return → FileReader.readAsDataURL → onChange(dataUrl)
                 → bouton Retirer : onChange(""). Toute la logique de
                 lecture est async via une Promise locale.

ecosystem:       UserAvatar = [
                   "@/components/user/AvatarPicker.tsx",
                   "@/lib/validations/avatar.ts",
                 ]

relatedFiles:    ["@/lib/validations/avatar.ts",
                  "@/components/ui/avatar.tsx",
                  "@/components/ui/button.tsx",
                  "@/utils/initials.ts"]

imports:         ["react", "lucide-react",
                  "@/lib/validations/avatar",
                  "@/components/ui/avatar",
                  "@/components/ui/button",
                  "@/utils/initials"]

exports:         ["AvatarPicker", "AvatarPickerProps"]

useBy:           ["@/app/core/auth/register/RegisterForm.tsx",
                  "@/app/user/profile/ProfileForm.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir et prévisualiser mon avatar"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState, FileReader, interactions.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import {
  ALLOWED_AVATAR_MIME,
  validateAvatarFile,
} from "@/lib/validations/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initialsOf } from "@/utils/initials";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface AvatarPickerProps {
  /** Data URL base64 ou URL http(s) — "" si aucun avatar. */
  readonly value: string;
  /** Appelé avec la nouvelle valeur (data URL) ou "" en cas de retrait. */
  readonly onChange: (value: string) => void;
  /** Nom affiché — utilisé pour calculer les initiales du fallback. */
  readonly name: string;
  /** Désactive toutes les interactions (pendant une soumission). */
  readonly disabled?: boolean;
  /** Texte d'aide sous le picker. Défaut : "JPG, PNG, WebP · 2 Mo max…". */
  readonly helperText?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Lit un fichier en data URL base64. Ne lève jamais côté client dans
 * notre usage : les erreurs sont converties en string et affichées
 * inline. FileReader.readAsDataURL est le même mécanisme que
 * Better Auth utilise pour enregistrer l'avatar (data URL base64).
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Lecture du fichier impossible."));
      }
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

/** Détecte si une valeur est affichable (data URL ou URL http(s)). */
function isDisplayable(value: string): boolean {
  return /^(https?:\/\/|data:image\/)/.test(value);
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function AvatarPicker({
  value,
  onChange,
  name,
  disabled = false,
  helperText = "JPG, PNG, WebP · 2 Mo max. Laissez vide pour utiliser vos initiales.",
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const busy = disabled || isReading;
  const previewUrl = isDisplayable(value) ? value : undefined;

  function handlePickFile() {
    if (busy) return;
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFile(file: File) {
    const validation = validateAvatarFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setIsReading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Lecture du fichier impossible.");
    } finally {
      setIsReading(false);
    }
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    /* Reset immédiat : permet de re-sélectionner le même fichier. */
    event.target.value = "";
    if (file) void handleFile(file);
  }

  function handleRemove() {
    if (busy) return;
    setError(null);
    onChange("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {/* Avatar cliquable — ouvre le file picker */}
        <button
          type="button"
          onClick={handlePickFile}
          disabled={busy}
          aria-label={value ? "Changer l'avatar" : "Choisir un avatar"}
          className="group relative size-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border/60 transition-all duration-200 hover:ring-chart-1/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Avatar className="size-full">
            {previewUrl && <AvatarImage src={previewUrl} alt="" />}
            <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-lg font-bold text-white">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>

          {/* Overlay au survol / focus */}
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {isReading ? (
              <Loader2 className="size-6 animate-spin text-white" />
            ) : (
              <ImagePlus className="size-6 text-white" />
            )}
          </span>
        </button>

        {/* Actions + texte */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePickFile}
              disabled={busy}
              className="gap-1.5"
            >
              {isReading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-3.5" aria-hidden />
              )}
              {value ? "Changer" : "Choisir une image"}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={busy}
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Retirer
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_AVATAR_MIME.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        tabIndex={-1}
        disabled={busy}
        aria-label="Choisir une image de profil"
      />

      {/* Erreur inline */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-2 py-1 text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}