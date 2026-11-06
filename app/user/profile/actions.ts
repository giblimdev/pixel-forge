/*
path :           app/user/profile/actions.ts
tag :            ["user", "profile", "action", "server-action", "update"]
projectId:       new-genesis
type:            action
generic:         false

role:            Server Action de mise à jour du profil utilisateur.
                 Reçoit un FormData (name, bio, phone, image), valide
                 via updateProfileSchema, puis écrit dans DEUX tables
                 Prisma : User.name + User.image, et Profile.name +
                 Profile.bio + Profile.phone (upsert, car Profile peut
                 ne pas exister pour un utilisateur créé avant cette
                 page). Le userId est TOUJOURS dérivé de la session —
                 jamais d'un paramètre client. Revalide /user/profile
                 et le header (avatar affiché dans UserMenu) via
                 revalidatePath("/", "layout").

                 Aucune logique métier dans le composant client :
                 le form fait juste FormData → action → toast.

flow:            updateProfileAction(formData) → getSession() → si null :
                 erreur → parse FormData → updateProfileSchema.parse →
                 prisma.$transaction([user.update, profile.upsert]) →
                 revalidatePath("/", "layout") → { ok: true, data: null }.

ecosystem:       UserProfile = [
                   "@/app/user/profile/actions.ts",
                   "@/app/user/profile/page.tsx",
                   "@/app/user/profile/ProfileForm.tsx",
                   "@/lib/validations/profile.ts",
                 ]

relatedFiles:    ["@/lib/prisma.ts",
                  "@/lib/auth/session.ts",
                  "@/lib/actions/result.ts",
                  "@/lib/validations/profile.ts"]

imports:         ["next/cache",
                  "@/lib/prisma",
                  "@/lib/auth/session",
                  "@/lib/actions/result",
                  "@/lib/validations/profile"]

exports:         ["updateProfileAction"]

useBy:           ["@/app/user/profile/ProfileForm.tsx"]

userStories:     ["*en tant qu'utilisateur je veux modifier mon profil"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  handleActionError,
  type ActionResult,
} from "@/lib/actions/result";
import { updateProfileSchema } from "@/lib/validations/profile";

/* ------------------------------------------------------------------ */
/*  Action                                                             */
/* ------------------------------------------------------------------ */

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  try {
    /* 1. Authentification */
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Authentification requise." };
    }

    /* 2. Parse + validation */
    const raw = {
      name: String(formData.get("name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim() || undefined,
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      image: String(formData.get("image") ?? "").trim() || undefined,
    };
    const input = updateProfileSchema.parse(raw);

    /* 3. Mise à jour User + upsert Profile (transaction) */
    const userId = session.user.id;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          image: input.image ?? null,
        },
      }),
      prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: input.name,
          bio: input.bio ?? null,
          phone: input.phone ?? null,
        },
        update: {
          name: input.name,
          bio: input.bio ?? null,
          phone: input.phone ?? null,
        },
      }),
    ]);

    /* 4. Invalidation du cache (page + header via layout) */
    revalidatePath("/", "layout");
    revalidatePath("/user/profile");

    return { ok: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}