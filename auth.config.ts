import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userLoginSchema } from "./lib/zod/validator-schema";

/**
 * Configuration NextAuth pour l'authentification
 * Utilise un provider Credentials pour se connecter au backend existant
 */
export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Validation des credentials avec Zod
        const validatedFields = userLoginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!validatedFields.success) {
          console.error(
            "❌ Validation des credentials échouée:",
            validatedFields.error
          );
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          // Appel à votre API backend existante
          const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;

          const response = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            console.error(
              "❌ Échec de l'authentification - Status:",
              response.status
            );
            const errorText = await response.text();
            console.error("❌ Message d'erreur:", errorText);
            return null;
          }

          const data = await response.json();

          console.log(
            "🔍 [AUTH] Données reçues du backend:",
            JSON.stringify(data, null, 2)
          );

          // Vérifier si le backend retourne une erreur
          if (data.error) {
            console.error("❌ Erreur d'authentification:", data.message);
            return null;
          }

          if (!data.access_token || !data.id) {
            console.error("❌ Token ou id manquant dans la réponse");
            console.error("Données reçues:", data);
            return null;
          }

          // Pour les clients, extraire les données du clientProfile
          if (data.role === "client") {
            if (!data.clientProfile) {
              console.error("❌ clientProfile manquant pour le client");
              console.error(
                "Structure complète des données:",
                JSON.stringify(data, null, 2)
              );
              return null;
            }

            const userObject = {
              id: String(data.id),
              email: data.email || email,
              name:
                data.clientProfile.pseudo ||
                `${data.firstName} ${data.lastName}`.trim() ||
                "",
              pseudo: data.clientProfile.pseudo || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              phone: data.phone || "",
              image: data.image || null,
              role: data.role,
              accessToken: data.access_token,
              clientProfile: data.clientProfile,
            };

            console.log("✅ Client authentifié:", userObject.email);
            return userObject;
          }

          // Si pas de clientProfile, erreur
          console.error("❌ Role non reconnu:", data.role);
          console.error("Données complètes:", JSON.stringify(data, null, 2));
          return null;
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
