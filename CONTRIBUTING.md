# Contributing — Genesis

Ce document décrit les règles et conventions à respecter pour tout
script produit dans le projet (par un humain ou une IA).

---

## Règles de génération de scripts

Un script (contenu d'un fichier) est constitué d'une **en-tête** (entre `/* */`) et de son **code** (TypeScript, TSX, etc.).

### 1. Script en entier

Toujours (sauf demande explicite de l'utilisateur) fournir
**l'intégralité / complet / en entier** du script :
en-tête `/* */` + code. Aucun placeholder (`// ...`, `// TODO`, `//`).

### 2. Intégration des scripts à l’architecture existante

Avant toute génération ou modification d’un script, analyser l’architecture et les scripts existants pertinents afin d’identifier les composants, fonctions, types, actions, stores, validations et conventions à réutiliser ou à étendre.Tout nouveau script doit s'intégrer à l'architecture existante du projet.

Il ne doit pas être conçu comme un module autonome ou selon une architecture parallèle.

Avant de créer un nouveau script, vérifier lorsque pertinent les éléments existants pouvant être réutilisés, étendus ou complétés :

composants UI et composants métier ;
helpers et utilitaires ;
Server Actions ;
validations Zod ;
stores ;
types et modèles ;
constantes et configurations ;
conventions d'import/export ;
conventions de nommage et d'organisation des fichiers ;
ecosystem existants ;
flux de données et responsabilités des modules concernés ;
design system et composants UI existants.

Règle de priorité :

réutiliser l'existant lorsqu'il répond au besoin ;
étendre proprement l'existant lorsqu'une évolution est nécessaire ;
créer un nouveau script uniquement lorsque l'existant ne permet pas de répondre correctement au besoin.

pense abrancher les page d'entré dans les */"data"Nav.ts

### 3. En-tête obligatoire

───────────────────────────────────────────
GROUPE « Classification »
───────────────────────────────────────────

#### 1.path — requis
Chemin complet depuis la racine du projet.

#### 2.tag — requis
Tableau de valeurs permet de trier les fichiers. Le tag reflète le plus
souvent la ou les user stories concernées.

#### 3.projectId — requis
Ne pas laisser vide : écrire `projectId: <à fournir>` en attendant.

#### 4.type — requis
Nature du fichier. Valeurs possibles : `layout | page | component |
action | route | helper | store | config | page d'entrée`.

#### 5.generic — optionnel (booléen, défaut `false`)
`true` si le fichier est réutilisable au-delà de son module
(composant UI transverse, utilitaire, type partagé).

───────────────────────────────────────────
GROUPE « Helpdev » — métadonnées du code
───────────────────────────────────────────

#### 21.role — requis
Rôle fonctionnel ou applicatif du fichier.

#### 22.flow — requis
Flux de données / séquence d'exécution interne.

#### 23.ecosystem — requis
Nom du domaine métier (Epic-us) + tableau des fichiers qui le composent (tout les fichiers).
Format :
ecosystem: Auth = [
  "@/app/auth/login/page.tsx",
  "@/app/auth/register/page.tsx",
  "@/lib/auth/auth.ts",
]

Règles :
- Le tableau contient TOUS les fichiers du domaine (y compris le courant).
- Tous les fichiers du même domaine portent EXACTEMENT le même tableau.
- Le tableau est trié alphabétiquement.
- Le tableau est la source de vérité du domaine.

#### 24. relatedFiles — requis
Fichiers fonctionnellement liés — CHEMINS COMPLETS.

#### 25. imports — requis
Imports (libs npm, constantes, fonctions, props, paramètres reçus).

#### 26. exports — requis
Éléments exportés (fonctions, consts, types, props, paramètres transmis).

#### 27. useBy — requis
Fichiers qui importent ce script (relation inverse). Si aucun : `[]`.

───────────────────────────────────────────
GROUPE « Scrum » — suivi qualité
───────────────────────────────────────────

#### 31. userStories — requis
User stories rattachées. Format : liste de slugs, ou généré si aucune
(`*en tant que je veux pour`, signalé par `*` si généré).

#### 32. status — requis
`planned | wip | done | deprecated`.

#### 33. pathChecked
Le chemin du fichier a été vérifié. Défaut : `✘false` → `✔true`.

#### 34. metaDataChecked
Les métadonnées (imports / exports / role…) sont à jour. Défaut : `✘false`.

#### 35. scriptChecked
Le script a été relu / validé. Défaut : `✘false`.

#### Format de sortie
/*
path :           lib/epic/serialize-epics.ts
tag :            ["epic-aut", "serialize", "json", "export"] // A adapter
projectId:       <UltimateBlog>
type:            helper
generic:         true

role:            Sérialise une liste d'Epics (issues de la base) en JSON
                 compatible avec bulkImportEpicsSchema. Les champs JSON
                 (acceptanceCriteria, dodChecked, linkedFiles) sont reconvertis
                 en texte multiligne (acceptanceInput, dodInput, linkedFilesInput).
                 Ne lève jamais : les null deviennent des chaînes vides.

flow:            serializeEpicsToImportJson(epics) → map sur chaque epic →
                 parse des champs JSON → texte multiligne → JSON.stringify.

ecosystem:       Epic = [
                   "@/app/actions/epic/bulkImportEpics.ts",
                   "@/app/actions/epic/createEpic.ts",
                   "@/app/actions/epic/hardDeleteEpic.ts",
                   "@/app/actions/epic/reorderEpics.ts",
                   "@/app/actions/epic/restoreEpic.ts",
                   "@/app/actions/epic/softDeleteEpic.ts",
                   "@/app/actions/epic/updateEpic.ts",
                   "@/app/back-studio/scrum/[slug]/epics/[epicSlug]/edit/page.tsx",
                   "@/app/back-studio/scrum/[slug]/epics/[epicSlug]/page.tsx",
                   "@/app/back-studio/scrum/[slug]/epics/new/page.tsx",
                   "@/app/back-studio/scrum/[slug]/epics/page.tsx",
                   "@/app/back-studio/scrum/[slug]/epics/trash/page.tsx",
                   "@/components/epic/DeleteEpicButton.tsx",
                   "@/components/epic/EpicBoard.tsx",
                   "@/components/epic/EpicCard.tsx",
                   "@/components/epic/EpicForm.tsx",
                   "@/components/epic/EpicMiniCard.tsx",
                   "@/components/epic/EpicPriorityBadge.tsx",
                   "@/components/epic/EpicSelect.tsx",
                   "@/components/epic/EpicStatusBadge.tsx",
                   "@/components/epic/HardDeleteEpicButton.tsx",
                   "@/components/epic/RestoreEpicButton.tsx",
                   "@/lib/design/accents.ts",
                   "@/lib/json-templates/epic.ts",
                   "@/lib/epic/serialize-epics.ts",
                   "@/lib/validations/epic.ts",
                 ]
relatedFiles:    ["@/lib/user-story/json.ts",
                  "@/lib/validations/epic.ts",
                  "@/app/back-studio/scrum/[slug]/epics/page.tsx"]
imports:         ["@/lib/user-story/json"]
exports:         ["serializeEpicsToImportJson", "SerializableEpic"]
useBy:           ["@/app/back-studio/scrum/[slug]/epics/page.tsx"]

userStories:     ["*en tant que développeur je veux copier le JSON des epics existants"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

## 4. Chemins complets

Dans l'en-tête, tout fichier référencé (imports, useBy, relatedFiles)
doit être mentionné par son **CHEMIN COMPLET** depuis la racine du projet.

- ✔ `@/lib/auth/auth-client`
- ✘ `auth-client`

## 5. Props typées

Chaque composant exporte son type de props :

```ts
type LoginFormProps = { … }
export function LoginForm({ … }: LoginFormProps) { … }
```

## 6. Séparation des responsabilités

- Pas de logique métier dans les composants de présentation.
- Mutations → Server Actions dans `lib/actions/**`.
- Validation → Zod dans `lib/validations/**`.
- `"use client"` justifié par un commentaire si présent.
eviter les scripts  de plus de 900 lignes. dés que un sripte est long verifier si il y a moins de separer les responsabilité dans d'autres composant existant ou a creer

## 7. Design system

Utiliser au mieux les valeurs de `@theme` Tailwind. Créer des classes
spécifiques uniquement si nécessaire.

## 8. UI/UX, mobile first et responsive

L’UI et l’UX sont des critères de qualité obligatoires pour tout script
de type `page` ou `component`.

- Concevoir d’abord pour mobile, puis enrichir progressivement pour
  tablette et desktop (`mobile first`).
- Utiliser les breakpoints Tailwind de façon progressive (`sm:`, `md:`,
  `lg:`, `xl:`), sans casser l’expérience mobile.
- Les pages et composants doivent être responsives : largeurs fluides,
  grilles adaptatives, pas de scroll horizontal non voulu, zones
  tactiles et textes lisibles.
- Respecter les états UX : chargement, vide, erreur, succès, désactivé,
  focus, hover, active.
- Préserver l’accessibilité de base : contrastes, labels, navigation
  clavier, `aria-*` si nécessaire.
- Ne pas dupliquer la logique métier dans l’UI ; l’UI/UX reste au niveau
  présentation et interaction.