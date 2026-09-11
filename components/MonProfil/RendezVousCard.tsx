import React, { useId } from "react";
import { Clock, MapPin, MessageSquare, ChevronDown, Video, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toSlug } from "@/lib/utils";
import AppButton from "@/components/Shared/AppButton";
import {
  FaStar,
  FaPalette,
  FaStore,
} from "react-icons/fa";
import { CiInstagram } from "react-icons/ci";
import { TfiWorld } from "react-icons/tfi";
import type { Appointment } from "./RendezVousTab";

type ReviewFormState = {
  rating: number;
  title: string;
  comment: string;
};

type RendezVousCardProps = {
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
  formatDate,
  formatTime,
  formatPhoneDisplay,
  toggleExpand,
  handleOpenMoodboard,
  handleOpenConnectModal,
  handleEditClick,
  handleCancelClick,
  handleReviewClick,
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
  const isIndependentArtist =
    appointment.salon.role?.toLowerCase() === "user_tatoueur" ||
    appointment.performerUser?.id === appointment.salon.id ||
    appointment.tatoueur?.id === appointment.salon.id;
  const hasDistinctArtist = appointment.tatoueur &&
    appointment.tatoueur.name.trim().toLocaleLowerCase("fr-FR") !== appointment.salon.salonName.trim().toLocaleLowerCase("fr-FR");
  return (
    <div className={`overflow-hidden rounded-2xl border bg-noir-500 font-one transition-colors ${isExpanded ? "border-tertiary-400/30" : "border-white/10 hover:border-white/25"}`}>
      <div className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
          <div className="flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-white/4 text-white sm:w-16">
            <span className="w-full bg-tertiary-400/10 py-1 text-center text-[11px] uppercase tracking-wider text-tertiary-400">{validDate ? date.toLocaleDateString("fr-FR", { month: "short" }) : "Date"}</span>
            <span className="pt-0.5 text-2xl leading-tight">{validDate ? date.getDate() : "—"}</span>
            <span className="pb-1 text-[11px] text-white/45">{validDate ? date.getFullYear() : ""}</span>
          </div>

            <div className="min-w-0 flex-1">
              {appointment.title ? <><p className="mb-1 text-xs text-tertiary-400">{serviceLabel}</p><h4 className="break-words text-lg leading-snug text-white sm:text-xl">{appointment.title}</h4></> : <h4 className="text-base leading-snug text-tertiary-400">{serviceLabel}</h4>}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/75">
                <span className="inline-flex min-w-0 items-center gap-2">
                  {appointment.salon.image && <Image src={appointment.salon.image} alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full object-cover" />}
                  <Link href={`/salon/${toSlug(appointment.salon.salonName)}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`} className="min-w-0 break-words text-white/80 underline-offset-4 hover:underline">{appointment.salon.salonName}</Link>
                </span>
                {!isIndependentArtist && hasDistinctArtist && <span className="break-words text-xs text-white/55">Avec {appointment.tatoueur!.name}</span>}
                <span className="inline-flex shrink-0 items-center gap-1.5"><Clock size={14} className="text-white/40" />{formatTime(appointment.start)}{appointment.duration ? <span className="text-xs text-white/50">· {appointment.duration} min</span> : null}</span>
                {appointment.visio ? <span className="inline-flex items-center gap-1.5"><Video size={14} className="shrink-0 text-white/40" />En visio</span> : appointment.salon.city && <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={14} className="shrink-0 text-white/40" /><span className="break-words">{appointment.salon.city}</span></span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            {getStatusBadge(appointment.status)}
            {typeof price === "number" && <span className="text-lg font-semibold tabular-nums text-white">{price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}
            <AppButton type="button" variant="secondary" onClick={() => toggleExpand(appointment.id)} aria-expanded={isExpanded} aria-controls={detailsId} className="min-h-11 cursor-pointer">{isExpanded ? "Fermer les détails" : "Voir le rendez-vous"}<ChevronDown size={15} className={isExpanded ? "rotate-180" : ""} /></AppButton>
          </div>
        </div>
        {appointment.conversation && <Link href={`/mon-profil/messagerie/${appointment.conversation.id}`} className="mt-4 flex min-h-11 items-center gap-2 rounded-xl bg-white/4 px-3 text-xs text-white/65 transition hover:bg-white/8 hover:text-white"><MessageSquare size={15} />Échanger avec le salon{appointment.conversation.unreadCount > 0 ? <span className="ml-auto rounded-full bg-tertiary-400/15 px-2 py-1 text-tertiary-400">{appointment.conversation.unreadCount} non lu{appointment.conversation.unreadCount > 1 ? "s" : ""}</span> : <span className="ml-auto text-white/35">Ouvrir la conversation →</span>}</Link>}
        {isExpanded && (
          <div id={detailsId} className="mt-5 space-y-5 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50">
              <span>{formatDate(appointment.start)} · {formatTime(appointment.start)} – {formatTime(appointment.end)}</span>
              {appointment.duration && <span>{appointment.duration} min</span>}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className={`min-w-0 space-y-4 rounded-xl bg-white/3 p-4 lg:order-2 ${appointment.prestationDetails ? "" : "lg:col-span-3"}`}>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="text-sm font-semibold text-white">Le salon et votre artiste</span>

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
                    {appointment.salon.phone && (
                      <a
                        href={`tel:${appointment.salon.phone}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-white/10 text-white/80 text-xs font-one transition-all"
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
                        className="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/60 hover:text-tertiary-400 transition-all"
                        title="Site web"
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
                        className="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-2xl text-white/60 hover:text-pink-400 transition-all"
                        title="Instagram"
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
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-white/10 text-white/80 text-xs font-one transition-all"
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
                          className="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-2xl text-white/60 hover:text-pink-400 transition-all"
                          title="Instagram"
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

              {appointment.prestationDetails && (
                <div className="min-w-0 space-y-4 lg:order-1 lg:col-span-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="text-sm font-semibold text-white">Votre projet</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs text-white">
                    {appointment.prestationDetails.zone && (
                      <div>
                        <p className="text-white/60">Zone</p>
                        <p>{appointment.prestationDetails.zone}</p>
                      </div>
                    )}
                    {appointment.prestationDetails.size && (
                      <div>
                        <p className="text-white/60">Taille</p>
                        <p>{appointment.prestationDetails.size}</p>
                      </div>
                    )}
                    {appointment.prestationDetails.colorStyle && (
                      <div>
                        <p className="text-white/60">Style</p>
                        <p>{appointment.prestationDetails.colorStyle}</p>
                      </div>
                    )}
                    {appointment.prestationDetails.piercingZone && (
                      <div>
                        <p className="text-white/60">Zone piercing</p>
                        <p>{appointment.prestationDetails.piercingZone}</p>
                      </div>
                    )}
                    {appointment.prestationDetails.piercingDetails && (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-white/60">Détail piercing</p>
                        <p>
                          {appointment.prestationDetails.piercingDetails.zoneOreille ||
                            appointment.prestationDetails.piercingDetails.zoneVisage ||
                            appointment.prestationDetails.piercingDetails.zoneBouche ||
                            appointment.prestationDetails.piercingDetails.zoneCorps ||
                            appointment.prestationDetails.piercingDetails.zoneMicrodermal ||
                            "Non spécifié"}
                        </p>
                      </div>
                    )}
                  </div>

                  {appointment.prestationDetails.description && (
                    <div className="pt-3 border-t border-white/10 whitespace-pre-line break-words text-sm text-white/70 leading-7">
                      {appointment.prestationDetails.description}
                    </div>
                  )}

                  {(appointment.prestationDetails.reference || appointment.prestationDetails.sketch) && (
                    <div className="border-t border-white/10 pt-2">
                      <p className="text-white/60 text-xs mb-2">Références</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.prestationDetails.reference && (
                          <div className="relative">
                            <Image
                              src={appointment.prestationDetails.reference}
                              alt="Image de référence"
                              width={96}
                              height={96}
                              className="h-24 w-24 rounded-2xl border border-white/15 object-cover"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-tertiary-500 text-white text-[11px] px-2 py-0.5 rounded">
                              Référence
                            </span>
                          </div>
                        )}
                        {appointment.prestationDetails.sketch && (
                          <div className="relative">
                            <Image
                              src={appointment.prestationDetails.sketch}
                              alt="Croquis"
                              width={96}
                              height={96}
                              className="h-24 w-24 rounded-2xl border border-white/15 object-cover"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[11px] px-2 py-0.5 rounded">
                              Croquis
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4"><h5 className="mb-3 text-sm font-semibold text-white">Gérer mon rendez-vous</h5><div className="flex flex-wrap gap-2">
            <Link
              href={`/salon/${toSlug(appointment.salon.salonName)}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-9 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-tertiary-200 transition-all hover:bg-tertiary-500/20 font-one"
            >
              <FaStore size={10} />
              Voir salon
            </Link>

            {appointment.visio && appointment.status === "CONFIRMED" && (
              <span className="inline-flex items-center justify-center min-h-11 sm:min-h-9 rounded-xl border border-blue-400/30 bg-blue-500/10 px-2.5 py-2 text-xs text-blue-200 font-one">
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
                className="cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-9 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-violet-200 transition-all hover:bg-violet-500/20 font-one"
              >
                <FaPalette size={10} /> Moodboard {" "}
                {appointment.moodboard.name}
              </button>
            ) : (
              appointment.status !== "CANCELED" &&
              appointment.status !== "COMPLETED" && (
                <button
                  onClick={() => handleOpenConnectModal(appointment.id)}
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-9 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white/70 transition-all hover:bg-white/10 font-one"
                >
                  + Lier un moodboard
                </button>
              )
            )}

            {appointment.status === "CONFIRMED" && (
              <>
                <button
                  onClick={() => handleEditClick(appointment)}
                  className="cursor-pointer min-h-11 sm:min-h-9 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white/85 transition-all hover:bg-white/10 font-one"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleCancelClick(appointment.id)}
                  disabled={cancelingAppointmentId === appointment.id}
                  className="cursor-pointer min-h-11 sm:min-h-9 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-xs text-red-200 transition-all hover:bg-red-500/20 disabled:opacity-50 font-one"
                >
                  {cancelingAppointmentId === appointment.id ? "..." : "Annuler"}
                </button>
              </>
            )}

            {appointment.status === "COMPLETED" && (
              <button
                onClick={() => handleReviewClick(appointment.id)}
                className="cursor-pointer min-h-11 sm:min-h-9 rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-200 transition-all hover:bg-amber-500/20 font-one"
              >
                ⭐ {hasReview ? "Voir l'avis" : "Donner un avis"}
              </button>
            )}


            </div></div>
            {appointment.status === "COMPLETED" && (
              <div id={`appointment-review-${appointment.id}`} className="scroll-mt-28 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-3.5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-lg">
                    ⭐
                  </span>
                  <div>
                    <p className="text-white font-one text-sm font-semibold">
                      {hasReview ? "Votre avis" : "Donner votre avis"}
                    </p>
                    <p className="text-white/60 text-xs font-one">
                      Partagez votre expérience avec le salon
                    </p>
                  </div>
                </div>

                {hasReview ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="text-amber-300 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < (appointment.review?.rating || 0) ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <span className="text-white/70 text-xs">{appointment.review?.rating}/5</span>
                      {appointment.review?.isVerified && (
                        <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30 font-one text-emerald-200 text-[11px]">
                          ✓ Vérifié
                        </span>
                      )}
                    </div>

                    {appointment.review?.title && (
                      <p className="text-white font-semibold text-sm font-one">
                        {appointment.review.title}
                      </p>
                    )}

                    {appointment.review?.comment && (
                      <p className="text-white/80 text-sm leading-relaxed font-one">
                        {appointment.review.comment}
                      </p>
                    )}

                    <p className="text-white/50 text-xs border-t border-white/10 pt-2 font-one">
                      Publié le{" "}
                      {appointment.review?.createdAt
                        ? new Date(appointment.review.createdAt).toLocaleDateString("fr-FR")
                        : ""}
                    </p>

                    {appointment.review?.salonResponse && (
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-white/70 text-xs mb-1 font-one font-semibold">
                          Réponse du salon
                        </p>
                        <p className="text-white/80 text-sm font-one">
                          {appointment.review.salonResponse}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const value = i + 1;
                        const active = (hoverRating ?? reviewForm.rating) >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() =>
                              setReviewForm((f) => ({
                                ...f,
                                rating: value,
                              }))
                            }
                            className="p-1"
                          >
                            <FaStar
                              className={`w-5 h-5 transition-all ${
                                active
                                  ? "text-amber-300 scale-105 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                                  : "text-white/30 hover:text-white/60"
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-white/70 text-xs ml-2">{reviewForm.rating}/5</span>
                    </div>

                    <div className="space-y-1 font-one">
                      <label className="text-white/80 text-xs">Titre (optionnel)</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) =>
                          setReviewForm((f) => ({
                            ...f,
                            title: e.target.value,
                          }))
                        }
                        maxLength={100}
                        placeholder="Ex: Excellent travail"
                        className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 placeholder:text-white/40"
                      />
                      <p className="text-white/40 text-[11px]">{reviewForm.title.length}/100</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/80 text-xs">Votre avis</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((f) => ({
                            ...f,
                            comment: e.target.value,
                          }))
                        }
                        maxLength={500}
                        rows={3}
                        placeholder="Partagez votre expérience..."
                        className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 placeholder:text-white/40 resize-none"
                      />
                      <p className="text-white/40 text-[11px]">{reviewForm.comment.length}/500</p>
                    </div>

                    <div className="flex justify-end">
                      <AppButton
                        onClick={() => handleSubmitReview(appointment)}
                        disabled={reviewSubmitting}
                        variant="primary"
                        icon={reviewSubmitting ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : undefined}
                        className="text-xs py-2 cursor-pointer"
                      >
                        {reviewSubmitting ? "Publication..." : "Publier l'avis"}
                      </AppButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
