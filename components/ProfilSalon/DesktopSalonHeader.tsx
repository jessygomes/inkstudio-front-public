import Image from "next/image";
import { toHourLabel } from "@/lib/utils/date";
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

const glass = "bg-noir-900/45 backdrop-blur-md";

export default function DesktopSalonHeader({ salonId, name, cover, portrait, city, postalCode, verified, artist, hasHours, open, today, variant = "desktop", bookingHref, canBook = true }: Props) {
  const mobile = variant === "mobile";
  // Avatar sans contour : il se détache de la couverture par son ombre.
  const avatar = (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-3xl bg-noir-500 text-3xl text-white/50 shadow-2xl shadow-black/60 ${mobile ? "size-24 sm:size-28" : "size-28 xl:size-32"}`}>
      {portrait ? <Image src={portrait} alt={`Photo de profil de ${name}`} fill sizes="128px" className="object-cover" /> : <span aria-hidden="true">{name?.charAt(0).toUpperCase()}</span>}
    </div>
  );
  const chips = (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {city && <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] text-white/85 ${mobile ? "bg-white/6" : glass}`}><MapPin size={13} className="shrink-0 text-tertiary-400" aria-hidden="true" />{city.toLocaleUpperCase("fr-FR")}{postalCode && <span className="text-white/45">{postalCode}</span>}</span>}
      {hasHours && <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] ${open ? "bg-emerald-400/15 text-emerald-300" : mobile ? "bg-white/6 text-white/60" : `${glass} text-white/60`}`}><span className={`size-1.5 rounded-full ${open ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-white/40"}`} aria-hidden="true" />{open ? "Ouvert maintenant" : "Actuellement fermé"}</span>}
      {today && <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] tabular-nums text-white/65 ${mobile ? "bg-white/6" : glass}`}><Clock3 size={12} aria-hidden="true" />{toHourLabel(`${today.start} – ${today.end}`)}</span>}
    </div>
  );
  const kind = <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/85 ${glass}`}><PenTool size={12} className="text-tertiary-400" aria-hidden="true" />{artist ? "Artiste tatoueur.se" : "Salon de tatouage"}</span>;

  return (
    <header className={`relative overflow-hidden rounded-[2rem] bg-noir-500 font-one ${mobile ? "lg:hidden" : "hidden lg:block"}`}>
      <div className={`relative overflow-hidden bg-linear-to-br from-tertiary-400/20 via-tertiary-500/10 to-cuatro-500/15 ${mobile ? "h-52 sm:h-64" : "min-h-96 xl:min-h-[460px]"}`}>
        {(cover || portrait) && <Image src={(cover || portrait)!} alt={`Couverture de ${name}`} fill priority sizes={mobile ? "(max-width: 1023px) 100vw, 1px" : "(min-width: 1280px) 60vw, (min-width: 1024px) 65vw, 1px"} className={cover ? "object-cover" : "object-cover blur-xl opacity-40"} />}
        <div className={`absolute inset-0 ${mobile ? "bg-linear-to-t from-noir-500 via-noir-500/10 to-transparent" : "bg-linear-to-t from-noir-900/95 via-noir-900/30 to-noir-900/10"}`} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
          {!mobile ? kind : <span />}
          <FavoriteBtn salonId={salonId} variant="icon-only" className={`border-0 ${glass}`} />
        </div>
        {!mobile && (
          <div className="relative flex items-end gap-6 px-7 pb-8 pt-56 xl:px-9 xl:pt-64">
            {avatar}
            <div className="min-w-0 pb-1">
              {verified && <VerifiedProfileBadge className={`mb-3 rounded-xl border-0 px-3 py-1.5 text-[10px] ${glass}`} iconSize={13} />}
              <h1 className="break-words text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">{name}</h1>
              {chips}
            </div>
          </div>
        )}
      </div>
      {mobile && (
        <div className="relative px-5 pb-6 sm:px-7">
          <div className="-mt-14 mb-4 flex items-end justify-between gap-3">{avatar}{verified && <VerifiedProfileBadge className="mb-1 rounded-xl border-0 bg-emerald-400/10 px-3 py-1.5 text-[10px]" iconSize={13} />}</div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-tertiary-400">{artist ? "Artiste tatoueur.se" : "Salon de tatouage"}</p>
          <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">{name}</h1>
          {chips}
          {bookingHref && <AppButton href={bookingHref} fullWidth className="mt-6 min-h-12! rounded-xl! px-4! py-3! text-sm! hover:translate-y-0!"><CalendarDays size={16} />{canBook ? "Prendre rendez-vous" : "Parlons de votre projet"}<ArrowUpRight size={15} /></AppButton>}
        </div>
      )}
    </header>
  );
}
