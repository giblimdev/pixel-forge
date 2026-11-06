/*
path :           lib/actions/result.ts
tag :            ["actions", "result", "discriminated", "generic", "neutral"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Contrat discriminé ActionResult<T> partagé par TOUTES les
                 Server Actions du projet (Blog, Scrum, futures), plus un
                 helper handleActionError(error) qui convertit une exception
                 en { ok: false, error } avec un message lisible.
                 Module NEUTRE : aucune dépendance à un domaine métier
                 particulier. Blog et Scrum l'importent via leurs modules
                 respectifs (@/app/blog/lib/actions/result et
                 @/app/core/lib/scrum/actions/_helpers) qui le ré-exportent
                 pour conserver leur API publique.

flow:            Module TypeScript pur → export du type ActionResult<T> et
                 de la fonction handleActionError(error) qui renvoie
                 { ok: false, error: message }.

ecosystem:       ActionsCore = [
                   "@/lib/actions/result.ts",
                 ]

relatedFiles:    ["@/app/blog/lib/actions/result.ts",
                  "@/app/core/lib/scrum/actions/_helpers.ts"]

imports:         []

exports:         ["ActionResult", "handleActionError"]

useBy:           ["@/app/blog/lib/actions/result.ts",
                  "@/app/core/lib/scrum/actions/_helpers.ts"]

userStories:     ["*en tant que développeur je veux un contrat ActionResult partagé par tous les modules"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

/**
 * Résultat discriminé d'une Server Action.
 * - `{ ok: true, data }` : succès, payload typé
 * - `{ ok: false, error }` : échec, message lisible
 */
export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

/**
 * Convertit une exception inconnue en `{ ok: false, error }`.
 * Utilisé dans les blocs `catch` de toutes les Server Actions du projet.
 */
export function handleActionError(error: unknown): {
  readonly ok: false;
  readonly error: string;
} {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Erreur inconnue.",
  };
}