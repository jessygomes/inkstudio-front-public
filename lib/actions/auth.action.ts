"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Type pour l'inscription client
type RegisterClientData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
};

/**
 * ! REGISTER CLIENT
 */
export async function registerAction(data: RegisterClientData) {
  try {
    const { email, password, firstName, lastName, birthDate } = data;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register_client`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate: birthDate || null,
        }),
      }
    );

    const responseData = await response.json();

    console.log("Response data from registerAction:", responseData);

    if (!response.ok || responseData.error) {
      throw new Error(
        responseData.message || "Échec de l'inscription. Veuillez réessayer."
      );
    }

    console.log("✅ Inscription client réussie :", responseData);
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription client :", error);
    throw error;
  }
}

/**
 * Server Action pour gérer la déconnexion et le nettoyage des cookies
 * Ne peut être appelée que depuis des composants client ou des formulaires
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    // Supprimer les cookies de session
    cookieStore.delete("inkera_access_token");
    cookieStore.delete("inkera_userId");

    console.log("🧹 Cookies de session supprimés via server action");

    // Rediriger vers la page de connexion
    redirect("/connexion?reason=token_expired");
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion:", error);
    throw error;
  }
}

/**
 * Server Action pour vérifier si un token est valide
 * Utilisée par le middleware pour éviter les appels API répétés
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/user/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token:", error);
    return false;
  }
}

/**
 * Server Action pour nettoyer les cookies expirés
 * Utilisée quand on détecte un token invalide/expiré
 */
export async function clearExpiredSession() {
  try {
    const cookieStore = await cookies();

    // Supprimer les cookies de session
    cookieStore.delete("inkera_access_token");
    cookieStore.delete("inkera_userId");

    console.log("🧹 Cookies expirés supprimés");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des cookies expirés:", error);
  }
}
