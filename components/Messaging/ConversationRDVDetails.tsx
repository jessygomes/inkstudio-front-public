/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AppointmentProps, ConversationDto } from "@/lib/type";
import { fetchAppointmentById } from "@/lib/actions/appointment.action";

interface ConversationRDVDetailsProps {
  conversation: ConversationDto;
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
  RESCHEDULING: {
    label: "Reprogrammation",
    dot: "bg-blue-400 animate-pulse",
    pill: "bg-blue-500/12 text-blue-300 border-blue-400/25",
  },
} as const;

export default function ConversationRDVDetails({
  conversation,
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
      <div className="h-full flex items-center justify-center rounded-2xl border border-white/20 bg-linear-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary-500/50 border-t-tertiary-400" />
          <p className="text-sm text-white/50 font-one">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="h-full flex items-center justify-center rounded-2xl border border-white/20 bg-linear-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg shadow-2xl">
        <div className="p-6 text-center">
          <p className="text-sm text-white/50 font-one">
            Aucun rendez-vous associé
          </p>
        </div>
      </div>
    );
  }

  const statusCfg =
    STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;

  const displayPrice =
    appointment.tattooDetail?.price ||
    appointment.tattooDetail?.estimatedPrice ||
    0;
  const hasPrice = typeof displayPrice === "number" && displayPrice > 0;

  const tattooDetail = appointment.tattooDetail;
  const colorStyle = tattooDetail?.colorStyle;

  const durationMin = Math.round(
    (new Date(appointment.end).getTime() -
      new Date(appointment.start).getTime()) /
      60000,
  );

  const startDate = new Date(appointment.start).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const startTime = new Date(appointment.start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(appointment.end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const clientImage = (conversation.client as { image?: string | null }).image;

  return (
    <div className="h-full flex flex-col border border-white/15 bg-linear-to-b from-noir-700/95 via-noir-700/90 to-noir-800/95 shadow-2xl sm:rounded-2xl">
      <div className="rounded-t-2xl border-b border-white/10 bg-linear-to-r from-noir-700/85 to-noir-600/70 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
              {clientImage ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-1 ring-white/15">
                  <Image
                    src={clientImage}
                    alt={`${conversation.client.firstName} ${conversation.client.lastName}`}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-tertiary-500 to-primary-500 shadow-lg">
                  <span className="text-base font-bold leading-none text-white">
                    {conversation.client.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-noir-700 ${statusCfg.dot}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-bold leading-tight text-white font-one">
                {conversation.client.firstName} {conversation.client.lastName}
              </h4>
              <p className="mt-0.5 truncate text-xs text-white/65 font-one">
                {conversation.subject}
              </p>
            </div>
          </div>

          <span
            className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium font-one ${statusCfg.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <section className="rounded-3xl border border-white/10 bg-linear-to-b from-white/4 to-white/2 p-3">
          <p className="mb-2.5 text-[9px] uppercase tracking-[0.14em] text-white/35 font-one">
            Rendez-vous
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/12">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Date</p>
                <p className="capitalize text-xs text-white font-one">{startDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/12">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Heure</p>
                <p className="text-xs text-white font-one tabular-nums">{startTime} - {endTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/12">
                <svg className="h-3.5 w-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Durée</p>
                <p className="text-xs text-white/90 font-one">{durationMin} min</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/12">
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Prestation</p>
                <p className="truncate text-xs text-white/90 font-one">{appointment.prestation}</p>
              </div>
            </div>

            {appointment.tatoueur && (
              <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/15 bg-tertiary-500/12">
                  <svg className="h-3.5 w-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Artiste</p>
                  <p className="truncate text-xs text-white/90 font-one">{appointment.tatoueur.name}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* {(appointment.prestation === "RETOUCHE" ||
          appointment.prestation === "TATTOO" ||
          appointment.prestation === "PIERCING") && (
          <section className="rounded-3xl flex justify-between items-center border border-white/10 bg-linear-to-b from-white/4 to-white/2 p-3">
            <p className="mb-2.5 text-[9px] uppercase tracking-[0.14em] text-white/35 font-one">
              Paiement
            </p>
            <div
              className={`flex w-64 items-center justify-center gap-2 rounded-2xl border px-3 py-1 ${
                appointment.isPayed
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                  : "border-red-400/30 bg-red-500/15 text-red-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  appointment.isPayed ? "bg-emerald-300" : "bg-red-300"
                }`}
              />
              <span className="text-xs font-medium font-one">
                {appointment.isPayed ? "Payé" : "Non payé"}
              </span>
            </div>
          </section>
        )} */}

        {tattooDetail && (
          <section className="rounded-3xl border border-white/10 bg-linear-to-b from-white/4 to-white/2 p-3">
            <p className="mb-2.5 text-[9px] uppercase tracking-[0.14em] text-white/35 font-one">
              Détails · {appointment.prestation}
            </p>

            <div className="space-y-2.5">
              {tattooDetail.description && (
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30 font-one">Description</p>
                  <p className="text-xs leading-relaxed text-white/80 font-one">{tattooDetail.description}</p>
                </div>
              )}

              {(tattooDetail.zone || tattooDetail.size || colorStyle) && (
                <div className="flex flex-wrap gap-1.5">
                  {tattooDetail.zone && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 font-one">
                      <span className="text-[9px] text-white/40">Zone</span>
                      {tattooDetail.zone}
                    </span>
                  )}
                  {tattooDetail.size && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 font-one">
                      <span className="text-[9px] text-white/40">Taille</span>
                      {tattooDetail.size}
                    </span>
                  )}
                  {colorStyle && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 font-one">
                      <span className="text-[9px] text-white/40">Style</span>
                      {colorStyle}
                    </span>
                  )}
                </div>
              )}

              {hasPrice && (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-3 py-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/35 font-one">
                    {tattooDetail.price ? "Prix final" : "Estimation"}
                  </span>
                  <span className="text-sm font-bold text-white font-one">
                    {displayPrice}
                    <span className="ml-0.5 text-xs font-medium text-white/55">€</span>
                  </span>
                </div>
              )}

              {(tattooDetail.reference || tattooDetail.sketch) && (
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-wider text-white/30 font-one">Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tattooDetail.reference && (
                      <a
                        href={tattooDetail.reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative h-24 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <Image
                          src={tattooDetail.reference}
                          alt="Référence"
                          fill
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
                      </a>
                    )}
                    {tattooDetail.sketch && (
                      <a
                        href={tattooDetail.sketch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative h-24 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <Image
                          src={tattooDetail.sketch}
                          alt="Croquis"
                          fill
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
