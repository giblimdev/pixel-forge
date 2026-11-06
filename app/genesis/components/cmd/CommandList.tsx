/*
path :           app/genesis/components/cmd/CommandList.tsx
tag :            ["genesis", "cmd", "commands", "client", "copy", "syntax"]
projectId:       new-genesis
type:            component
generic:         false

role:            Liste de commandes CLI copiables (Client Component). Chaque
                 commande est rendue dans un <pre><code> coloré par un
                 tokenizer local qui distingue 4 rôles : commande (1er mot,
                 coloré avec l'accent de l'outil), flag (commence par "-",
                 chart-4), chaîne entre guillemets (chart-3) et argument
                 (foreground). Un bouton Copier (icône Copier → Check après
                 succès) écrit dans navigator.clipboard et déclenche un toast
                 sonner. Le composant est purement présentationnel : il ne
                 fait aucune mutation métier, il copie du texte. Aucune
                 dépendance à un store ni à une Server Action.

flow:            Reçoit { commands, accent } → pour chaque commande :
                 tokenize(code) → rend 1 <li> = titre + bouton copier +
                 <pre> avec tokens colorés + description optionnelle.
                 handleCopy → navigator.clipboard.writeText(code) →
                 toast.success + setCopied(true) → setTimeout 2s reset.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/context-files.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/read-files.ts",
                   "@/app/genesis/actions/write-files.ts",
                   "@/app/genesis/cmd/page.tsx",
                   "@/app/genesis/components/ContextFileEditor.tsx",
                   "@/app/genesis/components/ContextOutput.tsx",
                   "@/app/genesis/components/CopyToIaPanel.tsx",
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
                   "@/app/genesis/components/cmd/CommandList.tsx",
                   "@/app/genesis/components/cmd/DesignShowcase.tsx",
                   "@/app/genesis/components/cmd/StackCard.tsx",
                   "@/app/genesis/copy-to-ia/page.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/help/page.tsx",
                   "@/app/genesis/layout.tsx",
                   "@/app/genesis/lib/context-files.ts",
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

relatedFiles:    ["@/app/genesis/cmd/page.tsx",
                  "@/app/genesis/components/cmd/StackCard.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/sonner.tsx"]

imports:         ["react", "lucide-react", "sonner",
                  "@/components/ui/button"]

exports:         ["CommandList", "CommandListProps", "Command"]

useBy:           ["@/app/genesis/cmd/page.tsx"]

userStories:     ["*en tant que développeur je veux copier une commande CLI en un clic"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

"use client";
// "use client" justifié : useState (copied) + navigator.clipboard + toast.

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Command {
  readonly label: string;
  readonly code: string;
  readonly description?: string;
}

export interface CommandListProps {
  readonly commands: readonly Command[];
  /** Couleur d'accent de l'outil (ex. "chart-1"). */
  readonly accent: string;
}

type TokenKind = "command" | "flag" | "string" | "arg";

interface Token {
  readonly raw: string;
  readonly kind: TokenKind;
}

/* ------------------------------------------------------------------ */
/*  Tokenizer — coloration syntaxique légère                          */
/* ------------------------------------------------------------------ */

/**
 * Découpe une commande shell en tokens colorables :
 * - commande (1er mot)        → accent de l'outil
 * - flag (commence par -)     → chart-4
 * - chaîne ("..." ou '...')   → chart-3
 * - argument (le reste)       → foreground/90
 *
 * Ne gère PAS les échappements (`\"`) : les commandes du projet n'en
 * utilisent pas.
 */
function tokenize(command: string): readonly Token[] {
  const regex = /("[^"]*"|'[^']*'|\S+)/g;
  const matches = command.match(regex) ?? [];
  return matches.map((raw, index) => {
    if (raw.startsWith('"') || raw.startsWith("'")) {
      return { raw, kind: "string" as const };
    }
    if (raw.startsWith("-")) {
      return { raw, kind: "flag" as const };
    }
    if (index === 0) {
      return { raw, kind: "command" as const };
    }
    return { raw, kind: "arg" as const };
  });
}

const TOKEN_CLASS: Record<TokenKind, string> = {
  command: "font-semibold",
  flag: "text-chart-4",
  string: "text-chart-3",
  arg: "text-foreground/90",
};

/* ------------------------------------------------------------------ */
/*  Composant liste                                                    */
/* ------------------------------------------------------------------ */

export function CommandList({ commands, accent }: CommandListProps) {
  return (
    <ul className="space-y-3">
      {commands.map((command) => (
        <CommandRow key={command.code} command={command} accent={accent} />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne de commande                                                  */
/* ------------------------------------------------------------------ */

function CommandRow({
  command,
  accent,
}: {
  readonly command: Command;
  readonly accent: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command.code);
      setCopied(true);
      toast.success(`Commande copiée : ${command.label}`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier la commande.");
    }
  }

  const tokens = tokenize(command.code);

  return (
    <li className="group rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {command.label}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          aria-label={`Copier la commande : ${command.label}`}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-chart-4" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>

      <pre className="overflow-x-auto rounded-md bg-background/60 p-2 font-mono text-xs leading-relaxed [scrollbar-width:thin]">
        <code>
          {tokens.map((token, i) => (
            <span key={`${token.raw}-${i}`}>
              {i > 0 ? " " : ""}
              <span
                className={TOKEN_CLASS[token.kind]}
                style={
                  token.kind === "command"
                    ? { color: `var(--${accent})` }
                    : undefined
                }
              >
                {token.raw}
              </span>
            </span>
          ))}
        </code>
      </pre>

      {command.description && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {command.description}
        </p>
      )}
    </li>
  );
}
