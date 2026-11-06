/*
path :           components/layout/header/Logo.tsx
tag :            ["layout", "header", "logo", "pixel-forge", "branding", "ui", "responsive"]
projectId:       new-genesis
type:            component
generic:         false

role:            Logo officiel de "Pixel-Forge". 100 % code (plus de
                 dépendance à public/mainLogo.png ni à next/image) :
                 icône Sparkles dans un carré en dégradé chart-1 →
                 chart-2, suivie du wordmark "Pixel-Forge" en gradient
                 de texte (chart-1 → chart-2 → chart-5). Deux variantes :
                 - "mark" (défaut) : icône + wordmark complet.
                 - "compact" : icône seule (pour usages futurs, ex.
                   sidebar repliée, favicon textuel).
                 Lien vers "/". Server Component pur.

                 Cohérence design : reprend exactement la charte
                 Genesis/Pixel-Forge (palette chart-1..chart-5, gradient
                 text-transparent, hover scale-105 subtil, focus
                 ring-chart-1/40). Aucun asset binaire requis.

flow:            Server Component → <Link href="/"> contenant
                 <span> icône gradient + <span> wordmark gradient
                 (variante "mark") OU <span> icône seule (variante
                 "compact").

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
                  "@/components/layout/footer/Footer.tsx"]

imports:         ["next/link", "lucide-react"]

exports:         ["default Logo", "LogoProps", "LogoVariant"]

useBy:           ["@/components/layout/header/Header.tsx",
                  "@/components/layout/footer/Footer.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un logo cliquable Pixel-Forge stylisé"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import { Sparkles } from "lucide-react";

export type LogoVariant = "mark" | "compact";

export interface LogoProps {
  readonly variant?: LogoVariant;
}

export default function Logo({ variant = "mark" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Pixel-Forge — Retour à l'accueil"
      className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1/40 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-chart-1 via-chart-2 to-chart-5 text-white shadow-md shadow-chart-1/30 transition-transform duration-200 group-hover:scale-105 lg:size-9"
      >
        <Sparkles className="size-4 lg:size-5" />
      </span>

      {variant === "mark" && (
        <span className="hidden bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-lg font-black tracking-tight text-transparent sm:inline lg:text-xl">
          Pixel-Forge
        </span>
      )}
    </Link>
  );
}