# 🎓 Percurus : Plateforme de Suivi de Formation et de Progression

Une application web moderne permettant à chaque utilisateur de **créer, gérer et suivre ses formations, parcours d’apprentissage ou projets personnels**.

Développée avec **Next.js 15**, **TypeScript**, **TailwindCSS**, **Shadcn/UI**, **PostgreSQL** et **Prisma**, la plateforme offre une expérience fluide et dynamique, tout en conservant une architecture claire côté serveur.

---

## 🚀 Fonctionnalités principales

- 👤 **Authentification sécurisée** via GitHub ou Google
- 🧭 **Création et gestion de parcours de formation** (titre, description, objectifs, tags, statut, etc.)
- 📚 **Suivi de modules** avec progression, échéances et historique d’activités
- 🏷️ **Gestion des tags** pour organiser et filtrer les parcours
- ⏰ **Rappels (Reminders)** liés aux modules ou parcours (à venir)
- 📊 **Calcul automatique de la progression** d’un parcours
- 💾 Persistance des données via **PostgreSQL + Prisma**
- 💬 **Feedback utilisateur via toasts (Sonner)** après les actions
- 🧱 Interface basée sur **Shadcn/UI** et **TailwindCSS**

---

## 🧩 Stack technique

| Technologie                 | Rôle                                    |
| --------------------------- | --------------------------------------- |
| **Next.js 15 (App Router)** | Framework web React full-stack          |
| **TypeScript**              | Typage statique et robustesse           |
| **TailwindCSS**             | Système de design rapide et moderne     |
| **Shadcn/UI**               | Composants UI accessibles et stylés     |
| **Prisma**                  | ORM pour PostgreSQL                     |
| **PostgreSQL**              | Base de données relationnelle           |
| **NextAuth.js**             | Authentification (Google, GitHub, etc.) |
| **Sonner**                  | Notifications Toast                     |

---

## ⚙️ Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/SimonMartinenq/percursus.git
cd <votre-projet>
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Créer le fichier `.env.local`

Ajoutez les variables d’environnement suivantes à la racine du projet :

```bash
AUTH_SECRET=""
NEXTAUTH_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
DATABASE_URL="postgresql://user:mdp@localhost:5432/database_name?schema=public"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

💡 **Remarques :**

- `DATABASE_URL` doit pointer vers votre base PostgreSQL locale ou distante.
- Les secrets GitHub/Google proviennent de vos **API credentials** créés sur leurs portails respectifs.
- `AUTH_SECRET` et `NEXTAUTH_SECRET` peuvent être générés avec :
  ```bash
  openssl rand -base64 32
  ```

---

### 4. Initialiser la base de données

```bash
npx prisma migrate dev
```

Cela crée les tables nécessaires à partir du schéma Prisma (`prisma/schema.prisma`).

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🔒 Authentification

Le projet utilise **NextAuth.js** avec :

- **GitHub OAuth**
- **Google OAuth**

Chaque utilisateur authentifié peut gérer **uniquement ses propres parcours et modules**.  
Les actions Prisma sont sécurisées via `requireUser()` dans `@/lib/auth-helper`.

---

## 🧪 Commandes utiles

| Commande                 | Description                         |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | Démarre le serveur de dev           |
| `npm run build`          | Build production                    |
| `npm run start`          | Lance le serveur en mode production |
| `npm run db:seed`        | Lance la seed de la database        |
| `npx prisma studio`      | Ouvre l’interface de gestion Prisma |
| `npx prisma migrate dev` | Applique les migrations locales     |

---

## 🖥️ Déploiement

Le projet est prêt à être déployé sur :

- [Vercel](https://vercel.com/)
- Ou tout autre hébergement compatible avec Next.js + PostgreSQL (ex. Railway, Render, Fly.io…)

Assurez-vous d’ajouter vos **variables d’environnement** dans la configuration de l’hébergement.

---

## 📜 Licence

Ce projet est sous licence MIT.  
Vous êtes libre de l’utiliser, le modifier et le distribuer, tant que la licence est conservée.
