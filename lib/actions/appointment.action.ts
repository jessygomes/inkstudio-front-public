"use server";

import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------
//!  ANNULER UN RENDEZ-VOUS PAR LE CLIENT
//! ----------------------------------------------------------------------------
export const cancelAppointmentByClient = async (
  appointmentId: string,
  reason?: string
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/client-cancel/${appointmentId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason }),
      }
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        `Erreur lors de l'annulation du rendez-vous (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous :", error);
    throw error;
  }
};
