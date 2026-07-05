/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";

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
import { TimeSlot } from "./types";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

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
  onSlotSelection: (slotStart: string) => void;
  onClearSelection: () => void;
  occupiedSlots: any[];
  blockedSlots: any[];
  isLoadingSlots: boolean;
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
}: SlotSelectionProps) {
  const { register } = useFormContext();
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

  const buildSlotsFromRanges = (
    ranges: any[],
    startKey: "start" | "startDate",
    endKey: "end" | "endDate",
  ) => {
    if (!selectedDate) return [] as string[];

    const dayStart = new Date(`${selectedDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${selectedDate}T23:59:59.999Z`);
    const slots: string[] = [];

    ranges.forEach((range) => {
      const rangeStart = new Date(range[startKey]);
      const rangeEnd = new Date(range[endKey]);

      const start = new Date(
        Math.max(rangeStart.getTime(), dayStart.getTime()),
      );
      const end = new Date(Math.min(rangeEnd.getTime(), dayEnd.getTime()));

      if (start >= end) return;

      const alignedStart = new Date(start);
      alignedStart.setSeconds(0, 0);
      const remainder = alignedStart.getMinutes() % 30;
      if (remainder !== 0) {
        alignedStart.setMinutes(alignedStart.getMinutes() + (30 - remainder));
      }

      for (
        let cursor = alignedStart;
        cursor < end;
        cursor = new Date(cursor.getTime() + 30 * 60 * 1000)
      ) {
        slots.push(cursor.toISOString());
      }
    });

    return slots;
  };

  const displayedSlotStarts = React.useMemo(() => {
    const available = timeSlots.map((slot) => slot.start);
    const occupied = buildSlotsFromRanges(occupiedSlots, "start", "end");
    const blocked = buildSlotsFromRanges(blockedSlots, "startDate", "endDate");
    const merged = Array.from(
      new Set([...available, ...occupied, ...blocked, ...selectedSlots]),
    );

    return merged
      .filter((slotStart) => {
        const slotDateKey =
          slotDisplayMode === "timezone"
            ? getDateKeyInTimeZone(slotStart)
            : getIsoDatePart(slotStart);

        return slotDateKey === selectedDate;
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [
    timeSlots,
    occupiedSlots,
    blockedSlots,
    selectedSlots,
    selectedDate,
    slotDisplayMode,
  ]);

  return (
    <Section title="Choisir ses créneaux">
      {/* Champ Visio pour prestation PROJET */}
      {prestation === "PROJET" && (
        <div className="mb-4 bg-white/5 p-3 rounded-2xl border border-white/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("visio")}
              className="w-4 h-4 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-tertiary-400 transition-colors accent-tertiary-400 mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm text-white/90 font-one block">
                Rendez-vous en visioconférence
              </span>
              <p className="text-xs text-white/60 font-one mt-0.5">
                Cochez cette case si vous souhaitez que ce rendez-vous se
                déroule en ligne
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Vérification si des tatoueurs sont disponibles */}
      {artists.length === 0 && isParTatoueurMode ? (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-4 text-center">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-orange-300 font-one mb-1">
            Aucun tatoueur disponible
          </h3>
          <p className="text-orange-300/80 text-sm font-one">
            Les réservations en ligne ne sont pas activées pour ce salon.
          </p>
        </div>
      ) : (
        <>
          {/* Tatoueur choisi + date */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:gap-4">
            {isParTatoueurMode && selectedArtist && (
              <div className="mb-3 sm:mb-0 max-w-sm rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-white/60 font-one">
                  Agenda affiché
                </p>
                <p className="text-white font-one text-sm mt-0.5">
                  {selectedArtist.name}
                </p>
                {selectedArtist.isLinkedUser && (
                  <p className="text-xs text-tertiary-300 mt-1.5 font-one">
                    Tatoueur avec compte personnel
                  </p>
                )}
              </div>
            )}

            {/* Sélection de date */}
            {!isParTatoueurMode || selectedTatoueur ? (
              <div>
                <label className="text-xs text-white/80 font-one mb-2 block uppercase tracking-wide">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  min={toDateInputValue(new Date())}
                  className="w-full max-w-xs p-2.5 bg-white/2 border border-white/10 rounded-2xl font-one text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                />
              </div>
            ) : null}
          </div>

          {/* Créneaux disponibles */}
          {selectedDate &&
            (!isParTatoueurMode || selectedTatoueur) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-one mb-1">Créneaux</h3>
                  <p className="text-sm text-white/60 font-one">
                    Les créneaux occupés et bloqués sont affichés mais non
                    sélectionnables
                  </p>
                </div>

                {/* Légende */}
                <div className="bg-white/3 rounded-2xl border border-white/10 p-3">
                  <h4 className="text-white/80 font-one font-semibold text-xs mb-2 uppercase tracking-wide">
                    Légende
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white/20 rounded" />
                      <span className="text-white/70 font-one">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-linear-to-br from-tertiary-500/30 to-tertiary-400/20 border border-tertiary-400/60 rounded" />
                      <span className="text-white/70 font-one">
                        Sélectionné
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-linear-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/40 rounded" />
                      <span className="text-white/70 font-one">Occupé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-linear-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded" />
                      <span className="text-white/70 font-one">Bloqué</span>
                    </div>
                  </div>
                </div>

                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-white/3 rounded-2xl border border-white/10">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mb-3"></div>
                    <span className="text-white font-one text-sm">
                      Chargement des créneaux...
                    </span>
                  </div>
                ) : displayedSlotStarts.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">
                        Cliquez sur les créneaux pour les sélectionner (doivent
                        être consécutifs). Maximum 1h par réservation (2
                        créneaux de 30 min). Les créneaux occupés ou bloqués
                        restent visibles.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {displayedSlotStarts.map((slotStartIso) => {
                          const startTime =
                            slotDisplayMode === "timezone"
                              ? getTimeInTimeZone(slotStartIso)
                              : getIsoTimePart(slotStartIso);
                          const endTime =
                            slotDisplayMode === "timezone"
                              ? addMinutesToIsoInTimeZone(slotStartIso, 30)
                              : addMinutesToTime(startTime, 30);

                          const isSelected =
                            selectedSlots.includes(slotStartIso);
                          const isOccupied = isSlotOccupied(slotStartIso);
                          const isBlocked = isSlotBlocked(slotStartIso);
                          const isAvailable = timeSlots.some(
                            (slot) => slot.start === slotStartIso,
                          );
                          const isDisabled =
                            !isAvailable || isOccupied || isBlocked;

                          return (
                            <button
                              key={slotStartIso}
                              type="button"
                              onClick={() =>
                                !isDisabled && onSlotSelection(slotStartIso)
                              }
                              disabled={isDisabled}
                              className={classNames(
                                "cursor-pointer p-3 rounded-2xl text-xs font-one font-medium transition-all duration-200 border",
                                isSelected &&
                                  "bg-linear-to-br from-tertiary-500/30 to-tertiary-400/20 border-tertiary-400/60 text-white shadow-lg",
                                !isSelected &&
                                  !isDisabled &&
                                  "bg-linear-to-br border-white/20 text-white/80 hover:bg-white/12",
                                isOccupied &&
                                  "bg-linear-to-br from-gray-500/20 to-gray-600/10 border-gray-500/40 text-gray-400 cursor-not-allowed",
                                isBlocked &&
                                  "bg-linear-to-br from-red-500/20 to-red-600/10 border-red-500/40 text-red-400 cursor-not-allowed",
                              )}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span>{startTime}</span>
                                <span className="text-[10px] opacity-70">
                                  {endTime}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Résumé de sélection */}
                      <div className="flex flex-wrap gap-3 text-xs text-white/70 font-one">
                        <div className="flex items-center gap-1.5">
                          <span>Total :</span>
                          <span>{displayedSlotStarts.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>Sélectionnés :</span>
                          <span className="text-tertiary-400">
                            {selectedSlots.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>Durée :</span>
                          <span className="text-tertiary-400">
                            {selectedSlots.length * 30} min
                          </span>
                        </div>
                        {selectedSlots.length > 0 && (
                          <button
                            type="button"
                            onClick={onClearSelection}
                            className="cursor-pointer ml-auto px-3 py-1 rounded-2xl border border-white/20 text-white/80 hover:bg-white/12 transition-colors"
                          >
                            Tout désélectionner
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Récapitulatif de sélection */}
                    {selectedSlots.length > 0 && (
                      <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-8 h-8 rounded-2xl bg-tertiary-500/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-tertiary-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="text-white font-one text-sm">
                                Créneaux sélectionnés
                              </h4>
                              <p className="text-xs text-white/60 font-one">
                                Vérifiez votre sélection
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Date
                                </p>
                                <p className="text-white font-one text-sm">
                                  {formatDateKeyForDisplay(selectedDate)}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Horaire
                                </p>
                                <p className="text-white font-one text-sm">
                                  {getIsoTimePart(selectedSlots[0])}{" "}
                                  -{" "}
                                  {addMinutesToTime(
                                    getIsoTimePart(
                                      selectedSlots[selectedSlots.length - 1],
                                    ),
                                    30,
                                  )}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Durée
                                </p>
                                <p className="text-white font-one text-sm">
                                  {selectedSlots.length * 30} min
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Créneaux
                                </p>
                                <p className="text-white font-one text-sm">
                                  {selectedSlots.length} x 30min
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-4 text-center">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-5 h-5 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-orange-300 font-one mb-1">
                      Aucun créneau disponible
                    </h3>
                    <p className="text-orange-300/80 text-sm font-one">
                      Essayez une autre date ou un autre tatoueur
                    </p>
                  </div>
                )}
              </div>
            )}
        </>
      )}
    </Section>
  );
}
