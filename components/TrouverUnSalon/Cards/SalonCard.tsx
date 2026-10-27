"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, PenTool, UsersRound } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
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
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-noir-800 font-one transition hover:border-tertiary-400/25 focus-within:ring-2 focus-within:ring-tertiary-400/30">
      <div className="relative aspect-[2/1] overflow-hidden bg-linear-to-br from-tertiary-400/8 via-white/3 to-noir-800">
        <Link href={href} aria-label={`Découvrir ${salon.salonName}`} className="absolute inset-0">
          {images.length > 0 && <Image src={images[imageIndex]} alt={salon.salonName} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" />}
          <span className="absolute inset-0 bg-linear-to-t from-noir-800/70 via-transparent to-transparent" />
        </Link>
        {salon.role && <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] text-white/80 backdrop-blur-md"><PenTool size={10} />{isArtist ? "Artiste tatoueur.se" : "Salon de tatouage"}</span>}
        {images.length > 1 && <div role="group" aria-label={`Photos de ${salon.salonName}`} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/45 p-1 backdrop-blur-md"><button type="button" aria-label="Photo précédente" onClick={() => setCurrent((imageIndex - 1 + images.length) % images.length)} className="grid size-7 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"><ChevronLeft size={13} /></button><span aria-live="polite" className="min-w-7 text-center text-[9px] tabular-nums text-white/65">{imageIndex + 1}/{images.length}</span><button type="button" aria-label="Photo suivante" onClick={() => setCurrent((imageIndex + 1) % images.length)} className="grid size-7 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"><ChevronRight size={13} /></button></div>}
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col px-3 pb-3">
        <div className="relative -mt-5 mb-2.5 grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border-[3px] border-noir-800 bg-noir-800 text-lg text-white/40 shadow-md">{portrait ? <Image src={portrait} alt={`Profil de ${salon.salonName}`} fill sizes="40px" className="object-cover" /> : salon.salonName?.charAt(0).toUpperCase()}</div>
        <Link href={href} className="w-fit max-w-full"><h3 className="break-words text-base font-medium leading-snug tracking-tight text-white/90 transition hover:text-tertiary-400">{salon.salonName}</h3></Link>
        {(salon.city || salon.postalCode) && <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-white/40"><MapPin size={12} className="mt-0.5 shrink-0 text-tertiary-400/70" />{[salon.city?.toLocaleUpperCase("fr-FR"), salon.postalCode].filter(Boolean).join(" · ")}</p>}
        {!isArtist && artists.length > 0 && <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40"><UsersRound size={12} />{artists.length} artiste{artists.length > 1 ? "s" : ""}{artists.length === 1 && artists[0].name ? ` · ${artists[0].name}` : ""}</p>}
        {salon.description?.trim() && <p className="mt-2 line-clamp-2 break-words text-[11px] leading-4 text-white/45">{salon.description}</p>}
        {!!services.length && <div className="mt-2 flex flex-wrap gap-1">{services.slice(0, 3).map(service => <span key={service} className="max-w-full break-words rounded-md border border-tertiary-400/10 bg-tertiary-400/5 px-2 py-1 text-[9px] text-tertiary-400/80">{serviceLabels[service.toUpperCase()] || service}</span>)}{services.length > 3 && <span className="px-1 py-1 text-[9px] text-white/35">+{services.length - 3}</span>}</div>}
        {!!styles.length && <div className="mt-2 flex flex-wrap gap-1">{styles.slice(0, 3).map(style => <span key={style} className="max-w-full break-words rounded-md border border-white/8 bg-white/[0.025] px-2 py-1 text-[9px] text-white/50">{style}</span>)}{styles.length > 3 && <span className="px-1 py-1 text-[9px] text-white/35">+{styles.length - 3}</span>}</div>}
        <div className="mt-auto pt-3"><AppButton href={href} fullWidth className="min-h-9! justify-between! rounded-lg! px-3! py-2! text-xs! shadow-none! hover:translate-y-0!">Découvrir le profil<ArrowUpRight size={14} /></AppButton></div>
      </div>
    </article>
  );
}
