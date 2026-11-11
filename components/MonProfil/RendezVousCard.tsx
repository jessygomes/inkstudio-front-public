import Image from "next/image";
import { RdvPlanningCard, RdvPrestationCard, RdvPaymentCard } from "./RdvInformationCards";
import React, { useEffect, useId, useState } from "react";
import { getMoodboardByIdAction } from "@/lib/actions/moodboard.action";
import { ArrowRight, CalendarClock, ExternalLink, Images, MapPin, MessageSquare, Pencil, Phone, Video, X } from "lucide-react";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import AppointmentDrawer from "./AppointmentDrawer";
import AppointmentReview from "./AppointmentReview";
import { CiInstagram } from "react-icons/ci";
import { TfiWorld } from "react-icons/tfi";
import { focusRing } from "@/components/Shared/ui";
import type { Appointment } from "./RendezVousTab";

type ReviewFormState = {
  rating: number;
  title: string;
  comment: string;
};

export type RendezVousCardProps = {
  appointment: Appointment;
  isExpanded: boolean;
  hasReview: boolean;
  cancelingAppointmentId: string | null;
  reviewForm: ReviewFormState;
  hoverRating: number | null;
  reviewSubmitting: boolean;
  getStatusBadge: (status: Appointment["status"]) => React.ReactNode;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  formatPhoneDisplay: (phone?: string | null) => string;
  toggleExpand: (appointmentId: string) => void;
  handleOpenMoodboard: (
    id: string,
    name: string,
    appointmentId: string,
    appointmentStatus: Appointment["status"],
  ) => void;
  handleOpenConnectModal: (appointmentId: string) => void;
  handleEditClick: (appointment: Appointment) => void;
  handleCancelClick: (appointmentId: string) => void;
  handleReviewClick: (appointmentId: string) => void;
  handleSubmitReview: (appointment: Appointment) => void;
  setHoverRating: React.Dispatch<React.SetStateAction<number | null>>;
  setReviewForm: React.Dispatch<React.SetStateAction<ReviewFormState>>;
};

const SERVICE_LABELS: Record<string, string> = { TATTOO: "Tatouage", PIERCING: "Piercing", RETOUCHE: "Retouche", PROJET: "Rendez-vous projet" };

// Boutons partagés (pilules sans contour).
const pill = `inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
const pillPrimary = `${pill} bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/20 hover:brightness-110`;
const pillSoft = `${pill} bg-white/6 text-white/80 hover:bg-white/10 hover:text-white`;
const pillDanger = `${pill} bg-red-400/10 text-red-300 hover:bg-red-400/20`;
const iconPill = `inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/6 text-white/75 transition hover:bg-white/10 hover:text-white ${focusRing}`;

/** Aperçu (première image) du moodboard lié, chargé à l'ouverture du détail. */
function MoodboardThumb({ id, name }: { id: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getMoodboardByIdAction(id)
      .then(result => { if (!cancelled && result.ok && result.data) setUrl(result.data.images?.[0]?.url ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);
  return (
    <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-tertiary-400/20 to-cuatro-500/20 text-tertiary-400">
      {url ? <Image src={url} alt={`Aperçu du moodboard ${name}`} fill sizes="56px" className="object-cover" /> : <Images size={18} aria-hidden="true" />}
    </span>
  );
}

export default function RendezVousCard({
  appointment,
  isExpanded,
  hasReview,
  cancelingAppointmentId,
  reviewForm,
  hoverRating,
  reviewSubmitting,
  getStatusBadge,
  formatTime,
  formatPhoneDisplay,
  toggleExpand,
  handleOpenMoodboard,
  handleOpenConnectModal,
  handleEditClick,
  handleCancelClick,
  handleSubmitReview,
  setHoverRating,
  setReviewForm,
}: RendezVousCardProps) {
  const detailsId = useId();
  const date = new Date(appointment.start);
  const validDate = !Number.isNaN(date.getTime());
  const price = appointment.prestationDetails?.price;
  const priceLabel = typeof price === "number" ? price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : null;
  const serviceType = appointment.prestation.toUpperCase();
  const serviceLabel = SERVICE_LABELS[serviceType] || serviceType;
  const salonName = appointment.salon.salonName?.trim() || [appointment.salon.firstName, appointment.salon.lastName].filter(Boolean).join(" ");
  const salonProfileHref = `/salon/${toSlug(salonName)}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`;
  const conversationHref = appointment.conversation
    ? `/mon-profil?tab=messagerie&conversation=${encodeURIComponent(appointment.conversation.id)}`
    : null;
  const unread = appointment.conversation?.unreadCount || 0;
  const isIndependentArtist =
    appointment.salon.role?.toLowerCase() === "user_tatoueur" ||
    appointment.performerUser?.id === appointment.salon.id ||
    appointment.tatoueur?.id === appointment.salon.id;
  const hasDistinctArtist = appointment.tatoueur &&
    appointment.tatoueur.name.trim().toLocaleLowerCase("fr-FR") !== salonName.toLocaleLowerCase("fr-FR");
  const artistName = !isIndependentArtist && hasDistinctArtist ? appointment.tatoueur!.name : null;
  // Heure figée au montage : suffisant pour savoir si le rendez-vous est encore à venir.
  const [now] = useState(() => Date.now());
  const isUpcoming = new Date(appointment.end).getTime() > now;
  const canManage = appointment.status === "CONFIRMED" && isUpcoming;
  const inactive = appointment.status === "CANCELED";
  const timeRange = `${formatTime(appointment.start)} – ${formatTime(appointment.end)}`;
  const place = appointment.visio ? "En visio" : [appointment.salon.city].filter(Boolean).join("");
  const open = () => toggleExpand(appointment.id);

  return (
    <>
      <article aria-labelledby={`${detailsId}-title`} className={`group relative flex h-full flex-col rounded-3xl p-4 font-one transition-colors sm:p-5 ${isExpanded ? "bg-noir-500" : "bg-noir-700 hover:bg-noir-500"} ${inactive ? "opacity-55" : ""}`}>
        {/* Toute la tuile ouvre le détail ; les liens et boutons restent cliquables au-dessus. */}
        <button type="button" onClick={open} aria-haspopup="dialog" aria-controls={isExpanded ? detailsId : undefined} aria-label={`Voir le détail : ${appointment.title || serviceLabel}`} className={`absolute inset-0 cursor-pointer rounded-3xl ${focusRing}`} />

        {/* Quand */}
        <div className="pointer-events-none relative flex items-start justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-semibold leading-none tabular-nums ${inactive ? "text-white/60" : "bg-linear-to-br from-tertiary-400 to-cuatro-500 bg-clip-text text-transparent"}`}>{validDate ? date.getDate() : "—"}</span>
            <span className="flex flex-col text-[11px] leading-4">
              <span className="font-medium capitalize text-white/80">{validDate ? date.toLocaleDateString("fr-FR", { weekday: "long" }) : ""}</span>
              <span className="tabular-nums text-white/45">{timeRange}</span>
            </span>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        {/* Quoi */}
        <div className="pointer-events-none relative mt-4 min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-tertiary-400">{serviceLabel}</p>
          <h3 id={`${detailsId}-title`} className="mt-1 line-clamp-2 break-words text-base font-semibold leading-snug text-white">{appointment.title || serviceLabel}</h3>
        </div>

        {/* Où / avec qui */}
        <div className="relative mt-4 space-y-1.5 text-xs text-white/55">
          <Link href={salonProfileHref} className="flex min-w-0 items-center gap-2 text-white/75 transition hover:text-tertiary-400">
            <span className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/8 text-[10px] text-white/60">
              {appointment.salon.image ? <Image src={appointment.salon.image} alt="" fill sizes="24px" className="object-cover" /> : salonName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{salonName}{artistName ? <span className="text-white/40"> · {artistName}</span> : null}</span>
          </Link>
          <p className="pointer-events-none flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">{appointment.visio ? <Video size={12} className="shrink-0" /> : <MapPin size={12} className="shrink-0" />}{place || "—"}</span>
            {priceLabel && <span className="shrink-0 font-semibold tabular-nums text-white/85">{priceLabel}</span>}
          </p>
        </div>

        {/* Actions */}
        <div className="relative mt-4 flex items-center gap-1.5">
          {conversationHref && (
            <Link href={conversationHref} aria-label={`Écrire au salon${unread > 0 ? ` (${unread} non lu${unread > 1 ? "s" : ""})` : ""}`} title="Écrire au salon" className={`relative inline-flex size-9 items-center justify-center rounded-xl bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white ${focusRing}`}>
              <MessageSquare size={15} />
              {unread > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-w-4.5 place-items-center rounded-full bg-linear-to-r from-tertiary-400 to-tertiary-500 px-1 text-[9px] font-semibold leading-4.5 text-white">{unread}</span>}
            </Link>
          )}
          {canManage && <button type="button" onClick={() => handleEditClick(appointment)} aria-label="Déplacer le rendez-vous" title="Déplacer" className={`inline-flex size-9 items-center justify-center rounded-xl bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white ${focusRing}`}><Pencil size={14} /></button>}
          <span aria-hidden="true" className="pointer-events-none ml-auto inline-flex items-center gap-1 text-xs text-white/40 transition group-hover:text-tertiary-400">Détail<ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
        </div>
      </article>

      {isExpanded && <AppointmentDrawer id={detailsId} onClose={open}>
        <div className="space-y-4 font-one">
          {/* En-tête du détail */}
          <div className="rounded-3xl bg-linear-to-br from-tertiary-400/15 via-tertiary-500/8 to-cuatro-500/15 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-tertiary-400">{serviceLabel}</span>
              <span className="ml-auto">{getStatusBadge(appointment.status)}</span>
            </div>
            <h3 className="mt-2 break-words text-xl font-semibold tracking-tight text-white">{appointment.title || serviceLabel}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm capitalize text-white/75"><CalendarClock size={15} className="shrink-0 text-tertiary-400" />{validDate ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "—"} · <span className="tabular-nums">{timeRange}</span></p>
            {priceLabel && <p className="mt-1 text-sm font-semibold tabular-nums text-white">{priceLabel}</p>}
          </div>

          <RdvPlanningCard appointment={appointment} />
          <RdvPaymentCard appointment={appointment} />

          {/* Salon et artiste */}
          <section className="space-y-4 rounded-3xl bg-white/4 p-5">
            <h4 className="text-sm font-semibold text-white">Le salon et votre artiste</h4>
            <Link href={salonProfileHref} className="group/salon flex items-center gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8 text-sm text-white/60">
                {appointment.salon.image ? <Image src={appointment.salon.image} alt="" fill sizes="44px" className="object-cover" /> : salonName.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-sm font-medium text-white transition group-hover/salon:text-tertiary-400">{salonName}<ExternalLink size={12} className="text-white/35" aria-hidden="true" /></span>
                <span className="block text-xs text-white/50">{appointment.salon.address && `${appointment.salon.address}, `}{appointment.salon.city} {appointment.salon.postalCode}</span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-2">
              {conversationHref && <Link href={conversationHref} className={pillPrimary}><MessageSquare size={14} aria-hidden="true" />Écrire au salon</Link>}
              {appointment.salon.phone && <a href={`tel:${appointment.salon.phone}`} className={pillSoft}><Phone size={14} aria-hidden="true" /><span className="tabular-nums">{formatPhoneDisplay(appointment.salon.phone)}</span></a>}
              {appointment.salon.website && <a href={appointment.salon.website} target="_blank" rel="noopener noreferrer" className={iconPill} title="Site web" aria-label="Site web du salon"><TfiWorld className="size-3.5" /></a>}
              {appointment.salon.instagram && <a href={appointment.salon.instagram} target="_blank" rel="noopener noreferrer" className={iconPill} title="Instagram" aria-label="Instagram du salon"><CiInstagram className="size-4" /></a>}
            </div>
            {appointment.tatoueur && (appointment.tatoueur.phone || appointment.tatoueur.instagram || artistName) && (
              <div className="rounded-2xl bg-white/4 p-3.5">
                <p className="mb-2 text-xs text-white/50">Votre artiste{artistName ? ` · ${artistName}` : ""}</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.tatoueur.phone && <a href={`tel:${appointment.tatoueur.phone}`} className={pillSoft}><Phone size={14} aria-hidden="true" /><span className="tabular-nums">{formatPhoneDisplay(appointment.tatoueur.phone)}</span></a>}
                  {appointment.tatoueur.instagram && <a href={appointment.tatoueur.instagram} target="_blank" rel="noopener noreferrer" className={iconPill} title="Instagram" aria-label="Instagram de l’artiste"><CiInstagram className="size-4" /></a>}
                </div>
              </div>
            )}
          </section>

          <RdvPrestationCard appointment={{ ...appointment, tattooDetail: appointment.prestationDetails }} piercingZoneName={appointment.prestationDetails?.piercingDetails?.zoneOreille || appointment.prestationDetails?.piercingDetails?.zoneVisage || appointment.prestationDetails?.piercingDetails?.zoneBouche || appointment.prestationDetails?.piercingDetails?.zoneCorps || appointment.prestationDetails?.piercingDetails?.zoneMicrodermal} />

          {/* Gestion */}
          {(appointment.moodboard || (appointment.status !== "CANCELED" && appointment.status !== "COMPLETED")) && (
            <section className="rounded-3xl bg-white/4 p-5">
              <h4 className="mb-3 text-sm font-semibold text-white">Gérer mon rendez-vous</h4>
              {appointment.visio && appointment.status === "CONFIRMED" && <p className="mb-3 inline-flex items-center gap-2 rounded-xl bg-sky-400/10 px-3 py-1.5 text-xs text-sky-200"><Video size={13} />Rendez-vous en visio</p>}
              <div className="flex flex-wrap gap-2">
                {appointment.moodboard ? (
                  <button type="button" onClick={() => handleOpenMoodboard(appointment.moodboard!.id, appointment.moodboard!.name, appointment.id, appointment.status)} className={`flex w-full cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-2 pr-4 text-left transition hover:bg-white/8 ${focusRing}`}><MoodboardThumb id={appointment.moodboard.id} name={appointment.moodboard.name} /><span className="min-w-0 flex-1"><span className="block text-[10px] uppercase tracking-[0.12em] text-white/40">Moodboard lié</span><span className="block truncate text-sm font-medium text-white">{appointment.moodboard.name}</span></span><span className="inline-flex items-center gap-1 text-xs text-white/50">Voir<ArrowRight size={13} /></span></button>
                ) : appointment.status !== "CANCELED" && appointment.status !== "COMPLETED" && (
                  <button type="button" onClick={() => handleOpenConnectModal(appointment.id)} className={pillSoft}><Images size={14} />Lier un moodboard</button>
                )}
                {canManage && (
                  <>
                    <button type="button" onClick={() => handleEditClick(appointment)} className={pillSoft}><Pencil size={13} />Déplacer le rendez-vous</button>
                    <button type="button" onClick={() => handleCancelClick(appointment.id)} disabled={cancelingAppointmentId === appointment.id} className={pillDanger}><X size={14} />{cancelingAppointmentId === appointment.id ? "Annulation…" : "Annuler"}</button>
                  </>
                )}
              </div>
            </section>
          )}

          {appointment.status === "COMPLETED" && (
            <AppointmentReview appointment={appointment} hasReview={hasReview} reviewForm={reviewForm} hoverRating={hoverRating} reviewSubmitting={reviewSubmitting} setHoverRating={setHoverRating} setReviewForm={setReviewForm} handleSubmitReview={handleSubmitReview} />
          )}
        </div>
      </AppointmentDrawer>}
    </>
  );
}
