/* eslint-disable @typescript-eslint/no-explicit-any */
import BookingFlow from "@/components/RDV/BookingFlow";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import HoursBadge from "@/components/Shared/HoursBadge";
import { hoursToLines, parseSalonHours } from "@/lib/horaireHelper";

type PageParams = { params: { slug: string; loc: string } };

async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc
  )}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load salon (${res.status})`);
  return res.json();
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

function todayLabelFR() {
  const p = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
  }).formatToParts(new Date());
  return (p.find((x) => x.type === "weekday")?.value || "").toLowerCase();
}

export default async function Page({ params }: PageParams) {
  const salon = await getSalon(params.slug, params.loc);
  if (!salon) notFound();

  // résumé salon
  const salonSummary = {
    id: salon.id,
    name: salon.salonName,
    image: salon.image ?? null,
    address: salon.address ?? null,
    city: salon.city ?? null,
    postalCode: salon.postalCode ?? null,
    phone: salon.phone ?? null,
    tatoueurs: salon.Tatoueur || [],
    prestations: salon.prestations || [],
  };

  // horaires normalisés + statut
  const normalized = parseSalonHours(salon.salonHours as any);
  const hoursLines = hoursToLines(normalized); // [{ day, value }]
  const openNow = getOpenNow(salon.salonHours);
  const todayFR = todayLabelFR();

  // pour itinéraire (si tu veux l’ajouter plus tard)
  // const mapsQuery = encodeURIComponent(
  //   [salonSummary.address, salonSummary.postalCode, salonSummary.city].filter(Boolean).join(" ")
  // );
  // const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-noir-700 sm:px-8 lg:px-20 pt-24">
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {/* En-tête salon */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-start">
            {/* Image principale */}
            <div className="relative h-36 w-full md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-noir-600/40">
              {salon.image ? (
                <Image
                  src={salon.image}
                  alt={salon.salonName}
                  className="h-full w-full object-cover"
                  width={800}
                  height={800}
                  priority
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                  N/A
                </div>
              )}
            </div>
            {/* Infos principales */}
            <div className="flex-1 w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-6 backdrop-blur shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-white font-one text-2xl sm:text-3xl tracking-[0.18em] uppercase font-bold mb-1">
                    {salon.salonName}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {salon.city && (
                      <span className="inline-block px-3 py-1 rounded-lg bg-tertiary-500/10 text-tertiary-400 border border-tertiary-500/20 text-xs font-one">
                        {salon.city}
                      </span>
                    )}
                    {salon.prestations && salon.prestations.length > 0 && (
                      <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-white/70 border border-white/10 text-xs font-one">
                        {salon.prestations.join("  •  ")}
                      </span>
                    )}
                  </div>
                </div>
                {/* Réseaux sociaux */}
                <div className="flex items-center gap-2">
                  {salon.instagram && (
                    <Link
                      href={salon.instagram}
                      target="_blank"
                      className="flex items-center justify-center h-9 w-9 rounded-lg bg-pink-500/20 text-white border border-pink-500/30 hover:bg-pink-500/30 transition"
                      aria-label="Instagram"
                    >
                      <CiInstagram size={18} />
                    </Link>
                  )}
                  {salon.facebook && (
                    <Link
                      href={salon.facebook}
                      target="_blank"
                      className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-500/20 text-white border border-blue-500/30 hover:bg-blue-500/30 transition"
                      aria-label="Facebook"
                    >
                      <CiFacebook size={18} />
                    </Link>
                  )}
                  {salon.tiktok && (
                    <Link
                      href={salon.tiktok}
                      target="_blank"
                      className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-500/20 text-white border border-gray-500/30 hover:bg-gray-500/30 transition"
                      aria-label="TikTok"
                    >
                      <PiTiktokLogoThin size={18} />
                    </Link>
                  )}
                  {salon.website && (
                    <Link
                      href={salon.website}
                      target="_blank"
                      className="flex items-center justify-center h-9 px-2 rounded-lg bg-green-500/20 text-white border border-green-500/30 hover:bg-green-500/30 transition text-[11px]"
                      aria-label="Site web"
                    >
                      <TfiWorld size={16} />
                    </Link>
                  )}
                </div>
              </div>
              {/* Adresse et téléphone */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <span className="font-one">Adresse :</span>
                  <span>
                    {[salon.address, salon.postalCode, salon.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
                {salon.phone && (
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <span className="font-one">Téléphone :</span>
                    <span>{salon.phone}</span>
                  </div>
                )}
              </div>
              {/* Horaires */}
              <div className="mt-4">
                <HoursBadge
                  hours={hoursLines}
                  todayLabel={todayFR}
                  className="pt-1"
                />
              </div>
            </div>
          </div>

          {/* Flow de réservation (scopé au salon) */}
          <BookingFlow
            salon={salonSummary}
            apiBase={process.env.NEXT_PUBLIC_BACK_URL}
            defaultTatoueurId={null}
          />
        </div>
      </section>
    </div>
  );
}
