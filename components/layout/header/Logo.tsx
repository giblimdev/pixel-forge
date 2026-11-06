/*
path :           components/layout/header/Logo.tsx
tag :            ["layout", "header", "logo", "pixel-forge", "branding", "ui", "responsive", "graphic", "pixel-forge-charte"]
projectId:       new-genesis
type:            component
generic:         false

role:            Logo officiel de "PixelForge". ASSOCIE :
                 1. L'IMAGE `public/mainLogo.png` (conservée).
                 2. Le WORDMARK "PixelForge" (sans tiret, plus lisible
                    en logo) en gradient de texte VIF
                    pf-primary → pf-primary-light → pf-secondary
                    (violet → violet clair → indigo), avec ombre
                    colorée.
                 Lien vers "/". Server Component pur.

                 Conforme à la charte PixelForge :
                 - Violets de marque (pf-primary, pf-primary-light,
                   pf-secondary) au lieu de chart-*.
                 - Halo coloré derrière l'image au survol.
                 - Double animation : image scale-105 + texte scale-[1.02].
                 - Police Plus Jakarta Sans héritée (var --font-sans).
                 - Wordmark "PixelForge" (sans tiret) — décision
                   validée par l'utilisateur.

                 Responsive :
                 - < sm : image seule
                 - ≥ sm : image + wordmark
                 - ≥ lg : taille légèrement augmentée

flow:            Server Component → <Link href="/"> contenant
                 <Image src="/mainLogo.png" /> + <span> "PixelForge"
                 en gradient pf-*. Hover : scale-105 + halo.

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

imports:         ["next/link", "next/image"]

exports:         ["default Logo", "LogoProps", "LogoVariant"]

useBy:           ["@/components/layout/header/Header.tsx",
                  "@/components/layout/footer/Footer.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un logo PixelForge avec image et texte modernes et colorés"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import Link from "next/link";
import Image from "next/image";

export type LogoVariant = "mark" | "compact";

export interface LogoProps {
  readonly variant?: LogoVariant;
}

export default function Logo({ variant = "mark" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="PixelForge — Retour à l'accueil"
      className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Image du logo — restaurée, avec halo violet au survol */}
      <span className="relative inline-flex shrink-0 items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[var(--pf-primary)]/25 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        />
        <Image
          src="/mainLogo.png"
          alt="PixelForge"
          width={40}
          height={40}
          priority
          className="relative h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 lg:h-9"
          style={{ width: "auto", height: "auto" }}
        />
      </span>

      {/* Wordmark "PixelForge" — gradient violet → indigo + ombre */}
      {variant === "mark" && (
        <span className="hidden bg-gradient-to-r from-[var(--pf-primary)] via-[var(--pf-primary-light)] to-[var(--pf-secondary)] bg-clip-text text-lg font-black tracking-tight text-transparent drop-shadow-[0_2px_12px_rgba(124,58,237,0.4)] transition-transform duration-200 group-hover:scale-[1.02] sm:inline lg:text-xl">
          PixelForge
        </span>
      )}
    </Link>
  );
}