/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import SalonPresentation from "@/components/ProfilSalon/SalonPresentation";
import SalonPracticalInfo from "@/components/ProfilSalon/SalonPracticalInfo";
import SalonTabs from "@/components/ProfilSalon/SalonTabs";
import AppButton from "@/components/Shared/AppButton";
import DesktopSalonHeader from "@/components/ProfilSalon/DesktopSalonHeader";
import SalonSectionNav from "@/components/ProfilSalon/SalonSectionNav";
import { TeamCard } from "@/components/ProfilSalon/TeamCard";
import { LinkedSalonCard } from "@/components/ProfilSalon/LinkedSalonCard";
import { hoursToLines, parseSalonHours } from "@/lib/horaireHelper";
import { FlashProps, LinkedSalonProps, SalonProfilProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import { getSearchReturnHref } from "@/lib/utils/searchReturn";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Metadata } from "next";

import HoursCard from "@/components/ProfilSalon/HoursCard";
import SalonReviews from "@/components/ProfilSalon/SalonReviews";
import { SalonProfileViewTracker } from "@/components/Shared/SalonProfileViewTracker";
import PublicProfileContactForm from "@/components/Contact/PublicProfileContactForm";
import StartInkeraConversationButton from "@/components/Contact/StartInkeraConversationButton";

type PageParams = {
  params: Promise<{ slug: string; loc: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

//! --- data
async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc,
  )}`;
  const res = await fetch(url, { cache: "no-store" });
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

  const title = `${salon.displayName || salon.salonName} - Salon de tatouage à ${
    salon.city || "France"
  } | Inkera`;
  const description = `Découvrez ${salon.displayName || salon.salonName}, salon de tatouage ${
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


//! PAGE
export default async function ProfilPublicSalonPage({ params, searchParams }: PageParams) {
  const previousSearch = getSearchReturnHref((await searchParams)?.returnTo);
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

  const getTatoueurDisplayName = (tatoueur: SalonTatoueur) => {
    if (tatoueur.isLinkedUser === true) {
      const linkedSalonName =
        typeof tatoueur.salonName === "string" ? tatoueur.salonName.trim() : "";
      if (linkedSalonName) return linkedSalonName;
    }

    return tatoueur.name;
  };

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
  const canBookAppointments = !isFree || (isTatoueurRole && linkedSalons.some(venue => venue.publicBookingEnabled));

  const heroSrc = salon.image || null;
  const profileSrc = salon.profileImage || null;
  const rawHours = parseSalonHours(salon.salonHours as any);
  const hours = hoursToLines(rawHours);
  const todayFR = todayLabelFR();
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

  // Styles (dedupliques, insensibles a la casse) — compat `style` ou `styles`
  const stylesRaw =
    (Array.isArray((salon as any).style) && (salon as any).style) ||
    (Array.isArray((salon as any).styles) && (salon as any).styles) ||
    [];

  const stylesCleaned = stylesRaw
    .map((s: unknown) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  const styleSeen = new Set<string>();
  const styles: string[] = [];
  for (const s of stylesCleaned) {
    const key = s.toLowerCase();
    if (!styleSeen.has(key)) {
      styleSeen.add(key);
      styles.push(s);
    }
  }

  // Enhanced JSON-LD with more complete schema
  const ld = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    "@id": `https://theinkera.com/salon/${slug}/${loc}`,
    name: salon.displayName || salon.salonName,
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
    //           `Tatoueur professionnel chez ${salon.displayName || salon.salonName}`,
    //         image: tatoueur.img || undefined,
    //         sameAs: tatoueur.instagram ? [tatoueur.instagram] : undefined,
    //         knowsAbout: tatoueur.style || "Tatouage",
    //         hasOccupation: {
    //           "@type": "Occupation",
    //           name: "Tatoueur",
    //           occupationLocation: {
    //             "@type": "Place",
    //             name: salon.displayName || salon.salonName,
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
        name: `Réservation chez ${salon.displayName || salon.salonName}`,
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
        className="min-h-screen bg-noir-800 font-one pb-8 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-tertiary-400 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-tertiary-400"
        style={customStyle}
      >

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:max-w-none lg:px-8 lg:py-10 xl:px-16">
        <Link href={previousSearch} className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm text-white/65 transition hover:text-white">
          <ArrowLeft size={16} /> {previousSearch.includes("?") ? "Retour aux résultats" : "Tous les salons"}
        </Link>
        <DesktopSalonHeader variant="mobile" salonId={salon.id} name={salon.displayName || salon.salonName} cover={heroSrc} portrait={profileSrc} city={salon.city} postalCode={salon.postalCode} verified={isVerifiedSalon} artist={isTatoueurRole} hasHours={hours.length > 0} open={openNow.open} today={openNow.today} bookingHref={!canBookAppointments ? "#contact" : "/salon/" + slug + "/" + loc + "/reserver"} canBook={canBookAppointments} />
        <SalonSectionNav showTeam={shouldShowTeamSection && sortedTatoueurs.length > 0} className="my-6 lg:hidden" />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-8">
          <aside id="informations" className="order-2 min-w-0 scroll-mt-28 space-y-4 lg:sticky lg:top-24">
            <section aria-label="Votre prochain projet" className="rounded-2xl border border-tertiary-400/20 bg-linear-to-br from-tertiary-400/10 via-tertiary-500/5 to-noir-800 p-4">
              <div className="mb-3 flex items-start gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><CalendarDays size={15} aria-hidden="true" /></span><div className="min-w-0"><h2 className="text-sm font-medium leading-5 text-white/90">Votre prochain projet commence ici</h2><p className="mt-1 text-[11px] leading-5 text-white/40">Une idée ? Échangez avec {salon.displayName || salon.salonName}.</p></div></div>
              <div className="space-y-2"><AppButton href={!canBookAppointments ? "#contact" : "/salon/" + slug + "/" + loc + "/reserver"} variant="primary" fullWidth className="min-h-9! px-3! py-2! text-xs! shadow-none! hover:translate-y-0!">{!canBookAppointments ? "Contacter le salon" : "Prendre rendez-vous"}<ArrowUpRight size={14} /></AppButton>
                {!isFree && <StartInkeraConversationButton variant="compact" targetUserId={salon.id} recipientName={salon.displayName || salon.salonName || "ce tatoueur"} className="min-h-9! px-3! py-2! text-xs! shadow-none!" />}
              </div>
              {!isFree && <a href="#contact" className="mt-2 flex items-center justify-center gap-1 py-1 text-[11px] text-white/40 transition hover:text-white">Poser une question<ArrowUpRight size={11} /></a>}
            </section>
            <SalonPracticalInfo
              address={salon.address}
              city={salon.city}
              postalCode={salon.postalCode}
              phone={salon.phone}
              phoneDisplay={phoneDisplay}
              directionsHref={directionsHref}
              instagram={salon.instagram}
              facebook={salon.facebook}
              tiktok={salon.tiktok}
              website={salon.website}
            />
            {/* Horaires */}
            <HoursCard hours={hours} todayFR={todayFR} openNow={openNow} />
          </aside>

          {/* Main Content */}
          <div className="order-1 min-w-0 space-y-8">
            <DesktopSalonHeader
              salonId={salon.id}
              name={salon.displayName || salon.salonName}
              cover={heroSrc}
              portrait={profileSrc}
              city={salon.city}
              postalCode={salon.postalCode}
              verified={isVerifiedSalon}
              artist={isTatoueurRole}
              hasHours={hours.length > 0}
              open={openNow.open}
              today={openNow.today}
            />
            <SalonSectionNav showTeam={shouldShowTeamSection && sortedTatoueurs.length > 0} className="hidden lg:flex" />
            <SalonPresentation description={salon.description} prestations={prestations} styles={styles} />

            {/* Tabs : Photos → Portfolio → Produits */}
            <SalonTabs
              photos={salon.salonPhotos ?? []}
              portfolio={salon.Portfolio ?? []}
              products={salon.ProductSalon ?? []}
              flashes={flashes}
              salonName={salon.displayName || salon.salonName}
              salonUserId={salon.id}
              bookingPath={`/salon/${resolvedParams.slug}/${resolvedParams.loc}/reserver`}
              canBookFlashes={canBookAppointments}
              tatoueurs={sortedTatoueurs.map((t) => ({
                id: t.id,
                name: getTatoueurDisplayName(t),
              }))}
            />

            {/* Équipe */}
            {shouldShowTeamSection && sortedTatoueurs.length > 0 && (
              <section id="equipe" className="scroll-mt-28">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white/95 font-one text-xl">
                    Les artistes du salon
                  </h3>
                  <span className="text-white/60 font-one text-sm">
                    {sortedTatoueurs.length}{" "}
                    {sortedTatoueurs.length > 1 ? "tatoueurs" : "tatoueur"}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 gap-4 ${
                    sortedTatoueurs.length > 1
                      ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                      : ""
                  }`}
                >
                  {sortedTatoueurs.map((t) => (
                    <div key={t.id}>
                      <TeamCard
                        name={getTatoueurDisplayName(t)}
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
                  className={`grid grid-cols-1 gap-5 lg:auto-rows-fr ${
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
            <section id="avis" className="scroll-mt-28"><SalonReviews salonId={salon.id} salonName={salon.displayName || salon.salonName} /></section>

            <section id="contact" className="scroll-mt-28">
            <PublicProfileContactForm
              messagingEnabled={!isFree}
              targetUserId={salon.id}
              recipientName={salon.displayName || salon.salonName || "ce profil"}
            />
            </section>
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
