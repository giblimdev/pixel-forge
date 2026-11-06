/*
path :           components/layout/header/Logo.tsx
tag :            ["layout", "header", "logo", "pixel-forge", "branding", "ui", "responsive", "graphic"]
projectId:       new-genesis
type:            component
generic:         false

role:            Logo officiel de "Pixel-Forge". ASSOCIE :
                 1. L'IMAGE `public/mainLogo.png` (restaurée — jamais
                    supprimée par la refonte).
                 2. Le WORDMARK "Pixel-Forge" à côté, en gradient de
                    texte VIF (chart-1 → chart-2 → chart-5) pour un
                    rendu graphique et moderne.
                 Lien vers "/". Server Component pur.

                 ⚠️ CORRECTION : ma refonte précédente avait supprimé
                 l'image `mainLogo.png` au profit d'une icône Sparkles.
                 C'était une erreur. On restaure l'image ET on garde le
                 texte "Pixel-Forge" — les deux ensemble, comme demandé.

                 ⚠️ COULEURS PLUS GRAPHIQUES :
                 - Le wordmark utilise un dégradé multi-couleurs
                   chart-1 → chart-2 → chart-5 en bg-clip-text.
                 - L'image reçoit un HALO coloré au survol (drop-shadow
                   chart-1/40) + scale-105.
                 - Le texte reçoit une ombre colorée subtile
                   (drop-shadow-[0_2px_12px_rgba(124,58,237,0.3)]).
                 Le résultat est moderne et vivant, pas plat.

                 RESPONSIVE :
                 - < sm (mobile) : icône image seule (gain de place)
                 - ≥ sm (tablette+) : image + wordmark complet
                 - ≥ lg (desktop) : taille légèrement augmentée

flow:            Server Component → <Link href="/"> contenant
                 <Image src="/mainLogo.png" /> + <span> "Pixel-Forge"
                 en gradient. Hover : scale-105 + drop-shadow coloré.

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

userStories:     ["*en tant qu'utilisateur je veux un logo cliquable Pixel-Forge avec image et texte modernes"]

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
      aria-label="Pixel-Forge — Retour à l'accueil"
      className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-1/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Image du logo — restaurée, avec halo coloré au survol */}
      <span className="relative inline-flex shrink-0 items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-chart-1/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        />
        <Image
          src="/mainLogo.png"
          alt="Pixel-Forge"
          width={40}
          height={40}
          priority
          className="relative h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 lg:h-9"
          style={{ width: "auto", height: "auto" }}
        />
      </span>

      {/* Wordmark "Pixel-Forge" — gradient vif + ombre colorée */}
      {variant === "mark" && (
        <span className="hidden bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-lg font-black tracking-tight text-transparent drop-shadow-[0_2px_12px_rgba(124,58,237,0.3)] transition-transform duration-200 group-hover:scale-[1.02] sm:inline lg:text-xl">
          Pixel-Forge
        </span>
      )}
    </Link>
  );
}