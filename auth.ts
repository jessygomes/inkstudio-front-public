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
    async jwt({ token, user, trigger, session }) {
      // Lors de la connexion initiale, ajouter les données utilisateur au token
      if (user) {
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
        console.log("🔄 [JWT Callback] Mise à jour du token JWT via trigger");
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
