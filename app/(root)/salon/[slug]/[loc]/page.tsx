/* eslint-disable @typescript-eslint/no-explicit-any */
import SalonTabs from "@/components/ProfilSalon/SalonTabs";
import { TeamCard } from "@/components/ProfilSalon/TeamCard";
import { LinkedSalonCard } from "@/components/ProfilSalon/LinkedSalonCard";
import { hoursToLines, parseSalonHours } from "@/lib/horaireHelper";
import { FlashProps, LinkedSalonProps, SalonProfilProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Metadata } from "next";

import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import HoursCard from "@/components/ProfilSalon/HoursCard";
import FavoriteBtn from "@/components/Shared/FavoriteBtn";
import SalonReviews from "@/components/ProfilSalon/SalonReviews";
import { SalonProfileViewTracker } from "@/components/Shared/SalonProfileViewTracker";

type PageParams = {
  params: Promise<{ slug: string; loc: string }>;
};

type SalonTatoueur = {
  id: string;
  name: string;
  salonName?: string | null;
  city?: string | null;
  postalCode?: string | null;
  img?: string | null;
  description?: string | null;
  instagram?: string | null;
  style?: string[] | null;
  skills?: string[] | null;
  isLinkedUser?: boolean;
  profileUserId?: string | null;
};

// --- data
async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc,
  )}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load salon (${res.status})`);

  // Vérifier si la réponse contient du JSON valide
  const text = await res.text();
  if (!text || text.trim() === "") {
    return null; // Profil incomplet ou vide
  }

  try {
    const data = JSON.parse(text);
    return data as SalonProfilProps;
  } catch (error) {
    console.error("Invalid JSON response:", text, error);
    return null; // JSON invalide = profil incomplet
  }
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

//! --- SEO
export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const salon = await getSalon(resolvedParams.slug, resolvedParams.loc);

  if (!salon) {
    return {
      title: "Salon introuvable - Inkera",
      description:
        "Ce salon de tatouage n'existe pas ou n'est plus disponible.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${salon.salonName} - Salon de tatouage à ${
    salon.city || "France"
  } | Inkera`;
  const description = `Découvrez ${salon.salonName}, salon de tatouage ${
    salon.city ? `à ${salon.city}` : "professionnel"
  }. ${
    salon.description
      ? salon.description.substring(0, 120) + "..."
      : "Consultez les portfolios, prestations et prenez rendez-vous."
  }`;

  const address = [salon.address, salon.postalCode, salon.city]
    .filter(Boolean)
    .join(", ");

  return {
    title,
    description,
    keywords: [
      "salon tatouage",
      salon.city ? `tatouage ${salon.city}` : "tatouage france",
      salon.salonName,
      "studio tatouage",
      "portfolio tatoueur",
      "piercing",
      "art corporel",
      salon.postalCode ? `tatouage ${salon.postalCode}` : "",
      "réservation tatouage",
    ].filter(Boolean),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: salon.image ? [salon.image] : undefined,
    },
    alternates: {
      canonical: `https://theinkera.com/salon/${resolvedParams.slug}/${resolvedParams.loc}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "business:contact_data:street_address": salon.address || "",
      "business:contact_data:locality": salon.city || "",
      "business:contact_data:postal_code": salon.postalCode || "",
      "business:contact_data:country_name": "France",
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
  const resolvedParams = await params;
  const { slug, loc } = resolvedParams;
  if (!slug || !loc) notFound();

  const salon = await getSalon(slug, loc);
  if (!salon) notFound();

  const role = typeof salon.role === "string" ? salon.role.toLowerCase() : "";
  const isSalonRole = role === "user_salon";
  const isTatoueurRole = role === "user_tatoueur";

  const tatoueurs: SalonTatoueur[] = Array.isArray(salon.Tatoueur)
    ? (salon.Tatoueur as SalonTatoueur[])
    : salon.Tatoueur
      ? [salon.Tatoueur as SalonTatoueur]
      : [];

  const sortedTatoueurs = [...tatoueurs].sort((a, b) => {
    const aLinked = a.isLinkedUser === true ? 1 : 0;
    const bLinked = b.isLinkedUser === true ? 1 : 0;
    return bLinked - aLinked;
  });

  const linkedProfileHref = (tatoueur: SalonTatoueur) => {
    if (tatoueur.isLinkedUser !== true || !tatoueur.profileUserId) return null;

    const nameSource =
      typeof tatoueur.salonName === "string" ? tatoueur.salonName.trim() : "";
    if (!nameSource) return null;

    const linkedCity =
      typeof tatoueur.city === "string" ? tatoueur.city.trim() : "";
    const linkedPostalCode =
      typeof tatoueur.postalCode === "string" ? tatoueur.postalCode.trim() : "";
    if (!linkedCity || !linkedPostalCode) return null;

    const nameSlug = toSlug(nameSource);

    const locSource = [linkedCity, linkedPostalCode].join("-");
    const locSlug = toSlug(locSource) || "localisation";

    if (!nameSlug) return null;
    return `/salon/${nameSlug}/${locSlug}`;
  };

  const shouldShowTeamSection =
    isSalonRole || (!isTatoueurRole && sortedTatoueurs.length > 0);

  const linkedSalons: LinkedSalonProps[] = Array.isArray(salon.linkedSalons)
    ? (salon.linkedSalons as LinkedSalonProps[])
    : [];

  const flashes = await getAvailableFlashes(salon.id);
  const isFree = salon.saasPlan === "FREE";

  const heroSrc = salon.image || null;
  const profileSrc = salon.profileImage || null;
  const rawHours = parseSalonHours(salon.salonHours as any);
  const hours = hoursToLines(rawHours);
  const openNow = getOpenNow(salon.salonHours);
  const isVerifiedSalon = salon.verifiedSalon === true;

  const mapsQuery = encodeURIComponent(
    [salon.address, salon.postalCode, salon.city].filter(Boolean).join(" "),
  );
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

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

  // Enhanced JSON-LD with more complete schema
  const ld = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "@id": `https://theinkera.com/salon/${slug}/${loc}`,
    name: salon.salonName,
    description:
      salon.description ||
      `Salon de tatouage professionnel ${
        salon.city ? `à ${salon.city}` : "en France"
      }`,
    url: `https://theinkera.com/salon/${slug}/${loc}`,
    image: salon.image || undefined,
    logo: salon.image || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address || "",
      addressLocality: salon.city || "",
      postalCode: salon.postalCode || "",
      addressCountry: "FR",
      addressRegion: "France",
    },
    geo: salon.city
      ? {
          "@type": "GeoCoordinates",
          address: `${salon.address || ""}, ${salon.city || ""}, ${
            salon.postalCode || ""
          }, France`,
        }
      : undefined,
    telephone: salon.phone || undefined,
    sameAs: [salon.instagram, salon.facebook, salon.tiktok].filter(Boolean),
    openingHoursSpecification: rawHours
      ? Object.entries(rawHours)
          .map(([day, hours]: [string, any]) => {
            if (!hours?.start || !hours?.end) return null;

            const dayMap: Record<string, string> = {
              monday: "Monday",
              tuesday: "Tuesday",
              wednesday: "Wednesday",
              thursday: "Thursday",
              friday: "Friday",
              saturday: "Saturday",
              sunday: "Sunday",
            };

            return {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: dayMap[day] || day,
              opens: hours.start,
              closes: hours.end,
            };
          })
          .filter(Boolean)
      : undefined,
    priceRange: "$$$",
    paymentAccepted: "Cash, Credit Card",
    currenciesAccepted: "EUR",
    hasOfferCatalog:
      prestations.length > 0
        ? {
            "@type": "OfferCatalog",
            name: "Services de tatouage",
            itemListElement: prestations
              .slice(0, 5)
              .map((prestation, index) => ({
                "@type": "Offer",
                name: prestation,
                category: "Tatouage",
                position: index + 1,
              })),
          }
        : undefined,
    // employee:
    //   salon.Tatoueur && salon.Tatoueur.length > 0
    //     ? salon.Tatoueur.map((tatoueur: any) => ({
    //         "@type": "Person",
    //         name: tatoueur.name,
    //         description:
    //           tatoueur.description ||
    //           `Tatoueur professionnel chez ${salon.salonName}`,
    //         image: tatoueur.img || undefined,
    //         sameAs: tatoueur.instagram ? [tatoueur.instagram] : undefined,
    //         knowsAbout: tatoueur.style || "Tatouage",
    //         hasOccupation: {
    //           "@type": "Occupation",
    //           name: "Tatoueur",
    //           occupationLocation: {
    //             "@type": "Place",
    //             name: salon.salonName,
    //           },
    //         },
    //       }))
    //     : undefined,
    // aggregateRating: salon.rating
    //   ? {
    //       "@type": "AggregateRating",
    //       ratingValue: salon.rating,
    //       ratingCount: salon.reviewCount || 1,
    //       bestRating: 5,
    //       worstRating: 1,
    //     }
    //   : undefined,
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://theinkera.com/salon/${slug}/${loc}/reserver`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: `Réservation chez ${salon.salonName}`,
      },
    },
  };

  //! --- helper pour afficher le téléphone plus lisible
  const formatPhone = (raw?: string | null) => {
    if (!raw) return "";
    const digits = String(raw).replace(/\D/g, "");
    const groups = digits.match(/.{1,2}/g) || [];
    return groups.join(" ");
  };

  const phoneDisplay = salon.phone ? formatPhone(salon.phone) : "";
  const phoneHref = salon.phone ? salon.phone.replace(/\D/g, "") : "";

  // Gestion des couleurs personnalisées
  const useCustomColors =
    salon.colorProfile &&
    salon.colorProfileBis &&
    salon.colorProfile !== "default" &&
    salon.colorProfileBis !== "default";

  const customStyle = useCustomColors
    ? ({
        "--color-tertiary-400": salon.colorProfile,
        "--color-tertiary-500": salon.colorProfileBis,
      } as React.CSSProperties)
    : {};

  return (
    <SalonProfileViewTracker
      salonId={salon.id}
      slug={resolvedParams.slug}
      loc={resolvedParams.loc}
    >
      <div
        className="min-h-screen bg-noir-700 pt-2"
        style={customStyle}
      >
      {/* CONTENT */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-16 py-6">
        {/* Mobile Hero */}
        <div className="mx-auto lg:hidden mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <div className="relative h-64 bg-linear-to-br from-noir-500 to-noir-700">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`${salon.salonName} - banniere`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              ) : profileSrc ? (
                <Image
                  src={profileSrc}
                  alt={`${salon.salonName} - photo de profil en arrière-plan`}
                  fill
                  sizes="100vw"
                  className="object-cover blur-2xl scale-110"
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
              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/80" />

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

              {/* Title + Profile overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-noir-700/80 shadow-lg backdrop-blur-sm">
                    {profileSrc ? (
                      <Image
                        src={profileSrc}
                        alt={`${salon.salonName} - photo de profil`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-white/60">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <h1 className="text-2xl font-one text-white tracking-wide drop-shadow-lg">
                        {salon.salonName}
                      </h1>
                      {isVerifiedSalon && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-one uppercase tracking-wide text-emerald-200">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Vérifié
                        </span>
                      )}
                    </div>
                    {openNow.today && (
                      <p className="text-white/80 text-xs font-one">
                        Aujourd&apos;hui: {openNow.today.start}–{openNow.today.end}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:order-2 lg:sticky lg:top-24 h-fit space-y-3">
            {/* Quick Actions */}
              <div className="flex items-center gap-2.5">
                <FavoriteBtn
                  salonId={salon.id}
                  variant="icon-only"
                  className="hover:scale-110"
                />

                {!isFree && (
                  <Link
                    href={`/salon/${resolvedParams.slug}/${resolvedParams.loc}/reserver`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-2.5 text-sm font-one transition-all duration-300 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 hover:-translate-y-0.5"
                    title="Réserver un rendez-vous avec ce salon"
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
                  </Link>
                )}

                <Link
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 group flex justify-center items-center gap-2 p-3 rounded-3xl bg-linear-to-br from-noir-500/8 to-white/2 hover:from-white/12 hover:to-white/6 text-white border border-white/20 hover:border-white/30 transition-all duration-300 text-sm tracking-widest font-one backdrop-blur-sm transform hover:scale-[1.02] ${
                    isFree ? "flex-1" : "flex-1"
                  }`}
                  title="Voir l'emplacement du salon sur Google Maps" 
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
                </Link>
              </div>

            {/* Contact Info */}
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500 to-white/2 p-5 backdrop-blur-lg shadow-xl">
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

              <div className="space-y-4 sm:flex sm:justify-between sm:gap-12 lg:flex-col lg:gap-0">
                <div className="flex flex-col justify-start gap-6">
                {salon.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-tertiary-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
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
                    <div className="">
                      <p className="text-white/90 font-one text-sm leading-relaxed">
                        {salon.address}
                        {salon.city && (
                          <>
                            {", "}
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
                    <div className="w-8 h-8 rounded-2xl bg-tertiary-500/30 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
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
                      href={`tel:${phoneHref}`}
                      className="text-white/90 font-one text-sm hover:text-tertiary-500 transition-colors"
                    >
                      {phoneDisplay}
                    </a>
                  </div>
                )}
                </div>

                {/* Social Media */}
                {(salon.instagram ||
                  salon.facebook ||
                  salon.tiktok ||
                  salon.website) && (
                  <div className="pt-2">
                    <p className="hidden lg:block text-white/70 font-one text-xs mb-3 uppercase tracking-wider">
                      Réseaux sociaux
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {salon.instagram && (
                        <Link
                          href={salon.instagram}
                          target="_blank"
                          className="group w-8 h-8 rounded-2xl bg-linear-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center hover:from-pink-500/30 hover:to-purple-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <CiInstagram className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                        </Link>
                      )}
                      {salon.facebook && (
                        <Link
                          href={salon.facebook}
                          target="_blank"
                          className="group w-8 h-8 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <CiFacebook className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </Link>
                      )}
                      {salon.tiktok && (
                        <Link
                          href={salon.tiktok}
                          target="_blank"
                          className="group w-8 h-8 rounded-2xl bg-linear-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 flex items-center justify-center hover:from-gray-500/30 hover:to-gray-600/30 hover:border-gray-400/50 transition-all duration-300 transform hover:scale-110"
                        >
                          <PiTiktokLogoThin className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                        </Link>
                      )}
                      {salon.website && (
                        <Link
                          href={salon.website}
                          target="_blank"
                          className="group w-8 h-8 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center hover:from-emerald-500/30 hover:to-emerald-600/30 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-110"
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
            <HoursCard hours={hours} todayFR={todayFR} openNow={openNow} />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 lg:order-1 space-y-6">
            {/* Desktop Hero */}
            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <div className="relative h-80 lg:h-96 bg-linear-to-br from-noir-500 to-noir-700">
                  {heroSrc ? (
                    <Image
                      src={heroSrc}
                      alt={`${salon.salonName} - banniere`}
                      fill
                      sizes="(min-width:1024px) 66vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : profileSrc ? (
                    <Image
                      src={profileSrc}
                      alt={`${salon.salonName} - photo de profil en arrière-plan`}
                      fill
                      sizes="(min-width:1024px) 66vw, 100vw"
                      className="object-cover blur-2xl scale-110"
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
                  <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/80" />

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

                  {/* Title + Profile overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end gap-4">
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-white/10 bg-noir-700/80 shadow-lg backdrop-blur-sm">
                        {profileSrc ? (
                          <Image
                            src={profileSrc}
                            alt={`${salon.salonName} - photo de profil`}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-white/60">
                            <svg
                              className="h-7 w-7"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h1 className="text-3xl lg:text-4xl font-one text-white tracking-wide drop-shadow-lg">
                            {salon.salonName}
                          </h1>
                          {isVerifiedSalon && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-one uppercase tracking-wide text-emerald-200">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Vérifié
                            </span>
                          )}
                        </div>
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
              </div>
            </div>

            {/* Présentation */}
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500 to-noir-700 p-6 backdrop-blur-lg shadow-xl">
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
                          className="px-3 py-1 rounded-2xl bg-linear-to-br from-noir-500/8 to-noir-700/2 text-white/80 border border-white/10 text-xs font-one backdrop-blur-sm"
                          title={p}
                        >
                          {p}
                        </span>
                      ))}
                      {prestationsRestantes > 0 && (
                        <span className="px-3 py-1 rounded-2xl bg-linear-to-br from-noir-500/8 to-noir-700/2 text-white/80 border border-white/10 text-xs font-one backdrop-blur-sm">
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
              flashes={flashes}
              salonName={salon.salonName}
              bookingPath={`/salon/${resolvedParams.slug}/${resolvedParams.loc}/reserver`}
              canBookFlashes={!isFree}
              tatoueurs={sortedTatoueurs.map((t) => ({ id: t.id, name: t.name }))}
            />

            {/* Équipe */}
            {shouldShowTeamSection && sortedTatoueurs.length > 0 && (
              <section className="">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white/95 font-one text-md tracking-wider uppercase">
                    L&apos;équipe
                  </h3>
                  <span className="text-white/60 font-one text-sm">
                    {sortedTatoueurs.length}{" "}
                    {sortedTatoueurs.length > 1 ? "tatoueurs" : "tatoueur"}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 gap-5 ${
                    sortedTatoueurs.length > 1
                      ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                      : ""
                  }`}
                >
                  {sortedTatoueurs.map((t) => (
                    <div key={t.id}>
                      <TeamCard
                        name={t.name}
                        img={t.img}
                        description={t.description}
                        instagram={t.instagram}
                        style={t.style}
                        skills={t.skills}
                        isLinkedUser={t.isLinkedUser}
                        profileUserId={t.profileUserId}
                        profileHref={linkedProfileHref(t)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Salons liés (tatoueur) */}
            {isTatoueurRole && linkedSalons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white/95 font-one text-md tracking-wider uppercase">
                    Salons liés
                  </h3>
                  <span className="text-white/60 font-one text-sm">
                    {linkedSalons.length}{" "}
                    {linkedSalons.length > 1 ? "salons" : "salon"}
                  </span>
                </div>

                <ul
                  className={`grid grid-cols-1 gap-5 ${
                    linkedSalons.length > 1
                      ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                      : ""
                  }`}
                >
                  {linkedSalons.map((ls) => (
                    <LinkedSalonCard key={ls.id} salon={ls} />
                  ))}
                </ul>
              </section>
            )}

            {/* Avis */}
            <SalonReviews salonId={salon.id} salonName={salon.salonName} />
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
    </SalonProfileViewTracker>
  );
}
