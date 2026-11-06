/*
path :           hooks/use-mobile.ts
tag :            ["hooks", "responsive", "mobile", "generic"]
projectId:       new-genesis
type:            helper
generic:         true

role:            Détecte si le viewport est en mode mobile (< 768px). S'appuie
                 sur window.matchMedia pour réagir aux redimensionnements de la
                 fenêtre. Consommé par Sidebar pour basculer entre la sidebar
                 desktop et la Sheet mobile.

flow:            Client hook → useState(undefined) → useEffect →
                 matchMedia(`(max-width: 767px)`) → abonnement à l'événement
                 "change" → setIsMobile(window.innerWidth < BP).
                 Nettoyage du listener au démontage.

ecosystem:       UI = [
                   "@/hooks/use-mobile.ts",
                   "@/components/ui/sidebar.tsx",
                 ]

relatedFiles:    ["@/components/ui/sidebar.tsx"]

imports:         ["react"]

exports:         ["useIsMobile", "MOBILE_BREAKPOINT"]

useBy:           ["@/components/ui/sidebar.tsx"]

userStories:     ["*en tant que développeur je veux adapter l'UI au format mobile"]

status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

"use client";
// "use client" justifié : useState + useEffect + window.matchMedia.

import * as React from "react";

export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}