/*
path:            app/pixel/lib/api/source-ids.ts
tag:             ["pixel", "api", "helper", "source-id"]
projectId:       <Pixel-fotgen>
type:            helper
generic:         true

role:            Lit le champ multipart "sourceIds" (une valeur par
                 fichier, meme ordre que "files") et renvoie un tableau
                 aligne sur les fichiers. Si le champ est absent ou si
                 le nombre de valeurs ne correspond pas au nombre de
                 fichiers, renvoie un tableau de undefined : le
                 contrat reste retrocompatible (sourceId optionnel
                 dans ResultImage).

flow:            form.getAll("sourceIds") -> filtre string -> controle
                 du nombre -> controle de longueur -> tableau aligne.

ecosystem:       ApiHelpers = [
                   "@/app/pixel/lib/api/source-ids.ts",
                 ]
relatedFiles:    ["@/app/pixel/types/image.ts"]
imports:         []
exports:         ["readSourceIds"]
useBy:           [
                   "app/api/images/convert/route.ts",
                   "app/api/images/optimize/route.ts",
                   "app/api/images/compress/route.ts",
                   "app/api/images/resize/route.ts",
                   "app/api/images/crop/route.ts",
                   "app/api/images/background/route.ts",
                   "app/api/images/retouch/route.ts",
                 ]

userStories:     ["*en tant que developpeur je veux relier chaque ResultImage a sa SourceImage sans matcher par nom de fichier"]
status:          wip
pathChecked:     true
metaDataChecked: true
scriptChecked:   true
*/

const MAX_SOURCE_ID_LENGTH = 100;

export function readSourceIds(
  form: FormData,
  fileCount: number,
): readonly (string | undefined)[] {
  const raw = form
    .getAll("sourceIds")
    .filter((v): v is string => typeof v === "string");

  if (raw.length !== fileCount) {
    return Array.from({ length: fileCount }, () => undefined);
  }

  return raw.map((v) =>
    v.length > 0 && v.length <= MAX_SOURCE_ID_LENGTH ? v : undefined,
  );
}