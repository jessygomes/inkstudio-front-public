"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! DONNER UN AVIS SUR UN SALON

//! ----------------------------------------------------------------------------
export type CreateReviewPayload = {
  salonId: string;
  appointmentId?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  photos?: string[];
};

export const createReview = async (payload: CreateReviewPayload) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la création de l'avis (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la création de l'avis :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! AFFICHER TOUS LES AVIS D'UN SALON

//! ----------------------------------------------------------------------------
export type GetSalonReviewsOptions = {
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
  filterRating?: number;
};

export const getSalonReviews = async (
  salonId: string,
  options: GetSalonReviewsOptions = {}
) => {
  try {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.filterRating)
      params.append("filterRating", options.filterRating.toString());

    const url = `${
      process.env.NEXT_PUBLIC_BACK_URL
    }/salon-review/salon/${salonId}${params.toString() ? `?${params}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json();

    console.log("getSalonReviews - Response data:", data);

    if (!response.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la récupération des avis (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis :", error);
    throw error;
  }
};

//! ---------------------------------------------------------------------------

//! AFFICHER TOUS LES AVIS D'UN CLIENT (PROFIL CLIENT)

//! ---------------------------------------------------------------------------
export type GetClientReviewsOptions = {
  page?: number;
  limit?: number;
  sortBy?: "recent" | "rating" | "oldest";
};

export const getClientReviews = async (
  options: GetClientReviewsOptions = {}
) => {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);

    const url = `${
      process.env.NEXT_PUBLIC_BACK_URL
    }/salon-review/client/my-reviews${params.toString() ? `?${params}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la récupération des avis (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis du client :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! MODIFIER LA VISIBILITÉ D'UN AVIS (SALON)

//! ----------------------------------------------------------------------------
export const updateReviewVisibility = async (
  reviewId: string,
  isVisible: boolean
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review/${reviewId}/visibility`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isVisible }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la mise à jour de la visibilité (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la visibilité :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN AVIS

//! ----------------------------------------------------------------------------
export const deleteReview = async (reviewId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review/client/${reviewId}`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      }
    );
    const data = await response.json();

    if (!response.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la suppression de l'avis (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }
    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis :", error);
    throw error;
  }
};
