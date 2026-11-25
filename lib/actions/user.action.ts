import { httpErrorMessage } from "@/lib/user-error";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! MODIFIER INFO DU SALON

//! ----------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUserInfoAction = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/userClient`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || httpErrorMessage(response.status);
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des infos du salon :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  Récupérer le profil complet du client
//! ----------------------------------------------------------------------------
export const getClientProfile = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/auth`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        httpErrorMessage(response.status);
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  Récupérer les salons favori du client
//! ----------------------------------------------------------------------------
export const getFavoriteSalon = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites`,
      {
        method: "GET",
        headers,
      },
    );
    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        httpErrorMessage(response.status);
      return { ok: false, error: true, status: response.status, message, data };
    }
    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des salons favoris :", error);
    throw error;
  }
};



//! ----------------------------------------------------------------------------
//!  METTRE EN FAVORI / RETIRER FAVORI SALON
//! ----------------------------------------------------------------------------
export const toggleFavoriteSalon = async (salonId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites/${salonId}`,
      {
        method: "PATCH",
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        httpErrorMessage(response.status);
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des favoris :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  VÉRIFIER SI UN SALON EST EN FAVORI
//! ----------------------------------------------------------------------------
export const isSalonFavorite = async (salonId: string) => {
  try {
    const headers = await getAuthHeaders();

    // Récupérer tous les favoris et vérifier si le salon y est
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      return { ok: false, isFavorite: false };
    }

    // Vérifier si le salonId est dans la liste des favoris
    const favoriteSalons = data.favoriteSalons || [];
    const isFavorite = favoriteSalons.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (salon: any) => salon.id === salonId,
    );

    return { ok: true, isFavorite };
  } catch (error) {
    console.error("Erreur lors de la vérification du favori :", error);
    return { ok: false, isFavorite: false };
  }
};

//! ----------------------------------------------------------------------------
//!  METTRE EN FAVORI / RETIRER FAVORI IMAGE DE PORTFOLIO
//! ----------------------------------------------------------------------------
export const toggleFavoritePortfolio = async (portfolioId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites/portfolio/${portfolioId}`,
      {
        method: "PATCH",
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        httpErrorMessage(response.status);
      return {
        ok: false,
        error: true,
        status: response.status,
        message,
        data,
      };
    }

    const normalizedMessage = String(data?.message || "").toLowerCase();
    const isFavorite = normalizedMessage.includes("ajout");

    return {
      ok: true,
      error: false,
      status: response.status,
      message: data?.message as string,
      isFavorite,
      data,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des favoris portfolio :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  METTRE EN FAVORI / RETIRER UN FLASH (le tatoueur est prévenu avec le pseudo du client)
//! ----------------------------------------------------------------------------
export const toggleFavoriteFlash = async (flashId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/work-favorites/flash/${encodeURIComponent(flashId)}`, { method: "PATCH", headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    return { ok: false, error: true, status: response.status, message: (data?.message as string) || httpErrorMessage(response.status), isFavorite: undefined as boolean | undefined };
  }
  return { ok: true, error: false, status: response.status, message: data?.message as string, isFavorite: data?.favorite === true };
};

//! Identifiants des flashs en favori du client (pour afficher les cœurs)
export const getFavoriteFlashIds = async (): Promise<string[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/work-favorites/flash/ids`, { headers, cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.flashIds) ? data.flashIds : [];
  } catch {
    return [];
  }
};

export type FavoriteFlash = {
  id: string; title: string; description?: string | null; imageUrl: string; price: number; dimension?: string | null;
  appointmentDurationMinutes?: number | null; isAvailable: boolean; style?: string[]; favoritedAt: string;
  user: { id: string; salonName?: string | null; firstName?: string | null; lastName?: string | null; nickname?: string | null; image?: string | null; profileImage?: string | null; city?: string | null; postalCode?: string | null; role?: string };
  tatoueur?: { id: string; name: string; img?: string | null } | null;
};

//! Flashs en favori du client
export const getFavoriteFlashes = async (): Promise<{ ok: boolean; flashes: FavoriteFlash[]; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/work-favorites/flash`, { headers, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.error) return { ok: false, flashes: [], message: data?.message || httpErrorMessage(response.status) };
    return { ok: true, flashes: Array.isArray(data?.favoriteFlashes) ? data.favoriteFlashes : [] };
  } catch {
    return { ok: false, flashes: [], message: "Impossible de charger vos flashs favoris." };
  }
};

//! ----------------------------------------------------------------------------
//!  RÉCUPÉRER LES IMAGES DE PORTFOLIO FAVORITES DU CLIENT
//! ----------------------------------------------------------------------------
export const getFavoritePortfolioImages = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites/portfolio`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        httpErrorMessage(response.status);
      return {
        ok: false,
        error: true,
        status: response.status,
        message,
        data,
      };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des images favorites du portfolio :",
      error,
    );
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  ENVOI D'UN MESSAGE DE CONTACT DEPUIS LE PROFIL PUBLIC
//! ----------------------------------------------------------------------------
type PublicProfileContactPayload = {
  firstName: string;
  lastName: string;
  bodyPart: string;
  projectDescription: string;
  email: string;
};

export const sendPublicProfileContact = async (
  userId: string,
  payload: PublicProfileContactPayload,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/${userId}/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || httpErrorMessage(response.status);
      return {
        ok: false,
        error: true,
        status: response.status,
        message,
        data,
      };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      message: data?.message || "Votre message a ete envoye avec succes.",
      data,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact public :", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Envoi impossible pour le moment.",
    };
  }
};
