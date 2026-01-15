# Guide de Migration vers Next-Auth

## ✅ Changements effectués

### 1. **Installation des dépendances**

```bash
npm install next-auth@beta bcryptjs
```

### 2. **Fichiers créés**

#### `auth.ts` (Configuration principale)

- Configure next-auth avec le provider Credentials
- Gère l'authentification via votre API backend
- Configure les callbacks JWT et session

#### `app/api/auth/[...nextauth]/route.ts`

- Endpoints API pour next-auth

#### `components/Auth/AuthProvider.tsx`

- SessionProvider pour wrapper l'application

#### `lib/auth-session.ts`

- Helpers pour accéder à la session dans les server actions

### 3. **Fichiers modifiés**

#### `components/Auth/Login.tsx`

- Utilise `signIn()` de next-auth au lieu des appels API directs
- Simplifié et sécurisé

#### `components/Auth/Register.tsx`

- Utilise `signIn()` automatiquement après inscription réussie

#### `components/Auth/LogoutBtn.tsx`

- Utilise `signOut()` de next-auth

#### `app/layout.tsx`

- Import de `AuthProvider` et `auth`
- SessionProvider wrappé autour de l'app
- Récupère la session avec `auth()`

#### `middleware.ts`

- Changé `export function` en `export async function`
- Import de `auth` (pour une utilisation future si nécessaire)

---

## 📋 Configuration supplémentaire nécessaire

### 1. **Fichier `.env.local`**

Assurez-vous d'avoir ces variables :

```
NEXT_PUBLIC_BACK_URL=https://votre-api.com
NEXTAUTH_URL=http://localhost:3000 # En dev
NEXTAUTH_SECRET=your-random-secret-key # Générer: openssl rand -base64 32
```

> ⚠️ En production :
>
> - `NEXTAUTH_URL` doit être votre domaine (ex: https://theinkera.com)
> - `NEXTAUTH_SECRET` doit être une clé sécurisée

### 2. **Générer NEXTAUTH_SECRET**

```bash
openssl rand -base64 32
```

Ou utiliser :

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🔧 Changements à effectuer manuellement

### 1. **Utiliser `getAccessToken()` dans les server actions**

Exemple pour faire des appels API authentifiés :

```typescript
// Dans une server action
import { getAccessToken } from "@/lib/auth-session";

export async function myServerAction() {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/api/endpoint`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}
```

### 2. **Adapter les composants client utilisant l'authentification**

Pour accéder à la session dans un composant client :

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Chargement...</div>;
  if (status === "unauthenticated") return <div>Non connecté</div>;

  return <div>Bienvenue {session?.user?.email}</div>;
}
```

### 3. **Protéger les pages (optionnel)**

Créer un middleware de protection :

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function protectedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/se-connecter");
  }

  return session;
}
```

---

## 🧪 Points à tester

- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion d'un utilisateur existant
- [ ] Auto-login après inscription
- [ ] Déconnexion et suppression de session
- [ ] Redirection après connexion
- [ ] Accès aux données utilisateur `session.user`
- [ ] Token d'accès disponible dans les server actions
- [ ] Expiration de session après 7 jours
- [ ] Middleware permettant les routes publiques
- [ ] Cookies sécurisés (httpOnly, secure, sameSite)

---

## 🔐 Sécurité

- ✅ Tokens stockés en httpOnly cookies (non accessibles en JS)
- ✅ CSRF protection native de next-auth
- ✅ Sessions JWT avec expiration de 7 jours
- ✅ Secure flag activé en production
- ✅ SameSite=lax par défaut

---

## 📚 Documentation utile

- [Next-Auth v5 Docs](https://authjs.dev/getting-started/installation)
- [Credentials Provider](https://authjs.dev/reference/core/providers#credentials)
- [Session & JWT](https://authjs.dev/concepts/session-strategies)
