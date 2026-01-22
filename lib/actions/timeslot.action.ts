"use server";

//! Fetch timeslots for a given date and tatoueur
export async function getTimeslots(date: string, tatoueurId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${date}&tatoueurId=${tatoueurId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération des créneaux",
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Erreur server action timeslots:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux",
    };
  }
}

//! Fetch timeslot for a given date and salon
export async function getTimeslotBySalon(date: string, salonId: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/salon/${salonId}?date=${date}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[getTimeslotBySalon] Error response:", errorText);
      return {
        ok: false,
        message: `Erreur lors de la récupération des créneaux (${res.status}): ${errorText}`,
      };
    }
    const data = await res.json();

    return { ok: true, data };
  } catch (error) {
    console.error("Erreur server action timeslots by salon:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux",
    };
  }
}

//! Fetch occupied slots for a given salon
export async function getOccupiedSlotsBySalon(date: string, salonId: string) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const url = `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/salon/${salonId}/range?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[getOccupiedSlotsBySalon] Error response:", errorText);
      return {
        ok: false,
        message: `Erreur lors de la récupération des créneaux occupés (${res.status}): ${errorText}`,
      };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Erreur server action occupied slots by salon:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux occupés",
    };
  }
}

//! Fetch occupied slots for a given date and tatoueur
export async function getOccupiedSlots(date: string, tatoueurId: string) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/appointments/tatoueur-range?tatoueurId=${tatoueurId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération des créneaux occupés",
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    console.error("Erreur server action occupied slots:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux occupés",
    };
  }
}

//! Fetch blocked slots for a given tatoueur
export async function getBlockedSlots(tatoueurId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${tatoueurId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération des créneaux bloqués",
      };
    }

    const data = await res.json();
    if (data.error) {
      return {
        ok: false,
        message:
          data.message || "Erreur lors de la récupération des créneaux bloqués",
      };
    }

    return { ok: true, data: data.blockedSlots || [] };
  } catch (error) {
    console.error("Erreur server action blocked slots:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux bloqués",
    };
  }
}

//! Fetch blocked slots for a given salon
export async function getBlockedSlotsBySalon(salonId: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/salon/${salonId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[getBlockedSlotsBySalon] Error response:", errorText);
      return {
        ok: false,
        message: `Erreur lors de la récupération des créneaux bloqués (${res.status}): ${errorText}`,
      };
    }

    const data = await res.json();
    if (data.error) {
      return {
        ok: false,
        message:
          data.message || "Erreur lors de la récupération des créneaux bloqués",
      };
    }

    return { ok: true, data: data.blockedSlots || [] };
  } catch (error) {
    console.error("Erreur server action blocked slots by salon:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des créneaux bloqués",
    };
  }
}
