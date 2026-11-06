/*
path :           lib/utils.ts
tag :            ["utils", "cn", "helper", "re-export"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Point d'entrée unique pour le helper `cn` (class-merger),
                 ré-exporté depuis le package npm `cn`. Tous les composants UI
                 doivent importer `cn` depuis `@/lib/utils` plutôt que depuis
                 le package directement, afin de centraliser un éventuel
                 remplacement futur.

flow:            Re-export direct : export { cn } from "cn".

ecosystem:       Lib = [
                   "@/lib/env.ts",
                   "@/lib/prisma.ts",
                   "@/lib/utils.ts",
                 ]

relatedFiles:    []

imports:         ["cn"]

exports:         ["cn"]

useBy:           ["@/components/ui/accordion.tsx",
                  "@/components/ui/alert.tsx",
                  "@/components/ui/avatar.tsx",
                  "@/components/ui/badge.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/input.tsx",
                  "@/components/ui/textarea.tsx"]

userStories:     ["*en tant que développeur je veux un helper cn centralisé"]

status:          planned
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { cn } from "cn";