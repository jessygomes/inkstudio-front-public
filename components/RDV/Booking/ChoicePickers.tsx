/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { Check, PenTool, UserRound } from "lucide-react";
import { FlashProps, PiercingZone } from "@/lib/type";
import { formatDurationMinutes } from "@/lib/booking-link";
import { getPiercingServiceLabel } from "./getPiercingServiceLabel";
import { checkBadge, choice, inset, surface } from "./ui";

const card = surface;

function PickerTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
      {hint && <p className="mt-1 text-xs leading-5 text-white/45">{hint}</p>}
    </div>
  );
}

export function getFlashDimensions(flash?: FlashProps): string {
  if (!flash) return "";
  const raw = flash.dimension || flash.dimensions || flash.size;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof flash.width === "number" && typeof flash.height === "number") return `${flash.width} × ${flash.height} ${(flash.unit || "cm").trim()}`;
  return "";
}

export function FlashPicker({ flashes, selectedFlashId, onChange, onChooseProject }: {
  flashes: FlashProps[];
  selectedFlashId: string;
  onChange: (id: string) => void;
  onChooseProject?: () => void;
}) {
  return (
    <section className={card} aria-labelledby="flash-picker-title">
      <div id="flash-picker-title"><PickerTitle title="Quel flash vous fait envie ?" hint="Touchez un dessin pour le sélectionner." /></div>
      {flashes.length ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {flashes.map(flash => {
            const active = flash.id === selectedFlashId;
            const duration = Number(flash.appointmentDurationMinutes);
            const name = flash.title || flash.name || "Flash";
            return (
              <button key={flash.id} type="button" aria-pressed={active} onClick={() => onChange(active ? "" : flash.id)}
                className={`group relative overflow-hidden rounded-2xl p-1.5 text-left ${choice(active)}`}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-white/3">
                  {flash.imageUrl ? <Image src={flash.imageUrl} alt={name} fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover transition duration-300 motion-safe:group-hover:scale-[1.03]" /> : <span className="absolute inset-0 grid place-items-center text-white/20"><PenTool size={24} /></span>}
                  {active && <span className={`absolute right-2 top-2 size-6! ${checkBadge}`}><Check size={14} strokeWidth={3} /></span>}
                </div>
                <div className="space-y-1 px-1.5 pb-1 pt-2">
                  <p className="truncate text-xs font-medium text-white/90">{name}</p>
                  <p className="flex flex-wrap justify-between gap-1 text-[11px] text-white/50">
                    <span>{Number.isFinite(duration) && duration > 0 ? formatDurationMinutes(Math.max(60, duration)) : getFlashDimensions(flash) || " "}</span>
                    {typeof flash.price === "number" && <span className="font-medium text-tertiary-400">{flash.price} €</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div role="status" className={`${inset} p-4 text-xs leading-6 text-white/55`}>
          Aucun flash n’est disponible pour le moment.
          {onChooseProject && <> Vous pouvez <button type="button" onClick={onChooseProject} className="text-tertiary-400 underline-offset-2 hover:underline">prendre un rendez-vous projet</button> pour parler de votre idée.</>}
        </div>
      )}
    </section>
  );
}

export function PiercingPicker({ zones, loading, selectedZone, selectedService, onZoneChange, onServiceChange }: {
  zones: PiercingZone[];
  loading: boolean;
  selectedZone: string;
  selectedService: string;
  onZoneChange: (id: string) => void;
  onServiceChange: (id: string) => void;
}) {
  const zone = zones.find(item => item.id === selectedZone);
  const chip = (active: boolean) => `min-h-11 rounded-xl px-4 py-2.5 text-xs ${choice(active)}`;
  return (
    <section className={card} aria-labelledby="piercing-picker-title">
      <div id="piercing-picker-title"><PickerTitle title="Quel piercing ?" hint="Choisissez d’abord la zone, puis le type." /></div>
      {loading ? <p role="status" className="text-xs text-white/45">Chargement des piercings proposés…</p> : !zones.length ? <p className="text-xs text-white/45">Aucun piercing n’est proposé en ligne pour le moment. Contactez le salon.</p> : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">{zones.map(item => <button key={item.id} type="button" aria-pressed={item.id === selectedZone} onClick={() => { onZoneChange(item.id); onServiceChange(""); }} className={chip(item.id === selectedZone)}>{item.piercingZone}</button>)}</div>
          {zone && (
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              {zone.services.map(service => {
                const active = service.id === selectedService;
                return <button key={service.id} type="button" aria-pressed={active} onClick={() => onServiceChange(service.id)} className={`flex min-h-12 items-center justify-between gap-3 rounded-xl! text-left ${chip(active)}`}><span className="flex items-center gap-2">{active && <Check size={13} className="text-tertiary-400" />}{getPiercingServiceLabel(service, zone.piercingZone)}</span><span className="shrink-0 text-tertiary-400">{typeof service.price === "number" ? `${service.price} €` : "Sur demande"}</span></button>;
              })}
              {!zone.services.length && <p className="text-xs text-white/45">Aucun piercing disponible pour cette zone.</p>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ArtistPicker({ artists, selectedId, onChange, required }: { artists: any[]; selectedId: string | null; onChange: (id: string) => void; required: boolean }) {
  return (
    <section className={card} aria-labelledby="artist-picker-title">
      <div id="artist-picker-title"><PickerTitle title="Avec quel artiste ?" hint={required ? undefined : "Facultatif : le salon peut choisir pour vous."} /></div>
      {artists.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {artists.map(artist => {
            const active = selectedId === artist.id;
            const image = artist.profileImage || artist.img;
            return (
              <button key={artist.id} type="button" aria-pressed={active} onClick={() => onChange(artist.id)}
                className={`flex min-h-16 items-center gap-3 rounded-xl p-2.5 text-left ${choice(active)}`}>
                <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8 text-sm text-white/55">
                  {image ? <Image src={image} alt="" fill sizes="44px" className="rounded-xl object-cover" /> : artist.name?.trim().charAt(0).toUpperCase() || <UserRound size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white/90">{artist.name}</span>
                  {artist.isLinkedUser && <span className="mt-0.5 block text-[11px] text-white/45">Réservation sur son profil</span>}
                </span>
                {active && <span className={checkBadge}><Check size={12} strokeWidth={3} /></span>}
              </button>
            );
          })}
        </div>
      ) : <p className="text-xs text-white/50">Aucun artiste n’est réservable en ligne actuellement.</p>}
    </section>
  );
}
