import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";
import { getBookingLinkPublic } from "@/lib/actions/bookingLink.action";
import { dateOnlyPart, terminalCodeFromStatus } from "@/lib/booking-link";
import BookingLinkFlow, { type BookingLinkViewer } from "@/components/RDV/BookingLink/BookingLinkFlow";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slugPublic: string; token: string }> };

// Titre neutre : ni slug ni token dans les métadonnées.
export const metadata: Metadata = {
  title: "Votre réservation | Inkera",
  description: "Réservez votre rendez-vous à partir du lien personnel transmis par votre tatoueur.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

function safeDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Chemin canonique tiré du bookingUrl renvoyé par le backend, uniquement s'il désigne le même token. */
function canonicalPathFor(bookingUrl: unknown, token: string): string | null {
  if (typeof bookingUrl !== "string") return null;
  try {
    const { pathname } = new URL(bookingUrl);
    const match = /^\/([^/]+)\/rdv\/([^/]+)\/?$/.exec(pathname);
    if (!match || safeDecode(match[2]) !== safeDecode(token)) return null;
    return pathname.replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function getViewer(): Promise<BookingLinkViewer> {
  const session = await auth();
  if (!session) return { state: "anonymous" };
  if (!hasUsableSession(session)) return { state: "expired" };
  const user = session.user;
  const profile = (user.clientProfile ?? {}) as { birthDate?: string | null; phone?: string | null };
  return {
    state: "authenticated",
    role: user.role,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || profile.phone || "",
    birthDate: dateOnlyPart(profile.birthDate) || "",
  };
}

export default async function BookingLinkPage({ params }: PageParams) {
  const { slugPublic, token } = await params;
  const result = await getBookingLinkPublic(safeDecode(token));

  if (result.ok) {
    // Ancien slug ou slug incorrect : on suit l'URL canonique fournie par le backend, sans la reconstruire.
    const canonical = canonicalPathFor(result.data.bookingUrl, token);
    if (canonical && result.data.publicSlug && safeDecode(slugPublic) !== result.data.publicSlug) {
      const [, canonicalSlug] = canonical.split("/");
      if (safeDecode(canonicalSlug) !== safeDecode(slugPublic)) redirect(canonical);
    }
  }

  const viewer = await getViewer();
  const terminal = result.ok ? terminalCodeFromStatus(result.data.status) : null;

  return (
    <div className="min-h-screen bg-noir-800 px-page pb-12 pt-6">
      <div className="mx-auto max-w-5xl">
        <BookingLinkFlow
          token={safeDecode(token)}
          info={result.ok && !terminal ? result.data : null}
          initialError={result.ok ? (terminal ? { status: 410, code: terminal } : null) : { status: result.status, code: result.code, retryAfterSeconds: result.retryAfterSeconds }}
          viewer={viewer}
        />
      </div>
    </div>
  );
}
