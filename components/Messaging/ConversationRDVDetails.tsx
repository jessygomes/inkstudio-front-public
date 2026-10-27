"use client";
import { RdvPlanningCard, RdvPrestationCard, RdvPaymentCard } from "../MonProfil/RdvInformationCards";


import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { AppointmentProps, ConversationDto } from "@/lib/type";
import { fetchAppointmentById } from "@/lib/actions/appointment.action";
import ConversationMoodboards from "./ConversationMoodboards";

interface ConversationRDVDetailsProps {
  conversation: ConversationDto;
  embedded?: boolean;
  onBack?: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    dot: "bg-amber-400 animate-pulse",
    pill: "bg-amber-500/12 text-amber-300 border-amber-400/25",
  },
  CONFIRMED: {
    label: "Confirmé",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/12 text-emerald-300 border-emerald-400/25",
  },
  COMPLETED: {
    label: "Complété",
    dot: "bg-teal-400",
    pill: "bg-teal-500/12 text-teal-300 border-teal-400/25",
  },
  NO_SHOW: {
    label: "Pas présenté",
    dot: "bg-orange-400",
    pill: "bg-orange-500/12 text-orange-300 border-orange-400/25",
  },
  CANCELLED: {
    label: "Annulé",
    dot: "bg-red-400",
    pill: "bg-red-500/12 text-red-300 border-red-400/25",
  },
  CANCELED: {
    label: "Annulé",
    dot: "bg-red-400",
    pill: "bg-red-500/12 text-red-300 border-red-400/25",
  },
  RESCHEDULING: {
    label: "Reprogrammation",
    dot: "bg-blue-400 animate-pulse",
    pill: "bg-blue-500/12 text-blue-300 border-blue-400/25",
  },
} as const;

export default function ConversationRDVDetails({
  conversation,
  embedded = false,
  onBack,
}: ConversationRDVDetailsProps) {
  const [appointment, setAppointment] = useState<AppointmentProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRDV = async () => {
      if (!conversation.appointmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAppointmentById(conversation.appointmentId);
        setAppointment(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur lors du chargement du RDV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRDV();
  }, [conversation.appointmentId]);

  if (loading) {
    return (
      <div className={`h-full min-h-0 w-full flex items-center justify-center bg-linear-to-br from-noir-500/10 to-noir-500/5 ${embedded ? "" : "rounded-2xl border border-white/20 backdrop-blur-lg shadow-2xl"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary-500/50 border-t-tertiary-400" />
          <p className="text-sm text-white/50 font-one">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className={`h-full min-h-0 w-full overflow-y-auto bg-noir-800 p-4 ${embedded ? "" : "rounded-2xl border border-white/15"}`}>
        {onBack && <button type="button" onClick={onBack} aria-label="Retour aux détails de la conversation" className="grid size-9 cursor-pointer place-items-center rounded-lg text-white/50 hover:bg-white/5"><ArrowLeft size={17} /></button>}
        <ConversationMoodboards key={conversation.id} conversationId={conversation.id} />
        <p className="mt-5 text-xs text-white/40">Aucun rendez-vous associé</p>
      </div>
    );
  }

  const statusCfg =
    STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;













  const clientImage = (conversation.client as { image?: string | null }).image;

  return (
    <div className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-noir-800 font-one [&_a]:cursor-pointer [&_button]:cursor-pointer [&_button]:disabled:cursor-not-allowed ${embedded ? "" : "border border-white/15 shadow-2xl sm:rounded-3xl"}`}>
      <div className={`shrink-0 border-b border-white/10 bg-noir-600 ${embedded ? "px-4 py-3" : "px-4 py-3 sm:rounded-t-3xl"}`}>
        <div className={`${embedded ? "mb-2" : "mb-4"} flex items-center gap-2`}>
          {onBack && <button type="button" onClick={onBack} aria-label="Retour aux rendez-vous" title="Retour aux rendez-vous" className="cursor-pointer disabled:cursor-not-allowed grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><ArrowLeft size={17} /></button>}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/60 font-one">
          Votre rendez-vous
        </h2>
        </div>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
              {clientImage ? (
                <div className="relative h-9 w-9 overflow-hidden rounded-2xl ring-1 ring-white/15">
                  <Image
                    src={clientImage}
                    alt={`${conversation.client.firstName} ${conversation.client.lastName}`}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-tertiary-500 to-primary-500 shadow-lg">
                  <span className="text-base font-bold leading-none text-white">
                    {conversation.client.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-noir-800 ${statusCfg.dot}`}
              />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-base font-bold leading-tight text-white font-one">
                {conversation.client.firstName} {conversation.client.lastName}
              </h4>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium font-one ${statusCfg.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-white/65 font-one">
              {conversation.subject}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain p-4"><ConversationMoodboards key={conversation.id} conversationId={conversation.id} /><RdvPlanningCard appointment={appointment} /><RdvPaymentCard appointment={appointment} /><RdvPrestationCard appointment={appointment} /></div>
    </div>
  );
}
