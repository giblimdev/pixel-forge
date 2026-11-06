/*
path :           lib/validations/profile.ts
tag :            ["validation", "profile", "zod", "user", "generic"]
projectId:       new-genesis
type:            config
generic:         true

role:            Schéma Zod pour la mise à jour du profil utilisateur.
                 Valide les 4 champs éditables depuis /user/profile :
                 name (2-60 car.), bio (max 500 car., optionnelle),
                 phone (max 30 car., optionnel), image (URL http(s) ou
                 data URL base64 — même règle que registerSchema côté
                 Auth). Un champ image vide est transformé en undefined
                 (null en base). Aucune dépendance runtime hors zod.

flow:            Module TypeScript pur → export de updateProfileSchema
                 et du type UpdateProfileInput. Aucun effet.

ecosystem:       UserProfile = [
                   "@/app/user/profile/actions.ts",
                   "@/app/user/profile/page.tsx",
                   "@/app/user/profile/ProfileForm.tsx",
                   "@/lib/validations/profile.ts",
                 ]

relatedFiles:    ["@/lib/validations/auth.ts"]

imports:         ["zod"]

exports:         ["updateProfileSchema", "UpdateProfileInput"]

useBy:           ["@/app/user/profile/actions.ts"]

userStories:     ["*en tant qu'utilisateur je veux modifier mon profil"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Champ image (URL http(s) OU data URL base64)                       */
/*  Aligné sur imageField de @/lib/validations/auth.ts                 */
/* ------------------------------------------------------------------ */

const imageField = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional()
  .refine(
    (v) =>
      v === undefined ||
      /^https?:\/\/.+/.test(v) ||
      /^data:image\/[a-z0-9.+-]+;base64,/i.test(v),
    {
      message:
        "Format d'image invalide (URL http(s) ou data URL base64 attendu).",
    },
  );

/* ------------------------------------------------------------------ */
/*  Schéma                                                             */
/* ------------------------------------------------------------------ */

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nom : 2 caractères minimum." })
    .max(60, { message: "Nom : 60 caractères maximum." }),

  bio: z
    .string()
    .trim()
    .max(500, { message: "Bio : 500 caractères maximum." })
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  phone: z
    .string()
    .trim()
    .max(30, { message: "Téléphone : 30 caractères maximum." })
    .optional()
    .transform((v) => (v === "" ? undefined : v)),

  image: imageField,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;