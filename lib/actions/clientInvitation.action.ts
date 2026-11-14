"use server";

// Invitation d'un salon à rejoindre Inkera et à relier son compte à sa fiche client.
// Le token ne doit jamais apparaître dans un log.

import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";
import type { ApiResult } from "@/lib/booking-link";

export type ClientInvitationStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "ACCEPTED";

export type ClientInvitationInfo = {
  status: ClientInvitationStatus;
  salonName: string;
  salonImage: string | null;
  expiresAt: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
};

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,200}$/;
const notFound: ApiResult<never> = { ok: false, status: 404, code: "INVITATION_NOT_FOUND" };

function backendBase(): string | null {
  const base = process.env.NEXT_PUBLIC_BACK_URL?.trim();
  return base ? base.replace(/\/+$/, "") : null;
}

async function readError(response: Response): Promise<ApiResult<never>> {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // corps vide ou non JSON
  }
  const retry = Number(body.retryAfterSeconds ?? response.headers.get("Retry-After"));
  return {
    ok: false,
    status: response.status,
    code: typeof body.code === "string" ? body.code : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    retryAfterSeconds: Number.isFinite(retry) && retry > 0 ? retry : undefined,
  };
}

export async function getClientInvitation(token: string): Promise<ApiResult<ClientInvitationInfo>> {
  if (!TOKEN_PATTERN.test(token)) return notFound;
  const base = backendBase();
  if (!base) return { ok: false, status: 503 };
  try {
    const response = await fetch(`${base}/client-invitations/${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return readError(response);
    return { ok: true, status: response.status, data: (await response.json()) as ClientInvitationInfo };
  } catch {
    console.error("[client-invitation] lecture de l'invitation impossible");
    return { ok: false, status: 0 };
  }
}

export async function acceptClientInvitation(token: string): Promise<ApiResult<{ linked: boolean; salonName: string }>> {
  if (!TOKEN_PATTERN.test(token)) return notFound;
  const base = backendBase();
  if (!base) return { ok: false, status: 503 };
  const session = await auth();
  if (!session) return { ok: false, status: 401, code: "LOGIN_REQUIRED" };
  if (!hasUsableSession(session)) return { ok: false, status: 401, code: "SESSION_EXPIRED" };
  try {
    const response = await fetch(`${base}/client-invitations/${encodeURIComponent(token)}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return readError(response);
    return { ok: true, status: response.status, data: (await response.json()) as { linked: boolean; salonName: string } };
  } catch {
    console.error("[client-invitation] acceptation impossible");
    return { ok: false, status: 0 };
  }
}
