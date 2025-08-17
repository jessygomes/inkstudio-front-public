/* eslint-disable @typescript-eslint/no-explicit-any */
import { SalonProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export function SalonCard({ salon }: { salon: SalonProps }) {
  //! Images : photo salon + photos tatoueurs
  const images = useMemo(() => {
    const list = Array.isArray(salon.Tatoueur)
      ? salon.Tatoueur
      : salon.Tatoueur
      ? [salon.Tatoueur]
      : [];
    const tattooerImages = list.map((t) => t?.img).filter(Boolean);
    return [salon.image, ...tattooerImages].filter(Boolean) as string[];
  }, [salon.image, salon.Tatoueur]);

  const [current, setCurrent] = useState(0);
  const hasImages = images.length > 0;

  const FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'><rect width='400' height='240' fill='%231a1a1a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff88' font-family='sans-serif' font-size='18'>Aucune image</text></svg>`
    );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasImages) return;
    if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
    if (e.key === "ArrowLeft")
      setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  //! URL lisible
  const nameSlug = toSlug(salon.salonName || "salon");
  const locSource = [salon.city, salon.postalCode]
    .filter((v) => typeof v === "string" && v.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";
  const salonHref = `/salon/${nameSlug}/${locSlug}`;

  //! Liste tatoueurs (uniformiser tableau / objet)
  const tattooers = useMemo(() => {
    return Array.isArray(salon.Tatoueur)
      ? salon.Tatoueur
      : salon.Tatoueur
      ? [salon.Tatoueur]
      : [];
  }, [salon.Tatoueur]);

  //! Agrégation des styles (dédupliqués, insensible à la casse)
  const { styleChips, remainingCount } = useMemo(() => {
    const all = tattooers.flatMap((t) =>
      Array.isArray(t?.style) ? t.style : []
    );
    const cleaned = all
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

    const MAX = 4;
    return {
      styleChips: unique.slice(0, MAX),
      remainingCount: unique.length > MAX ? unique.length - MAX : 0,
    };
  }, [tattooers]);

  //! Prestations (dédupliquées, insensible à la casse)
  const { prestationChips, prestationRemaining } = useMemo(() => {
    // Compat: accepte salon.prestations OU salon.prestation
    const raw =
      (Array.isArray((salon as any).prestations) &&
        (salon as any).prestations) ||
      (Array.isArray((salon as any).prestation) && (salon as any).prestation) ||
      [];
    const cleaned = raw
      .map((p: unknown) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const p of cleaned) {
      const key = p.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }

    const MAX = 4;
    return {
      prestationChips: unique.slice(0, MAX),
      prestationRemaining: unique.length > MAX ? unique.length - MAX : 0,
    };
  }, [salon]);

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden shadow-2xl bg-[var(--color-noir-500)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-noir-500)]/60 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] focus-within:ring-2 focus-within:ring-white/30"
      tabIndex={-1}
    >
      {/* Media */}
      <div
        className="relative h-48 w-full overflow-hidden outline-none"
        role="button"
        tabIndex={0}
        aria-label="Changer l'image"
        onKeyDown={onKeyDown}
      >
        <Image
          src={hasImages ? images[current] : FALLBACK}
          alt={salon.salonName}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-noir-700)]/80 via-transparent to-transparent" />

        {salon.city && (
          <span className="absolute top-3 right-3 px-4 py-1 rounded-lg text-xs font-var(--font-one) tracking-widest text-white shadow-lg bg-gradient-to-br from-[var(--color-tertiary-400)] to-[var(--color-tertiary-500)]">
            {salon.city}
          </span>
        )}

        {hasImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Voir image ${idx + 1}`}
                className={`h-2.5 w-2.5 rounded-full border border-white/20 transition${
                  current === idx
                    ? "scale-110 bg-[var(--color-tertiary-400)]"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 sm:p-5">
        <h3 className="text-white text-xl sm:text-2xl font-var(--font-one) tracking-widest">
          {salon.salonName}
        </h3>

        {/* Ligne d’infos */}
        <div className="mt-2 flex flex-wrap items-center gap-2 font-var(--font-one) text-white/70 text-xs">
          {tattooers.length === 0
            ? "Tatoueur : Inconnu"
            : `${tattooers.length > 1 ? "Tatoueurs" : "Tatoueur"} - ${tattooers
                .map((t) => t.name)
                .filter(Boolean)
                .join(", ")}`}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {prestationChips.length > 0 ? (
            <>
              {prestationChips.map((p, idx) => (
                <span
                  key={`${p}-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)"
                  title={p}
                >
                  {p}
                </span>
              ))}
              {prestationRemaining > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)">
                  +{prestationRemaining}
                </span>
              )}
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)">
              Prestations : non renseignées
            </span>
          )}
        </div>

        {/* Styles (chips) */}
        <div className="mt-3 flex flex-wrap gap-1">
          {styleChips.length > 0 ? (
            <>
              {styleChips.map((s, idx) => (
                <span
                  key={`${s}-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)"
                  title={s}
                >
                  {s}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)">
                  +{remainingCount}
                </span>
              )}
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-var(--font-one)">
              Styles : non renseignés
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <Link
            href={salonHref}
            className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-var(--font-one) text-xs shadow-lg"
          >
            Voir le salon
          </Link>

          <button
            type="button"
            className="cursor-pointer px-3 py-2 rounded-lg text-xs font-var(--font-one) text-white/90 border border-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
            onClick={() => {
              // Action secondaire (modal, like, etc.)
            }}
          >
            En savoir +
          </button>
        </div>
      </div>

      <div className="pointer-events-none h-2 w-full bg-gradient-to-r from-tertiary-400/80 to-tertiary-500/80 opacity-90 animate-pulse" />
    </div>
  );
}
