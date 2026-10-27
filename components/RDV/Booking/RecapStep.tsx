/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CalendarDays, Clock3, UserRound, PenTool, MapPin, Info, Images, CheckCheck } from "lucide-react";
import {
  addMinutesToTime,
  formatDateKeyForDisplay,
  getIsoTimePart,
  getTimeInTimeZone,
  getWeekdayKeyFromDate,
  resolveSlotDisplayMode,
  addMinutesToIsoInTimeZone,
} from "@/lib/utils/date";
import { parseSalonHours } from "@/lib/horaireHelper";
import Section from "./Section";
import { getPiercingServiceLabel } from "./getPiercingServiceLabel";
import ReferenceImages from "./ReferenceImages";
import Image from "next/image";
import { FlashProps } from "@/lib/type";
import { SkinToneOption, BookingMoodboardOption } from "./types";
import AppButton from "@/components/Shared/AppButton";

interface RecapStepProps {
  prestation: string;
  formData: any;
  selectedDate: string;
  selectedSlots: string[];
  selectedTatoueur: string | null;
  artists: any[];
  piercingZones: any[];
  piercingPrice: number | null;
  pierc: string | null;
  salon: any;
  referenceFile?: File | null;
  sketchFile?: File | null;
  skinToneOptions?: SkinToneOption[];
  selectedFlash?: FlashProps;
  onEdit?: (step: number) => void;
  piercingServiceId?: string;
  selectedMoodboard?: BookingMoodboardOption;
}

export default function RecapStep({
  prestation,
  formData,
  selectedDate,
  selectedSlots,
  selectedTatoueur,
  artists,
  piercingZones,
  piercingPrice,
  pierc,
  salon,
  referenceFile,
  sketchFile,
  skinToneOptions = [],
  selectedFlash,
  onEdit,
  piercingServiceId,
  selectedMoodboard,
}: RecapStepProps) {
  // Trouver le nom du tatoueur
  const tatoueur = artists.find((a) => a.id === selectedTatoueur);
  const parsedSalonHours = React.useMemo(
    () => parseSalonHours(salon.salonHours),
    [salon.salonHours],
  );

  const openingForSelectedDate = React.useMemo(() => {
    if (!selectedDate || !parsedSalonHours) return null;

    const weekdayKey = getWeekdayKeyFromDate(selectedDate);
    return parsedSalonHours[weekdayKey] ?? null;
  }, [parsedSalonHours, selectedDate]);

  const slotDisplayMode = React.useMemo(
    () =>
      resolveSlotDisplayMode(selectedSlots, openingForSelectedDate),
    [openingForSelectedDate, selectedSlots],
  );

  // Trouver la zone de piercing
  const piercingZone = piercingZones.find((pz) => pz.id === pierc);
  const piercingService = piercingZone?.services?.find((service: { id: string }) => service.id === piercingServiceId);
  const piercingZoneLabel =
    piercingZone?.piercingZone || piercingZone?.name || "Zone non spécifiée";
  const selectedSkinTone = skinToneOptions.find(
    (option) => option.value === formData?.details?.skin,
  );
  const projectAppointmentDurationMinutes = React.useMemo(() => {
    const raw = Number(salon?.projectAppointmentDurationMinutes);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return 60;
  }, [salon?.projectAppointmentDurationMinutes]);
  const projectAppointmentIsFree =
    typeof salon?.projectAppointmentIsFree === "boolean"
      ? salon.projectAppointmentIsFree
      : true;
  const projectAppointmentPrice = projectAppointmentIsFree
    ? 0
    : typeof salon?.projectAppointmentPrice === "number"
      ? salon.projectAppointmentPrice
      : 0;

  const orderedSlots = [...selectedSlots].sort();
  const start = orderedSlots[0];
  const end = orderedSlots[orderedSlots.length - 1];
  const timeLabel = start && end ? (slotDisplayMode === "timezone" ? getTimeInTimeZone(start) + " – " + addMinutesToIsoInTimeZone(end, 30) : getIsoTimePart(start) + " – " + addMinutesToTime(getIsoTimePart(end), 30)) : "À choisir";
  const serviceLabel = ({ TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Consultation projet", RETOUCHE: "Retouche" } as Record<string, string>)[prestation] || prestation;

  return (
    <div className="space-y-4">
      <Section title="Vérifiez votre demande" eyebrow="Votre rendez-vous" description="Retrouvez les informations de votre rendez-vous avant de confirmer." icon={<CheckCheck size={18} />}>
        <div className="mb-3 flex justify-end"><AppButton type="button" variant="secondary" onClick={() => onEdit?.(3)} className="px-3! py-1.5! text-xs! shadow-none!">Modifier la date ou l’heure</AppButton></div>
        <div className="overflow-hidden rounded-xl border border-tertiary-400/20 bg-tertiary-400/5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tertiary-400/10 px-4 py-3">
            <span className="text-sm font-semibold text-white font-one">{serviceLabel}</span>
            <span className="rounded-full border border-white/10 bg-noir-700/50 px-2 py-1 text-[10px] text-white/60">Au salon</span>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <SummaryFact icon={<CalendarDays size={16} />} label="Date" value={selectedDate ? formatDateKeyForDisplay(selectedDate) : "À choisir"} />
            <SummaryFact icon={<Clock3 size={16} />} label="Horaire" value={timeLabel} />
            <SummaryFact icon={<UserRound size={16} />} label="Votre artiste" value={tatoueur?.name || salon.name || salon.salonName} />
            <SummaryFact icon={<MapPin size={16} />} label="Lieu du rendez-vous" value={[salon.name || salon.salonName, salon.address || salon.adress, salon.postalCode, salon.city].filter(Boolean).join(", ")} />
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-t border-tertiary-400/10 px-4 py-2.5 text-xs text-white/60">
            <span>Durée <strong className="ml-1 font-medium text-white">{prestation === "PROJET" ? projectAppointmentDurationMinutes : selectedSlots.length * 30} min</strong></span>
            {prestation === "PROJET" && <span>Tarif <strong className="ml-1 text-tertiary-400">{projectAppointmentIsFree ? "Gratuit" : projectAppointmentPrice + " €"}</strong></span>}
            {prestation === "PIERCING" && piercingPrice !== null && <span>Tarif <strong className="ml-1 text-tertiary-400">{piercingPrice} €</strong></span>}
          </div>
        </div>
      </Section>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Section title="Vos coordonnées" eyebrow="Contact" icon={<UserRound size={18} />}>
          <div className="mb-3 flex justify-end"><AppButton type="button" variant="secondary" onClick={() => onEdit?.(2)} className="px-3! py-1.5! text-xs! shadow-none!">Modifier</AppButton></div>
          <dl className="space-y-3">
            <SummaryRow label="Nom complet" value={[formData?.client?.firstName, formData?.client?.lastName].filter(Boolean).join(" ")} />
            <SummaryRow label="Email" value={formData?.client?.email} />
            <SummaryRow label="Téléphone" value={formData?.client?.phone} />
            {formData?.client?.birthDate && <SummaryRow label="Naissance" value={new Date(formData.client.birthDate).toLocaleDateString("fr-FR", {timeZone: "UTC"})} />}
          </dl>
        </Section>
        <Section title="Votre prestation" eyebrow="Le projet" icon={<PenTool size={18} />}>
          <div className="mb-3 flex justify-end"><AppButton type="button" variant="secondary" onClick={() => onEdit?.(2)} className="px-3! py-1.5! text-xs! shadow-none!">Modifier le projet</AppButton></div>
          {selectedFlash && <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/8 bg-noir-700/50 p-2.5">{selectedFlash.imageUrl && <Image src={selectedFlash.imageUrl} alt={selectedFlash.title || selectedFlash.name || "Flash"} width={56} height={56} className="size-14 rounded-lg object-cover" />}<div className="min-w-0"><p className="text-[10px] text-white/40">Flash choisi</p><p className="mt-1 break-words text-xs text-white/85">{selectedFlash.title || selectedFlash.name || "Flash"}</p>{typeof selectedFlash.price === "number" && <p className="mt-1 text-xs text-tertiary-400">{selectedFlash.price} €</p>}</div></div>}
          <dl className="space-y-3">
            <SummaryRow label="Prestation" value={serviceLabel} />
            {prestation === "PIERCING" && <><SummaryRow label="Zone" value={piercingZoneLabel} />{piercingService && <SummaryRow label="Piercing" value={getPiercingServiceLabel(piercingService, piercingZoneLabel)} />}</>}
            {formData?.details?.zone && <SummaryRow label="Zone du corps" value={formData.details.zone} />}
            {formData?.details?.size && <SummaryRow label="Dimensions" value={formData.details.size} />}
            {formData?.details?.colorStyle && <SummaryRow label="Style et couleurs" value={formData.details.colorStyle} />}
            {selectedSkinTone && <SummaryRow label="Teinte de peau" value={<span className="inline-flex items-center gap-2"><span className="size-3 rounded-full border border-white/15" style={{backgroundColor: selectedSkinTone.previewHex}} />{selectedSkinTone.label}</span>} />}
          </dl>
          {formData?.details?.description && <div className="mt-4 rounded-xl border border-white/5 bg-noir-700/60 p-3"><p className="mb-1 text-[10px] text-white/40">Description du projet</p><p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/75">{formData.details.description}</p></div>}
          <ReferenceImages referenceFile={referenceFile} sketchFile={sketchFile} />
        </Section>
      </div>
      {selectedMoodboard && <Section title="Moodboard associé" description="Ces inspirations seront partagées avec le salon." icon={<Images size={17} />}><div className="flex items-start gap-3 rounded-xl border border-tertiary-400/20 bg-tertiary-400/5 p-3"><CheckCheck size={16} className="mt-0.5 shrink-0 text-tertiary-400" /><div className="min-w-0"><p className="break-words text-sm text-white/85">{selectedMoodboard.name}</p>{selectedMoodboard.description && <p className="mt-1 break-words text-xs leading-6 text-white/45">{selectedMoodboard.description}</p>}</div><AppButton type="button" variant="secondary" onClick={() => onEdit?.(2)} className="ml-auto px-3! py-1.5! text-xs! shadow-none!">Modifier</AppButton></div></Section>}
      {formData?.message && <div className="rounded-xl border border-white/10 bg-noir-500 p-4"><p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Votre message</p><p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/75">{formData.message}</p></div>}
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 p-4"><Info size={17} className="mt-0.5 shrink-0 text-tertiary-400" /><div><p className="text-xs font-medium text-white/85">{salon.addConfirmationEnabled ? "Une demande soumise au salon" : "Tout est prêt pour votre rendez-vous"}</p><p className="mt-1 text-xs leading-5 text-white/50">{salon.addConfirmationEnabled ? "Le salon validera votre demande et pourra vous contacter pour des précisions. Vous recevrez un email une fois le rendez-vous confirmé." : "Votre rendez-vous sera enregistré après confirmation. Vous recevrez un email avec les informations de votre réservation."}</p></div></div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"><dt className="text-[11px] text-white/40">{label}</dt><dd className="min-w-0 break-words text-xs text-white/85 font-one">{value || "Non renseigné"}</dd></div>;
}

function SummaryFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="flex min-w-0 items-start gap-2.5"><span className="mt-0.5 text-tertiary-400/80" aria-hidden="true">{icon}</span><div className="min-w-0"><p className="text-[10px] text-white/45">{label}</p><p className="mt-1 break-words text-xs leading-5 text-white/90 font-one">{value || "Non renseigné"}</p></div></div>;
}
