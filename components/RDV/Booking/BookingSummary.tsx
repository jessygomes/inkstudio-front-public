/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, PenTool, Phone, UserRound } from "lucide-react";
import { formatPhoneNumber, phoneHref } from "./bookingDisplay";
import { focusRing } from "./ui";

export type BookingSummaryData = {
  prestationLabel?: string | null;
  choiceLabel?: string | null;
  artistName?: string | null;
  dateLabel?: string | null;
  timeLabel?: string | null;
  durationLabel?: string | null;
  priceLabel?: string | null;
};

function Line({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <span aria-hidden="true" className={`mt-0.5 ${value ? "text-tertiary-400" : "text-white/20"}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-white/40">{label}</p>
        <p className={`mt-0.5 break-words text-xs ${value ? "text-white/90" : "text-white/30"}`}>{value || "—"}</p>
      </div>
    </div>
  );
}

/** En-tête salon cliquable (photo + nom) vers son profil public. */
export function SalonIdentity({ salon, size = 44 }: { salon: any; size?: number }) {
  const image = salon.profileImage || salon.image;
  const location = [salon.address, [salon.postalCode, salon.city].filter(Boolean).join(" ")].filter(Boolean);
  const content = (
    <>
      <span style={{ width: size, height: size }} className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8 text-sm text-white/50">
        {image ? <Image src={image} alt="" fill sizes={`${size}px`} className="rounded-xl object-cover" /> : salon.name?.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-semibold text-white transition group-hover:text-tertiary-400">
          <span className="truncate">{salon.name}</span>
          {salon.profileHref && <ArrowUpRight size={13} aria-hidden="true" className="shrink-0 text-white/30 transition group-hover:text-tertiary-400" />}
        </span>
        {location.length > 0 && <span className="mt-0.5 flex items-start gap-1 text-[11px] leading-4 text-white/45"><MapPin size={11} className="mt-0.5 shrink-0" />{location.join(", ")}</span>}
      </span>
    </>
  );
  return salon.profileHref
    ? <Link href={salon.profileHref} aria-label={`Voir le profil de ${salon.name}`} className={`group flex min-w-0 items-center gap-3 rounded-xl ${focusRing}`}>{content}</Link>
    : <div className="flex min-w-0 items-center gap-3">{content}</div>;
}

/** Récapitulatif qui se remplit au fil des étapes (colonne de droite sur grand écran). */
export default function BookingSummary({ salon, data }: { salon: any; data: BookingSummaryData }) {
  const phone = formatPhoneNumber(salon.phone);
  return (
    <aside aria-label="Votre réservation" className="overflow-hidden rounded-3xl bg-noir-500 font-one">
      <div className="p-5 pb-3">
        <SalonIdentity salon={salon} />
        {phone && (
          <a href={phoneHref(salon.phone)} className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-xs tabular-nums text-white/80 transition hover:bg-white/9 hover:text-white">
            <Phone size={12} className="text-tertiary-400" aria-hidden="true" />{phone}
          </a>
        )}
      </div>
      <div className="mx-3 mb-3 space-y-1 rounded-2xl bg-white/3 px-3 py-1">
        <Line icon={<PenTool size={14} />} label="Prestation" value={[data.prestationLabel, data.choiceLabel].filter(Boolean).join(" · ") || null} />
        {data.artistName && <Line icon={<UserRound size={14} />} label="Artiste" value={data.artistName} />}
        <Line icon={<CalendarDays size={14} />} label="Date" value={data.dateLabel} />
        <Line icon={<Clock3 size={14} />} label="Heure" value={data.timeLabel ? `${data.timeLabel}${data.durationLabel ? ` (${data.durationLabel})` : ""}` : null} />
      </div>
      {data.priceLabel && (
        <div className="flex items-center justify-between bg-linear-to-r from-tertiary-400/12 to-cuatro-500/10 px-5 py-3.5 text-xs">
          <span className="text-white/50">Tarif</span>
          <span className="font-semibold text-tertiary-400">{data.priceLabel}</span>
        </div>
      )}
    </aside>
  );
}
