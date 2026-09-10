import Image from "next/image";
import { BadgeCheck, MapPin } from "lucide-react";
import FavoriteBtn from "@/components/Shared/FavoriteBtn";

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
};

export default function DesktopSalonHeader({ salonId, name, cover, portrait, city, postalCode, verified, artist, hasHours, open, today }: Props) {
  return (
    <header className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-noir-500 lg:block">
      <div className="relative min-h-96 xl:min-h-[440px]">
        {(cover || portrait) && (
          <Image src={(cover || portrait)!} alt={`Le salon ${name}`} fill priority sizes="(min-width:1280px) calc((100vw - 160px) * 0.667), 66vw" className={cover ? "object-cover" : "object-cover blur-xl opacity-50"} />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/45 to-black/10" />
        <div className="relative flex items-start justify-between gap-4 p-6">
          <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs tracking-widest text-white/90 uppercase backdrop-blur-md">{artist ? "Artiste tatoueur" : "Salon de tatouage"}</span>
          <FavoriteBtn salonId={salonId} variant="icon-only" />
        </div>
        <div className="relative flex items-end gap-5 px-6 pb-7 pt-32 xl:px-8 xl:pt-40">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-white/25 bg-noir-500 text-3xl text-white xl:h-28 xl:w-28">
            {portrait ? <Image src={portrait} alt={name} fill sizes="112px" className="object-cover" /> : name?.charAt(0)}
          </div>
          <div className="min-w-0">
            {verified && <span className="mb-3 inline-flex items-center gap-1.5 text-xs text-emerald-300"><BadgeCheck size={16} /> Profil vérifié</span>}
            <h1 className="break-words text-3xl leading-tight text-white xl:text-4xl 2xl:text-5xl">{name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
              {city && <span className="inline-flex items-center gap-2"><MapPin size={16} />{city} {postalCode}</span>}
              {hasHours && <span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${open ? "bg-emerald-400" : "bg-white/50"}`} />{open ? "Ouvert maintenant" : "Actuellement fermé"}</span>}
              {today && <span>{today.start} – {today.end}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
