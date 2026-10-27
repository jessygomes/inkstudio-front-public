/* eslint-disable @typescript-eslint/no-explicit-any */
import BookingFlowNew from "@/components/RDV/BookingFlowNew";
import AuthPromptBanner from "@/components/Auth/AuthPromptBanner";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { Clock3, ChevronDown, MapPin, Phone, Mail, ArrowUpRight, ArrowLeft } from "lucide-react";
import { parseSalonHours, hoursToLines } from "@/lib/horaireHelper";
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
      next: { revalidate: 30 },
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

// Ouvert maintenant ? (timezone Europe/Paris)
function getOpenNow(raw: any) {
  const parsed = parseSalonHours(raw as any);
  if (!parsed) return { open: false as const, today: null as any };

  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const weekdayFR =
    parts.find((p) => p.type === "weekday")?.value?.toLowerCase() || "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const nowMin = hour * 60 + minute;

  const map: Record<string, keyof typeof parsed> = {
    lundi: "monday",
    mardi: "tuesday",
    mercredi: "wednesday",
    jeudi: "thursday",
    vendredi: "friday",
    samedi: "saturday",
    dimanche: "sunday",
  };

  const key = (map[weekdayFR] || weekdayFR) as keyof typeof parsed;
  const slot = parsed[key];

  if (!slot?.start || !slot?.end) return { open: false as const, today: null };

  const [sh, sm] = String(slot.start).split(":").map(Number);
  const [eh, em] = String(slot.end).split(":").map(Number);
  const startMin = (sh || 0) * 60 + (sm || 0);
  const endMin = (eh || 0) * 60 + (em || 0);

  const open = nowMin >= startMin && nowMin < endMin;
  return { open, today: { start: slot.start, end: slot.end } };
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
    bookingHref: getLinkedBookingHref(tatoueur),
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
    name: salon.salonName,
    image: salon.image ?? null,
    address: salon.address ?? null,
    city: salon.city ?? null,
    postalCode: salon.postalCode ?? null,
    phone: salon.phone ?? null,
    salonHours: salon.salonHours ?? null,
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
  };

  // horaires normalisés + statut
  const normalized = parseSalonHours(salon.salonHours as any);
  const hoursLines = hoursToLines(normalized);
  const openNow = getOpenNow(salon.salonHours);

  // Jour actuel en français pour highlighting
  function todayLabelFR() {
    const p = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
    }).formatToParts(new Date());
    return (p.find((x) => x.type === "weekday")?.value || "").toLowerCase();
  }
  const todayFR = todayLabelFR();
  const displayCity = typeof salon.city === "string" ? salon.city.toLocaleUpperCase("fr-FR") : "";
  const phoneDigits = String(salon.phone || "").replace(/\D/g, "");
  const localPhoneDigits = phoneDigits.length === 11 && phoneDigits.startsWith("33") ? "0" + phoneDigits.slice(2) : phoneDigits;
  const displayPhone = localPhoneDigits.length === 10 ? localPhoneDigits.match(/.{2}/g)?.join(" ") : salon.phone;

  // pour itinéraire (si tu veux l’ajouter plus tard)
  // const mapsQuery = encodeURIComponent(
  //   [salonSummary.address, salonSummary.postalCode, salonSummary.city].filter(Boolean).join(" ")
  // );
  // const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-noir-700 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href={`/salon/${slug}/${loc}`} className="mb-6 inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-white"><ArrowLeft size={13} />Retour au salon</Link>
        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
          <aside aria-label="Votre salon" className="order-2 overflow-hidden rounded-2xl border border-white/10 bg-noir-700 lg:sticky lg:top-6 lg:order-1">
            <div className="relative h-32 overflow-hidden bg-white/3 lg:h-40">
              {salon.image ? <Image src={salon.image} alt={salon.salonName} fill sizes="(min-width: 1024px) 260px, 100vw" className="object-cover" priority /> : <div className="grid h-full place-items-center text-xl text-white/15 font-one">{salon.salonName}</div>}
              <div className="absolute inset-0 bg-linear-to-t from-noir-700/70 via-transparent to-transparent" />
            </div>
            <div className="space-y-5 p-5">
              <div><p className="text-[9px] font-medium uppercase tracking-[0.16em] text-tertiary-400/80">Vous avez rendez-vous chez</p><div className="mt-3 flex items-center gap-3"><div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5">{salon.profileImage || salon.image ? <Image src={salon.profileImage || salon.image} alt={salon.salonName} fill sizes="44px" className="object-cover" /> : <span aria-hidden="true" className="text-base text-white/45">{salon.salonName?.slice(0, 1).toUpperCase()}</span>}</div><div className="min-w-0"><h2 className="break-words text-lg font-semibold tracking-tight text-white font-one">{salon.salonName}</h2><p className="mt-1 text-xs text-white/40">{[displayCity, salon.postalCode].filter(Boolean).join(" · ")}</p></div></div></div>
              <div className="space-y-3 border-t border-white/8 pt-4 text-[11px] leading-5 text-white/55">
                {salon.address && <div className="flex gap-2.5"><MapPin size={14} className="mt-0.5 shrink-0 text-white/30" /><p>{salon.address}<br />{[salon.postalCode, displayCity].filter(Boolean).join(" ")}</p></div>}
                {salon.phone && <a href={`tel:${salon.phone}`} className="flex items-center gap-2.5 hover:text-white"><Phone size={13} className="shrink-0 text-white/30" />{displayPhone}</a>}
                {salon.email && <a href={`mailto:${salon.email}`} className="flex items-start gap-2.5 break-all hover:text-white"><Mail size={13} className="mt-0.5 shrink-0 text-white/30" />{salon.email}</a>}
              </div>
              <div className="overflow-hidden rounded-xl border border-white/8 bg-noir-700/40">
                <div className="flex gap-2.5 p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-tertiary-400"><Clock3 size={15} /></span><div className="flex-1"><p className="text-[10px] text-white/40">Aujourd’hui au salon</p><div className="mt-1 flex items-center justify-between gap-2"><p className="text-[11px] tabular-nums text-white/80">{openNow.today ? openNow.today.start + " – " + openNow.today.end : hoursLines.length ? "Fermé aujourd’hui" : "Horaires non renseignés"}</p>{!!hoursLines.length && <span className={`size-1.5 shrink-0 rounded-full ${openNow.open ? "bg-emerald-400" : "bg-white/25"}`} aria-label={openNow.open ? "Ouvert actuellement" : "Actuellement fermé"} />}</div></div></div>
                {!!hoursLines.length && <details className="group border-t border-white/8"><summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-[10px] text-white/45 hover:text-white [&::-webkit-details-marker]:hidden">Les horaires de la semaine<ChevronDown size={12} className="transition-transform group-open:rotate-180" /></summary><div className="space-y-0.5 px-1.5 pb-1.5">{hoursLines.map(hour => <div key={hour.day} className={`flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-[10px] ${hour.day.toLowerCase() === todayFR ? "bg-tertiary-400/5 text-tertiary-400" : "text-white/45"}`}><span className="capitalize">{hour.day}</span><span className="tabular-nums">{hour.value}</span></div>)}</div></details>}
              </div>
              {(salon.instagram || salon.facebook || salon.tiktok || salon.website) && <div className="flex items-center gap-3 text-white/35">
                {salon.instagram && <a href={salon.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white"><CiInstagram size={18} /></a>}
                {salon.facebook && <a href={salon.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white"><CiFacebook size={18} /></a>}
                {salon.tiktok && <a href={salon.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-white"><PiTiktokLogoThin size={17} /></a>}
                {salon.website && <a href={salon.website} target="_blank" rel="noopener noreferrer" aria-label="Site du salon" className="hover:text-white"><TfiWorld size={16} /></a>}
              </div>}
              <Link href={`/salon/${slug}/${loc}`} className="flex items-center justify-between border-t border-white/8 pt-3 text-[10px] text-white/35 hover:text-white">Découvrir le salon<ArrowUpRight size={12} /></Link>
            </div>
          </aside>
          <main className="order-1 min-w-0 lg:order-2">
            <BookingFlowNew salon={salonSummary} apiBase={process.env.NEXT_PUBLIC_BACK_URL} defaultTatoueurId={null} defaultPrestation={defaultPrestation} flashes={availableFlashes} defaultFlashId={defaultFlashId} />
            <AuthPromptBanner compact />
          </main>
        </div>
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
    title: salon.salonName,
    description: `Réservez votre séance chez ${salon.salonName}, situé à ${salon.address}, ${salon.postalCode} ${salon.city}.`,
    openGraph: {
      title: salon.salonName,
      description: `Réservez votre séance chez ${salon.salonName}, situé à ${salon.address}, ${salon.postalCode} ${salon.city}.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/salon/${slug}/${loc}`,
      images: [
        {
          url: salon.image
            ? salon.image
            : `${process.env.NEXT_PUBLIC_SITE_URL}/default-salon-image.jpg`,
          alt: salon.salonName,
        },
      ],
    },
  };
}
