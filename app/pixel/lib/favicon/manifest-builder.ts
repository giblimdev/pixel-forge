/*
path:            app/pixel/lib/favicon/manifest-builder.ts
tag:             ["pixel", "favicon", "manifest", "builder"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Generation du fichier manifest.webmanifest (PWA) a
                 partir des options utilisateur (nom, short_name,
                 theme_color, background_color). Retourne un objet
                 serialisable JSON.

                 Aucune dependance runtime.

flow:            buildManifest(options) -> objet { name, short_name,
                 icons[], theme_color, background_color, display,
                 start_url }.

ecosystem:       Favicon = [
                   "@/app/pixel/lib/favicon/ico-builder.ts",
                   "@/app/pixel/lib/favicon/manifest-builder.ts",
                 ]
relatedFiles:    ["@/app/pixel/features/favicon-generator/types/favicon.types.ts"]
imports:         ["@/app/pixel/features/favicon-generator/types/favicon.types"]
exports:         ["buildManifest"]
useBy:           ["@/app/api/images/favicon/route.ts"]

userStories:     ["*en tant que developpeur je veux generer un manifest PWA"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

import type { ManifestOptions } from "@/app/pixel/features/favicon-generator/types/favicon.types";

export interface WebManifest {
  readonly name: string;
  readonly short_name: string;
  readonly icons: readonly {
    readonly src: string;
    readonly sizes: string;
    readonly type: string;
    readonly purpose?: string;
  }[];
  readonly theme_color: string;
  readonly background_color: string;
  readonly display: string;
  readonly start_url: string;
}

export function buildManifest(options: ManifestOptions): WebManifest {
  return {
    name: options.appName,
    short_name: options.shortName,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: options.themeColor,
    background_color: options.backgroundColor,
    display: "standalone",
    start_url: "/",
  };
}