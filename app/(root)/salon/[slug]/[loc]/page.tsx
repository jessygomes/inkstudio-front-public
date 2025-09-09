/* eslint-disable @typescript-eslint/no-explicit-any */
import SalonTabs from "@/components/ProfilSalon/SalonTabs";
import { TeamCard } from "@/components/ProfilSalon/TeamCard";
import { hoursToLines, parseSalonHours } from "@/lib/horaireHelper";
import { SalonProfilProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";

type PageParams = { params: { slug: string; loc: string } };

// --- data
async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc
  )}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load salon (${res.status})`);
  const data = await res.json();
  return data as SalonProfilProps;
}

//! --- SEO
export async function generateMetadata({ params }: PageParams) {
  const salon = await getSalon(params.slug, params.loc);
  if (!salon) return { title: "Salon introuvable" };

  const title = `${salon.salonName} — ${salon.city ?? "Salon"}`;
  const description = [
    salon.address ? `${salon.address}` : null,
    salon.postalCode || salon.city
      ? `${salon.postalCode ?? ""} ${salon.city ?? ""}`.trim()
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: salon.image
        ? [{ url: salon.image, width: 1200, height: 630 }]
        : undefined,
    },
  };
}

// Ouvert maintenant ? (Europe/Paris, robuste)
function getOpenNow(raw: any) {
  const parsed = parseSalonHours(raw as any);
  if (!parsed) return { open: false as const, today: null, todayKey: "" };

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

  // map FR -> EN (comme les clés normalisées de parseSalonHours)
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

  if (!slot?.start || !slot?.end) {
    return { open: false as const, today: null, todayKey: key as string };
  }

  // "09:00" -> minutes
  const [sh, sm] = String(slot.start).split(":").map(Number);
  const [eh, em] = String(slot.end).split(":").map(Number);
  const startMin = (sh || 0) * 60 + (sm || 0);
  const endMin = (eh || 0) * 60 + (em || 0);

  // fin EXCLUSIVE : 09:00 ≤ now < 18:00
  const open = nowMin >= startMin && nowMin < endMin;

  return {
    open,
    today: { start: slot.start, end: slot.end },
    todayKey: key as string,
  };
}

function todayLabelFR() {
  const p = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
  }).formatToParts(new Date());
  return (p.find((x) => x.type === "weekday")?.value || "").toLowerCase();
}
const todayFR = todayLabelFR();

//! PAGE
export default async function ProfilPublicSalonPage({ params }: PageParams) {
  const { slug, loc } = params;
  if (!slug || !loc) notFound();

  const salon = await getSalon(slug, loc);
  if (!salon) notFound();

  const heroSrc = salon.image || null;
  const rawHours = parseSalonHours(salon.salonHours as any);
  const hours = hoursToLines(rawHours);
  const openNow = getOpenNow(salon.salonHours);

  const mapsQuery = encodeURIComponent(
    [salon.address, salon.postalCode, salon.city].filter(Boolean).join(" ")
  );
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: salon.salonName,
    image: heroSrc || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      postalCode: salon.postalCode,
      addressLocality: salon.city,
      addressCountry: "FR",
    },
    telephone: salon.phone,
    url: salon.website,
  };

  // Prestations (dédupliquées, insensibles à la casse) — compat `prestation` ou `prestations`
  const prestRaw =
    (Array.isArray((salon as any).prestations) && (salon as any).prestations) ||
    (Array.isArray((salon as any).prestation) && (salon as any).prestation) ||
    [];

  const prestCleaned = prestRaw
    .map((p: unknown) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);

  const prestSeen = new Set<string>();
  const prestations: string[] = [];
  for (const p of prestCleaned) {
    const key = p.toLowerCase();
    if (!prestSeen.has(key)) {
      prestSeen.add(key);
      prestations.push(p);
    }
  }
  const PREST_MAX = 8;
  const prestationsVisibles = prestations.slice(0, PREST_MAX);
  const prestationsRestantes = Math.max(0, prestations.length - PREST_MAX);

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 via-noir-600 to-noir-800 pt-20">
      {/* CONTENT */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-16 py-6">
        {/* Mobile Hero */}
        <div className="mx-auto sm:hidden mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <div className="relative h-64 bg-gradient-to-br from-noir-600 to-noir-800">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`${salon.salonName} - photo de profil`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <div className="text-center text-white/60">
                    <div className="w-12 h-12 bg-white/10 rounded-full grid place-items-center mx-auto mb-2">
                      <svg
                        className="w-6 h-6"
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
                    <span className="text-xs font-one">
                      Aucune image disponible
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

              {/* Status badges */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-one backdrop-blur-md">
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
                  {salon.city ?? "Ville inconnue"}
                  {salon.postalCode && (
                    <span className="opacity-70">• {salon.postalCode}</span>
                  )}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-one border backdrop-blur-md ${
                    openNow.open
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border-red-500/40"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      openNow.open ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {openNow.open ? "Ouvert maintenant" : "Fermé"}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h1 className="text-2xl font-one text-white tracking-wide drop-shadow-lg mb-2">
                  {salon.salonName}
                </h1>
                {openNow.today && (
                  <p className="text-white/80 text-xs font-one">
                    Aujourd&apos;hui: {openNow.today.start}–{openNow.today.end}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:order-2 lg:sticky lg:top-24 h-fit space-y-5">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg shadow-xl">
              <div className="flex gap-2.5">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 group flex justify-center items-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-one text-sm tracking-widest shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-[1.02]"
                >
                  <svg
                    className="w-4 h-4"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Itinéraire
                </a>
                <a
                  href={`/salon/${params.slug}/${params.loc}/reserver`}
                  className="flex-1 group flex justify-center items-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.06] text-white border border-white/20 hover:border-white/30 transition-all duration-300 text-sm tracking-widest font-one backdrop-blur-sm transform hover:scale-[1.02]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Réserver
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg shadow-xl">
              <h3 className="text-white/95 text-sm font-one tracking-wider uppercase mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Informations
              </h3>

              <div className="space-y-4">
                {salon.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tertiary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-tertiary-400"
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
                    <div className="flex-1">
                      <p className="text-white/90 font-one text-sm leading-relaxed">
                        {salon.address}
                        {salon.city && (
                          <>
                            <br />
                            {salon.city}
                          </>
                        )}{" "}
                        {salon.postalCode}
                      </p>
                    </div>
                  </div>
                )}

                {salon.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-tertiary-400"
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
                      className="text-white/90 font-one text-sm hover:text-tertiary-400 transition-colors"
                    >
                      {salon.phone}
                    </a>
                  </div>
                )}

                {/* Social Media */}
                {(salon.instagram ||
                  salon.facebook ||
                  salon.tiktok ||
                  salon.website) && (
                  <div className="pt-2">
                    <p className="text-white/70 font-one text-xs mb-3 uppercase tracking-wider">
                      Réseaux sociaux
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {salon.instagram && (
                        <Link
                          href={salon.instagram}
                          target="_blank"
                          className="group w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center hover:from-pink-500/30 hover:to-purple-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <CiInstagram className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                        </Link>
                      )}
                      {salon.facebook && (
                        <Link
                          href={salon.facebook}
                          target="_blank"
                          className="group w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <CiFacebook className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </Link>
                      )}
                      {salon.tiktok && (
                        <Link
                          href={salon.tiktok}
                          target="_blank"
                          className="group w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center hover:from-gray-500/30 hover:to-gray-600/30 hover:border-gray-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <PiTiktokLogoThin className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                        </Link>
                      )}
                      {salon.website && (
                        <Link
                          href={salon.website}
                          target="_blank"
                          className="group w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center hover:from-emerald-500/30 hover:to-emerald-600/30 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <TfiWorld className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Horaires */}
            {hours.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg shadow-xl">
                <h3 className="text-white/95 font-one text-sm tracking-wider uppercase mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  Horaires d&apos;ouverture
                </h3>
                <div className="space-y-1.5">
                  {hours.map((h) => {
                    const isToday = h.day.toLowerCase() === todayFR;
                    return (
                      <div
                        key={h.day}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isToday
                            ? "bg-gradient-to-r from-tertiary-500/20 to-tertiary-600/10 border border-tertiary-500/30"
                            : "bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className={`font-one text-sm ${
                            isToday
                              ? "text-tertiary-300 font-semibold"
                              : "text-white/80"
                          }`}
                        >
                          {h.day}
                          {isToday && (
                            <span className="ml-2 text-xs text-tertiary-400">
                              (Aujourd&apos;hui)
                            </span>
                          )}
                        </span>
                        <span
                          className={`font-one text-sm ${
                            isToday
                              ? "text-white font-semibold"
                              : "text-white/90"
                          }`}
                        >
                          {h.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 lg:order-1 space-y-6">
            {/* Desktop Hero */}
            <div className="hidden sm:block">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <div className="relative h-80 lg:h-96 bg-gradient-to-br from-noir-600 to-noir-800">
                  {heroSrc ? (
                    <Image
                      src={heroSrc}
                      alt={`${salon.salonName} - photo de profil`}
                      fill
                      sizes="(min-width:1024px) 66vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <div className="text-center text-white/60">
                        <div className="w-16 h-16 bg-white/10 rounded-full grid place-items-center mx-auto mb-3">
                          <svg
                            className="w-8 h-8"
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
                        <span className="text-base font-one">
                          Aucune image disponible
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                  {/* Status badges */}
                  <div className="absolute top-5 left-5 right-5 flex flex-wrap gap-3 z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-one backdrop-blur-md">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {salon.city ?? "Ville inconnue"}
                      {salon.postalCode && (
                        <span className="opacity-70">• {salon.postalCode}</span>
                      )}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-one border backdrop-blur-md ${
                        openNow.open
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-red-500/20 text-red-300 border-red-500/40"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          openNow.open ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      {openNow.open ? "Ouvert maintenant" : "Fermé"}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h1 className="text-3xl lg:text-4xl font-one text-white tracking-wide drop-shadow-lg mb-2">
                      {salon.salonName}
                    </h1>
                    {openNow.today && (
                      <p className="text-white/80 text-base font-one">
                        Aujourd&apos;hui: {openNow.today.start}–
                        {openNow.today.end}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Présentation */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-lg shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-white/95 font-one text-sm tracking-wider uppercase">
                  Présentation
                </h2>
                <div className="flex flex-wrap gap-2">
                  {prestationsVisibles.length > 0 ? (
                    <>
                      {prestationsVisibles.map((p, idx) => (
                        <span
                          key={`${p}-${idx}`}
                          className="px-3 py-1 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/80 border border-white/10 text-xs font-one backdrop-blur-sm"
                          title={p}
                        >
                          {p}
                        </span>
                      ))}
                      {prestationsRestantes > 0 && (
                        <span className="px-3 py-1 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/80 border border-white/10 text-xs font-one backdrop-blur-sm">
                          +{prestationsRestantes}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-white/50 text-xs font-one">
                      Aucune prestation renseignée
                    </span>
                  )}
                </div>
              </div>

              <p className="text-white/85 text-sm font-one leading-relaxed">
                {salon.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Tabs : Photos → Portfolio → Produits */}
            <SalonTabs
              photos={salon.salonPhotos ?? []}
              portfolio={salon.Portfolio ?? []}
              products={salon.ProductSalon ?? []}
              salonName={salon.salonName}
            />

            {/* Équipe */}
            {Array.isArray(salon.Tatoueur) && salon.Tatoueur.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-lg shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white/95 font-one text-sm tracking-wider uppercase">
                    L&apos;équipe
                  </h3>
                  <span className="text-white/60 font-one text-sm">
                    {salon.Tatoueur.length}{" "}
                    {salon.Tatoueur.length > 1 ? "tatoueurs" : "tatoueur"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                  {salon.Tatoueur.map((t: any) => (
                    <TeamCard
                      key={t.id}
                      name={t.name}
                      img={t.img}
                      description={t.description}
                      instagram={t.instagram}
                      phone={t.phone}
                      style={t.style}
                      skills={t.skills}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <Script
        id="salon-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
