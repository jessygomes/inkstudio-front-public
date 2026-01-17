"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Appointment } from "@/components/MonProfil/RendezVousTab";
import EditAppointmentModal from "@/components/RDV/EditAppointmentModal";

type EditAppointmentContextType = {
  isOpen: boolean;
  appointment: Appointment | null;
  openModal: (appointment: Appointment, callback?: () => void) => void;
  closeModal: () => void;
  onUpdated: (() => void) | null;
  setOnUpdated: (callback: () => void) => void;
};

const EditAppointmentContext = createContext<
  EditAppointmentContextType | undefined
>(undefined);

export function EditAppointmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [onUpdated, setOnUpdated] = useState<(() => void) | null>(null);

  const openModal = (appt: Appointment, callback?: () => void) => {
    setAppointment(appt);
    setIsOpen(true);
    if (callback) setOnUpdated(() => callback);
  };

  const closeModal = () => {
    setIsOpen(false);
    setAppointment(null);
    setOnUpdated(null);
  };

  const handleUpdated = () => {
    if (onUpdated) onUpdated();
    closeModal();
  };
  return (
    <EditAppointmentContext.Provider
      value={{
        isOpen,
        appointment,
        openModal,
        closeModal,
        onUpdated,
        setOnUpdated,
      }}
    >
      {children}

      {/* Modal rendue indépendamment */}
      {isOpen && appointment && (
        <EditAppointmentModal
          appointment={appointment}
          onClose={closeModal}
          onUpdated={handleUpdated}
        />
      )}
    </EditAppointmentContext.Provider>
  );
}

export function useEditAppointmentModal() {
  const context = useContext(EditAppointmentContext);
  if (!context) {
    throw new Error(
      "useEditAppointmentModal doit être utilisé dans EditAppointmentProvider",
    );
  }
  return context;
}
