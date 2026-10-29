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

  const hoursRef = React.useRef<HTMLDivElement>(null);
  const chooseDate = (date: string) => {
    onDateChange(date);
    if (date) {
      setWeekOffset(Math.max(0, Math.floor((Date.parse(date) - Date.parse(toDateInputValue(new Date()))) / (7 * 86400000))));
      // Reveal the hours only when they would otherwise remain below the viewport.
      requestAnimationFrame(() => {
        const panel = hoursRef.current;
        if (panel && window.innerWidth < 768 && panel.getBoundingClientRect().top > window.innerHeight - 180) {
          panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        }
      });
    }
  };
  const canChooseHours = !isParTatoueurMode || !!selectedTatoueur;

  return (
    <Section title="Votre jour, votre horaire" description={selectedArtist ? `Les disponibilités de ${selectedArtist.name}, en un coup d’œil.` : "Choisissez une date pour découvrir les heures disponibles."} icon={<CalendarDays size={17} />}>
      {artists.length === 0 && isParTatoueurMode ? (
        <p role="status" className="rounded-xl bg-white/3 p-4 text-xs text-white/55">Aucun artiste n’est réservable en ligne pour le moment.</p>
      ) : (
        <div className="grid gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium capitalize text-white/80">{weekDates[0].date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
              <div className="flex gap-1">
                <button type="button" aria-label="Semaine précédente" disabled={weekOffset === 0} onClick={() => setWeekOffset(value => Math.max(0, value - 1))} className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 disabled:opacity-20"><ChevronLeft size={15} /></button>
                <button type="button" aria-label="Semaine suivante" onClick={() => setWeekOffset(value => value + 1)} className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40"><ChevronRight size={15} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDates.map(({ key, date }) => {
                const active = selectedDate === key;
                return (
                  <button type="button" key={key} aria-pressed={active} aria-controls="booking-hours" aria-label={date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} onClick={() => chooseDate(key)} className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-0.5 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${active ? "border-tertiary-400/60 bg-tertiary-400/10 text-tertiary-400 shadow-[0_0_20px_-10px_rgba(255,165,0,0.35)]" : "border-white/8 bg-noir-800/40 text-white/45 hover:border-white/25 hover:bg-white/5"}`}>
                    <span className="text-[9px] capitalize">{date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span>
                    <span className={`text-base font-semibold tabular-nums ${active ? "text-tertiary-400" : "text-white/80"}`}>{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="booking-date" className="text-[11px] text-white/45">Choisir une autre date</label>
              <input id="booking-date" type="date" min={toDateInputValue(new Date())} value={selectedDate} onChange={event => chooseDate(event.target.value)} className="min-w-0 rounded-lg border border-white/10 bg-noir-800 px-2.5 py-2 text-xs text-white/75 outline-none focus:border-tertiary-400/50 [color-scheme:dark]" />
            </div>
          </div>

          {canChooseHours ? (
            <div ref={hoursRef} id="booking-hours" aria-busy={isLoadingSlots} className="min-w-0 scroll-mt-5 border-t border-white/8 pt-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white/90"><Clock3 size={15} className="text-tertiary-400" />Heures disponibles</h3>
                  <p className="mt-1 text-[11px] capitalize text-white/45">{selectedDate ? formatDateKeyForDisplay(selectedDate) : "Choisissez un jour"}</p>
                </div>
                <span role="status" className="rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[10px] text-white/55">
                  {isLoadingSlots ? "Recherche…" : !selectedDate ? "En attente" : `${bookableStarts.length} horaire${bookableStarts.length > 1 ? "s" : ""}`}
                </span>
              </div>
              {!fixedDuration && <div className="mb-3 flex items-center justify-between gap-2"><p className="text-[11px] text-white/50">Durée</p><div className="flex gap-1 rounded-lg border border-white/8 bg-noir-800 p-1">{[1, 2].map(count => <button key={count} type="button" aria-pressed={durationSlots === count} onClick={() => { setDurationSlots(count); onClearSelection(); }} className={`rounded-md px-3 py-1.5 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${durationSlots === count ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>{count * 30} min</button>)}</div></div>}
              <div className="min-h-28">
                {isLoadingSlots ? (
                  <div role="status" className="space-y-3"><span className="sr-only">Recherche des disponibilités…</span><div className="h-3 w-16 animate-pulse rounded bg-white/5 motion-reduce:animate-none" /><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />)}</div></div>
                ) : !selectedDate ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 p-5 text-center"><CalendarSearch size={23} className="text-white/25" /><p className="text-xs text-white/50">Choisissez un jour pour afficher les horaires.</p></div>
                ) : bookableStarts.length ? (
                  <div className="space-y-3">{periods.filter(period => period.starts.length).map(period => <div key={period.label}><p className="mb-2 text-[9px] font-medium uppercase tracking-[0.1em] text-white/35">{period.label}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{period.starts.map(start => {
                    const active = sortedSelection[0] === start;
                    return <button key={start} type="button" aria-pressed={active} onClick={() => onSlotSelection(start, slotCount)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 ${active ? "border-tertiary-400/60 bg-tertiary-400/10 text-tertiary-400" : "border-white/10 bg-noir-800/40 text-white/75 hover:border-tertiary-400/40 hover:bg-tertiary-400/5"}`}>{active && <Check size={12} />}{formatStart(start)}</button>;
                  })}</div></div>)}</div>
                ) : (
                  <div role="status" className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 p-5 text-center"><CalendarSearch size={23} className="text-white/25" /><p className="text-xs font-medium text-white/80">Aucun horaire pour cette durée</p><p className="text-[11px] leading-5 text-white/45">Choisissez un autre jour{!fixedDuration ? " ou une durée plus courte" : ""}.</p></div>
                )}
              </div>
              {fixedDuration && <p className="mt-3 text-[10px] leading-5 text-white/40"><span className="text-white/65">Durée : {requestedMinutes} min.</span> Les créneaux nécessaires sont réservés automatiquement.</p>}
              {(prestation === "TATTOO" || prestation === "RETOUCHE") && <p className="mt-1 text-[10px] leading-5 text-white/40">Minimum une heure. L’artiste pourra ajuster la durée ; vous serez prévenu par email.</p>}
            </div>
          ) : <p role="status" className="self-center text-xs text-white/50">Sélectionnez un artiste pour consulter ses horaires.</p>}

          {!!sortedSelection.length && <div aria-live="polite" className="flex flex-wrap items-center gap-3 rounded-xl border border-tertiary-400/20 bg-tertiary-400/5 p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tertiary-400/10 text-tertiary-400"><Check size={15} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/90">{formatStart(sortedSelection[0])} – {formatEnd(sortedSelection[sortedSelection.length - 1])}</p><p className="mt-1 text-[10px] text-white/45">{formatDateKeyForDisplay(selectedDate)} · {sortedSelection.length * 30} min réservées</p></div><AppButton type="button" variant="secondary" onClick={onClearSelection} className="px-2.5! py-1.5! text-[11px]! shadow-none!">Effacer</AppButton></div>}
        </div>
      )}
    </Section>
  );
}
