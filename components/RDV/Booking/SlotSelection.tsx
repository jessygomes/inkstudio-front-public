/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Check, CalendarSearch } from "lucide-react";


import {
  addMinutesToTime,
  formatDateKeyForDisplay,
  getDateKeyInTimeZone,
  getIsoDatePart,
  getIsoTimePart,
  getTimeInTimeZone,
  getWeekdayKeyFromDate,
  resolveSlotDisplayMode,
  addMinutesToIsoInTimeZone,
  toDateInputValue,
} from "@/lib/utils/date";
import { parseSalonHours } from "@/lib/horaireHelper";
import Section from "./Section";
import AppButton from "@/components/Shared/AppButton";
import { TimeSlot } from "./types";
import { getBookingSlotRange } from "./slotRange";

interface SlotSelectionProps {
  prestation: string;
  salon: any;
  artists: any[];
  isParTatoueurMode: boolean;
  selectedTatoueur: string | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  timeSlots: TimeSlot[];
  selectedSlots: string[];
  onSlotSelection: (slotStart: string, durationSlots?: number) => void;
  onClearSelection: () => void;
  occupiedSlots: any[];
  blockedSlots: any[];
  isLoadingSlots: boolean;
  selectedFlashId?: string;
  selectedFlashDurationMinutes?: number;
  requiredTattooSlots?: number;
}

export default function SlotSelection({
  prestation,
  salon,
  artists,
  isParTatoueurMode,
  selectedTatoueur,
  selectedDate,
  onDateChange,
  timeSlots,
  selectedSlots,
  onSlotSelection,
  onClearSelection,
  occupiedSlots,
  blockedSlots,
  isLoadingSlots,
  selectedFlashDurationMinutes = 60,
  requiredTattooSlots = 2,
}: SlotSelectionProps) {

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
      resolveSlotDisplayMode(
        timeSlots.map((slot) => slot.start),
        openingForSelectedDate,
      ),
    [openingForSelectedDate, timeSlots],
  );

  const selectedArtist = React.useMemo(
    () => artists.find((artist) => artist.id === selectedTatoueur) || null,
    [artists, selectedTatoueur],
  );
  const rawProjectDuration = Number(salon.projectAppointmentDurationMinutes);
  const projectAppointmentDurationMinutes = Number.isFinite(rawProjectDuration) && rawProjectDuration > 0 ? rawProjectDuration : 60;
  const requiredProjectSlots = Math.max(1, Math.ceil(projectAppointmentDurationMinutes / 30));

  // Vérifier si un créneau est bloqué
  const isSlotBlocked = (slotStart: string) => {
    if (!selectedTatoueur && isParTatoueurMode) return false;

    const slotStartDate = new Date(slotStart);
    const slotEndDate = new Date(slotStartDate.getTime() + 30 * 60 * 1000);

    return blockedSlots.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      const hasOverlap =
        slotStartDate.getTime() < blockedEnd.getTime() &&
        slotEndDate.getTime() > blockedStart.getTime();

      const concernsTatoueur =
        blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;

      return (
        hasOverlap && (!isParTatoueurMode || concernsTatoueur)
      );
    });
  };

  // Vérifier si un créneau est occupé
  const isSlotOccupied = (slotStart: string) => {
    const sStart = new Date(slotStart);
    const sEnd = new Date(sStart.getTime() + 30 * 60 * 1000);

    return occupiedSlots.some((occ) => {
      const oStart = new Date(occ.start);
      const oEnd = new Date(occ.end);
      return sStart < oEnd && sEnd > oStart;
    });
  };

  const displayedSlotStarts = Array.from(new Set(timeSlots.map(slot => slot.start)))
    .filter(value => (slotDisplayMode === "timezone" ? getDateKeyInTimeZone(value) : getIsoDatePart(value)) === selectedDate)
    .sort((a, b) => Date.parse(a) - Date.parse(b));

  const [weekOffset, setWeekOffset] = React.useState(() => Math.max(0, Math.floor((Date.parse(selectedDate) - Date.parse(toDateInputValue(new Date()))) / (7 * 86400000))) || 0);
  const [durationSlots, setDurationSlots] = React.useState(() => Math.min(2, Math.max(1, selectedSlots.length)));
  const fixedDuration = prestation === "PROJET" || prestation === "TATTOO" || prestation === "RETOUCHE";
  const slotCount = prestation === "PROJET" ? requiredProjectSlots : prestation === "TATTOO" ? requiredTattooSlots : prestation === "RETOUCHE" ? 2 : durationSlots;
  const requestedMinutes = prestation === "PROJET" ? projectAppointmentDurationMinutes : prestation === "TATTOO" ? Math.max(60, selectedFlashDurationMinutes) : prestation === "RETOUCHE" ? 60 : durationSlots * 30;
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + weekOffset * 7 + index);
    return { key: toDateInputValue(date), date };
  });
  const formatStart = (value: string) => slotDisplayMode === "timezone" ? getTimeInTimeZone(value) : getIsoTimePart(value);
  const formatEnd = (value: string) => slotDisplayMode === "timezone" ? addMinutesToIsoInTimeZone(value, 30) : addMinutesToTime(getIsoTimePart(value), 30);
  const availableStarts = timeSlots.map(slot => slot.start);
  const bookableStarts = displayedSlotStarts.filter(value => getBookingSlotRange(value, slotCount, availableStarts, start => isSlotBlocked(start) || isSlotOccupied(start)) !== null);
  const periods = [
    { label: "Matin", starts: bookableStarts.filter(value => Number(formatStart(value).split(":")[0]) < 12) },
    { label: "Après-midi", starts: bookableStarts.filter(value => { const hour = Number(formatStart(value).split(":")[0]); return hour >= 12 && hour < 18; }) },
    { label: "Soir", starts: bookableStarts.filter(value => Number(formatStart(value).split(":")[0]) >= 18) },
  ];
  const sortedSelection = [...selectedSlots].sort();

  return (
    <div className="space-y-4">
      <Section title="Quand souhaitez-vous venir ?" description={selectedArtist ? `Consultez les disponibilités de ${selectedArtist.name}.` : "Choisissez votre jour, puis l’heure qui vous convient."} icon={<CalendarDays size={17} />}>
        {artists.length === 0 && isParTatoueurMode ? <p role="status" className="rounded-xl bg-white/3 p-4 text-xs text-white/55">Aucun artiste n’est réservable en ligne pour le moment.</p> : <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium capitalize text-white/75">{weekDates[0].date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
            <div className="flex gap-1"><button type="button" aria-label="Semaine précédente" disabled={weekOffset === 0} onClick={() => setWeekOffset(value => Math.max(0, value - 1))} className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:bg-white/5 disabled:opacity-20"><ChevronLeft size={14} /></button><button type="button" aria-label="Semaine suivante" onClick={() => setWeekOffset(value => value + 1)} className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:bg-white/5"><ChevronRight size={14} /></button></div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{weekDates.map(({ key, date }) => {
            const active = selectedDate === key;
            return <button type="button" key={key} aria-pressed={active} aria-label={date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} onClick={() => onDateChange(key)} className={`flex min-w-0 flex-col items-center gap-2 rounded-xl border px-1 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${active ? "border-tertiary-400/60 bg-tertiary-400/10 text-white" : "border-white/8 bg-noir-700/40 text-white/45 hover:border-white/25"}`}><span className="text-[9px] capitalize sm:text-[10px]">{date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span><span className={`text-base font-semibold ${active ? "text-tertiary-400" : "text-white/80"}`}>{date.getDate()}</span><span className={`size-1 rounded-full ${active ? "bg-tertiary-400" : "bg-white/15"}`} /></button>;
          })}</div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3"><label htmlFor="booking-date" className="text-[11px] text-white/45">Une autre date ?</label><input id="booking-date" type="date" min={toDateInputValue(new Date())} value={selectedDate} onChange={e => { onDateChange(e.target.value); if (e.target.value) setWeekOffset(Math.max(0, Math.floor((Date.parse(e.target.value) - Date.parse(toDateInputValue(new Date()))) / (7 * 86400000)))); }} className="min-w-0 rounded-lg border border-white/10 bg-noir-700 px-3 py-2 text-xs text-white/75 outline-none focus:border-tertiary-400/50 [color-scheme:dark]" /></div>
        </div>}
      </Section>
      {(!isParTatoueurMode || selectedTatoueur) && <Section title="Choisissez votre heure de début" description={selectedDate ? formatDateKeyForDisplay(selectedDate) : "Les disponibilités s’afficheront après le choix d’une date."} icon={<Clock3 size={17} />}>
        {!fixedDuration && <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-white/50">Durée du rendez-vous</p><div className="flex gap-1 rounded-lg border border-white/8 bg-noir-700 p-1">{[1, 2].map(count => <button key={count} type="button" aria-pressed={durationSlots === count} onClick={() => { setDurationSlots(count); onClearSelection(); }} className={`rounded-md px-3 py-1.5 text-[11px] transition ${durationSlots === count ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>{count * 30} min</button>)}</div></div>}
        {fixedDuration && <p className="mb-4 rounded-lg bg-tertiary-400/5 px-3 py-2.5 text-[11px] leading-5 text-white/55">Durée prévue : <strong className="font-medium text-white/85">{requestedMinutes} min</strong>. Choisissez une heure de début, nous réservons les créneaux nécessaires.</p>}
        {(prestation === "TATTOO" || prestation === "RETOUCHE") && <p className="mb-4 rounded-xl border border-white/10 bg-noir-700/40 p-3 text-xs leading-6 text-white/55">Prévoyez <strong className="font-medium text-white/85">au minimum une heure</strong> pour un tatouage ou une retouche. Le salon ou le tatoueur pourra ajuster la durée selon votre projet. <span className="text-white/75">Vous recevrez un email si la durée de votre rendez-vous est modifiée.</span></p>}
        {isLoadingSlots ? <div role="status" className="space-y-3 py-4"><p className="text-xs text-white/45">Recherche des disponibilités…</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />)}</div></div> : !selectedDate ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center"><CalendarSearch size={26} className="text-white/20" /><p className="text-xs text-white/45">Commencez par choisir une date au-dessus.</p></div> : bookableStarts.length ? <div className="space-y-4">{periods.filter(period => period.starts.length).map(period => <div key={period.label}><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-white/35">{period.label}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{period.starts.map(start => {
          const active = sortedSelection[0] === start;
          return <button key={start} type="button" aria-pressed={active} onClick={() => onSlotSelection(start, slotCount)} className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 ${active ? "border-tertiary-400/60 bg-tertiary-400/10 text-tertiary-400" : "border-white/10 bg-noir-700/40 text-white/75 hover:border-tertiary-400/40 hover:bg-white/5"}`}>{active && <Check size={12} />}{formatStart(start)}</button>;
        })}</div></div>)}</div> : <div role="status" className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 p-6 text-center"><CalendarSearch size={26} className="text-white/25" /><div><p className="text-sm text-white/80">Pas de disponibilité pour cette durée</p><p className="mt-1 text-xs leading-5 text-white/45">Essayez une autre date{!fixedDuration ? " ou une durée plus courte" : ""}.</p></div></div>}
        {!!sortedSelection.length && <div aria-live="polite" className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-tertiary-400/20 bg-tertiary-400/5 p-3.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tertiary-400/10 text-tertiary-400"><Check size={15} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/90">{formatStart(sortedSelection[0])} – {formatEnd(sortedSelection[sortedSelection.length - 1])}</p><p className="mt-1 text-[10px] text-white/45">{formatDateKeyForDisplay(selectedDate)} · {sortedSelection.length * 30} min réservées</p></div><AppButton type="button" variant="secondary" onClick={onClearSelection} className="px-2.5! py-1.5! text-[11px]! shadow-none!">Effacer</AppButton></div>}
      </Section>}
    </div>
  );
}