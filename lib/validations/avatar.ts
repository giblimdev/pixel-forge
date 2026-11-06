/*
path :           lib/validations/avatar.ts
tag :            ["validation", "avatar", "user", "image", "generic"]
projectId:       new-genesis
type:            config
generic:         true

role:            Constantes et validateur partagés pour les avatars
                 utilisateur. Utilisé par <AvatarPicker /> (client) et
                 par les schémas Zod registerSchema / updateProfileSchema
                 (serveur). Source unique de vérité pour :
                 - MAX_AVATAR_BYTES  = 2 Mo (compromis base64 / SQLite)
                 - ALLOWED_AVATAR_MIME = JPEG, PNG, WebP, GIF
                 - validateAvatarFile(file) → { ok: true } | { ok: false, error }
                 SVG volontairement exclu (vecteur XSS stocké, cf. blog).
                 Aucune dépendance runtime hors TypeScript.

flow:            Module TypeScript pur → export des constantes + du
                 validateur. Aucun effet, aucun state.

ecosystem:       UserAvatar = [
                   "@/components/user/AvatarPicker.tsx",
                   "@/lib/validations/avatar.ts",
                 ]

relatedFiles:    ["@/lib/validations/auth.ts",
                  "@/lib/validations/profile.ts"]

imports:         []

exports:         ["MAX_AVATAR_BYTES", "ALLOWED_AVATAR_MIME",
                  "AllowedAvatarMime", "AvatarValidationResult",
                  "validateAvatarFile"]

useBy:           ["@/components/user/AvatarPicker.tsx"]

userStories:     ["*en tant que développeur je veux une validation d'avatar partagée"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

/** Taille maximale d'un avatar : 2 Mo. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/**
 * MIME autorisés. SVG volontairement exclu (vecteur XSS stocké —
 * même règle que l'upload de couverture du blog).
 */
export const ALLOWED_AVATAR_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedAvatarMime = (typeof ALLOWED_AVATAR_MIME)[number];

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

export type AvatarValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

/**
 * Valide un fichier avatar côté client :
 * - MIME dans ALLOWED_AVATAR_MIME
 * - taille ≤ MAX_AVATAR_BYTES
 *
 * Ne lit PAS le fichier (pas d'I/O) — la lecture est faite par
 * l'appelant (FileReader). Cette fonction est pure et testable.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!(ALLOWED_AVATAR_MIME as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      error: "Format non supporté (JPEG, PNG, WebP, GIF).",
    };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Image trop lourde (2 Mo maximum)." };
  }
  return { ok: true };
}