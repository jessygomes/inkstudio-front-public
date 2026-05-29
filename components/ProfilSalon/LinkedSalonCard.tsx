"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CiInstagram } from "react-icons/ci";
import { TfiWorld } from "react-icons/tfi";
import { LinkedSalonProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";

function buildSalonHref(salon: LinkedSalonProps): string | null {
  const nameSlug = toSlug(salon.salonName ?? "");
  const locSource = [salon.city, salon.postalCode]
    .filter((v) => typeof v === "string" && v.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";
  if (!nameSlug) return null;
  return `/salon/${nameSlug}/${locSlug}`;
}

export function LinkedSalonCard({ salon }: { salon: LinkedSalonProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const salonHref = buildSalonHref(salon);

  const instaUrl = salon.instagram
    ? salon.instagram.startsWith("http")
      ? salon.instagram
      : `https://instagram.com/${salon.instagram.replace(/^@/, "")}`
    : null;

  const imgSrc = salon.profileImage ?? salon.image ?? null;

  // Prestations (dédupliquées)
  const prestCleaned = (salon.prestations ?? [])
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  const prestSeen = new Set<string>();
  const prestUnique: string[] = [];
  for (const p of prestCleaned) {
    if (!prestSeen.has(p.toLowerCase())) {
      prestSeen.add(p.toLowerCase());
      prestUnique.push(p);
    }
  }
  const MAX = 8;
  const prestChips = prestUnique.slice(0, MAX);
  const prestRemaining = prestUnique.length > MAX ? prestUnique.length - MAX : 0;

  return (
    <li className="group relative list-none overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-noir-500/8 to-white/2 p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-tertiary-400/35 lg:h-full lg:min-h-88">
      {/* Header */}
      <div className="relative -mx-3.5 -mt-3.5 mb-3 flex sm:flex-col items-center gap-3.5 rounded-none px-3.5 py-4 sm:-mx-4 sm:-mt-4 sm:px-4 sm:py-5 lg:mb-4 lg:min-h-64 lg:justify-center lg:rounded-t-3xl lg:py-8">
        {imgSrc ? (
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={imgSrc}
              alt=""
              fill
              className="object-cover blur-lg scale-100 sm:scale-105 opacity-60"
              aria-hidden
            />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/8 to-white/2" />
        )}

        <div className="relative z-10 h-18 w-18 sm:h-40 sm:w-40 shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-white/10">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={salon.salonName ?? "Salon"}
              fill
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-white/40 text-xs font-one">
              N/A
            </div>
          )}
        </div>

        <div className="relative z-10 min-w-0 flex-1 h-18 sm:h-20 flex flex-col justify-center lg:h-auto sm:text-center">
          <p className="text-white text-sm sm:text-base leading-tight tracking-widest font-one font-semibold wrap-break-word">
            {salon.salonName ?? "Salon sans nom"}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55 font-one">
            {salon.isCurrentSalon ? "Salon actuel" : "Salon associé"}
          </p>
          {(salon.city || salon.postalCode) && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/60 font-one sm:justify-center">
              <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {[salon.city, salon.postalCode].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        {/* Bouton expansion mobile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isExpanded ? "Réduire" : "Développer"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Contenu dépliable */}
      <div className={`${isExpanded ? "flex" : "hidden"} lg:flex mt-3 flex-1 flex-col`}>
        {(salon.address || salon.city || salon.postalCode) && (
          <div className="mb-3 flex items-start gap-2 text-white/70 text-xs font-one">
            <svg className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>
              {[
                salon.address,
                [salon.postalCode, salon.city].filter(Boolean).join(" "),
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {/* Prestations */}
        <div className="rounded-2xl border border-white/10 bg-white/2 p-2.5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60 font-one">
            Prestations
          </p>
          {prestChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {prestChips.map((p, i) => (
                <span
                  key={`prest-${p}-${i}`}
                  className="rounded-full border border-tertiary-500/20 bg-tertiary-500/10 px-2 py-0.5 text-[11px] text-tertiary-300 font-one"
                  title={p}
                >
                  {p}
                </span>
              ))}
              {prestRemaining > 0 && (
                <span className="rounded-full border border-tertiary-500/20 bg-tertiary-500/10 px-2 py-0.5 text-[11px] text-tertiary-300 font-one">
                  +{prestRemaining}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-white/50 font-one">Non renseignées</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <p className="text-xs text-white/55 font-one">Salon</p>
            <div className="flex items-center gap-2">
              {salonHref && (
                <Link
                  href={salonHref}
                  className="inline-flex h-7 items-center justify-center rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-3 text-[11px] text-white font-one shadow-lg shadow-tertiary-500/25 transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 hover:-translate-y-0.5"
                  title="Voir le profil du salon"
                >
                  Voir le salon
                </Link>
              )}

              {salon.website && (
                <a
                  href={salon.website.startsWith("http") ? salon.website : `https://${salon.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:border-emerald-400/50 hover:text-emerald-300 hover:scale-110"
                  title="Site web"
                >
                  <TfiWorld className="h-3.5 w-3.5" />
                </a>
              )}

              {instaUrl && (
                <a
                  href={instaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-linear-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 transition-all duration-300 hover:border-pink-400/50 hover:text-pink-300 hover:scale-110"
                  title="Instagram"
                  aria-label={`Instagram de ${salon.salonName}`}
                >
                  <CiInstagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
