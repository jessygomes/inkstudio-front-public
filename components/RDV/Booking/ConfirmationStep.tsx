/* eslint-disable @typescript-eslint/no-explicit-any */
import AppButton from "@/components/Shared/AppButton";
import { Check, Mail, Clock3, ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { toSlug } from "@/lib/utils";

interface ConfirmationStepProps { salon: any; addConfirmationEnabled: boolean; }

export default function ConfirmationStep({ salon, addConfirmationEnabled }: ConfirmationStepProps) {
  const name = salon.name || salon.salonName || "Votre salon";
  const phone = salon.phone || salon.salonPhone;
  const email = salon.email || salon.salonEmail;
  const salonHref = `/salon/${toSlug(name)}/${toSlug(`${salon.city || ""}-${salon.postalCode || ""}`)}`;
  return (
    <section aria-labelledby="booking-success" className="overflow-hidden rounded-2xl border border-white/10 bg-noir-500">
      <div className="border-b border-white/8 bg-emerald-400/[0.025] px-5 py-8 sm:px-8">
        <span className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Check size={24} /></span>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-300/70">{addConfirmationEnabled ? "Demande transmise" : "Réservation effectuée"}</p>
        <h1 id="booking-success" className="text-2xl font-semibold tracking-tight text-white font-one sm:text-3xl">{addConfirmationEnabled ? "Votre demande est entre de bonnes mains." : "Votre rendez-vous est confirmé."}</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">{addConfirmationEnabled ? `${name} a reçu votre demande. Le salon vous informera dès qu’elle sera validée.` : `C’est noté ! Votre rendez-vous chez ${name} a bien été enregistré.`}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-8">
        <div className="flex gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-tertiary-400" /><div><h2 className="text-sm font-medium text-white/85">Gardez un œil sur votre boîte mail</h2><p className="mt-1 text-xs leading-6 text-white/45">{addConfirmationEnabled ? "Vous recevrez une confirmation par email une fois le rendez-vous validé. Le salon peut vous contacter pour préciser votre projet." : "Un email récapitulatif vous sera envoyé. Pensez à vérifier vos courriers indésirables."}</p></div></div>
        <div className="flex gap-3 rounded-xl border border-white/8 bg-noir-700/40 p-3.5"><Clock3 size={17} className="mt-0.5 shrink-0 text-white/40" /><p className="text-xs leading-6 text-white/50">Un empêchement ou une question ? Prévenez le salon pour organiser votre venue dans les meilleures conditions.</p></div>
        {(phone || email) && <div className="flex flex-wrap gap-4 text-xs text-white/65">{phone && <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-tertiary-400"><Phone size={13} />{phone}</a>}{email && <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all hover:text-tertiary-400"><Mail size={13} />{email}</a>}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5"><AppButton href={salonHref} variant="secondary" className="px-3! py-2! text-xs! shadow-none!"><ArrowLeft size={14} />Retour au salon</AppButton><AppButton href="/mon-profil" className="px-3.5! py-2.5! text-xs! shadow-none!">Mes rendez-vous<ArrowRight size={14} /></AppButton></div>
      </div>
    </section>
  );
}
