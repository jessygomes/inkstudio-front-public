/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CalendarSearch, Check, ChevronLeft, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import {
  addMinutesToIsoInTimeZone,
  addMinutesToTime,
  formatDateKeyForDisplay,
  getDateKeyInTimeZone,
  getIsoDatePart,
  getIsoTimePart,
  getTimeInTimeZone,
  getWeekdayKeyFromDate,
  resolveSlotDisplayMode,
  toHourLabel,
} from "@/lib/utils/date";
import { parseSalonHours } from "@/lib/horaireHelper";
import { SAME_DAY_BOOKING_MESSAGE, addDaysToDateKey, diffDateKeys, formatDurationMinutes, getParisTodayKey, isDateKey } from "@/lib/booking-link";
import { TimeSlot } from "./types";
import { getBookingSlotRange } from "./slotRange";
import { focusRing, iconBadge, inset, surface } from "./ui";

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

const dayLabel = (key: string, options: Intl.DateTimeFormatOptions) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("fr-FR", { ...options, timeZone: "UTC" });
};

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
  const parsedSalonHours = React.useMemo(() => parseSalonHours(salon.salonHours), [salon.salonHours]);
  const openingForSelectedDate = React.useMemo(() => {
    if (!selectedDate || !parsedSalonHours) return null;
    return parsedSalonHours[getWeekdayKeyFromDate(selectedDate)] ?? null;
  }, [parsedSalonHours, selectedDate]);
  const slotDisplayMode = React.useMemo(() => resolveSlotDisplayMode(timeSlots.map(slot => slot.start), openingForSelectedDate), [openingForSelectedDate, timeSlots]);

  const rawProjectDuration = Number(salon.projectAppointmentDurationMinutes);
  const projectDuration = Number.isFinite(rawProjectDuration) && rawProjectDuration > 0 ? rawProjectDuration : 60;
  const requiredProjectSlots = Math.max(1, Math.ceil(projectDuration / 30));

  // Un créneau de 30 min est indisponible s'il chevauche un blocage ou un rendez-vous existant.
  const isSlotBlocked = (slotStart: string) => {
    if (!selectedTatoueur && isParTatoueurMode) return false;
    const start = Date.parse(slotStart);
    const end = start + 30 * 60 * 1000;
    return blockedSlots.some(blocked => {
      const overlap = start < Date.parse(blocked.endDate) && end > Date.parse(blocked.startDate);
      const concerns = blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;
      return overlap && (!isParTatoueurMode || concerns);
    });
  };
  const isSlotOccupied = (slotStart: string) => {
    const start = Date.parse(slotStart);
    const end = start + 30 * 60 * 1000;
    return occupiedSlots.some(occ => start < Date.parse(occ.end) && end > Date.parse(occ.start));
  };

  // « Aujourd'hui » en Europe/Paris, quel que soit le fuseau du navigateur.
  const todayKey = getParisTodayKey();
  const allowSameDayBooking = salon.allowSameDayBooking !== false;
  const minDateKey = allowSameDayBooking ? todayKey : addDaysToDateKey(todayKey, 1);
  const weekOffsetFor = (date: string) => (isDateKey(date) ? Math.max(0, Math.floor(diffDateKeys(todayKey, date) / 7)) : 0);
  const [weekOffset, setWeekOffset] = React.useState(() => weekOffsetFor(selectedDate));
  const [durationSlots, setDurationSlots] = React.useState(() => Math.min(2, Math.max(1, selectedSlots.length)));

  const flexibleDuration = prestation === "PIERCING";
  const slotCount = prestation === "PROJET" ? requiredProjectSlots : prestation === "TATTOO" ? requiredTattooSlots : prestation === "RETOUCHE" ? 2 : durationSlots;
  const durationMinutes = prestation === "PROJET" ? projectDuration : prestation === "TATTOO" ? Math.max(60, selectedFlashDurationMinutes) : prestation === "RETOUCHE" ? 60 : durationSlots * 30;

  const formatStart = (value: string) => (slotDisplayMode === "timezone" ? getTimeInTimeZone(value) : getIsoTimePart(value));
  const formatEnd = (value: string) => (slotDisplayMode === "timezone" ? addMinutesToIsoInTimeZone(value, 30) : addMinutesToTime(getIsoTimePart(value), 30));
  const toMinutes = (time: string) => { const match = /(\d{1,2})\D+(\d{2})/.exec(time); return match ? Number(match[1]) * 60 + Number(match[2]) : NaN; };
  const parsedClosing = openingForSelectedDate?.end ? toMinutes(openingForSelectedDate.end) : NaN;
  const closingMinutes = Number.isNaN(parsedClosing) ? null : parsedClosing || 24 * 60;
  // Le rendez-vous complet doit tenir dans les disponibilités et se terminer avant la fermeture.
  const endsBeforeClosing = (range: string[]) => closingMinutes === null || (toMinutes(formatEnd(range[range.length - 1])) || 24 * 60) <= closingMinutes;

  const availableStarts = timeSlots.map(slot => slot.start);
  const isUnavailable = (start: string) => isSlotBlocked(start) || isSlotOccupied(start);
  const rangeFrom = (start: string) => {
    const range = getBookingSlotRange(start, slotCount, availableStarts, isUnavailable);
    return range && endsBeforeClosing(range) ? range : null;
  };
  // Tous les créneaux de 30 min libres ce jour-là ; seuls certains permettent de caser tout le rendez-vous.
  const daySlots = Array.from(new Set(availableStarts))
    .filter(value => (slotDisplayMode === "timezone" ? getDateKeyInTimeZone(value) : getIsoDatePart(value)) === selectedDate)
    .filter(value => !isUnavailable(value))
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  const bookableStarts = daySlots.filter(value => rangeFrom(value) !== null);
  const hourOf = (value: string) => Number(formatStart(value).split(":")[0]);
  const periods = [
    { label: "Matin", slots: daySlots.filter(value => hourOf(value) < 12) },
    { label: "Après-midi", slots: daySlots.filter(value => hourOf(value) >= 12 && hourOf(value) < 18) },
    { label: "Soir", slots: daySlots.filter(value => hourOf(value) >= 18) },
  ].filter(period => period.slots.length);
  const [hoverStart, setHoverStart] = React.useState<string | null>(null);
  const previewRange = hoverStart ? rangeFrom(hoverStart) ?? [] : [];

  const sortedSelection = [...selectedSlots].sort((a, b) => Date.parse(a) - Date.parse(b));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const key = addDaysToDateKey(todayKey, weekOffset * 7 + index);
    return { key, disabled: key < minDateKey };
  });

  const chooseDate = (date: string) => {
    if (!isDateKey(date) || date < minDateKey) return;
    onDateChange(date);
    setWeekOffset(weekOffsetFor(date));
  };

  if (artists.length === 0 && isParTatoueurMode) {
    return <p role="status" className={`${surface} text-xs text-white/55`}>Aucun artiste n’est réservable en ligne pour le moment.</p>;
  }
  if (isParTatoueurMode && !selectedTatoueur) {
    return <p role="status" className={`${surface} text-xs text-white/55`}>Choisissez d’abord un artiste pour voir ses disponibilités.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Jour */}
      <section aria-labelledby="booking-day-title" className={surface}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="booking-day-title" className="text-base font-semibold capitalize tracking-tight text-white">{dayLabel(weekDays[0].key, { month: "long", year: "numeric" })}</h2>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Semaine précédente" disabled={weekOffset === 0} onClick={() => setWeekOffset(value => Math.max(0, value - 1))} className={`grid size-9 place-items-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-20 ${focusRing}`}><ChevronLeft size={16} /></button>
            <button type="button" aria-label="Semaine suivante" onClick={() => setWeekOffset(value => value + 1)} className={`grid size-9 place-items-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white ${focusRing}`}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(({ key, disabled }) => {
            const active = selectedDate === key;
            return (
              <button key={key} type="button" disabled={disabled} aria-pressed={active} aria-label={dayLabel(key, { weekday: "long", day: "numeric", month: "long" }) + (disabled ? ", indisponible" : "")} onClick={() => chooseDate(key)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl py-3 transition disabled:cursor-not-allowed disabled:opacity-25 ${focusRing} ${active ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900 shadow-lg shadow-tertiary-500/20" : "bg-white/4 text-white/75 hover:bg-white/8"}`}>
                <span className={`text-[10px] capitalize ${active ? "text-noir-900/70" : "text-white/45"}`}>{key === todayKey ? "Auj." : dayLabel(key, { weekday: "short" }).replace(".", "")}</span>
                <span className="text-base font-semibold tabular-nums">{Number(key.slice(8, 10))}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {!allowSameDayBooking ? <p className="text-[11px] text-white/40">{SAME_DAY_BOOKING_MESSAGE}.</p> : <span />}
          <label className="flex items-center gap-2 text-[11px] text-white/45">Aller au
            <input type="date" min={minDateKey} value={selectedDate} onChange={event => chooseDate(event.target.value)} className="rounded-xl bg-white/5 px-3 py-1.5 text-xs text-white/75 outline-none transition hover:bg-white/8 focus:ring-2 focus:ring-tertiary-400/40 [color-scheme:dark]" />
          </label>
        </div>
      </section>

      {/* Heure */}
      <section aria-labelledby="booking-hour-title" aria-busy={isLoadingSlots} className={surface}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="booking-hour-title" className="text-base font-semibold tracking-tight text-white">À quelle heure ?</h2>
            <p className="mt-1 text-xs capitalize text-white/45">{selectedDate ? formatDateKeyForDisplay(selectedDate) : "Choisissez un jour"}</p>
          </div>
        </div>

        {/* Durée mise en avant : le client voit combien de créneaux de 30 min seront pris. */}
        <div className="mb-6 rounded-2xl bg-linear-to-br from-tertiary-400/15 via-tertiary-500/8 to-cuatro-500/12 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className={iconBadge}><Clock3 size={18} /></span>
              <div>
                <p className="text-[11px] text-white/55">Durée de votre rendez-vous</p>
                <p className="text-lg font-semibold leading-6 text-white">{formatDurationMinutes(durationMinutes)}</p>
              </div>
            </div>
            {flexibleDuration && (
              <div role="group" aria-label="Choisir la durée" className="flex rounded-2xl bg-noir-900/60 p-1">
                {[1, 2].map(count => <button key={count} type="button" aria-pressed={durationSlots === count} onClick={() => { setDurationSlots(count); onClearSelection(); }} className={`rounded-xl px-3.5 py-1.5 text-xs transition ${focusRing} ${durationSlots === count ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 font-medium text-noir-900" : "text-white/55 hover:text-white"}`}>{count === 1 ? "30 min" : "1 h"}</button>)}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/65">
            <span aria-hidden="true" className="flex gap-0.5">{Array.from({ length: Math.min(slotCount, 12) }, (_, index) => <span key={index} className="h-2.5 w-4 rounded-full bg-linear-to-r from-tertiary-400 to-tertiary-500" />)}</span>
            <span>{slotCount > 1 ? <><strong className="font-semibold text-white">{slotCount} créneaux de 30 min</strong> à la suite</> : <strong className="font-semibold text-white">1 créneau de 30 min</strong>}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-white/45">{slotCount > 1 ? `Touchez l’heure de début : les ${slotCount} créneaux sont sélectionnés automatiquement.` : "Touchez le créneau qui vous convient."}</p>
        </div>

        <div className="min-h-24" aria-live="polite">
          {isLoadingSlots ? (
            <p role="status" className="flex items-center gap-2 py-6 text-xs text-white/45"><LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" />Recherche des horaires libres…</p>
          ) : bookableStarts.length ? (
            <div className="space-y-4" onMouseLeave={() => setHoverStart(null)}>
              {periods.map(period => (
                <div key={period.label}>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">{period.label}</p>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 xl:grid-cols-6">
                    {period.slots.map(start => {
                      const position = sortedSelection.indexOf(start);
                      const selected = position !== -1;
                      const previewed = !selected && previewRange.includes(start);
                      const startable = bookableStarts.includes(start);
                      const startLabel = toHourLabel(formatStart(start));
                      const fullRange = startable ? rangeFrom(start) : null;
                      const label = fullRange
                        ? `Commencer à ${startLabel}, fin à ${toHourLabel(formatEnd(fullRange[fullRange.length - 1]))}`
                        : `${startLabel} : pas assez de temps libre ensuite pour ${formatDurationMinutes(durationMinutes)}`;
                      return (
                        <button key={start} type="button" disabled={!startable && !selected} aria-pressed={sortedSelection[0] === start} aria-label={label} title={startable ? undefined : label}
                          onClick={() => { if (startable) onSlotSelection(start, slotCount); }}
                          onMouseEnter={() => setHoverStart(startable ? start : null)} onFocus={() => setHoverStart(startable ? start : null)} onBlur={() => setHoverStart(null)}
                          className={`relative flex min-h-13 flex-col items-center justify-center rounded-xl px-1 tabular-nums transition disabled:cursor-not-allowed ${focusRing} ${selected ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900 shadow-lg shadow-tertiary-500/20" : previewed ? "bg-tertiary-400/20 text-white" : startable ? "bg-white/4 text-white/85 hover:bg-white/8" : "bg-white/1.5 text-white/20"}`}>
                          <span className="text-sm font-semibold leading-5">{startLabel}</span>
                          <span className={`text-[10px] leading-3 ${selected ? "text-noir-900/65" : "text-white/35"}`}>→ {toHourLabel(formatEnd(start))}</span>
                          {selected && slotCount > 1 && <span aria-hidden="true" className="absolute right-1.5 top-1.5 rounded-full bg-noir-900/20 px-1.5 text-[9px] font-semibold leading-3.5">{position + 1}/{slotCount}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div role="status" className={`flex flex-col items-center gap-2 ${inset} p-6 text-center`}>
              <CalendarSearch size={22} className="text-white/25" />
              <p className="text-xs font-medium text-white/80">Plus d’horaire libre ce jour-là</p>
              <button type="button" onClick={() => chooseDate(addDaysToDateKey(selectedDate || minDateKey, 1))} className={`mt-1 inline-flex items-center gap-1 rounded-xl bg-white/8 px-4 py-2 text-xs text-white/85 transition hover:bg-white/12 hover:text-white ${focusRing}`}>Voir le jour suivant<ChevronRight size={13} /></button>
            </div>
          )}
        </div>

        {sortedSelection.length > 0 && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-linear-to-r from-tertiary-400/15 to-cuatro-500/10 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900"><Check size={15} /></span>
            <p className="min-w-0 text-xs text-white/85"><span className="capitalize">{formatDateKeyForDisplay(selectedDate)}</span><br /><span className="tabular-nums text-white/60">de {toHourLabel(formatStart(sortedSelection[0]))} à {toHourLabel(formatEnd(sortedSelection[sortedSelection.length - 1]))} · {sortedSelection.length} créneau{sortedSelection.length > 1 ? "x" : ""} de 30 min</span></p>
          </div>
        )}
      </section>
    </div>
  );
}
