import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Ban, Check, Flag, MapPin, MessageSquare, ShieldOff, X } from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectProposal } from "@/lib/actions/projects.action";
import { toSlug } from "@/lib/utils";
import AppButton from "../Shared/AppButton";

type Props = {
  proposal: ProjectProposal;
  disabled: boolean;
  showConversation: boolean;
  onAccept: () => void;
  onRefuse: () => void;
  onBlock: () => void;
  onReport: () => void;
  children?: ReactNode;
};

export default function ProjectProposalCard({ proposal, disabled, showConversation, onAccept, onRefuse, onBlock, onReport, children }: Props) {
  const professional = proposal.professional;
  const name = professional?.salonName || [professional?.firstName, professional?.lastName].filter(Boolean).join(" ") || "Professionnel";
  const href = professional?.city && professional.postalCode
    ? `/salon/${toSlug(name)}/${toSlug(`${professional.city}-${professional.postalCode}`)}` : null;
  const pending = proposal.status === "PENDING";
  const status = proposal.blocked ? "Salon bloqué" : pending ? "À confirmer" : proposal.status === "ACCEPTED" ? "Acceptée" : "Refusée";
  const iconButton = "grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-white/35 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:cursor-wait disabled:opacity-40 sm:size-9";
  const identity = <>
    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-tertiary-400">
      {professional?.image ? <Image src={professional.image} alt="" fill sizes="40px" className="object-cover" /> : name.charAt(0)}
    </span>
    <span className="min-w-0">
      <span className="flex items-center gap-1 text-xs font-semibold tracking-tight text-white"><span className="truncate">{name}</span>{href && <ArrowUpRight size={12} aria-hidden="true" className="shrink-0 text-white/30" />}</span>
      <span className="mt-1 flex items-center gap-1 text-[10px] text-white/40"><MapPin size={10} aria-hidden="true" className="shrink-0" /><span className="truncate">{professional?.city || "Salon de tatouage"}</span></span>
    </span>
  </>;

  return (
    <article aria-label={`Proposition de ${name} pour ${proposal.moodboard.name}`} className="group min-w-0 rounded-xl border border-white/10 bg-noir-500 font-one transition-colors hover:border-white/20 focus-within:border-white/20">
      <div className="grid min-w-0 items-center gap-x-4 gap-y-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(160px,0.75fr)_minmax(0,1.5fr)_auto]">
        <div className="min-w-0">
          {href ? <Link href={href} title={`Voir le profil de ${name}`} className="flex min-w-0 items-center gap-2.5 rounded-lg transition hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400">{identity}</Link> : <div className="flex min-w-0 items-center gap-2.5">{identity}</div>}
        </div>

        <div className="min-w-0 sm:col-start-1 sm:row-start-2 lg:col-start-2 lg:row-start-1 lg:border-l lg:border-white/8 lg:pl-4">
          <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
            <span title={proposal.moodboard.name} className="max-w-full truncate rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">{proposal.moodboard.name}</span>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] ${proposal.blocked ? "border-white/10 bg-white/3 text-white/40" : pending ? "border-tertiary-400/15 bg-tertiary-400/5 text-tertiary-400" : proposal.status === "ACCEPTED" ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300/80" : "border-white/10 bg-white/3 text-white/40"}`}><span className="size-1 rounded-full bg-current" aria-hidden="true" />{status}</span>
          </div>
          {proposal.message.length > 180 ? (
            <details className="group/message text-xs leading-5 text-white/65">
              <summary className="cursor-pointer list-none rounded focus-visible:outline-2 focus-visible:outline-tertiary-400 [&::-webkit-details-marker]:hidden"><span className="line-clamp-2 break-words group-open/message:hidden">{proposal.message}</span><span className="text-[10px] text-white/40 transition hover:text-tertiary-400 group-open/message:hidden">Lire la suite</span><span className="hidden text-[10px] text-white/40 group-open/message:inline">Réduire le message</span></summary>
              <p className="mt-1 whitespace-pre-wrap break-words">{proposal.message}</p>
            </details>
          ) : <p className="whitespace-pre-wrap break-words text-xs leading-5 text-white/65">{proposal.message}</p>}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 border-t border-white/8 pt-2.5 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:flex-nowrap sm:justify-end sm:border-0 sm:pt-0 lg:col-start-3 lg:row-span-1">
          {pending && !proposal.blocked && <>
            <AppButton type="button" disabled={disabled} onClick={onAccept} icon={<Check size={13} aria-hidden="true" />} className="min-h-10 flex-1 !px-3 !py-1.5 !text-xs !shadow-none sm:min-h-9 sm:flex-none">Accepter</AppButton>
            <button type="button" disabled={disabled} onClick={onRefuse} className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border border-white/10 px-3 text-xs text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-wait disabled:opacity-40 sm:min-h-9 sm:flex-none"><X size={12} aria-hidden="true" />Refuser</button>
          </>}
          {proposal.conversationId && proposal.status === "ACCEPTED" && showConversation && <Link href={`/mon-profil?tab=messagerie&conversation=${encodeURIComponent(proposal.conversationId)}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs text-white/70 transition hover:bg-white/5 hover:text-white sm:min-h-9 sm:flex-none"><MessageSquare size={13} aria-hidden="true" />Conversation</Link>}
          <div className="ml-auto flex shrink-0 items-center sm:ml-0">
            <button type="button" disabled={disabled} onClick={onBlock} aria-label={`${proposal.blocked ? "Débloquer" : "Bloquer"} ${name}`} title={proposal.blocked ? "Débloquer le salon" : "Bloquer le salon"} className={iconButton}>{proposal.blocked ? <ShieldOff size={14} aria-hidden="true" /> : <Ban size={14} aria-hidden="true" />}</button>
            <button type="button" disabled={disabled} onClick={onReport} aria-label={`Signaler ${name}`} title="Signaler le salon" className={`${iconButton} hover:!bg-red-400/10 hover:!text-red-300`}><Flag size={14} aria-hidden="true" /></button>
          </div>
        </div>
        {children && <div className="min-w-0 border-t border-white/8 pt-3 sm:col-span-2 lg:col-span-3">{children}</div>}
      </div>
    </article>
  );
}
