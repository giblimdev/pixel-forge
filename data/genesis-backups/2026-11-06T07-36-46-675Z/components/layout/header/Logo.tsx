/*
path :           components/layout/header/Logo.tsx
tag :            ["layout", "header", "logo", "ui", "responsive"]
projectId:       genesis
type:            component
generic:         false

role:            Logo de l'application. Affiche en priorité le logo
                 officiel "ListaMiam" (public/mainLogo.png) via <Image />.
                 Fallback visuel (icône Sparkles + wordmark) si absent.
                 Lien vers l'accueil.

                 AJUSTEMENT RESPONSIVE : la taille passe de `h-8` à
                 `h-8 lg:h-9` — léger surcroît de présence sur desktop
                 (≥ 1024px) quand le header passe à `h-[68px]`, sans
                 impact mobile (h-8 conservé sous lg:). Le fallback
                 icône passe de `size-8` à `size-8 lg:size-9` et le
                 wordmark de `text-lg` à `text-lg lg:text-xl`.

                 Note Next/Image : width={160} height={32} déclarés
                 pour le préchargement, mais `style={{ width: "auto",
                 height: "auto" }}` neutralise le warning « has either
                 width or height modified ». La taille finale est
                 pilotée par CSS (`h-8 lg:h-9`).

flow:            Server Component → <Link href="/"> avec <Image>
                 (priorité) ou fallback.

ecosystem:       Layout = [
                   "@/components/layout/header/CommandKButton.tsx",
                   "@/components/layout/header/Header.tsx",
                   "@/components/layout/header/HeaderActions.tsx",
                   "@/components/layout/header/Logo.tsx",
                   "@/components/layout/header/MainNav.tsx",
                   "@/components/layout/header/NavActiveLink.tsx",
                   "@/components/layout/header/UserMenu.tsx",
                   "@/components/layout/header/UserMenuInner.tsx",
                   "@/components/layout/header/nav/frontWorkSpace.ts",
                   "@/components/layout/header/navTypes.ts",
                   "@/components/ui/sheet.tsx",
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/config/navigation.ts",
                   "@/config/roles.ts",
                 ]

relatedFiles:    ["@/components/layout/header/Header.tsx",
                  "@/components/layout/footer/Footer.tsx",
                  "public/mainLogo.png"]

imports:         ["next/link", "next/image", "lucide-react"]

exports:         ["default Logo"]

useBy:           ["@/components/layout/header/Header.tsx",
                  "@/components/layout/footer/Footer.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un logo cliquable qui ramène à l'accueil"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function Logo() {
  const useImage = true;

  return (
    <Link
      href="/"
      aria-label="Retour à l'accueil"
      className="group inline-flex shrink-0 items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {useImage ? (
        <Image
          src="/mainLogo.png"
          alt="ListaMiam"
          width={160}
          height={32}
          className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 lg:h-9"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      ) : (
        <>
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 lg:size-9">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground lg:text-xl">
            genesis
          </span>
        </>
      )}
    </Link>
  );
}