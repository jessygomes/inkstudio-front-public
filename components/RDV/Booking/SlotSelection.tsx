/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";

import Section from "./Section";
import { TimeSlot } from "./types";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

interface SlotSelectionProps {
  prestation: string;
  salon: any;
  artists: any[];
  selectedTatoueur: string | null;
  onTatoueurChange: (tatoueurId: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  timeSlots: TimeSlot[];
  selectedSlots: string[];
  onSlotSelection: (slotStart: string) => void;
  occupiedSlots: any[];
  blockedSlots: any[];
  isLoadingSlots: boolean;
}

export default function SlotSelection({
  prestation,
  salon,
  artists,
  selectedTatoueur,
  onTatoueurChange,
  selectedDate,
  onDateChange,
  timeSlots,
  selectedSlots,
  onSlotSelection,
  occupiedSlots,
  blockedSlots,
  isLoadingSlots,
}: SlotSelectionProps) {
  const { register } = useFormContext();

  // Vérifier si un créneau est bloqué
  const isSlotBlocked = (slotStart: string) => {
    if (!selectedTatoueur && !salon.appointmentBookingEnabled) return false;

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
        hasOverlap && (salon.appointmentBookingEnabled || concernsTatoueur)
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

  return (
    <Section title="Choisir le tatoueur et les créneaux">
      {/* Champ Visio pour prestation PROJET */}
      {prestation === "PROJET" && (
        <div className="mb-4 bg-white/[0.05] p-3 rounded-md border border-white/10">
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
      {artists.length === 0 && !salon.appointmentBookingEnabled ? (
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
          {/* Sélection du tatoueur ou date directe */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:gap-4">
            {!salon.appointmentBookingEnabled && (
              <div className="mb-3 sm:mb-0">
                <label className="text-xs text-white/80 font-one mb-2 block uppercase tracking-wide">
                  Tatoueur souhaité
                </label>
                <select
                  className="w-full max-w-xs p-2.5 bg-white/[0.05] border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                  value={selectedTatoueur || ""}
                  onChange={(e) => onTatoueurChange(e.target.value)}
                >
                  <option value="" className="bg-noir-500">
                    -- Choisissez un tatoueur --
                  </option>
                  {artists.map((tatoueur) => (
                    <option
                      key={tatoueur.id}
                      value={tatoueur.id}
                      className="bg-noir-500"
                    >
                      {tatoueur.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sélection de date */}
            {(salon.appointmentBookingEnabled || selectedTatoueur) && (
              <div>
                <label className="text-xs text-white/80 font-one mb-2 block uppercase tracking-wide">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full max-w-xs p-2.5 bg-white/[0.05] border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                />
              </div>
            )}
          </div>

          {/* Créneaux disponibles */}
          {selectedDate &&
            (salon.appointmentBookingEnabled || selectedTatoueur) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-one mb-1">
                    Créneaux disponibles
                  </h3>
                  <p className="text-sm text-white/60 font-one">
                    Sélectionnez les créneaux consécutifs à réserver
                  </p>
                </div>

                {/* Légende */}
                <div className="bg-white/[0.03] rounded-md border border-white/10 p-3">
                  <h4 className="text-white/80 font-one font-semibold text-xs mb-2 uppercase tracking-wide">
                    Légende
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white/20 rounded" />
                      <span className="text-white/70 font-one">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-tertiary-500/30 to-tertiary-400/20 border border-tertiary-400/60 rounded" />
                      <span className="text-white/70 font-one">
                        Sélectionné
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/40 rounded" />
                      <span className="text-white/70 font-one">Occupé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded" />
                      <span className="text-white/70 font-one">Bloqué</span>
                    </div>
                  </div>
                </div>

                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-white/[0.03] rounded-md border border-white/10">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mb-3"></div>
                    <span className="text-white font-one text-sm">
                      Chargement des créneaux...
                    </span>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {prestation === "PROJET" ? (
                        <p className="text-xs text-white/50">
                          Pour un rendez-vous projet, sélectionnez un seul
                          créneau de 30 minutes.
                        </p>
                      ) : (
                        <p className="text-xs text-white/50">
                          Cliquez sur les créneaux pour les sélectionner
                          (doivent être consécutifs).
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {timeSlots.map((slot) => {
                          const slotStart = new Date(slot.start);
                          const slotEnd = new Date(slot.end);
                          const startTime = slotStart.toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          );
                          const endTime = slotEnd.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          const isSelected = selectedSlots.includes(slot.start);
                          const isOccupied = isSlotOccupied(slot.start);
                          const isBlocked = isSlotBlocked(slot.start);
                          const isDisabled = isOccupied || isBlocked;

                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() =>
                                !isDisabled && onSlotSelection(slot.start)
                              }
                              disabled={isDisabled}
                              className={classNames(
                                "cursor-pointer p-3 rounded-md text-xs font-one font-medium transition-all duration-200 border-1 ",
                                isSelected &&
                                  "bg-gradient-to-br from-tertiary-500/30 to-tertiary-400/20 border-tertiary-400/60 text-white shadow-lg",
                                !isSelected &&
                                  !isDisabled &&
                                  "bg-gradient-to-br border-white/20 text-white/80 hover:bg-white/[0.12]",
                                isOccupied &&
                                  "bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500/40 text-gray-400 cursor-not-allowed",
                                isBlocked &&
                                  "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/40 text-red-400 cursor-not-allowed",
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
                      <div className="flex flex-wrap gap-3 text-xs text-white/70">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">Total:</span>
                          <span>{timeSlots.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">Sélectionnés:</span>
                          <span className="text-tertiary-400">
                            {selectedSlots.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">Durée:</span>
                          <span className="text-tertiary-400">
                            {selectedSlots.length * 30} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Récapitulatif de sélection */}
                    {selectedSlots.length > 0 && (
                      <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-tertiary-500/20 flex items-center justify-center">
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
                              <div className="bg-white/5 rounded-md p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Date
                                </p>
                                <p className="text-white font-one text-sm">
                                  {new Date(selectedDate).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Horaire
                                </p>
                                <p className="text-white font-one text-sm">
                                  {new Date(
                                    selectedSlots[0],
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    new Date(
                                      selectedSlots[selectedSlots.length - 1],
                                    ).getTime() +
                                      30 * 60 * 1000,
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2 border border-white/10">
                                <p className="text-xs text-white/60 mb-0.5">
                                  Durée
                                </p>
                                <p className="text-white font-one text-sm">
                                  {selectedSlots.length * 30} min
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2 border border-white/10">
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
