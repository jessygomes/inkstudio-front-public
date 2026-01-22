"use server";

import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------
//!  RECUPERER UN RDV PAR ID
//! ----------------------------------------------------------------------------
export const fetchAppointmentById = async (appointmentId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${appointmentId}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(
      `Erreur lors de la récupération du rendez-vous: ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data;
};

//! ----------------------------------------------------------------------------
//!  ANNULER UN RENDEZ-VOUS PAR LE CLIENT
//! ----------------------------------------------------------------------------
export const cancelAppointmentByClient = async (
  appointmentId: string,
  reason?: string,
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/client-cancel/${appointmentId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason }),
      },
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

//! ----------------------------------------------------------------------------
//!  MODIFIER UN RENDEZ-VOUS PAR LE CLIENT
//! ----------------------------------------------------------------------------
type ModifyAppointmentPayload = {
  userId: string;
  start?: string;
  end?: string;
  tatoueurId?: string;
};

export const modifyAppointmentByClient = async (
  appointmentId: string,
  payload: ModifyAppointmentPayload,
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/client-update/${appointmentId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message ||
        `Erreur lors de la modification du rendez-vous (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }
    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la modification du rendez-vous :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------
//!  CRÉER UN RENDEZ-VOUS PAR LE CLIENT
//! ----------------------------------------------------------------------------
type RdvBody = {
  title: string;
  prestation: string;
  start: string;
  end: string;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  clientPhone: string;
  clientBirthdate: string;
  tatoueurId: string;
  visio?: boolean;
  description?: string;
  zone?: string;
  size?: string;
  colorStyle?: string;
  reference?: string;
  sketch?: string;
  estimatedPrice?: number;
  price?: number;
  piercingZone?: string;
  piercingZoneOreille?: string | null;
  piercingZoneVisage?: string | null;
  piercingZoneBouche?: string | null;
  piercingZoneCorps?: string | null;
  piercingZoneMicrodermal?: string | null;
};

export const createAppointmentByClient = async (
  salonId: string,
  rdvBody: RdvBody,
) => {
  try {
    const headers = await getAuthHeaders();

    const backUrl = process.env.NEXT_PUBLIC_BACK_URL || "";

    const response = await fetch(`${backUrl}/appointments/by-client`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: salonId,
        rdvBody: rdvBody,
      }),
    });

    const json = await response.json();
    console.log("Réponse du backend:", json);

    if (!response.ok || (json && json.error)) {
      throw new Error(json?.message || "Échec de la création du rendez-vous");
    }

    return json;
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous :", error);
    throw error;
  }
};
