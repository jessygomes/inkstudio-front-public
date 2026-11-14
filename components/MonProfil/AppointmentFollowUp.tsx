/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, HeartPulse, MessageCircle, Star } from "lucide-react";
import { focusRing, iconBadge } from "@/components/Shared/ui";
import { HEALING_LABELS, HEALING_OPTIONS, type ClientFollowUp } from "@/lib/follow-up";

const dateFr = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" }) : "";

/**
 * Suivi de cicatrisation dans le détail d'un rendez-vous (espace client) :
 * le suivi envoyé et la réponse du salon, ou le lien pour l'envoyer s'il est encore valable.
 */
export default function AppointmentFollowUp({ followUp, followUpToken, salonName }: { followUp?: ClientFollowUp | null; followUpToken?: string | null; salonName: string }) {
  if (!followUp && !followUpToken) return null;

  if (!followUp)
    return (
      <section className="rounded-3xl bg-linear-to-br from-tertiary-400/15 via-tertiary-500/8 to-cuatro-500/15 p-5">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className={iconBadge}><HeartPulse size={18} /></span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white">Votre suivi de cicatrisation</h4>
            <p className="mt-1 text-xs leading-5 text-white/60">{salonName} aimerait savoir comment se passe la cicatrisation. Envoyez quelques photos en deux minutes.</p>
          </div>
        </div>
        <Link href={`/suivi/${encodeURIComponent(followUpToken!)}`} className={`mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-4 text-xs font-medium text-white shadow-lg shadow-tertiary-500/20 transition hover:brightness-110 ${focusRing}`}>
          Envoyer mon suivi<ArrowRight size={14} aria-hidden="true" />
        </Link>
      </section>
    );

  const concern = HEALING_OPTIONS.find((option) => option.value === followUp.healingStatus)?.concern;
  return (
    <section className="space-y-4 rounded-3xl bg-white/4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">Votre suivi de cicatrisation</h4>
        <span className="text-[11px] text-white/40">Envoyé le {dateFr(followUp.createdAt)}</span>
      </div>

      {followUp.photoUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {followUp.photoUrls.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={`block aspect-square overflow-hidden rounded-2xl bg-white/4 ${focusRing}`}>
              <img src={url} alt={`Photo de suivi ${index + 1}`} className="size-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {followUp.healingStatus && (
          <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ${concern ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200"}`}>
            <HeartPulse size={13} aria-hidden="true" />{HEALING_LABELS[followUp.healingStatus]}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-xl bg-white/6 px-3 py-1.5 text-xs text-white/75">
          <Star size={13} aria-hidden="true" className="text-tertiary-400" fill="currentColor" />{followUp.rating}/5
        </span>
      </div>
      {followUp.review && <p className="text-sm leading-6 text-white/70">« {followUp.review} »</p>}

      <div className="rounded-2xl bg-white/4 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-white/60"><MessageCircle size={14} aria-hidden="true" className="text-tertiary-400" />Réponse de {salonName}</p>
        {followUp.isAnswered && followUp.response
          ? <><p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/85">{followUp.response}</p>{followUp.respondedAt && <p className="mt-2 text-[11px] text-white/40">Le {dateFr(followUp.respondedAt)}</p>}</>
          : <p className="mt-2 text-sm text-white/50">Le salon n’a pas encore répondu. Vous serez prévenu par e-mail.</p>}
      </div>
    </section>
  );
}
