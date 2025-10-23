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
    <li className="group relative rounded-xl border border-white/10 bg-white/[0.06] p-5 hover:bg-white/[0.1] transition-colors list-none">
      {/* Header */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl" />
          <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden ring-1 ring-white/15 bg-white/10">
            {img ? (
              <Image
                src={img}
                alt={name}
                fill
                sizes="112px"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                N/A
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-white/95 font-var(--font-one) text-sm leading-6">
            {name}
          </p>

          {/* Meta: uniquement Instagram */}
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 underline-offset-2 hover:underline"
              title="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden
                className="opacity-85 text-white hover:text-white/50 transition-colors"
              >
                <path
                  fill="currentColor"
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 0 0 0-5.6ZM18.5 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2Z"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Bouton d'expansion (mobile et tablette) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          aria-label={isExpanded ? "Réduire" : "Développer"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
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
      <div className={`${isExpanded ? "block" : "hidden"} lg:block`}>
        {/* Description */}
        {description && (
          <p className="mt-4 text-white/80 font-var(--font-one) text-xs leading-7 whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Styles et Skills */}
        <div className="mt-4 space-y-3">
          {/* Styles */}
          {styleChips.length > 0 ? (
            <div>
              <p className="text-[10px] text-white/60 font-var(--font-one) uppercase tracking-wider mb-2">
                Styles
              </p>
              <div className="flex flex-wrap gap-2">
                {styleChips.map((s, i) => (
                  <span
                    key={`style-${s}-${i}`}
                    className="px-2.5 py-1 rounded-full bg-tertiary-500/10 text-tertiary-300 border border-tertiary-500/20 text-[11px] font-var(--font-one)"
                    title={s}
                  >
                    {s}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-tertiary-500/10 text-tertiary-300 border border-tertiary-500/20 text-[11px] font-var(--font-one)">
                    +{remainingCount}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-white/60 font-var(--font-one) uppercase tracking-wider mb-2">
                Styles
              </p>
              <div className="text-[11px] text-white/50 font-var(--font-one)">
                Non renseignés
              </div>
            </div>
          )}

          {/* Skills */}
          {skillChips.length > 0 ? (
            <div>
              <p className="text-[10px] text-white/60 font-var(--font-one) uppercase tracking-wider mb-2">
                Compétences
              </p>
              <div className="flex flex-wrap gap-2">
                {skillChips.map((s, i) => (
                  <span
                    key={`skill-${s}-${i}`}
                    className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 text-[11px] font-var(--font-one)"
                    title={s}
                  >
                    {s}
                  </span>
                ))}
                {remainingSkillsCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 text-[11px] font-var(--font-one)">
                    +{remainingSkillsCount}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-white/60 font-var(--font-one) uppercase tracking-wider mb-2">
                Compétences
              </p>
              <div className="text-[11px] text-white/50 font-var(--font-one)">
                Non renseignées
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="text-xs text-white/50 font-var(--font-one">
            Profil artiste
          </div>
        </div>
      </div>
    </li>
  );
}
