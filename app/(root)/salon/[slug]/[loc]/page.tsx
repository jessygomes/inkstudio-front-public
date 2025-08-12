/* eslint-disable @typescript-eslint/no-explicit-any */
import SalonTabs from "@/components/ProfilSalon/SalonTabs";
import { TeamCard } from "@/components/ProfilSalon/TeamCard";
import { hoursToLines, parseSalonHours } from "@/lib/horaireHelper";
import { SalonProfilProps } from "@/lib/type";
import Image from "next/image";
import { notFound } from "next/navigation";
import Script from "next/script";

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

// --- small helpers
function socialLink(href?: string | null, label?: string) {
  if (!href) return null;
  try {
    const url = new URL(href);
    return (
      <a
        href={url.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition font-var(--font-one) text-xs"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-tertiary-400" />
        {label ?? url.hostname.replace("www.", "")}
      </a>
    );
  } catch {
    return null;
  }
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

  console.log(salon);

  return (
    <div className="min-h-screen bg-noir-700 sm:px-8 lg:px-20 pt-24">
      {/* CONTENT */}
      <section className="relative z-10 px-4 py-10 md:-mt-10 ">
        <div className="mx-auto sm:hidden mb-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="relative h-[300px] md:h-[420px] bg-black/30">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`${salon.salonName} - photo de profil`}
                  fill
                  sizes="(min-width:1280px) 900px, (min-width:768px) 70vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-white/60 text-sm">
                  Aucune image disponible
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/85 text-[11px] font-one">
                    {salon.city ?? "Ville inconnue"}
                    {salon.postalCode ? (
                      <span className="opacity-60">• {salon.postalCode}</span>
                    ) : null}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-var(--font-one) border ${
                      openNow.open
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/15 text-red-300 border-red-500/30"
                    }`}
                    title={
                      openNow.today
                        ? `${openNow.today.start}–${openNow.today.end}`
                        : "Aucun horaire pour aujourd’hui"
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        openNow.open ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {openNow.open ? "Ouvert maintenant" : "Fermé"}
                    {openNow.today
                      ? ` • ${openNow.today.start}–${openNow.today.end}`
                      : ""}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-var(--font-one) text-white tracking-[0.14em] drop-shadow">
                  {salon.salonName}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aside (sticky) */}
          <aside className="space-y-4 md:order-2 md:sticky md:top-24 h-fit">
            {/* Infos */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
              <h3 className="text-white/95 text-xs font-var(--font-one) tracking-[0.22em] uppercase mb-4">
                Informations
              </h3>

              <ul className="space-y-3 text-sm">
                {salon.address && (
                  <li className="flex items-center gap-3 font-var(--font-one)">
                    <span
                      aria-hidden
                      className="mt-1 h-2 w-2 rounded-full bg-tertiary-400/80"
                    />
                    <p className="text-white/85">
                      {salon.address}
                      {salon.city ? `, ${salon.city}` : ""}{" "}
                      {salon.postalCode ? salon.postalCode : ""}
                    </p>
                  </li>
                )}
                {salon.phone && (
                  <li className="flex items-center gap-3 font-var(--font-one) tracking-widest">
                    <span
                      aria-hidden
                      className="mt-1 h-2 w-2 rounded-full bg-tertiary-400/80"
                    />
                    <p className="text-white/80">{salon.phone}</p>
                  </li>
                )}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {socialLink(salon.website, "Site web")}
                {socialLink(salon.instagram, "Instagram")}
                {socialLink(salon.facebook, "Facebook")}
                {socialLink(salon.tiktok, "TikTok")}
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium font-var(--font-one) text-xs shadow-lg"
                >
                  Itinéraire
                </a>
                <a
                  href={`/salon/${params.slug}/${params.loc}/reserver`}
                  className="cursor-pointer flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-xs font-var(--font-one)"
                >
                  Prendre RDV
                </a>
              </div>
            </div>

            {/* Horaires */}
            {hours.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <h3 className="text-white/95 font-var(--font-one) text-xs tracking-[0.22em] uppercase mb-4">
                  Horaires
                </h3>
                <ul className="space-y-1.5">
                  {hours.map((h) => {
                    const isToday = h.day.toLowerCase() === todayFR; // ex: "lundi", "dimanche"
                    return (
                      <li
                        key={h.day}
                        className={`flex items-center justify-between text-sm rounded-xl px-4 py-1 font-var(--font-one) ${
                          isToday
                            ? "bg-white/[0.07] border border-white/10"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-white/75 font-var(--font-one) ${
                            isToday ? "font-medium" : ""
                          }`}
                        >
                          {h.day}
                        </span>
                        <span className="text-white/90 font-var(--font-one)">
                          {h.value}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          {/* Col principale */}
          <div className="md:col-span-2 space-y-6 md:order-1">
            {/* HERO (photo de profil) */}
            <div className="mx-auto hidden sm:block">
              <div className="relative overflow-hidden rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="relative h-[300px] md:h-[420px] bg-black/30">
                  {heroSrc ? (
                    <Image
                      src={heroSrc}
                      alt={`${salon.salonName} - photo de profil`}
                      fill
                      sizes="(min-width:1280px) 900px, (min-width:768px) 70vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-white/60 text-sm">
                      Aucune image disponible
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/85 text-[11px] font-var(--font-one)">
                        {salon.city ?? "Ville inconnue"}
                        {salon.postalCode ? (
                          <span className="opacity-60">
                            • {salon.postalCode}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-var(--font-one) border ${
                          openNow.open
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/15 text-red-300 border-red-500/30"
                        }`}
                        title={
                          openNow.today
                            ? `${openNow.today.start}–${openNow.today.end}`
                            : "Aucun horaire pour aujourd’hui"
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full font-var(--font-one) ${
                            openNow.open ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {openNow.open ? "Ouvert maintenant" : "Fermé"}
                        {openNow.today
                          ? ` • ${openNow.today.start}–${openNow.today.end}`
                          : ""}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-var(--font-one) text-white tracking-[0.14em] drop-shadow">
                      {salon.salonName}
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Présentation */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/95 font-var(--font-one) text-xs tracking-[0.22em] uppercase">
                  Présentation
                </h2>
              </div>
              <p className="text-white/80 text-sm font-var(--font-one) leading-relaxed">
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
              <section className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/95 font-var(--font-one) text-xs tracking-[0.22em] uppercase">
                    L’équipe
                  </h3>
                  <span className="text-white/55 font-var(--font-one) text-[11px]">
                    {salon.Tatoueur.length}{" "}
                    {salon.Tatoueur.length > 1 ? "tatoueurs" : "tatoueur"}
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salon.Tatoueur.map((t: any) => (
                    <TeamCard
                      key={t.id}
                      name={t.name}
                      img={t.img}
                      description={t.description}
                      instagram={t.instagram}
                      phone={t.phone}
                    />
                  ))}
                </ul>
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
