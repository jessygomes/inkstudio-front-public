import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Extend la session pour inclure toutes les données client
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      phone: string;
      image?: string | null;
      role: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clientProfile?: any;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    image?: string | null;
    role: string;
    accessToken: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientProfile?: any;
  }
}

/**
 * Configuration principale de NextAuth
 * Gère l'authentification avec JWT et les callbacks
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/se-connecter",
    error: "/se-connecter",
  },
  callbacks: {
    /**
     * Callback JWT - Ajoute les données personnalisées au token JWT
     * Appelé quand le token est créé ou mis à jour
     */
    async jwt({ token, user, trigger, session, account, profile }) {
      // Connexion via Google -> on crée/valide l'utilisateur côté backend et on récupère le token métier
      if (account?.provider === "google") {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;

          if (!backendUrl) {
            throw new Error("NEXT_PUBLIC_BACK_URL n'est pas configuré");
          }

          const response = await fetch(`${backendUrl}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile?.email ?? user?.email,
              firstName:
                // @ts-expect-error: Google renvoie given_name/family_name dans profile
                profile?.given_name ?? profile?.name?.split(" ")?.[0] ?? "",
              lastName:
                // @ts-expect-error: Google renvoie given_name/family_name dans profile
                profile?.family_name ?? profile?.name?.split(" ")?.slice(1).join(" ") ?? "",
              avatar: profile?.picture ?? user?.image ?? null,
              googleId: account.providerAccountId,
              idToken: account.id_token,
              accessToken: account.access_token,
            }),
          });

          const data = await response.json();

          if (!response.ok || data?.error) {
            const message =
              data?.message || "Échec de l'authentification Google côté backend";
            throw new Error(message);
          }

          if (!data?.access_token || !data?.id) {
            throw new Error("Réponse backend incomplète pour Google");
          }

          token.accessToken = data.access_token;
          token.id = String(data.id);
          token.role = data.role ?? "client";
          token.email = data.email ?? profile?.email ?? user?.email ?? "";
          token.name =
            data.clientProfile?.pseudo ||
            `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
            profile?.name ||
            user?.name ||
            "";
          token.firstName =
            data.firstName ??
            // @ts-expect-error: Google renvoie given_name
            profile?.given_name ??
            "";
          token.lastName =
            data.lastName ??
            // @ts-expect-error: Google renvoie family_name
            profile?.family_name ??
            "";
          token.phone = data.phone ?? "";
          token.image = data.image ?? profile?.picture ?? user?.image ?? null;
          token.clientProfile = data.clientProfile;
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification Google:", error);
          throw error;
        }
      }

      // Connexion classique via credentials
      if (user && (!account || account.provider === "credentials")) {
        token.accessToken = user.accessToken;
        token.id = user.id as string;
        token.role = user.role;
        token.email = user.email as string;
        token.name = user.name as string;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.image = user.image;
        token.clientProfile = user.clientProfile;
      }

      // Support pour la mise à jour de session
      if (trigger === "update" && session) {
        token = { ...token, ...session.user };
      }

      return token;
    },

    /**
     * Callback Session - Expose les données du token à la session client
     * Ces données seront disponibles via useSession()
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.image = token.image as string | null;
        session.user.clientProfile = token.clientProfile;
        session.accessToken = token.accessToken as string;
      } else {
        console.warn("⚠️  [Session Callback] Token non disponible");
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  cookies: {
    sessionToken: {
      name: "client_access_token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
