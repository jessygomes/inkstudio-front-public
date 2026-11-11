/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { CalendarDays, Info, MapPin, PenTool, UserRound } from "lucide-react";
import { formatDateKeyForDisplay } from "@/lib/utils/date";
import { FlashProps } from "@/lib/type";
import { PROJECT_BUDGET_RANGES, formatDesiredTattooPeriod, formatIsFirstTattoo } from "@/lib/booking-link";
import ReferenceImages from "./ReferenceImages";
import { SkinToneOption, BookingMoodboardOption } from "./types";
import { PRESTATION_LABELS, formatDurationMinutes, getSelectedTimeRange } from "./bookingDisplay";
import { focusRing, iconBadge, surface } from "./ui";

interface RecapStepProps {
  prestation: string;
  formData: any;
  selectedDate: string;
  selectedSlots: string[];
  durationMinutes: number;
  priceLabel: string | null;
  artistName?: string | null;
  choiceLabel?: string | null;
  salon: any;
  referenceFile?: File | null;
  sketchFile?: File | null;
  skinToneOptions?: SkinToneOption[];
  selectedFlash?: FlashProps;
  selectedMoodboard?: BookingMoodboardOption;
  onEdit?: (step: number) => void;
}

function Block({ icon, title, onEdit, children }: { icon: React.ReactNode; title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5 rounded-2xl bg-white/3 p-4">
      <span aria-hidden="true" className={`${iconBadge} size-9!`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">{title}</p>
          {onEdit && <button type="button" onClick={onEdit} className={`rounded-xl bg-white/6 px-3 py-1 text-[11px] text-white/75 transition hover:bg-white/10 hover:text-white ${focusRing}`}>Modifier</button>}
        </div>
        <div className="mt-1 text-sm text-white/90">{children}</div>
      </div>
    </div>
  );
}

export default function RecapStep({
  prestation,
  formData,
  selectedDate,
  selectedSlots,
  durationMinutes,
  priceLabel,
  artistName,
  choiceLabel,
  salon,
  referenceFile,
  sketchFile,
  skinToneOptions = [],
  selectedFlash,
  selectedMoodboard,
  onEdit,
}: RecapStepProps) {
  const range = getSelectedTimeRange(salon, selectedDate, selectedSlots);
  const client = formData?.client ?? {};
  const details = formData?.details ?? {};
  const project = formData?.project ?? {};
  const skin = skinToneOptions.find(option => option.value === details.skin);
  const budget = PROJECT_BUDGET_RANGES.find(item => item.key === project.budget)?.label;
  const extras = [
    { label: "Emplacement", value: details.zone },
    { label: "Taille", value: prestation === "PROJET" ? details.size : null },
    { label: "Teinte de peau", value: skin?.label },
    { label: "Période souhaitée", value: prestation === "PROJET" ? formatDesiredTattooPeriod(project) : null },
    { label: "Budget", value: prestation === "PROJET" ? budget : null },
    { label: "Premier tatouage", value: prestation === "PROJET" ? formatIsFirstTattoo(project.isFirstTattoo === "yes" ? true : project.isFirstTattoo === "no" ? false : null) : null },
    { label: "Moodboard", value: selectedMoodboard?.name },
  ].filter(item => item.value);
  const address = [salon.address, [salon.postalCode, salon.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <div className="space-y-4">
      <section className={`${surface} space-y-2 p-3! sm:p-4!`}>
        <Block icon={<PenTool size={16} />} title="Prestation" onEdit={() => onEdit?.(1)}>
          <div className="flex items-center gap-3">
            {selectedFlash?.imageUrl && <Image src={selectedFlash.imageUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0">
              <p>{PRESTATION_LABELS[prestation] || prestation}</p>
              {choiceLabel && <p className="text-xs text-white/55">{choiceLabel}</p>}
              <p className="text-xs text-white/45">{formatDurationMinutes(durationMinutes)}{priceLabel ? ` · ${priceLabel}` : ""}{artistName ? ` · avec ${artistName}` : ""}</p>
            </div>
          </div>
        </Block>
        <Block icon={<CalendarDays size={16} />} title="Date et heure" onEdit={() => onEdit?.(2)}>
          <p className="capitalize">{selectedDate ? formatDateKeyForDisplay(selectedDate) : "À choisir"}</p>
          {range && <p className="text-xs tabular-nums text-white/55">de {range.start} à {range.end}</p>}
        </Block>
        <Block icon={<MapPin size={16} />} title="Lieu">
          <p>{salon.name}</p>
          {address && <p className="text-xs text-white/55">{address}</p>}
        </Block>
        <Block icon={<UserRound size={16} />} title="Vos coordonnées" onEdit={() => onEdit?.(3)}>
          <p>{[client.firstName, client.lastName].filter(Boolean).join(" ")}</p>
          <p className="break-all text-xs text-white/55">{[client.email, client.phone].filter(Boolean).join(" · ")}</p>
        </Block>
        {(extras.length > 0 || details.description || formData?.message || referenceFile || sketchFile) && (
          <Block icon={<Info size={16} />} title="Vos précisions" onEdit={() => onEdit?.(3)}>
            {details.description && <p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/75">{details.description}</p>}
            {extras.length > 0 && <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">{extras.map(item => <div key={item.label} className="min-w-0"><dt className="text-[10px] text-white/40">{item.label}</dt><dd className="break-words text-white/80">{item.value}</dd></div>)}</dl>}
            {formData?.message && <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-white/4 p-3 text-xs leading-5 text-white/70">« {formData.message} »</p>}
            <ReferenceImages referenceFile={referenceFile} sketchFile={sketchFile} />
          </Block>
        )}
      </section>
      <p className="flex items-start gap-2.5 rounded-2xl bg-linear-to-r from-tertiary-400/10 to-cuatro-500/8 p-4 text-xs leading-5 text-white/65">
        <Info size={14} className="mt-0.5 shrink-0 text-tertiary-400" />
        {salon.addConfirmationEnabled ? "Le salon validera votre demande. Vous recevrez un email dès qu’elle sera confirmée." : "Votre rendez-vous sera confirmé immédiatement. Un email récapitulatif vous sera envoyé."}
      </p>
    </div>
  );
}
