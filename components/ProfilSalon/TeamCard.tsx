"use client";
import Image from "next/image";
import { useState } from "react";

export function TeamCard({
  name,
  img,
  description,
  instagram,
  skills,
  style,
}: {
  name: string;
  img?: string | null;
  description?: string | null;
  instagram?: string | null;
  phone?: string | null;
  skills?: string[] | null;
  style?: string[] | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const instaUrl = instagram
    ? instagram.startsWith("http")
      ? instagram
      : `https://instagram.com/${instagram.replace(/^@/, "")}`
    : null;

  // -- Styles (chips)
  const cleaned = (style ?? [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of cleaned) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }
  const MAX = 8;
  const styleChips = unique.slice(0, MAX);
  const remainingCount = unique.length > MAX ? unique.length - MAX : 0;

  // -- Skills (chips)
  const cleanedSkills = (skills ?? [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  const seenSkills = new Set<string>();
  const uniqueSkills: string[] = [];
  for (const s of cleanedSkills) {
    const key = s.toLowerCase();
    if (!seenSkills.has(key)) {
      seenSkills.add(key);
      uniqueSkills.push(s);
    }
  }
  const skillChips = uniqueSkills.slice(0, MAX);
  const remainingSkillsCount =
    uniqueSkills.length > MAX ? uniqueSkills.length - MAX : 0;

  return (
    <li className="group relative list-none overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-noir-500/8 to-white/2 p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-tertiary-400/35 lg:h-full lg:min-h-88">
      {/* Header */}
      <div className="relative -mx-3.5 -mt-3.5 mb-3 flex sm:flex-col items-center gap-3.5 rounded-none px-3.5 py-4 sm:-mx-4 sm:-mt-4 sm:px-4 sm:py-5 lg:mb-4 lg:min-h-64 lg:justify-center lg:rounded-t-3xl lg:py-8">
        {img ? (
          <>
            <div className="pointer-events-none absolute inset-0">
              <Image
                src={img}
                alt=""
                fill
                className="object-cover blur-lg scale-100 sm:scale-105 opacity-60"
                aria-hidden
              />
            </div>
            {/* <div className="pointer-events-none absolute inset-0 bg-noir-700/45 lg:bg-noir-700/55" /> */}
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/8 to-white/2" />
        )}

        <div className="relative z-10 h-18 w-18 sm:h-40 sm:w-40 shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-white/10">
          {img ? (
            <Image
              src={img}
              alt={name}
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
            {name}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55 font-one">
            Artiste du salon
          </p>
        </div>

        {/* Bouton d'expansion (mobile et tablette) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isExpanded ? "Réduire" : "Développer"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Contenu dépliable (caché sur mobile/tablette si non étendu) */}
      <div className={`${isExpanded ? "flex" : "hidden"} lg:flex mt-3 flex-1 flex-col`}>
        <div className="min-h-14">
          {description ? (
            <p className="text-white/80 text-xs leading-5 whitespace-pre-line line-clamp-3 font-one">
              {description}
            </p>
          ) : (
            <p className="text-white/45 text-xs leading-5 font-one">
              Description non renseignée.
            </p>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/2 p-2.5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60 font-one">
              Styles
            </p>
            {styleChips.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {styleChips.map((s, i) => (
                  <span
                    key={`style-${s}-${i}`}
                    className="rounded-full border border-tertiary-500/20 bg-tertiary-500/10 px-2 py-0.5 text-[11px] text-tertiary-300 font-one"
                    title={s}
                  >
                    {s}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="rounded-full border border-tertiary-500/20 bg-tertiary-500/10 px-2 py-0.5 text-[11px] text-tertiary-300 font-one">
                    +{remainingCount}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-white/50 font-one">Non renseignés</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/2 p-2.5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60 font-one">
              Compétences
            </p>
            {skillChips.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skillChips.map((s, i) => (
                  <span
                    key={`skill-${s}-${i}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80 font-one"
                    title={s}
                  >
                    {s}
                  </span>
                ))}
                {remainingSkillsCount > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80 font-one">
                    +{remainingSkillsCount}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-white/50 font-one">Non renseignées</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <p className="text-xs text-white/55 font-one">Profil artiste</p>
            {instaUrl ? (
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/25 transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 hover:shadow-tertiary-500/40 hover:-translate-y-0.5"
                title="Instagram"
                aria-label={`Instagram de ${name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 0 0 0-5.6ZM18.5 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2Z"
                  />
                </svg>
              </a>
            ) : (
              <span className="text-[11px] text-white/35 font-one">Sans Instagram</span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
