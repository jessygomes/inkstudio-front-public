/* eslint-disable @typescript-eslint/no-explicit-any */
import AppButton from "@/components/Shared/AppButton";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Mail, MapPin, Phone } from "lucide-react";
import { toSlug } from "@/lib/utils";
import type { BookingSummaryData } from "./BookingSummary";
import SalonMessageCard from "./SalonMessageCard";
import { formatPhoneNumber, phoneHref } from "./bookingDisplay";

interface ConfirmationStepProps { salon: any; addConfirmationEnabled: boolean; summary?: BookingSummaryData; isAuthenticated?: boolean; messaging?: { targetUserId: string; recipientName: string } }

export default function ConfirmationStep({ salon, addConfirmationEnabled, summary, isAuthenticated = false, messaging }: ConfirmationStepProps) {
  const name = salon.name || salon.salonName || "Votre salon";
  const phone = salon.phone || salon.salonPhone;
  const email = salon.email || salon.salonEmail;
  const salonHref = salon.profileHref || `/salon/${toSlug(name)}/${toSlug(`${salon.city || ""}-${salon.postalCode || ""}`)}`;
  const address = [salon.address, [salon.postalCode, salon.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <section aria-labelledby="booking-success" className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-noir-500 font-one">
      <div className="px-5 pb-6 pt-8 text-center sm:px-8">
        <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-linear-to-br from-tertiary-400 via-tertiary-500 to-cuatro-500 text-white shadow-xl shadow-tertiary-500/25"><Check size={30} strokeWidth={2.5} /></span>
        <h1 id="booking-success" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{addConfirmationEnabled ? "Demande envoyée !" : "C’est réservé !"}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">{addConfirmationEnabled ? `${name} a reçu votre demande et vous confirmera le rendez-vous par email.` : "Votre rendez-vous est confirmé. Un email récapitulatif vous a été envoyé (pensez à vérifier vos indésirables)."}</p>
      </div>

      {summary?.dateLabel && (
        <div className="mx-5 mb-6 space-y-2.5 rounded-2xl bg-white/4 p-5 text-sm sm:mx-8">
          <p className="font-medium text-white/90">{[summary.prestationLabel, summary.choiceLabel].filter(Boolean).join(" · ")}</p>
          <p className="flex items-center gap-2 text-xs text-white/70"><CalendarDays size={14} className="shrink-0 text-tertiary-400" /><span className="capitalize">{summary.dateLabel}</span>{summary.timeLabel && <span className="tabular-nums">· {summary.timeLabel}</span>}</p>
          <p className="flex items-start gap-2 text-xs text-white/70"><MapPin size={14} className="mt-0.5 shrink-0 text-tertiary-400" /><span>{name}{address ? `, ${address}` : ""}</span></p>
        </div>
      )}

      {(phone || email) && (
        <div className="mx-5 mb-6 sm:mx-8">
          <p className="mb-2 text-xs text-white/45">Un empêchement ? Prévenez le salon :</p>
          <div className="flex flex-wrap gap-4 text-xs text-white/70">
            {phone && <a href={phoneHref(phone)} className="inline-flex items-center gap-2 tabular-nums hover:text-tertiary-400"><Phone size={13} />{formatPhoneNumber(phone)}</a>}
            {email && <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all hover:text-tertiary-400"><Mail size={13} />{email}</a>}
          </div>
        </div>
      )}

      {messaging && <div className="mx-5 mb-6 sm:mx-8"><SalonMessageCard targetUserId={messaging.targetUserId} recipientName={messaging.recipientName} title="Une question sur votre rendez-vous ?" className="bg-white/3" /></div>}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/2 px-5 py-4 sm:px-8">
        <AppButton href={salonHref} variant="secondary" className="rounded-xl! border-0! bg-white/6! px-4! py-2! text-xs! shadow-none! hover:bg-white/10!"><ArrowLeft size={14} />Retour au salon</AppButton>
        {isAuthenticated && <AppButton href="/mon-profil" className="rounded-xl! px-4! py-2.5! text-xs! shadow-none!">Mes rendez-vous<ArrowRight size={14} /></AppButton>}
      </div>
    </section>
  );
}
