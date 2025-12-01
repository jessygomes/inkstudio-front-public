"use server";

export async function getPiercingPrice({ salonId }: { salonId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/configuration/${salonId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log("Piercing zones result:", result);
    // Vérifier si le résultat est valide
    if (Array.isArray(result)) {
      return { ok: true, data: result };
    } else if (result && typeof result === "object" && !result.error) {
      return { ok: true, data: result };
    } else {
      console.error("Invalid result format:", result);
      return {
        ok: false,
        message: result.message || "Format de données invalide",
      };
    }
  } catch (error) {
    return {
      ok: false,
      message: `Erreur réseau: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`,
    };
  }
}
