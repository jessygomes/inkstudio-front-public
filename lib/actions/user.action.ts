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
        data?.message || `Erreur lors de l'opération (${response.status})`;
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
        `Erreur lors de la récupération du profil (${response.status})`;
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
        `Erreur lors de la récupération des salons favoris (${response.status})`;
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
        `Erreur lors de la mise à jour des favoris (${response.status})`;
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
        `Erreur lors de la mise à jour des favoris image (${response.status})`;
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
        `Erreur lors de la récupération des images favorites (${response.status})`;
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
