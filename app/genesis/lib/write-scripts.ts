/*
path :           app/genesis/lib/write-scripts.ts
tag :            ["genesis", "write-scripts", "fs", "server-only", "security"]
projectId:       new-genesis
type:            helper
generic:         false

role:            Écriture séquentielle d'une liste de scripts. Pour chaque
                 script : garde-fou path traversal, vérification d'extension,
                 backup du fichier existant (avant écrasement), écriture
                 atomique. Un échec n'interrompt pas les suivants. Retourne
                 un rapport consolidé { created, overwritten, backedUp,
                 rejected }. Importable UNIQUEMENT côté serveur.

flow:            writeScripts(scripts) → timestamp unique pour le batch →
                 boucle for...of sur chaque script → assertUnderRoot →
                 ALLOWED_EXTENSIONS → si fichier existe : readProjectFile +
                 writeBackupFile → writeProjectFile → push dans la bonne
                 catégorie du rapport → retour.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/components/CreateFilesPanel.tsx",
                   "@/app/genesis/components/ExclusionsDialog.tsx",
                   "@/app/genesis/components/FileTree.tsx",
                   "@/app/genesis/components/FileTreeRow.tsx",
                   "@/app/genesis/components/GenesisNav.tsx",
                   "@/app/genesis/components/ReadFilesPanel.tsx",
                   "@/app/genesis/components/ResultDialog.tsx",
                   "@/app/genesis/components/ScriptInput.tsx",
                   "@/app/genesis/components/ScriptQueue.tsx",
                   "@/app/genesis/components/ScriptQueueItem.tsx",
                   "@/app/genesis/components/WriteReport.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/parse-script.ts",
                   "@/app/genesis/lib/storage.ts",
                   "@/app/genesis/lib/tree.ts",
                   "@/app/genesis/lib/types.ts",
                   "@/app/genesis/lib/validations.ts",
                   "@/app/genesis/lib/write-scripts.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]

relatedFiles:    ["@/app/genesis/lib/storage.ts",
                  "@/app/genesis/lib/parse-script.ts",
                  "@/app/genesis/lib/types.ts"]

imports:         ["server-only",
                  "@/app/genesis/lib/types",
                  "@/app/genesis/lib/parse-script",
                  "@/app/genesis/lib/storage"]

exports:         ["writeScripts"]

useBy:           ["@/app/genesis/actions/write-files.ts"]

userStories:     ["*en tant que développeur je veux écrire des scripts séquentiellement avec backup"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import "server-only";

import type { ScriptEntry, WriteReport } from "@/app/genesis/lib/types";
import { ALLOWED_EXTENSIONS } from "@/app/genesis/lib/parse-script";
import {
  assertUnderRoot,
  fileExists,
  readProjectFile,
  writeBackupFile,
  writeProjectFile,
} from "@/app/genesis/lib/storage";

/**
 * Écrit séquentiellement les scripts fournis. Timestamp unique pour le
 * batch : tous les fichiers de cette session de sauvegarde partagent le
 * même dossier dans data/genesis-backups/{timestamp}/.
 *
 * Règles :
 * - chaque script est traité indépendamment (un échec n'interrompt pas les suivants)
 * - backup AVANT écrasement (fichier existant et non-binaire uniquement)
 * - backup échoué → rejet, pas d'écrasement (pas de perte de données)
 * - écriture atomique via storage.writeProjectFile (tmp + rename)
 */
export async function writeScripts(
  scripts: readonly Pick<ScriptEntry, "path" | "content">[],
): Promise<WriteReport> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const created: string[] = [];
  const overwritten: string[] = [];
  const backedUp: string[] = [];
  const rejected: { path: string; reason: string }[] = [];

  for (const script of scripts) {
    try {
      // 1. Garde-fou path traversal + fichiers critiques (fait dans storage).
      assertUnderRoot(script.path);

      // 2. Vérification d'extension (même règle que côté client).
      const ext = script.path.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        rejected.push({
          path: script.path,
          reason: `Extension non autorisée : .${ext || "(aucune)"}`,
        });
        continue;
      }

      // 3. Backup si le fichier existe déjà.
      const existed = await fileExists(script.path);
      if (existed) {
        try {
          const current = await readProjectFile(script.path);
          if (!current.isBinary) {
            await writeBackupFile(timestamp, script.path, current.content);
            backedUp.push(script.path);
          }
          // Fichier binaire existant : on écrase quand même (le contenu
          // d'origine n'est pas restituable en texte, donc pas de backup
          // texte possible). On le signale dans le rapport via overwritten.
        } catch (err) {
          // Backup impossible → on refuse l'écrasement pour ne pas perdre
          // le fichier d'origine.
          rejected.push({
            path: script.path,
            reason: `Backup impossible : ${
              err instanceof Error ? err.message : "erreur inconnue"
            }`,
          });
          continue;
        }
      }

      // 4. Écriture atomique.
      await writeProjectFile(script.path, script.content);

      if (existed) {
        overwritten.push(script.path);
      } else {
        created.push(script.path);
      }
    } catch (error) {
      rejected.push({
        path: script.path,
        reason: error instanceof Error ? error.message : "Erreur inconnue.",
      });
    }
  }

  return { created, overwritten, backedUp, rejected };
}