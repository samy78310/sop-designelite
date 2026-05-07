# Design Elite — Base de connaissances SOP

Une application web interne de documentation (type Mintlify) pour l'équipe Design Elite. Construite avec Next.js 14, Tailwind CSS, Vercel Postgres, next-auth et Tiptap.

---

## Stack

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Style** : Tailwind CSS + shadcn/ui
- **Base de données** : Vercel Postgres
- **Auth** : next-auth v5 (admin) + cookie (lecteurs)
- **Éditeur** : Tiptap (riche, avec embed Claap, callouts, images)
- **Déploiement** : Vercel

---

## Démarrage local

### 1. Prérequis

- Node.js 18+
- npm ou pnpm
- Un projet Vercel avec une base de données Postgres activée

### 2. Installation

```bash
npm install
```

### 3. Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez les valeurs :

```bash
cp .env.example .env.local
```

```env
POSTGRES_URL=postgres://...          # URL de connexion Vercel Postgres
NEXTAUTH_SECRET=...                   # Générer avec : openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000    # URL de votre app
READER_PASSWORD=designelite2026       # Mot de passe partagé pour /docs
BLOB_READ_WRITE_TOKEN=...             # Token Vercel Blob (pour uploads images)
```

### 4. Initialiser la base de données

```bash
npm run dev
```

Puis visitez :
- `http://localhost:3000/api/db/setup` — crée les tables
- `http://localhost:3000/api/db/seed` — insère les données de démonstration

### 5. Premier accès admin

- URL : `http://localhost:3000/admin`
- Email : `admin@designelite.co`
- Mot de passe : `admin123`

> **⚠️ Changez le mot de passe immédiatement après la première connexion.**

---

## Déploiement Vercel en 3 étapes

### Étape 1 — Pushez sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-org/design-elite-sop.git
git push -u origin main
```

### Étape 2 — Créez le projet sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Importez votre repo GitHub
3. Dans **Storage**, ajoutez une base de données **Postgres** (Vercel Postgres)
4. Dans **Blob**, créez un store Blob pour les uploads d'images
5. Ajoutez les variables d'environnement :
   - `NEXTAUTH_SECRET` (générez avec `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (votre URL de production, ex: `https://sop.designelite.co`)
   - `READER_PASSWORD` (mot de passe partagé équipe)
   - `BLOB_READ_WRITE_TOKEN` (depuis le store Blob Vercel)

### Étape 3 — Initialisez la DB en production

Après déploiement, visitez :
```
https://votre-app.vercel.app/api/db/setup
https://votre-app.vercel.app/api/db/seed
```

Votre app est prête !

---

## Structure des routes

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Redirige vers `/docs` |
| `/docs` | Mot de passe lecteur | Redirige vers le premier article |
| `/docs/[categorie]/[article]` | Mot de passe lecteur | Article de documentation |
| `/reader-login` | Public | Page de saisie du mot de passe |
| `/admin` | Public | Login admin |
| `/admin/dashboard` | Admin | Tableau de bord |
| `/admin/articles` | Admin | Liste des articles |
| `/admin/articles/new` | Admin | Créer un article |
| `/admin/articles/[id]/edit` | Admin | Modifier un article |
| `/admin/categories` | Admin | Gérer les catégories |
| `/admin/users` | Admin | Gérer les admins |
| `/admin/settings` | Admin | Paramètres |

---

## Fonctionnalités clés

- **Sidebar Mintlify-style** : navigation par sections collapsibles, article actif mis en évidence en violet
- **Mode sombre/clair** : toggle avec persistance localStorage
- **Recherche CMD+K** : recherche full-text en temps réel, groupée par catégorie
- **Éditeur Tiptap** : gras, italique, H1-H3, listes, blockquotes, blocs de code, callouts info/warning, images, liens, **embed Claap**
- **Embed Claap** : insertion via URL Claap, rendu en iframe 16:9 responsive sans redirection
- **Votes "utile"** : boutons Oui/Non en bas de chaque article
- **Navigation précédent/suivant** : entre articles
- **Drag & drop** catégories (dnd-kit)
- **Auth deux niveaux** : cookie 30 jours pour lecteurs, JWT next-auth pour admins

---

## Ajouter un admin manuellement

Via l'API (depuis l'admin) ou directement en DB :

```sql
INSERT INTO admin_users (id, email, name, password_hash, must_change_password)
VALUES (
  gen_random_uuid(),
  'pm@designelite.co',
  'Nouveau PM',
  '$2b$12$...', -- bcrypt hash de votre mot de passe
  true
);
```

Ou utilisez la page `/admin/users` pour inviter un utilisateur via l'interface.
