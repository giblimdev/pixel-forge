/*
path :           app/auth/layout.tsx
tag :            ["auth", "layout", "branding"]
projectId:       new-genesis
type:            layout
generic:         false

role:            Layout commun aux pages /auth/* (login, register, welcome).
                 Présente un panneau de marque à gauche (desktop) et la zone
                 de formulaire centrée à droite (tous formats). Affiche un
                 mini-logo en haut de la zone formulaire sur mobile (le panneau
                 gauche est masqué sous lg). Server Component pur.

flow:            Server Component → rend une grille min-h-svh lg:grid-cols-2
                 → aside branding (masqué < lg) + main formulaire qui monte
                 les enfants (page login/register/welcome).

ecosystem:       Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/app/auth/layout.tsx",
                   "@/app/auth/login/LoginForm.tsx",
                   "@/app/auth/login/page.tsx",
                   "@/app/auth/register/RegisterForm.tsx",
                   "@/app/auth/register/page.tsx",
                   "@/app/auth/welcome/page.tsx",
                   "@/components/auth/PasswordInput.tsx",
                   "@/components/auth/PasswordStrength.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/validations/auth.ts",
                 ]

relatedFiles:    ["@/app/auth/login/page.tsx",
                  "@/app/auth/register/page.tsx",
                  "@/app/auth/welcome/page.tsx"]

imports:         ["next/link", "lucide-react"]

exports:         ["default AuthLayout"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux une mise en page de marque cohérente pour l'authentification"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Panneau marque — desktop uniquement */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-chart-1 via-chart-2 to-chart-5 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-white/10 blur-3xl"
        />

        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Sparkles className="size-5" aria-hidden />
          </span>
          Genesis
        </Link>

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            L&apos;atelier qui structure vos projets.
          </h2>
          <p className="text-white/80">
            Conception, planification, développement. De l&apos;idée au
            produit, toute l&apos;équipe alignée.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/70">© Genesis</p>
      </aside>

      {/* Zone formulaire */}
      <main className="flex flex-col items-center justify-center gap-6 bg-muted/30 p-6 sm:p-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold lg:hidden"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 text-white">
            <Sparkles className="size-4" aria-hidden />
          </span>
          Genesis
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}