/* eslint-disable @typescript-eslint/no-explicit-any */
// --- Helpers horaires (robustes)
type Opening = { start?: string; end?: string } | null;
type HoursMap = Record<string, Opening>;

/** Parse + normalise (supporte string JSON, objet, clés open/close ou start/end) */
export function parseSalonHours(raw: unknown): HoursMap | null {
  if (!raw) return null;

  let src: any = raw;
  if (typeof raw === "string") {
    try {
      src = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof src !== "object" || src === null) return null;

  const keyMap: Record<string, string> = {
    monday: "monday",
    tuesday: "tuesday",
    wednesday: "wednesday",
    thursday: "thursday",
    friday: "friday",
    saturday: "Saturday".toLowerCase(),
    sunday: "sunday",
    // On accepte déjà des clés FR si jamais :
    lundi: "monday",
    mardi: "tuesday",
    mercredi: "wednesday",
    jeudi: "thursday",
    vendredi: "friday",
    samedi: "saturday",
    dimanche: "sunday",
  };

  const normalizeEntry = (entry: any): Opening => {
    if (!entry) return null;
    const start = entry.start ?? entry.open ?? "";
    const end = entry.end ?? entry.close ?? "";
    if (!start || !end) return null;
    return { start, end };
  };

  const out: HoursMap = {};
  for (const [k, v] of Object.entries(src)) {
    const key = keyMap[k.toLowerCase()] || k.toLowerCase();
    out[key] = normalizeEntry(v);
  }
  return out;
}

export function hoursToLines(hours: HoursMap | null) {
  if (!hours) return [];
  const order = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];
  return order.map(({ key, label }) => {
    const v = hours[key];
    return v && v.start && v.end
      ? { day: label, value: `${v.start} – ${v.end}` }
      : { day: label, value: "Fermé" };
  });
}
