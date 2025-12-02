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
      }
    );

    const data = await response.json();

    console.log("Response data from updateUserInfoAction:", data);

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
      }
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
//!  Récupérer tous les RDV d'un client avec pagination et filtres
//! ----------------------------------------------------------------------------
export const getAllRdvClient = async (options?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const headers = await getAuthHeaders();

    // Construction des paramètres de requête
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_BACK_URL}/users/rdv-client${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        `Erreur lors de la récupération des rdv (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des rdv :", error);
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
      }
    );

    const data = await response.json();

    console.log("Response data from toggleFavoriteSalon:", data);

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
