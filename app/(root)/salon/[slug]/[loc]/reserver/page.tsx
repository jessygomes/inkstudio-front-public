/* eslint-disable @typescript-eslint/no-explicit-any */
import BookingFlowNew from "@/components/RDV/BookingFlowNew";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FlashProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";

type PageParams = {
  params: Promise<{ slug: string; loc: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PrestationType = "TATTOO" | "PIERCING" | "PROJET" | "RETOUCHE";

function normalizePrestation(
  value?: string | string[],
): PrestationType | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const normalized = raw.toUpperCase();
  if (
    normalized === "TATTOO" ||
    normalized === "PIERCING" ||
    normalized === "PROJET" ||
    normalized === "RETOUCHE"
  ) {
    return normalized;
  }
  return undefined;
}

function normalizeFlashId(value?: string | string[]): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim();
  return normalized ? normalized : undefined;
}

type BookingTatoueur = {
  id: string;
  name: string;
  img?: string | null;
  profileImage?: string | null;
  rdvBookingEnabled?: boolean;
  isLinkedUser?: boolean | null;
  profileUserId?: string | null;
  salonName?: string | null;
  city?: string | null;
  postalCode?: string | null;
  bookingHref?: string | null;
};

function getLinkedBookingHref(tatoueur: BookingTatoueur): string | null {
  if (tatoueur.isLinkedUser !== true || !tatoueur.profileUserId) return null;

  const nameSource =
    typeof tatoueur.salonName === "string" ? tatoueur.salonName.trim() : "";
  const city = typeof tatoueur.city === "string" ? tatoueur.city.trim() : "";
  const postalCode =
    typeof tatoueur.postalCode === "string" ? tatoueur.postalCode.trim() : "";

  if (!nameSource || !city || !postalCode) return null;

  const nameSlug = toSlug(nameSource);
  const locSlug = toSlug(`${city}-${postalCode}`);
  if (!nameSlug || !locSlug) return null;

  return `/salon/${nameSlug}/${locSlug}/reserver`;
}

async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc,
  )}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load salon (${res.status})`);
  return res.json();
}

async function getAvailableFlashes(userId: string): Promise<FlashProps[]> {
  const base = process.env.NEXT_PUBLIC_BACK_URL;
  if (!base || !userId) return [];

  try {
    const res = await fetch(`${base}/flash/${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];

    const payload = await res.json();
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.flashs)
          ? payload.flashs
          : Array.isArray(payload?.flashes)
            ? payload.flashes
            : [];

    return list as FlashProps[];
  } catch {
    return [];
  }
}

export default async function ReserverPage({
  params,
  searchParams,
}: PageParams) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { slug, loc } = resolvedParams;
  const defaultPrestation = normalizePrestation(
    resolvedSearchParams?.prestation,
  );
  const requestedFlashId = normalizeFlashId(resolvedSearchParams?.flashId);

  const salon = await getSalon(slug, loc);

  if (!salon) notFound();
  const flashes = await getAvailableFlashes(salon.id);
  const availableFlashes = flashes.filter(
    (f) => f && (f.available === undefined || f.available || f.isAvailable),
  );
  const defaultFlashId = availableFlashes.some((f) => f.id === requestedFlashId)
    ? requestedFlashId
    : undefined;

  const tatoueurs = (Array.isArray(salon.Tatoueur)
    ? salon.Tatoueur
    : salon.Tatoueur
      ? [salon.Tatoueur]
      : []) as BookingTatoueur[];

  const bookingTatoueurs = tatoueurs.map((tatoueur) => ({
    ...tatoueur,
    rdvBookingEnabled: tatoueur.rdvBookingEnabled === true,
    bookingHref: tatoueur.bookingHref || getLinkedBookingHref(tatoueur),
  }));

  const resolvedAgendaMode =
    typeof salon?.saasPlanDetails?.agendaMode === "string"
      ? salon.saasPlanDetails.agendaMode.toUpperCase()
      : typeof salon?.agendaMode === "string"
        ? salon.agendaMode.toUpperCase()
        : null;

  // résumé salon
  const salonSummary = {
    saasPlan: salon.saasPlan,
    publicBookingAllowed: salon.saasPlan !== "FREE" || (salon.role === "user_tatoueur" && (salon.linkedSalons || []).some((venue: any) => venue.publicBookingEnabled)), 
    role: salon.role,
    linkedSalons: salon.linkedSalons || [],
    id: salon.id,
    name: salon.displayName || salon.salonName,
    image: salon.image ?? null,
    address: salon.address ?? null,
    city: salon.city ?? null,
    postalCode: salon.postalCode ?? null,
    phone: salon.phone ?? null,
    email: salon.email ?? null,
    profileImage: salon.profileImage ?? null,
    salonHours: salon.salonHours ?? null,
    profileHref: `/salon/${slug}/${loc}`,
    tatoueurs: bookingTatoueurs,
    prestations: Array.from(
      new Set([
        ...(salon.prestations || []),
        ...(defaultPrestation ? [defaultPrestation] : []),
      ]),
    ),
    appointmentBookingEnabled: salon.appointmentBookingEnabled,
    agendaMode: resolvedAgendaMode,
    addConfirmationEnabled: salon.addConfirmationEnabled,
    projectAppointmentDurationMinutes:
      typeof salon.projectAppointmentDurationMinutes === "number"
        ? salon.projectAppointmentDurationMinutes
        : 60,
    projectAppointmentIsFree:
      typeof salon.projectAppointmentIsFree === "boolean"
        ? salon.projectAppointmentIsFree
        : true,
    projectAppointmentPrice:
      typeof salon.projectAppointmentPrice === "number"
        ? salon.projectAppointmentPrice
        : null,
    allowSameDayBooking: salon.allowSameDayBooking !== false,
  };

  return (
    <div className="min-h-screen bg-noir-800 px-page pb-10 pt-6">
      <div>
        <Link href={`/salon/${slug}/${loc}`} className="mb-6 inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-white"><ArrowLeft size={13} />Retour au profil</Link>
        <BookingFlowNew salon={salonSummary} apiBase={process.env.NEXT_PUBLIC_BACK_URL} defaultTatoueurId={null} defaultPrestation={defaultPrestation} flashes={availableFlashes} defaultFlashId={defaultFlashId} />
      </div>
    </div>
  );
}
export async function generateMetadata({ params }: PageParams) {
  const resolvedParams = await params;
  const { slug, loc } = resolvedParams;

  const salon = await getSalon(slug, loc);
  if (!salon) return {};

  return {
    title: salon.displayName || salon.salonName,
    description: `Réservez votre séance chez ${salon.displayName || salon.salonName}, situé à ${salon.address}, ${salon.postalCode} ${salon.city}.`,
    openGraph: {
      title: salon.displayName || salon.salonName,
      description: `Réservez votre séance chez ${salon.displayName || salon.salonName}, situé à ${salon.address}, ${salon.postalCode} ${salon.city}.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/salon/${slug}/${loc}`,
      images: [
        {
          url: salon.image
            ? salon.image
            : `${process.env.NEXT_PUBLIC_SITE_URL}/default-salon-image.jpg`,
          alt: salon.displayName || salon.salonName,
        },
      ],
    },
  };
}
