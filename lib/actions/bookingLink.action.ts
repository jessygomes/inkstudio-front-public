"use server";

// Réservation par lien personnel. Le token ne doit jamais apparaître dans un log :
// les erreurs sont journalisées sans URL ni paramètre.

import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";
import {
  type ApiResult,
  type BookingLinkAvailability,
  type BookingLinkConfirmBody,
  type BookingLinkConfirmation,
  type BookingLinkPublicInfo,
  diffDateKeys,
  isDateKey,
} from "@/lib/booking-link";

const TOKEN_PATTERN = /^[A-Za-z0-9._~-]{16,512}$/;

function backendBase(): string | null {
  const base = process.env.NEXT_PUBLIC_BACK_URL?.trim();
  return base ? base.replace(/\/+$/, "") : null;
}

function linkPath(token: string): string {
  return `/appointments/booking-links/public/${encodeURIComponent(token)}`;
}

async function readError(response: Response): Promise<ApiResult<never>> {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // corps vide ou non JSON
  }
  const rawMessage = body.message;
  const messages = Array.isArray(rawMessage) ? rawMessage.filter((item): item is string => typeof item === "string") : undefined;
  const headerRetry = Number(response.headers.get("Retry-After"));
  const bodyRetry = Number(body.retryAfterSeconds);
  const retryAfterSeconds = Number.isFinite(bodyRetry) && bodyRetry > 0 ? bodyRetry : Number.isFinite(headerRetry) && headerRetry > 0 ? headerRetry : undefined;
  return {
    ok: false,
    status: response.status,
    code: typeof body.code === "string" ? body.code : undefined,
    message: typeof rawMessage === "string" ? rawMessage : undefined,
    messages,
    retryAfterSeconds,
  };
}

const invalidLink: ApiResult<never> = { ok: false, status: 404, code: "BOOKING_LINK_NOT_FOUND" };
const unconfigured: ApiResult<never> = { ok: false, status: 503 };

//! ----------------------------------------------------------------------------
//!  Informations publiques d'un lien (toujours sans cache)
//! ----------------------------------------------------------------------------
export async function getBookingLinkPublic(token: string): Promise<ApiResult<BookingLinkPublicInfo>> {
  if (!TOKEN_PATTERN.test(token)) return invalidLink;
  const base = backendBase();
  if (!base) return unconfigured;
  try {
    const response = await fetch(base + linkPath(token), { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return readError(response);
    return { ok: true, status: response.status, data: (await response.json()) as BookingLinkPublicInfo };
  } catch {
    console.error("[booking-link] lecture du lien impossible");
    return { ok: false, status: 0 };
  }
}

//! ----------------------------------------------------------------------------
//!  Disponibilités (7 dates civiles incluses au maximum)
//! ----------------------------------------------------------------------------
export async function getBookingLinkAvailability(token: string, from: string, to: string): Promise<ApiResult<BookingLinkAvailability>> {
  if (!TOKEN_PATTERN.test(token)) return invalidLink;
  if (!isDateKey(from) || !isDateKey(to) || diffDateKeys(from, to) < 0 || diffDateKeys(from, to) > 6) {
    return { ok: false, status: 400, code: "INVALID_AVAILABILITY_WINDOW" };
  }
  const base = backendBase();
  if (!base) return unconfigured;
  try {
    const query = new URLSearchParams({ from, to });
    const response = await fetch(`${base}${linkPath(token)}/availability?${query}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return readError(response);
    const data = (await response.json()) as BookingLinkAvailability;
    return { ok: true, status: response.status, data: { timeZone: data?.timeZone || "Europe/Paris", dates: Array.isArray(data?.dates) ? data.dates : [] } };
  } catch {
    console.error("[booking-link] lecture des disponibilités impossible");
    return { ok: false, status: 0 };
  }
}

//! ----------------------------------------------------------------------------
//!  Confirmation explicite (invité, ou JWT client si une session existe)
//! ----------------------------------------------------------------------------
export async function confirmBookingLink(token: string, body: BookingLinkConfirmBody): Promise<ApiResult<BookingLinkConfirmation>> {
  if (!TOKEN_PATTERN.test(token)) return invalidLink;
  const base = backendBase();
  if (!base) return unconfigured;

  // `start` doit rester un instant UTC explicite renvoyé par le backend.
  if (typeof body?.start !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(body.start) || !Number.isFinite(Date.parse(body.start))) {
    return { ok: false, status: 400, code: "INVALID_DATE" };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const session = await auth();
  if (session) {
    // Une session présente mais inutilisable ne doit jamais devenir une réservation invitée.
    if (!hasUsableSession(session)) return { ok: false, status: 401, code: "SESSION_EXPIRED" };
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  // Liste blanche : ni identifiant client, ni durée, ni type, ni fin.
  const source = body.rdvBody ?? ({} as BookingLinkConfirmBody["rdvBody"]);
  const rdvBody: BookingLinkConfirmBody["rdvBody"] = {
    clientFirstname: String(source.clientFirstname ?? "").trim(),
    clientLastname: String(source.clientLastname ?? "").trim(),
    clientEmail: String(source.clientEmail ?? "").trim(),
    skin: String(source.skin ?? ""),
  };
  const phone = typeof source.clientPhone === "string" ? source.clientPhone.trim() : "";
  if (phone) rdvBody.clientPhone = phone;
  if (isDateKey(source.clientBirthdate)) rdvBody.clientBirthdate = source.clientBirthdate;

  try {
    const response = await fetch(`${base}${linkPath(token)}/confirm`, {
      method: "POST",
      headers,
      body: JSON.stringify({ start: body.start, rdvBody }),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return readError(response);
    return { ok: true, status: response.status, data: (await response.json()) as BookingLinkConfirmation };
  } catch {
    // Aucune réponse : la réservation a pu être enregistrée.
    console.error("[booking-link] confirmation sans réponse");
    return { ok: false, status: 0 };
  }
}
