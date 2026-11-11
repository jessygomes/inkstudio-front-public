/* eslint-disable @typescript-eslint/no-explicit-any */
// Formatage partagé par le parcours de réservation (résumé, récapitulatif, confirmation).
import { parseSalonHours } from "@/lib/horaireHelper";
import {
  addMinutesToIsoInTimeZone,
  addMinutesToTime,
  getIsoTimePart,
  getTimeInTimeZone,
  getWeekdayKeyFromDate,
  resolveSlotDisplayMode,
  toHourLabel,
} from "@/lib/utils/date";
import { formatDurationMinutes } from "@/lib/booking-link";

export const PRESTATION_LABELS: Record<string, string> = {
  PROJET: "Rendez-vous projet",
  TATTOO: "Tatouage (flash)",
  RETOUCHE: "Retouche",
  PIERCING: "Piercing",
};

/** Heures de début/fin lisibles d'une sélection de créneaux de 30 min. */
export function getSelectedTimeRange(salon: any, selectedDate: string, selectedSlots: string[]) {
  if (!selectedSlots.length) return null;
  const sorted = [...selectedSlots].sort((a, b) => Date.parse(a) - Date.parse(b));
  const hours = parseSalonHours(salon?.salonHours);
  const opening = selectedDate && hours ? hours[getWeekdayKeyFromDate(selectedDate)] ?? null : null;
  const mode = resolveSlotDisplayMode(sorted, opening);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const start = mode === "timezone" ? getTimeInTimeZone(first) : getIsoTimePart(first);
  const end = mode === "timezone" ? addMinutesToIsoInTimeZone(last, 30) : addMinutesToTime(getIsoTimePart(last), 30);
  return { start: toHourLabel(start), end: toHourLabel(end) };
}

export { formatDurationMinutes };

/** Libellé de prix connu à ce stade, ou null. */
export function getPriceLabel({ prestation, projectIsFree, projectPrice, flashPrice, piercingPrice }: {
  prestation?: string;
  projectIsFree?: boolean;
  projectPrice?: number;
  flashPrice?: number | null;
  piercingPrice?: number | null;
}) {
  if (prestation === "PROJET") return projectIsFree ? "Gratuit" : `${projectPrice ?? 0} €`;
  if (prestation === "TATTOO" && typeof flashPrice === "number") return `${flashPrice} €`;
  if (prestation === "PIERCING" && typeof piercingPrice === "number") return `${piercingPrice} €`;
  return null;
}

/** « 0612345678 » → « 06 12 34 56 78 », « +33612345678 » → « +33 6 12 34 56 78 ». */
export function formatPhoneNumber(phone?: string | null): string {
  const raw = (phone || "").trim();
  if (!raw) return "";
  const compact = raw.replace(/[\s.\-()]/g, "");
  const pairs = (digits: string) => digits.replace(/(\d{2})(?=\d)/g, "$1 ");
  const french = /^\+33(\d)(\d{8})$/.exec(compact);
  if (french) return `+33 ${french[1]} ${pairs(french[2])}`;
  if (/^\d+$/.test(compact)) return pairs(compact);
  return raw;
}

/** Lien tel: sans espaces. */
export function phoneHref(phone?: string | null): string {
  return `tel:${(phone || "").replace(/[^\d+]/g, "")}`;
}
