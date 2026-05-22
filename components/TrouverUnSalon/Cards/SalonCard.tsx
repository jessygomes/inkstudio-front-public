/* eslint-disable @typescript-eslint/no-explicit-any */
import { SalonProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import AppButton from "@/components/Shared/AppButton";
import Image from "next/image";
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
  const profileSrc = salon.profileImage || salon.image || null;

  const FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'><rect width='400' height='240' fill='%231a1a1a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff88' font-family='sans-serif' font-size='18'>Aucune image</text></svg>`
    );

  const mediaSrc = hasImages ? images[current] : profileSrc || FALLBACK;

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
      className="group relative flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-noir-500/80 backdrop-blur supports-backdrop-filter:bg-noir-500/60 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] focus-within:ring-2 focus-within:ring-white/30"
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
          src={mediaSrc}
          alt={salon.salonName}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`object-cover transition-transform duration-500 ${
            hasImages ? "group-hover:scale-105" : "blur-2xl scale-110"
          }`}
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-noir-700/80 via-transparent to-transparent" />

        {salon.city && (
          <span className="absolute top-3 right-3 px-4 py-1 rounded-2xl text-xs uppercase font-one tracking-widest text-white shadow-lg bg-linear-to-br from-noir-500/70 to-noir-700/40 border border-white/20 backdrop-blur-2xl">
            {salon.city}
          </span>
        )}

        {hasImages && (
          <div className="absolute bottom-4 right-5 sm:right-6 flex gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Voir image ${idx + 1}`}
                className={`h-2.5 w-2.5 cursor-pointer rounded-full border border-white/20 transition${
                  current === idx
                    ? "scale-110 bg-tertiary-400"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {profileSrc && (
        <div className="absolute left-1/2 top-41 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-lg shadow-noir-700/60 bg-noir-500">
            <Image
              src={profileSrc}
              alt={`Photo de profil ${salon.salonName}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className={`${profileSrc ? "pt-10" : ""} p-5 sm:p-5`}>
        <h3 className="text-white text-xl sm:text-2xl font-one tracking-widest">
          {salon.salonName}
        </h3>

        {/* Ligne d’infos */}
        <div className="mt-2 flex flex-wrap items-center gap-2 font-one text-white/70 text-sm">
          {tattooers.length === 0
            ? "Tatoueur : Inconnu"
            : `${tattooers.length > 1 ? "Tatoueurs" : "Tatoueur"} : ${tattooers
                .map((t) => t.name)
                .filter(Boolean)
                .join(" - ")}`}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {prestationChips.length > 0 ? (
            <>
              {prestationChips.map((p, idx) => (
                <span
                  key={`${p}-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-one"
                  title={p}
                >
                  {p}
                </span>
              ))}
              {prestationRemaining > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-one">
                  +{prestationRemaining}
                </span>
              )}
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 border border-white/10 text-[10px] font-one">
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
          <AppButton
            href={salonHref}
            variant="primary"
            className="mx-auto"
          >
            Voir le salon
          </AppButton>

          {/* <button
            type="button"
            className="cursor-pointer px-3 py-2 rounded-lg text-xs font-var(--font-one) text-white/90 border border-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
            onClick={() => {
              // Action secondaire (modal, like, etc.)
            }}
          >
            En savoir +
          </button> */}
        </div>
      </div>

      <div className="pointer-events-none h-2 w-full bg-linear-to-r from-tertiary-400/80 to-tertiary-500/80 opacity-90 animate-pulse" />
    </div>
  );
}
