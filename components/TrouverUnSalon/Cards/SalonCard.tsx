import { SalonProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export function SalonCard({ salon }: { salon: SalonProps }) {
  //! Construire la liste des images : profil salon + photos tatoueurs
  const images = useMemo(() => {
    const tattooerImages = Array.isArray(salon.Tatoueur)
      ? salon.Tatoueur.map((t: { img?: string }) => t.img).filter(Boolean)
      : [];
    return [salon.image, ...tattooerImages].filter(Boolean) as string[];
  }, [salon.image, salon.Tatoueur]);
  const [current, setCurrent] = useState(0);
  const hasImages = images.length > 0;

  // Fallback minimal en data URL si pas d'image
  const FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'><rect width='400' height='240' fill='%231a1a1a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff88' font-family='sans-serif' font-size='18'>Aucune image</text></svg>`
    );

  // Gestion clavier pour changer d'image
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasImages) return;
    if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
    if (e.key === "ArrowLeft")
      setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  //! Construire une URL à 2 segments lisibles et uniques
  const nameSlug = toSlug(salon.salonName || "salon");
  const locSource = [salon.city, salon.postalCode] // city-75001
    .filter((v) => typeof v === "string" && v.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";
  const salonHref = `/salon/${nameSlug}/${locSlug}`;

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
        {/* Voile dégradé pour lisibilité */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-noir-700)]/80 via-transparent to-transparent" />

        {/* Badge Ville */}
        {salon.city && (
          <span className="absolute top-3 right-3 px-4 py-1 rounded-lg text-xs font-var(--font-one) tracking-widest text-white shadow-lg bg-gradient-to-br from-[var(--color-tertiary-400)] to-[var(--color-tertiary-500)]">
            {salon.city}
          </span>
        )}

        {/* Pagination images (pastilles) */}
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

        {/* Ligne d’infos (ajoute ce que tu veux : tags, prestations, etc.) */}
        <div className="mt-2 flex flex-wrap items-center gap-2 font-var(--font-one) text-white/70 text-xs">
          {(() => {
            const list = Array.isArray(salon.Tatoueur) ? salon.Tatoueur : [];
            if (list.length === 0) return "Tatoueur : Inconnu";
            const label = list.length > 1 ? "Tatoueurs" : "Tatoueur";
            return `${label} - ${list
              .map((t: { name: string }) => t.name)
              .join(", ")}`;
          })()}
          {/* Exemple de chip “ouvert aux rdv” si tu as l'info */}
          {/* <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">Prend des rendez-vous</span> */}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          {/* 🔗 Adapte l'URL à ta route réelle */}
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
              // Place ton action secondaire ici (ex: ouvrir une modal, like, etc.)
            }}
          >
            En savoir +
          </button>
        </div>
      </div>

      {/* Liseré d’accent en bas (subtil) */}
      <div className="pointer-events-none h-2 w-full bg-gradient-to-r from-tertiary-400/80 to-tertiary-500/80 opacity-80" />
    </div>
  );
}
