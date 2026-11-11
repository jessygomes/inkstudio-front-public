// Types et fonctions pures partagés par la réservation par lien personnel et les champs Projet.
// Aucun token ne doit être journalisé ni envoyé à un outil d'analyse depuis ce module.

import { getDateKeyInTimeZone } from "@/lib/utils/date";

export const BOOKING_TIME_ZONE = "Europe/Paris";

export type BookingLinkMode = "FIXED_START" | "AUTOMATIC";
export type BookingLinkStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
export type BookingLinkPrestation = "TATTOO" | "RETOUCHE";

export type BookingLinkPublicInfo = {
  bookingUrl: string;
  publicSlug: string;
  status: BookingLinkStatus;
  prestation: BookingLinkPrestation;
  durationMinutes: number;
  mode: BookingLinkMode;
  fixedStartTime: string | null;
  timeZone: string;
  allowedFrom: string;
  allowedTo: string;
  expiresAt: string | null;
  requiresAuthentication: boolean;
  /** Non prévu par le contrat actuel : utilisé uniquement s'il est renvoyé. */
  allowSameDayBooking?: boolean;
  professional: { name: string; image: string | null; city: string | null; address: string | null; postalCode: string | null };
  artist: { name: string; image: string | null } | null;
};

export type BookingLinkSlot = { start: string; end: string };
export type BookingLinkAvailability = { timeZone: string; dates: { date: string; slots: BookingLinkSlot[] }[] };

export type BookingLinkConfirmBody = {
  start: string;
  rdvBody: {
    clientFirstname: string;
    clientLastname: string;
    clientEmail: string;
    clientPhone?: string;
    clientBirthdate?: string;
    skin: string;
  };
};

export type BookingLinkConfirmation = {
  error: false;
  appointment: { id: string; prestation: string; start: string; end: string; status: string };
  status: "USED";
};

/** Résultat normalisé d'un appel API. `status: 0` = aucune réponse reçue (issue inconnue). */
export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code?: string; message?: string; messages?: string[]; retryAfterSeconds?: number };

export const TERMINAL_LINK_CODES = ["BOOKING_LINK_NOT_FOUND", "BOOKING_LINK_USED", "BOOKING_LINK_EXPIRED", "BOOKING_LINK_REVOKED"] as const;
export type TerminalLinkCode = (typeof TERMINAL_LINK_CODES)[number];

export function isTerminalLinkCode(code?: string): code is TerminalLinkCode {
  return !!code && (TERMINAL_LINK_CODES as readonly string[]).includes(code);
}

/** Statut public non actif → code terminal équivalent. */
export function terminalCodeFromStatus(status?: string): TerminalLinkCode | null {
  if (status === "USED") return "BOOKING_LINK_USED";
  if (status === "EXPIRED") return "BOOKING_LINK_EXPIRED";
  if (status === "REVOKED") return "BOOKING_LINK_REVOKED";
  return null;
}

/** Code d'erreur à partir d'un statut HTTP quand le backend n'en fournit pas. */
export function terminalCodeFromHttp(status: number): TerminalLinkCode | null {
  if (status === 404) return "BOOKING_LINK_NOT_FOUND";
  return null;
}

export const SAME_DAY_BOOKING_MESSAGE = "Ce professionnel n’accepte pas les réservations le jour même";

export const PRESTATION_LABELS: Record<string, string> = { TATTOO: "Tatouage", RETOUCHE: "Retouche", PROJET: "Projet", PIERCING: "Piercing" };

/** 175 → « 2 h 55 », 240 → « 4 h », 45 → « 45 min ». */
export function formatDurationMinutes(total: number): string {
  if (!Number.isFinite(total) || total <= 0) return "";
  const hours = Math.floor(total / 60);
  const minutes = Math.round(total % 60);
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${String(minutes).padStart(2, "0")}` : `${hours} h`;
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value;
}

/** Ajoute des jours à une date civile YYYY-MM-DD, sans fuseau. */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function diffDateKeys(from: string, to: string): number {
  const toUtc = (key: string) => { const [y, m, d] = key.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((toUtc(to) - toUtc(from)) / 86400000);
}

/** Date civile du jour en Europe/Paris (jamais le fuseau du navigateur). */
export function getParisTodayKey(now: Date = new Date()): string {
  return getDateKeyInTimeZone(now, BOOKING_TIME_ZONE);
}

/** Date affichable d'une date civile (sans conversion de fuseau). */
export function formatDateKey(dateKey: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }): string {
  if (!isDateKey(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

/** Les dates Prisma `DATE` arrivent en ISO minuit UTC : on garde la partie YYYY-MM-DD telle quelle. */
export function dateOnlyPart(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 10) return null;
  const key = value.slice(0, 10);
  return isDateKey(key) ? key : null;
}

// ---------------------------------------------------------------------------
// Période souhaitée, budget et premier tatouage (RDV Projet)
// ---------------------------------------------------------------------------

export const DESIRED_TATTOO_PERIODS = ["ASAP", "EXACT_DATE", "DATE_RANGE", "FLEXIBLE", "UNDECIDED"] as const;
export type DesiredTattooPeriod = (typeof DESIRED_TATTOO_PERIODS)[number];

export const DESIRED_TATTOO_PERIOD_LABELS: Record<DesiredTattooPeriod, string> = {
  ASAP: "Dès que possible",
  EXACT_DATE: "À une date précise",
  DATE_RANGE: "Sur une période",
  FLEXIBLE: "Flexible",
  UNDECIDED: "Pas encore décidé",
};

export const PROJECT_BUDGET_RANGES = [
  { key: "lt200", label: "Moins de 200 €", min: null, max: 20000 },
  { key: "200-500", label: "200 – 500 €", min: 20000, max: 50000 },
  { key: "500-1000", label: "500 – 1 000 €", min: 50000, max: 100000 },
  { key: "1000-2000", label: "1 000 – 2 000 €", min: 100000, max: 200000 },
  { key: "gt2000", label: "Plus de 2 000 €", min: 200000, max: null },
] as const satisfies readonly { key: string; label: string; min: number | null; max: number | null }[];
export type ProjectBudgetKey = (typeof PROJECT_BUDGET_RANGES)[number]["key"];

const euros = (cents: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100) + " €";

/** Libellé de la tranche Studio/People, ou formulation libre si le budget ne correspond à aucune tranche. */
export function formatProjectBudget(minCents: unknown, maxCents: unknown): string | null {
  const min = typeof minCents === "number" && Number.isFinite(minCents) ? minCents : null;
  const max = typeof maxCents === "number" && Number.isFinite(maxCents) ? maxCents : null;
  if (min === null && max === null) return null;
  const range = PROJECT_BUDGET_RANGES.find(item => item.min === min && item.max === max);
  if (range) return range.label;
  if (min !== null && max !== null) return `${euros(min)} – ${euros(max)}`;
  if (min !== null) return `À partir de ${euros(min)}`;
  return `Jusqu’à ${euros(max as number)}`;
}

export type ProjectClientInfo = {
  desiredTattooPeriod?: string | null;
  desiredTattooDate?: string | null;
  desiredTattooStartDate?: string | null;
  desiredTattooEndDate?: string | null;
  projectBudgetMinCents?: number | null;
  projectBudgetMaxCents?: number | null;
  isFirstTattoo?: boolean | null;
};

/** Texte lisible de la période souhaitée, ou null si elle n'est pas renseignée. */
export function formatDesiredTattooPeriod(info: ProjectClientInfo): string | null {
  const period = info.desiredTattooPeriod as DesiredTattooPeriod | null | undefined;
  if (!period || !(period in DESIRED_TATTOO_PERIOD_LABELS)) return null;
  const short = { day: "numeric", month: "long", year: "numeric" } as const;
  if (period === "EXACT_DATE") {
    const date = dateOnlyPart(info.desiredTattooDate);
    return date ? `Le ${formatDateKey(date, short)}` : DESIRED_TATTOO_PERIOD_LABELS.EXACT_DATE;
  }
  if (period === "DATE_RANGE") {
    const start = dateOnlyPart(info.desiredTattooStartDate);
    const end = dateOnlyPart(info.desiredTattooEndDate);
    return start && end ? `Du ${formatDateKey(start, short)} au ${formatDateKey(end, short)}` : DESIRED_TATTOO_PERIOD_LABELS.DATE_RANGE;
  }
  return DESIRED_TATTOO_PERIOD_LABELS[period];
}

export function formatIsFirstTattoo(value: unknown): string | null {
  if (value === true) return "Oui";
  if (value === false) return "Non";
  return null;
}

// ---------------------------------------------------------------------------
// Pratiques de tatouage (profils publics)
// ---------------------------------------------------------------------------

export const TATTOO_PRACTICE_LABELS: Record<string, string> = {
  MACHINE: "Machine",
  HANDPOKE: "Handpoke",
  TRADITIONAL: "Technique traditionnelle",
  OTHER: "Autre",
};

export function getTattooPracticeLabels(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && value in TATTOO_PRACTICE_LABELS))).map(value => TATTOO_PRACTICE_LABELS[value]);
}

export function getTattooPracticeDetails(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// ---------------------------------------------------------------------------
// Retour après connexion (stocké hors URL pour ne pas exposer de token)
// ---------------------------------------------------------------------------

const AUTH_RETURN_KEY = "inkera_auth_return_path";

export function isSafeReturnPath(value: unknown): value is string {
  return typeof value === "string" && value.length < 1024 && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

export function setAuthReturnPath(path: string) {
  try { if (isSafeReturnPath(path)) window.sessionStorage.setItem(AUTH_RETURN_KEY, path); } catch { /* stockage indisponible */ }
}

export function peekAuthReturnPath(): string | null {
  try { const value = window.sessionStorage.getItem(AUTH_RETURN_KEY); return isSafeReturnPath(value) ? value : null; } catch { return null; }
}

export function clearAuthReturnPath() {
  try { window.sessionStorage.removeItem(AUTH_RETURN_KEY); } catch { /* stockage indisponible */ }
}
