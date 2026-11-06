/*
path :           app/auth/login/page.tsx
projectId:       new-genesis
type:            page
generic:         false

role:            Page de connexion. Vérifie la session dans un composant enfant
                 asynchrone enveloppé, redirige vers /auth/welcome. Sinon, rend <LoginForm />.

flow:            Server Component sync → <Suspense fallback=<LoginSkeleton />> →
                 <SessionGate /> (async) → getSession() → redirect ou <LoginForm />.

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

relatedFiles:    ["@/app/auth/login/LoginForm.tsx",
                  "@/lib/auth/session.ts"]

imports:         ["next", "react", "next/navigation",
                  "@/lib/auth/session",
                  "@/app/auth/login/LoginForm",
                  "@/components/ui/skeleton"]

exports:         ["metadata", "default LoginPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux accéder à la page de connexion"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à Genesis.",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <SessionGate />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Vérification de session (async, isolée derrière Suspense)          */
/* ------------------------------------------------------------------ */

async function SessionGate() {
  const session = await getSession();
  if (session) redirect("/auth/welcome");

  return <LoginForm callbackUrl="/auth/welcome" />;
}

/* ------------------------------------------------------------------ */
/*  Skeleton de chargement                                             */
/* ------------------------------------------------------------------ */

function LoginSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-chart-1/5 sm:p-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="size-11 rounded-xl" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>

      <Skeleton className="mx-auto mt-8 h-4 w-48" />
    </div>
  );
}