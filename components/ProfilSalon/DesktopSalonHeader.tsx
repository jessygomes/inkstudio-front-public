import Image from "next/image";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, PenTool } from "lucide-react";
import VerifiedProfileBadge from "@/components/Shared/VerifiedProfileBadge";
import FavoriteBtn from "@/components/Shared/FavoriteBtn";
import AppButton from "@/components/Shared/AppButton";

type Props = {
  salonId: string;
  name: string;
  cover: string | null;
  portrait: string | null;
  city?: string | null;
  postalCode?: string | null;
  verified: boolean;
  artist: boolean;
  hasHours: boolean;
  open: boolean;
  today: { start: string; end: string } | null;
  variant?: "desktop" | "mobile";
  bookingHref?: string;
  canBook?: boolean;
};

export default function DesktopSalonHeader({ salonId, name, cover, portrait, city, postalCode, verified, artist, hasHours, open, today, variant = "desktop", bookingHref, canBook = true }: Props) {
  const mobile = variant === "mobile";
  const avatar = (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-noir-800 text-3xl text-white/50 shadow-xl shadow-black/25 ${mobile ? "size-24 border-4 border-noir-800 sm:size-28" : "size-24 border-2 border-white/25 xl:size-28"}`}>
      {portrait ? <Image src={portrait} alt={`Photo de profil de ${name}`} fill sizes="112px" className="object-cover" /> : <span aria-hidden="true">{name?.charAt(0).toUpperCase()}</span>}
    </div>
  );
  const identity = (
    <div className="min-w-0">
      {!mobile && verified && <VerifiedProfileBadge className="mb-3 rounded-full border border-emerald-400/20 bg-black/25 px-2.5 py-1 text-[10px] backdrop-blur-md" iconSize={13} />}
      {mobile && <p className="mb-2 text-[10px] tracking-[0.16em] text-tertiary-400">{artist ? "Artiste tatoueur.se" : "Salon de tatouage"}</p>}
      <h1 className={`break-words font-medium leading-tight tracking-tight text-white ${mobile ? "text-3xl sm:text-4xl" : "text-3xl xl:text-4xl 2xl:text-5xl"}`}>{name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {city && <span className="inline-flex items-center gap-1.5 text-xs text-white/80"><MapPin size={14} className="shrink-0 text-tertiary-400" aria-hidden="true" />{city.toLocaleUpperCase("fr-FR")}{postalCode && <span className="text-white/45">{postalCode}</span>}</span>}
        {hasHours && <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${open ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-black/20 text-white/60"}`}><span className={`size-1.5 rounded-full ${open ? "bg-emerald-400" : "bg-white/40"}`} aria-hidden="true" />{open ? "Ouvert maintenant" : "Actuellement fermé"}</span>}
        {today && <span className="inline-flex items-center gap-1.5 text-[11px] tabular-nums text-white/55"><Clock3 size={12} aria-hidden="true" />{today.start} – {today.end}</span>}
      </div>
    </div>
  );
  return (
    <header className={`relative overflow-hidden rounded-3xl border border-white/10 bg-noir-800 font-one ${mobile ? "lg:hidden" : "hidden lg:block"}`}>
      <div className={`relative overflow-hidden bg-linear-to-br from-tertiary-400/15 via-tertiary-500/5 to-noir-800 ${mobile ? "h-48 sm:h-64" : "min-h-96 xl:min-h-[440px]"}`}>
        {(cover || portrait) && <Image src={(cover || portrait)!} alt={`Couverture de ${name}`} fill priority sizes={mobile ? "(max-width: 1023px) 100vw, 1px" : "(min-width: 1280px) 60vw, (min-width: 1024px) 65vw, 1px"} className={cover ? "object-cover" : "object-cover blur-xl opacity-40"} />}
        <div className={`absolute inset-0 ${mobile ? "bg-linear-to-t from-noir-800 via-black/10 to-transparent" : "bg-linear-to-t from-black/95 via-black/35 to-black/10"}`} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
          {!mobile && <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[10px] tracking-[0.12em] text-white/85 backdrop-blur-md"><PenTool size={12} className="text-tertiary-400" aria-hidden="true" />{artist ? "Artiste tatoueur.se" : "Salon de tatouage"}</span>}
          <div className="ml-auto"><FavoriteBtn salonId={salonId} variant="icon-only" className="border border-white/15 bg-black/30 backdrop-blur-md" /></div>
        </div>
        {!mobile && <div className="relative flex items-end gap-5 px-6 pb-7 pt-56 xl:px-8 xl:pt-64">{avatar}{identity}</div>}
      </div>
      {mobile && <div className="relative px-5 pb-5 sm:px-8 sm:pb-6">
        <div className="-mt-12 mb-4 flex items-end justify-between gap-3">{avatar}{verified && <VerifiedProfileBadge className="mb-1 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1.5 text-[10px]" iconSize={13} />}</div>
        {identity}
        {bookingHref && <AppButton href={bookingHref} fullWidth className="mt-5 min-h-11! px-4! py-2.5! text-xs! shadow-none! hover:translate-y-0!"><CalendarDays size={15} />{canBook ? "Prendre rendez-vous" : "Parlons de votre projet"}<ArrowUpRight size={14} /></AppButton>}
      </div>}
    </header>
  );
}