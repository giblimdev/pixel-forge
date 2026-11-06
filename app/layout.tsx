/*
path :           app/layout.tsx
tag :            ["layout", "root", "fonts", "theme", "providers", "notification-slot", "platform-role", "suspense", "io", "pixel-forge", "plus-jakarta", "jetbrains-mono"]
projectId:       new-genesis
type :           layout
generic:         false

role:            Layout racine : html/body, polices, ThemeProvider,
                 TooltipProvider, Toaster, Header, Footer.

                 ⚠️ CHARTE PIXELFORGE APPLIQUÉE :
                 - Police principale : Plus Jakarta Sans (remplace Inter).
                   Variable CSS --font-plus-jakarta.
                 - Police technique : JetBrains Mono (conservée).
                   Variable CSS --font-jetbrains-mono.
                 - Thème SOMBRE par défaut (charte "Dark Creative
                   Studio"). `defaultTheme="dark"` + `enableSystem=false`
                   pour forcer le sombre. L'utilisateur peut basculer
                   en clair via le toggle (thème `.light` défini dans
                   globals.css).
                 - Métadonnées alignées sur PixelForge :
                   title.default "PixelForge", title.template
                   "%s · PixelForge", applicationName "PixelForge",
                   description = "Precision meets creativity…".
                 - lang="fr", className du <html> inclut les
                   variables de police + `dark` forcé.

                 La lecture de la session reste ISOLÉE dans
                 <HeaderWithRole> (Suspense + io() + getSession +
                 Prisma), exactement comme avant — aucune régression
                 sur le pattern Cache Components / Prisma 7.

flow:            RootLayout (sync) → html.dark → body → ThemeProvider
                 (dark) → TooltipProvider → <Suspense><HeaderWithRole />
                 </Suspense> → <main>{children}</main> → Footer →
                 Toaster.

ecosystem:       Layout = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/components/layout/footer/Footer.tsx",
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
                   "@/components/ui/sonner.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/app/blog/components/NotificationBell.tsx",
                   "@/config/navigation.ts",
                   "@/config/roles.ts",
                 ]

relatedFiles:    ["@/app/globals.css",
                  "@/components/layout/footer/Footer.tsx",
                  "@/components/layout/header/Header.tsx",
                  "@/lib/auth/session.ts",
                  "@/lib/prisma.ts",
                  "@/config/roles.ts"]

imports:         ["next", "next/font/google", "next-themes", "react",
                  "next/cache",
                  "./globals.css",
                  "@/components/ui/tooltip",
                  "@/components/ui/sonner",
                  "@/components/layout/header/Header",
                  "@/components/layout/footer/Footer",
                  "@/app/blog/components/NotificationBell",
                  "@/lib/auth/session",
                  "@/lib/prisma",
                  "@/config/roles"]

exports:         ["metadata", "default RootLayout"]

useBy:           []

userStories:     ["*en tant que développeur je veux un layout racine dark par défaut avec les polices PixelForge",
                  "*en tant qu'utilisateur je veux une identité visuelle sombre et premium"]

status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { io } from "next/cache";

import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isPlatformRole, type PlatformRole } from "@/config/roles";

/* ------------------------------------------------------------------ */
/*  Polices                                                            */
/* ------------------------------------------------------------------ */

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/*  Métadonnées                                                        */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: {
    default: "PixelForge — Precision meets creativity",
    template: "%s · PixelForge",
  },
  description:
    "Une suite professionnelle pour convertir, optimiser et transformer vos images — en local, gratuit, open-source.",
  applicationName: "PixelForge",
};

/* ------------------------------------------------------------------ */
/*  Fallbacks                                                          */
/* ------------------------------------------------------------------ */

function BellFallback() {
  return <div className="size-9" aria-hidden />;
}

function HeaderFallback() {
  return <Header platformRole={null} />;
}

/* ------------------------------------------------------------------ */
/*  Lecture du rôle plateforme Prisma (isolée)                         */
/* ------------------------------------------------------------------ */

async function UserRoleReader({ userId }: { readonly userId: string }) {
  await io();

  const rawRole = (
    await prisma.user.findUnique({
      where: { id: userId },
      select: { platformRole: true },
    })
  )?.platformRole;

  const platformRole: PlatformRole = isPlatformRole(rawRole) ? rawRole : "user";

  return (
    <Header
      platformRole={platformRole}
      notificationSlot={<Suspense fallback={<BellFallback />}></Suspense>}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Header avec rôle plateforme (async, sous Suspense)                 */
/* ------------------------------------------------------------------ */

async function HeaderWithRole() {
  await io();

  const session = await getSession();

  if (!session?.user) {
    return <Header platformRole={null} />;
  }

  return (
    <Suspense fallback={<Header platformRole={null} />}>
      <UserRoleReader userId={session.user.id} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense fallback={<HeaderFallback />}>
              <HeaderWithRole />
            </Suspense>{" "}
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}