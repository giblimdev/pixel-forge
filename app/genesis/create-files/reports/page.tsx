/*
path :           app/genesis/create-files/reports/page.tsx
tag :            ["genesis", "create-files", "reports", "page"]
projectId:       new-genesis
type:            page
generic:         false

role:            Page de l'historique des rapports d'écriture. Rend le
                 composant ReportsList qui charge les 10 derniers
                 rapports, permet de voir le détail, supprimer un rapport
                 ou tout vider. Sync page, pas de Suspense nécessaire
                 (ReportsList gère son propre chargement via Server
                 Action au mount).

flow:            Sync page → wrapper max-w-4xl → <ReportsList />.

ecosystem:       CreateFiles = [
                   "@/app/genesis/create-files/reports/page.tsx",
                   "@/app/genesis/components/ReportsList.tsx",
                 ]

relatedFiles:    ["@/app/genesis/components/ReportsList.tsx"]

imports:         ["@/app/genesis/components/ReportsList"]

exports:         ["default ReportsPage"]

useBy:           []

userStories:     ["*en tant qu'utilisateur je veux consulter l'historique des rapports"]

status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

import { ReportsList } from "@/app/genesis/components/ReportsList";

export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <ReportsList />
    </div>
  );
}