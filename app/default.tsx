/*
path :           app/default.tsx
tag :            ["app", "default", "fallback", "slot", "next-special"]
projectId:       new-genesis
type:            component
generic:         true

role:            Fallback de route par défaut. Fichier spécial Next.js
                 (`default.tsx`) : utilisé comme contenu de secours pour
                 un slot parallèle non matché lors d'une navigation
                 (App Router). L'application n'utilise pas encore de
                 routes parallèles (@slot) — ce fichier existe comme
                 point d'ancrage, rend null et ne produit aucun effet
                 visuel. Server Component pur (aucune donnée, aucun
                 état, aucun effet).

flow:            Server Component → retourne null. Next.js le monte
                 automatiquement si un slot parallèle n'a pas de match
                 pour la route courante. Aucun rendu.

ecosystem:       AppShell = [
                   "@/app/layout.tsx",
                   "@/app/loading.tsx",
                   "@/app/error.tsx",
                   "@/app/not-found.tsx",
                   "@/app/global-error.tsx",
                   "@/app/template.tsx",
                   "@/app/default.tsx",
                 ]

relatedFiles:    ["@/app/layout.tsx"]

imports:         []

exports:         ["default Default"]

useBy:           []

userStories:     ["*en tant que développeur je veux un fallback de route par défaut"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export default function Default() {
  return null;
}