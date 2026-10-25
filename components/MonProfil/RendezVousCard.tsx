import Image from "next/image";
import { RdvPlanningCard, RdvPrestationCard, RdvPaymentCard } from "./RdvInformationCards";
import React, { useId } from "react";
import { Clock, MapPin, MessageSquare, ChevronRight, Video, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import AppointmentDrawer from "./AppointmentDrawer";
import AppointmentReview from "./AppointmentReview";
import AppButton from "@/components/Shared/AppButton";
import {
  FaPalette,
} from "react-icons/fa";
import { CiInstagram } from "react-icons/ci";
import { TfiWorld } from "react-icons/tfi";
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
  const serviceType = appointment.prestation.toUpperCase();
  const serviceLabel = ({ TATTOO: "TATOUAGE", PIERCING: "PIERCING", RETOUCHE: "RETOUCHE" } as Record<string, string>)[serviceType] || serviceType;
  const salonName = appointment.salon.salonName?.trim();
  const salonProfileHref = `/salon/${toSlug(salonName || [appointment.salon.firstName, appointment.salon.lastName].filter(Boolean).join(" "))}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`;
  const conversationHref = appointment.conversation
    ? `/mon-profil?tab=messagerie&conversation=${encodeURIComponent(appointment.conversation.id)}`
    : null;
  const contactLinkClass = "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400";
  const contactIconClass = `${contactLinkClass} w-8 !p-0`;
  const isIndependentArtist =
    appointment.salon.role?.toLowerCase() === "user_tatoueur" ||
    appointment.performerUser?.id === appointment.salon.id ||
    appointment.tatoueur?.id === appointment.salon.id;
  const hasDistinctArtist = appointment.tatoueur &&
    appointment.tatoueur.name.trim().toLocaleLowerCase("fr-FR") !== salonName?.toLocaleLowerCase("fr-FR");
  const renderSummary = (inDrawer = false) => (
    <>
        {inDrawer && <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-tertiary-400">{serviceLabel}</span><div className="ml-auto flex items-center gap-2">{getStatusBadge(appointment.status)}{typeof price === "number" && <span className="text-sm font-semibold tabular-nums text-white">{price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}</div></div>}
        <div className={`grid gap-2 ${inDrawer ? "" : "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4"}`}>
          <div className="flex items-start gap-2.5">
          <div className="flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-white/4 text-white">
            <span className="w-full bg-tertiary-400/10 py-1 text-center text-[11px] uppercase tracking-wider text-tertiary-400">{validDate ? date.toLocaleDateString("fr-FR", { month: "short" }) : "Date"}</span>
            <span className="pt-0.5 text-xl leading-tight">{validDate ? date.getDate() : "—"}</span>
            <span className="pb-1 text-[11px] text-white/45">{validDate ? date.getFullYear() : ""}</span>
          </div>

            <div className="min-w-0 flex-1">
              {appointment.title ? <>{!inDrawer && <p className="mb-1 text-xs text-tertiary-400">{serviceLabel}</p>}<h4 className="break-words text-sm leading-snug text-white">{appointment.title}</h4></> : <h4 className="text-base leading-snug text-tertiary-400">{serviceLabel}</h4>}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                <span className="inline-flex min-w-0 items-center gap-2">
                  {appointment.salon.image && <Image src={appointment.salon.image} alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full object-cover" />}
                  {salonName && <Link href={salonProfileHref} className="min-w-0 cursor-pointer break-words text-white/80 underline-offset-4 hover:text-tertiary-400 hover:underline">{salonName}</Link>}
                </span>
                {!isIndependentArtist && hasDistinctArtist && <span className="break-words text-xs text-white/55">Avec {appointment.tatoueur!.name}</span>}
                <span className="inline-flex shrink-0 items-center gap-1.5"><Clock size={14} className="text-white/40" />{formatTime(appointment.start)}{appointment.duration ? <span className="text-xs text-white/50">· {appointment.duration} min</span> : null}</span>
                {appointment.visio ? <span className="inline-flex items-center gap-1.5"><Video size={14} className="shrink-0 text-white/40" />En visio</span> : appointment.salon.city && <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={14} className="shrink-0 text-white/40" /><span className="break-words">{appointment.salon.city}</span></span>}
              </div>
            </div>
          </div>
          {!inDrawer && <div className={`flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2 ${inDrawer ? "" : "lg:flex-row lg:items-center lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"}`}>
            {getStatusBadge(appointment.status)}
            {typeof price === "number" && <span className="text-base font-semibold tabular-nums text-white">{price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}
            {!inDrawer && <AppButton type="button" variant="secondary" onClick={() => toggleExpand(appointment.id)} aria-haspopup="dialog" aria-controls={isExpanded ? detailsId : undefined} className="min-h-8 cursor-pointer !px-3 !py-1 !text-xs">Voir le rendez-vous<ChevronRight size={15} /></AppButton>}
          </div>}
        </div>
        {!inDrawer && appointment.conversation && <Link href={`/mon-profil?tab=messagerie&conversation=${encodeURIComponent(appointment.conversation.id)}`} className="mt-2 flex min-h-8 items-center gap-2 rounded-xl bg-white/4 px-3 text-xs text-white/65 transition hover:bg-white/8 hover:text-white"><MessageSquare size={15} />Échanger avec le salon{appointment.conversation.unreadCount > 0 ? <span className="ml-auto rounded-full bg-tertiary-400/15 px-2 py-1 text-tertiary-400">{appointment.conversation.unreadCount} non lu{appointment.conversation.unreadCount > 1 ? "s" : ""}</span> : <span className="ml-auto text-white/35">Ouvrir la conversation →</span>}</Link>}
</>);
  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl border bg-noir-500 font-one transition-colors ${isExpanded ? "border-tertiary-400/30" : "border-white/10 hover:border-white/25"}`}>
        <button type="button" onClick={() => toggleExpand(appointment.id)} aria-label={`Voir le rendez-vous : ${appointment.title || serviceLabel}`} aria-haspopup="dialog" aria-controls={isExpanded ? detailsId : undefined} className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-tertiary-400" />
        <div className="pointer-events-none relative p-2.5 sm:p-3 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">{renderSummary()}</div>
      </div>
      {isExpanded && <AppointmentDrawer id={detailsId} onClose={() => toggleExpand(appointment.id)}>
        <div className="font-one">{renderSummary(true)}
          <div className="mt-2.5 space-y-2.5 border-t border-white/10 pt-2.5">
            <RdvPlanningCard appointment={appointment} /><RdvPaymentCard appointment={appointment} />
            <div className="grid gap-2">
              <div className="min-w-0 space-y-3 rounded-2xl border border-white/10 bg-noir-600 p-4">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="text-xs font-semibold text-white">Le salon et votre artiste</span>

                </div>
                <div className="space-y-1 text-sm text-white font-one">
                  <p className="text-white/80 text-xs">Adresse du salon</p>
                  <p className="text-white text-xs">
                    {appointment.salon.address && `${appointment.salon.address}, `}
                    {appointment.salon.city} {appointment.salon.postalCode}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-2 font-one">
                  <p className="text-white/60 text-xs mb-2">Contact salon</p>
                  <div className="flex flex-wrap gap-2">
                    {conversationHref && <Link href={conversationHref} className={contactLinkClass}><MessageSquare size={14} aria-hidden="true" />Ouvrir la conversation</Link>}
                    <Link href={salonProfileHref} aria-label="Profil Inkera" title="Profil Inkera" className={contactIconClass}><ExternalLink size={14} aria-hidden="true" /></Link>
                    {appointment.salon.phone && (
                      <a
                        href={`tel:${appointment.salon.phone}`}
                        className={contactLinkClass}
                      >
                        <Phone size={14} aria-hidden="true" />
                        <span>{formatPhoneDisplay(appointment.salon.phone)}</span>
                      </a>
                    )}
                    {appointment.salon.website && (
                      <a
                        href={appointment.salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={contactIconClass}
                        title="Site web"
                        aria-label="Site web du salon"
                      >
                        <span>
                          <TfiWorld className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    )}
                    {appointment.salon.instagram && (
                      <a
                        href={appointment.salon.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={contactIconClass}
                        title="Instagram"
                        aria-label="Instagram"
                      >
                        <span>
                          <CiInstagram className="w-4 h-4" />
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 font-one">
                  <p className="text-white/60 text-xs mb-2">Contact tatoueur</p>
                  {appointment.tatoueur ? (
                    <div className="flex flex-wrap gap-2">
                      {appointment.tatoueur.phone && (
                        <a
                          href={`tel:${appointment.tatoueur.phone}`}
                          className={contactLinkClass}
                        >
                          <Phone size={14} aria-hidden="true" />
                          <span>{formatPhoneDisplay(appointment.tatoueur.phone)}</span>
                        </a>
                      )}
                      {appointment.tatoueur.instagram && (
                        <a
                          href={appointment.tatoueur.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={contactIconClass}
                          title="Instagram"
                        aria-label="Instagram"
                        >
                          <span>
                            <CiInstagram className="w-4 h-4" />
                          </span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/50 text-xs">Non assigné</p>
                  )}
                </div>
              </div>

              <RdvPrestationCard appointment={{ ...appointment, tattooDetail: appointment.prestationDetails }} piercingZoneName={appointment.prestationDetails?.piercingDetails?.zoneOreille || appointment.prestationDetails?.piercingDetails?.zoneVisage || appointment.prestationDetails?.piercingDetails?.zoneBouche || appointment.prestationDetails?.piercingDetails?.zoneCorps || appointment.prestationDetails?.piercingDetails?.zoneMicrodermal} />
            </div>

            {(appointment.moodboard || appointment.status === "CONFIRMED" || (appointment.status !== "CANCELED" && appointment.status !== "COMPLETED")) && <div className="border-t border-white/10 pt-3"><h5 className="mb-3 text-xs font-semibold text-white">Gérer mon rendez-vous</h5><div className="grid grid-cols-2 gap-2">

            {appointment.visio && appointment.status === "CONFIRMED" && (
              <span className="inline-flex items-center justify-center min-h-8 rounded-lg border border-blue-400/30 bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-200 font-one">
                📹 Visio
              </span>
            )}

            {appointment.moodboard ? (
              <button
                onClick={() =>
                  handleOpenMoodboard(
                    appointment.moodboard!.id,
                    appointment.moodboard!.name,
                    appointment.id,
                    appointment.status,
                  )
                }
                className="cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 font-one border-white/10 bg-white/[0.025] text-violet-200 hover:bg-white/5"
              >
                <FaPalette size={10} /> Moodboard {" "}
                {appointment.moodboard.name}
              </button>
            ) : (
              appointment.status !== "CANCELED" &&
              appointment.status !== "COMPLETED" && (
                <button
                  onClick={() => handleOpenConnectModal(appointment.id)}
                  className="cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 font-one border-white/10 bg-white/[0.025] text-white/70 hover:bg-white/5"
                >
                  + Lier un moodboard
                </button>
              )
            )}

            {appointment.status === "CONFIRMED" && new Date(appointment.end).getTime() > Date.now() && (
              <>
                <button
                  onClick={() => handleEditClick(appointment)}
                  className="cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 font-one border-white/10 bg-white/[0.025] text-white/80 hover:bg-white/5"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleCancelClick(appointment.id)}
                  disabled={cancelingAppointmentId === appointment.id}
                  className="cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 font-one border-red-400/15 bg-red-400/[0.025] text-red-300 hover:bg-red-400/10"
                >
                  {cancelingAppointmentId === appointment.id ? "..." : "Annuler"}
                </button>
              </>
            )}

            </div></div>}
            {appointment.status === "COMPLETED" && (
              <AppointmentReview appointment={appointment} hasReview={hasReview} reviewForm={reviewForm} hoverRating={hoverRating} reviewSubmitting={reviewSubmitting} setHoverRating={setHoverRating} setReviewForm={setReviewForm} handleSubmitReview={handleSubmitReview} />
            )}
          </div></div>
      </AppointmentDrawer>}
    </>
  );
}
