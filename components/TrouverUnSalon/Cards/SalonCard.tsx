"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, PenTool, UsersRound } from "lucide-react";
import { SalonProps } from "@/lib/type";
import { toSlug } from "@/lib/utils";
import { getTattooStyleOptions } from "@/lib/utils/tattooStyles";

type SearchProfile = SalonProps & { role?: string; style?: string[]; prestation?: string[]; };
const serviceLabels: Record<string, string> = { TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Consultation", RETOUCHE: "Retouche" };
function unique(values: unknown[]) {
  const seen = new Set<string>();
  return values.filter((value): value is string => typeof value === "string").map(value => value.trim()).filter(value => { const key = value.trim().toLocaleLowerCase("fr-FR"); if (!key || seen.has(key)) return false; seen.add(key); return true; });
}

export function SalonCard({ salon, returnTo }: { salon: SearchProfile; returnTo?: string }) {
  const [current, setCurrent] = useState(0);
  const artists = useMemo(() => Array.isArray(salon.Tatoueur) ? salon.Tatoueur : salon.Tatoueur ? [salon.Tatoueur] : [], [salon.Tatoueur]);
  const images = useMemo(() => Array.from(new Set([salon.image, ...(salon.salonPhotos || []), ...artists.map(artist => artist.img)].filter((value): value is string => typeof value === "string" && !!value.trim()))), [salon.image, salon.salonPhotos, artists]);
  const imageIndex = images.length ? current % images.length : 0;
  const portrait = salon.profileImage || salon.image;
  const isArtist = salon.role === "user_tatoueur";
  const styles = getTattooStyleOptions([...(Array.isArray(salon.style) ? salon.style : []), ...artists.flatMap(artist => Array.isArray(artist.style) ? artist.style : [])]).map(option => option.label);
  const services = unique(Array.isArray(salon.prestations) ? salon.prestations : salon.prestation || []);
  const location = toSlug([salon.city, salon.postalCode].filter(Boolean).join("-")) || "localisation";
  const profileHref = `/salon/${toSlug(salon.salonName || "salon")}/${location}`;
  const href = returnTo ? `${profileHref}?${new URLSearchParams({ returnTo })}` : profileHref;
  const displayName = salon.displayName || salon.salonName;
  return (
    <article className="group flex h-full min-w-0 flex-col rounded-3xl bg-noir-700 p-2 font-one transition-colors hover:bg-noir-500 focus-within:ring-2 focus-within:ring-tertiary-400/40">
      {/* Visuel */}
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-tertiary-400/15 via-white/3 to-cuatro-500/10">
        <Link href={href} aria-label={`Découvrir ${displayName}`} className="absolute inset-0">
          {images.length > 0 && <Image src={images[imageIndex]} alt={displayName} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none" />}
          <span className="absolute inset-0 bg-linear-to-t from-noir-900/60 via-transparent to-noir-900/20" />
        </Link>
        {salon.role && <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-xl bg-noir-900/50 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"><PenTool size={11} className="text-tertiary-400" />{isArtist ? "Artiste" : "Salon"}</span>}
        {images.length > 1 && (
          <div role="group" aria-label={`Photos de ${displayName}`} className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 rounded-xl bg-noir-900/50 p-0.5 backdrop-blur-md opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button type="button" aria-label="Photo précédente" onClick={() => setCurrent((imageIndex - 1 + images.length) % images.length)} className="grid size-7 cursor-pointer place-items-center rounded-xl text-white/75 hover:bg-white/10 hover:text-white"><ChevronLeft size={14} /></button>
            <span aria-live="polite" className="min-w-8 text-center text-[10px] tabular-nums text-white/70">{imageIndex + 1}/{images.length}</span>
            <button type="button" aria-label="Photo suivante" onClick={() => setCurrent((imageIndex + 1) % images.length)} className="grid size-7 cursor-pointer place-items-center rounded-xl text-white/75 hover:bg-white/10 hover:text-white"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      {/* Identité */}
      <div className="flex min-w-0 flex-1 flex-col px-2 pb-1.5 pt-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/6 text-base text-white/50">{portrait ? <Image src={portrait} alt={`Profil de ${displayName}`} fill sizes="44px" className="object-cover" /> : displayName?.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <Link href={href} className="block w-fit max-w-full"><h3 className="truncate text-base font-semibold leading-snug tracking-tight text-white transition hover:text-tertiary-400">{displayName}</h3></Link>
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-white/45">
              {(salon.city || salon.postalCode) && <><MapPin size={11} className="shrink-0 text-tertiary-400" />{[salon.city?.toLocaleUpperCase("fr-FR"), salon.postalCode].filter(Boolean).join(" ")}</>}
              {!isArtist && artists.length > 0 && <><span aria-hidden="true">·</span><UsersRound size={11} className="shrink-0" />{artists.length} artiste{artists.length > 1 ? "s" : ""}</>}
            </p>
          </div>
        </div>
        {salon.description?.trim() && <p className="mt-3 line-clamp-2 break-words text-xs leading-5 text-white/50">{salon.description}</p>}
        {(services.length > 0 || styles.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {services.slice(0, 2).map(service => <span key={service} className="max-w-full break-words rounded-xl bg-linear-to-r from-tertiary-400/20 to-cuatro-500/15 px-2.5 py-1 text-[10px] text-white/85">{serviceLabels[service.toUpperCase()] || service}</span>)}
            {styles.slice(0, 2).map(style => <span key={style} className="max-w-full break-words rounded-xl bg-white/6 px-2.5 py-1 text-[10px] text-white/60">{style}</span>)}
            {services.length + styles.length > 4 && <span className="rounded-xl px-1.5 py-1 text-[10px] text-white/35">+{Math.max(0, services.length - 2) + Math.max(0, styles.length - 2)}</span>}
          </div>
        )}
        <div className="mt-auto pt-4">
          <Link href={href} className="flex min-h-10 items-center justify-between rounded-xl bg-white/6 px-3.5 text-xs font-medium text-white/85 transition group-hover:bg-linear-to-r group-hover:from-tertiary-400 group-hover:to-tertiary-500 group-hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Découvrir le profil<ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </article>
  );
}
