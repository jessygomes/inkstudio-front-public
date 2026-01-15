"use server";
import { auth } from "@/auth";
import { getAuthenticatedUserSchema } from "./zod/validator-schema";

/**
 * Récupère l'utilisateur authentifié avec toutes ses données
 * Utilise directement les données de la session NextAuth (déjà validées lors du login)
 * Lance une erreur si l'utilisateur n'est pas authentifié
 */
export const getAuthenticatedUser = async () => {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error(
      "Aucun token d'accès trouvé. L'utilisateur n'est pas authentifié."
    );
  }

  const accessToken = session.accessToken;

  if (!accessToken) {
    throw new Error("Token d'accès non trouvé dans la session.");
  }

  // ✅ Les données utilisateur sont déjà disponibles dans la session
  // Plus besoin d'appel API supplémentaire car le backend retourne tout lors du login
  const userData = {
    id: session.user.id,
    role: session.user.role as "client",
    email: session.user.email,
    firstName: null, // Non retourné par le backend pour l'instant
    lastName: null, // Non retourné par le backend pour l'instant
    phone: session.user.phone || null,
    image: session.user.image || null,
    accessToken: accessToken,
    // clientProfile: session.user.clientProfile || null,
  };

  // Valider les données avec le schéma Zod
  return getAuthenticatedUserSchema.parse(userData);
};

/**
 * Alias simple pour récupérer l'utilisateur (retourne null si non connecté)
 * Utile pour les pages qui doivent vérifier l'authentification sans lever d'erreur
 */
export const currentUser = async () => {
  const session = await auth();
  return session?.user ?? null;
};
