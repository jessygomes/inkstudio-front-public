"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getBlockedSlots,
  getOccupiedSlots,
  getTimeslots,
} from "@/lib/actions/timeslot.action";
import { modifyAppointmentByClient } from "@/lib/actions/appointment.action";
import { toSlug } from "@/lib/utils";
import { Appointment } from "@/components/MonProfil/RendezVousTab";
import { useSession } from "next-auth/react";

// Types locaux pour les données de créneaux
type TimeSlot = {
  start: string;
  end: string;
};

type OccupiedSlot = {
  start: string;
  end: string;
};

type BlockedSlot = {
  startDate: string;
  endDate: string;
  tatoueurId: string | null;
};

type Tatoueur = {
  id: string;
  name: string;
  img?: string | null;
  instagram?: string | null;
  rdvBookingEnabled?: boolean;
};

type EditAppointmentModalProps = {
  appointment: Appointment;
  onClose: () => void;
  onUpdated: () => void;
};

const formatDateInput = (value: string) => {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const formatTimeRange = (start: string, end: string) => {
  const startTime = new Date(start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startTime} - ${endTime}`;
};

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  onClose,
  onUpdated,
}) => {
  const { data: session } = useSession();
  const [tatoueurs, setTatoueurs] = useState<Tatoueur[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTatoueur, setSelectedTatoueur] = useState(
    appointment.tatoueur?.id || "",
  );
  const [selectedDate, setSelectedDate] = useState(
    formatDateInput(appointment.start),
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(appointment.start);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  const durationMinutes = useMemo(() => {
    if (appointment.duration) return appointment.duration;
    const start = new Date(appointment.start).getTime();
    const end = new Date(appointment.end).getTime();
    return Math.max(30, Math.round((end - start) / 60000));
  }, [appointment.duration, appointment.end, appointment.start]);

  const salonSlug = useMemo(
    () => toSlug(appointment.salon.salonName || ""),
    [appointment.salon.salonName],
  );
  const salonLoc = useMemo(
    () =>
      `${toSlug(appointment.salon.city || "")}-${appointment.salon.postalCode}`,
    [appointment.salon.city, appointment.salon.postalCode],
  );

  // Charger la team du salon
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoadingTeam(true);
        const url = `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonSlug}/${salonLoc}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Impossible de récupérer les artistes");
        const data = await res.json();
        const list: Tatoueur[] = Array.isArray(data?.Tatoueur)
          ? data.Tatoueur
          : data?.Tatoueur
            ? [data.Tatoueur]
            : [];
        setTatoueurs(list);
        if (list.length && !list.find((t) => t.id === selectedTatoueur)) {
          setSelectedTatoueur(list[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement des tatoueurs");
      } finally {
        setIsLoadingTeam(false);
      }
    };

    fetchTeam();
  }, [salonLoc, salonSlug, selectedTatoueur]);

  // Charger les créneaux pour la date + tatoueur
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTatoueur || !selectedDate) return;
      try {
        setIsLoadingSlots(true);
        const [slotsRes, occupiedRes, blockedRes] = await Promise.all([
          getTimeslots(selectedDate, selectedTatoueur),
          getOccupiedSlots(selectedDate, selectedTatoueur),
          getBlockedSlots(selectedTatoueur),
        ]);

        if (slotsRes.ok) {
          setTimeSlots(slotsRes.data || []);
        } else {
          setTimeSlots([]);
          toast.error(slotsRes.message || "Créneaux indisponibles");
        }

        if (occupiedRes.ok) {
          setOccupiedSlots(occupiedRes.data || []);
        } else {
          setOccupiedSlots([]);
        }

        if (blockedRes.ok) {
          setBlockedSlots(blockedRes.data || []);
        } else {
          setBlockedSlots([]);
        }
      } catch (err) {
        console.error(err);
        setTimeSlots([]);
        setOccupiedSlots([]);
        setBlockedSlots([]);
        toast.error("Erreur lors du chargement des créneaux");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedTatoueur]);

  const slotSet = useMemo(
    () => new Set(timeSlots.map((s) => s.start)),
    [timeSlots],
  );

  const fitsDuration = (startIso: string) => {
    const steps = Math.max(1, Math.ceil(durationMinutes / 30));
    const startTime = new Date(startIso).getTime();
    for (let i = 0; i < steps; i += 1) {
      const stepStart = new Date(startTime + i * 30 * 60000).toISOString();
      if (!slotSet.has(stepStart)) return false;
    }
    return true;
  };

  const overlaps = (startIso: string) => {
    const start = new Date(startIso).getTime();
    const end = start + durationMinutes * 60000;

    const blocked = blockedSlots.some((b) => {
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      const concern = !b.tatoueurId || b.tatoueurId === selectedTatoueur;
      return concern && start < bEnd && end > bStart;
    });

    const occupied = occupiedSlots.some((o) => {
      const oStart = new Date(o.start).getTime();
      const oEnd = new Date(o.end).getTime();
      return start < oEnd && end > oStart;
    });

    return blocked || occupied;
  };

  const isSlotAvailable = (slotStart: string) =>
    fitsDuration(slotStart) && !overlaps(slotStart);

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error("Erreur: utilisateur non authentifié");
      return;
    }
    if (!selectedTatoueur) {
      toast.error("Sélectionnez un tatoueur");
      return;
    }
    if (!selectedSlot) {
      toast.error("Sélectionnez un créneau");
      return;
    }

    const startIso = new Date(selectedSlot).toISOString();
    const endIso = new Date(
      new Date(selectedSlot).getTime() + durationMinutes * 60000,
    ).toISOString();

    setIsSaving(true);
    try {
      const result = await modifyAppointmentByClient(appointment.id, {
        userId: session.user.id,
        start: startIso,
        end: endIso,
        tatoueurId: selectedTatoueur,
      });

      if (!result.ok) {
        toast.error(result.message || "Impossible de modifier le rendez-vous");
        return;
      }

      toast.success("Rendez-vous mis à jour");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir-700/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.04] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-one text-lg font-semibold">
              Modifier le rendez-vous
            </h3>
            <p className="text-white/60 text-sm font-one">
              {appointment.salon.salonName}{appointment.tatoueur?.name ? ` • ${appointment.tatoueur.name}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer px-3 py-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10"
          >
            Fermer
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-one">Tatoueur</label>
            <select
              value={selectedTatoueur}
              onChange={(e) => {
                setSelectedTatoueur(e.target.value);
                setSelectedSlot("");
              }}
              className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20"
              disabled={isLoadingTeam}
            >
              {tatoueurs.length === 0 && (
                <option value="">Aucun tatoueur disponible</option>
              )}
              {tatoueurs.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  className="bg-noir-500 font-one"
                >
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-white/80 text-xs font-one">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
              className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-white/80 text-xs font-one">Durée</label>
            <div className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2">
              {durationMinutes} min
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-one">
                Créneaux disponibles
              </p>
              <p className="text-white/50 text-xs font-one">
                Sélectionnez un créneau. Les créneaux bloqués ou occupés sont
                désactivés.
              </p>
            </div>
            {isLoadingSlots && (
              <div className="text-white/60 text-xs font-one">
                Chargement...
              </div>
            )}
          </div>

          {isLoadingSlots ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent"></div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-white/60 text-sm font-one py-6 text-center bg-white/5 rounded-lg border border-white/10">
              Aucun créneau pour cette date.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const available = isSlotAvailable(slot.start);
                const selected = selectedSlot === slot.start;
                const label = formatTimeRange(slot.start, slot.end);

                return (
                  <button
                    key={slot.start}
                    disabled={!available}
                    onClick={() => setSelectedSlot(slot.start)}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-one border transition-all duration-200 text-left ${
                      selected
                        ? "bg-tertiary-500 text-white border-tertiary-400 shadow-lg"
                        : available
                          ? "bg-white/5 text-white/80 hover:bg-white/10 border-white/10"
                          : "bg-red-900/30 text-red-200 border-red-400/40 cursor-not-allowed"
                    }`}
                    title={!available ? "Créneau indisponible" : ""}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/10 text-sm font-one"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoadingSlots || !selectedSlot}
            className="cursor-pointer px-5 py-2 rounded-lg text-sm font-one bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white hover:from-tertiary-500 hover:to-tertiary-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
