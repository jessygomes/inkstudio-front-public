/* eslint-disable @typescript-eslint/no-explicit-any */
import BookingFlow from "@/components/RDV/BookingFlow";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { parseSalonHours, hoursToLines } from "@/lib/horaireHelper";

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

  // pour itinéraire (si tu veux l’ajouter plus tard)
  // const mapsQuery = encodeURIComponent(
  //   [salonSummary.address, salonSummary.postalCode, salonSummary.city].filter(Boolean).join(" ")
  // );
  // const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 via-noir-600 to-noir-800 pt-20">
      <section className="px-4 sm:px-6 lg:px-8 xl:px-16 py-4">
        <div className="mx-auto max-w-7xl">
          {/* Header ultra-compact */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg shadow-lg mb-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-5">
              {/* Photo compacte - 1/5 sur desktop */}
              <div className="lg:col-span-1">
                <div className="relative h-32 lg:h-full rounded-lg overflow-hidden border border-white/10">
                  {salon.image ? (
                    <Image
                      src={salon.image}
                      alt={salon.salonName}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-noir-600 to-noir-800 grid place-items-center">
                      <div className="text-center text-white/60">
                        <div className="w-8 h-8 bg-white/10 rounded-full grid place-items-center mx-auto mb-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-one">N/A</span>
                      </div>
                    </div>
                  )}

                  {/* Status badge compact */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-one border backdrop-blur-md ${
                        openNow.open
                          ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/50"
                          : "bg-red-500/30 text-red-200 border-red-400/50"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          openNow.open ? "bg-emerald-300" : "bg-red-300"
                        }`}
                      />
                      {openNow.open ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations principales - 4/5 sur desktop */}
              <div className="lg:col-span-4">
                {/* En-tête compact */}
                <div className="mb-4">
                  <h1 className="text-2xl lg:text-3xl font-one text-white font-bold tracking-wide mb-1">
                    {salon.salonName}
                  </h1>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-one text-sm">
                      {[salon.city, salon.postalCode]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                </div>

                {/* Grid 3 colonnes ultra-compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Prestations compact */}

                  {/* Contact compact */}
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <h3 className="text-white/80 font-one text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3 text-tertiary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact
                    </h3>
                    <div className="space-y-2">
                      {salon.address && (
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg
                              className="w-3 h-3 text-white/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/80 font-one text-xs leading-relaxed">
                              {salon.address}
                              {salon.city && (
                                <>
                                  <br />
                                  {salon.city}
                                </>
                              )}
                              {salon.postalCode && <> {salon.postalCode}</>}
                            </p>
                          </div>
                        </div>
                      )}

                      {salon.phone && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <a
                            href={`tel:${salon.phone}`}
                            className="text-white/80 font-one text-xs hover:text-tertiary-400 transition-colors"
                          >
                            {salon.phone}
                          </a>
                        </div>
                      )}

                      {/* Réseaux sociaux ultra-compact */}
                      {(salon.instagram ||
                        salon.facebook ||
                        salon.tiktok ||
                        salon.website) && (
                        <div className="pt-2 border-t border-white/5">
                          <div className="flex gap-1">
                            {salon.instagram && (
                              <Link
                                href={salon.instagram}
                                target="_blank"
                                className="w-6 h-6 rounded bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center hover:scale-105 transition-transform"
                                aria-label="Instagram"
                              >
                                <CiInstagram className="w-3 h-3 text-pink-400" />
                              </Link>
                            )}
                            {salon.facebook && (
                              <Link
                                href={salon.facebook}
                                target="_blank"
                                className="w-6 h-6 rounded bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center hover:scale-105 transition-transform"
                                aria-label="Facebook"
                              >
                                <CiFacebook className="w-3 h-3 text-blue-400" />
                              </Link>
                            )}
                            {salon.tiktok && (
                              <Link
                                href={salon.tiktok}
                                target="_blank"
                                className="w-6 h-6 rounded bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center hover:scale-105 transition-transform"
                                aria-label="TikTok"
                              >
                                <PiTiktokLogoThin className="w-3 h-3 text-gray-400" />
                              </Link>
                            )}
                            {salon.website && (
                              <Link
                                href={salon.website}
                                target="_blank"
                                className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center hover:scale-105 transition-transform"
                                aria-label="Site web"
                              >
                                <TfiWorld className="w-3 h-3 text-emerald-400" />
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horaires ultra-compact */}
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5 col-span-2">
                    <h3 className="text-white/80 font-one text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3 text-tertiary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Horaires
                    </h3>

                    {/* Status aujourd'hui compact */}
                    {openNow.today && (
                      <div className="mb-2 p-2 rounded bg-gradient-to-r from-tertiary-500/15 to-tertiary-600/10 border border-tertiary-500/25">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-one text-xs font-semibold">
                            Aujourd&apos;hui
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`h-1 w-1 rounded-full ${
                                openNow.open ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-xs font-one ${
                                openNow.open
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}
                            >
                              {openNow.open ? "Ouvert" : "Fermé"}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/80 font-one text-xs">
                          {openNow.today.start}–{openNow.today.end}
                        </p>
                      </div>
                    )}

                    {/* Horaires condensés - Affichage en 2 colonnes */}
                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                      {hoursLines.map((h) => {
                        const isToday = h.day.toLowerCase() === todayFR;
                        return (
                          <div
                            key={h.day}
                            className={`flex justify-between text-xs ${
                              isToday ? "text-tertiary-300" : "text-white/70"
                            }`}
                          >
                            <span className="font-one capitalize">{h.day}</span>
                            <span className="font-one">{h.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flow de réservation */}
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
