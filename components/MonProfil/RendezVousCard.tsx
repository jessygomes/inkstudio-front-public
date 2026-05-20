import React from "react";
import Link from "next/link";
import Image from "next/image";
import { toSlug } from "@/lib/utils";
import AppButton from "@/components/Shared/AppButton";
import {
  FaCalendarAlt,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaPalette,
  FaRegCommentDots,
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
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 transition-all duration-300 hover:border-white/25 hover:bg-white/6 ${
        isExpanded ? "sm:col-span-2" : ""
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          appointment.status === "CONFIRMED"
            ? "bg-emerald-400"
            : appointment.status === "PENDING"
              ? "bg-orange-400"
              : appointment.status === "COMPLETED"
                ? "bg-blue-400"
                : "bg-red-400"
        }`}
      />

      <div className="bg-linear-to-b from-noir-700/55 to-noir-500/45 p-3 sm:p-3.5">
        <div className="flex flex-col gap-2.5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
              <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-tertiary-400/15 to-tertiary-500/15">
                {appointment.salon.image ? (
                  <Image
                    src={appointment.salon.image}
                    alt={appointment.salon.salonName}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-tertiary-500">
                    {appointment.salon.salonName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="line-clamp-1 text-sm font-semibold leading-tight text-white font-one">
                    {appointment.prestation}
                  </h4>
                  <p className="mt-0.5 truncate text-xs text-white/60 font-one">
                    {appointment.salon.salonName}
                    {appointment.tatoueur && <> • {appointment.tatoueur.name}</>}
                  </p>
                </div>
                <div className="shrink-0">{getStatusBadge(appointment.status)}</div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-white/70">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2 py-0.5 font-one">
                  <FaCalendarAlt className="h-3 w-3 text-tertiary-400" />
                  {formatDate(appointment.start)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2 py-0.5 font-one">
                  <FaClock className="h-3 w-3 text-tertiary-400" />
                  {formatTime(appointment.start)}
                </span>
                {appointment.prestationDetails &&
                  appointment.prestationDetails.price !== undefined &&
                  (appointment.prestationDetails.price ?? 0) > 0 && (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2 py-0.5 font-semibold text-white font-one">
                      {appointment.prestationDetails.price}€
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 pt-2 sm:flex sm:flex-wrap sm:items-center sm:gap-0">
            <Link
              href={`/salon/${toSlug(appointment.salon.salonName)}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-tertiary-200 transition-all hover:bg-tertiary-500/20 font-one sm:rounded-none sm:border-0 sm:bg-transparent"
            >
              <FaStore size={10} />
              Voir salon
            </Link>

            {appointment.conversation && (
              <Link
                href={`/mon-profil/messagerie/${appointment.conversation.id}`}
                className="relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/85 transition-all hover:bg-white/10 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
              >
                <FaRegCommentDots size={10} />
                Messagerie
                {appointment.conversation.unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-tertiary-500 px-1 text-[10px] font-semibold text-white">
                    {appointment.conversation.unreadCount > 9
                      ? "9+"
                      : appointment.conversation.unreadCount}
                  </span>
                )}
              </Link>
            )}

            {appointment.visio && appointment.status === "CONFIRMED" && (
              <span className="inline-flex items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-200 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent sm:text-blue-200">
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
                className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-violet-200 transition-all hover:bg-violet-500/20 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
              >
                <FaPalette size={10} /> Moodboard {" "}
                {appointment.moodboard.name}
              </button>
            ) : (
              appointment.status !== "CANCELED" &&
              appointment.status !== "COMPLETED" && (
                <button
                  onClick={() => handleOpenConnectModal(appointment.id)}
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition-all hover:bg-white/10 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
                >
                  + Lier un moodboard
                </button>
              )
            )}

            {appointment.status === "CONFIRMED" && (
              <>
                <button
                  onClick={() => handleEditClick(appointment)}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/85 transition-all hover:bg-white/10 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleCancelClick(appointment.id)}
                  disabled={cancelingAppointmentId === appointment.id}
                  className="cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-200 transition-all hover:bg-red-500/20 disabled:opacity-50 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
                >
                  {cancelingAppointmentId === appointment.id ? "..." : "Annuler"}
                </button>
              </>
            )}

            {appointment.status === "COMPLETED" && (
              <button
                onClick={() => handleReviewClick(appointment.id)}
                className="cursor-pointer rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200 transition-all hover:bg-amber-500/20 font-one sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
              >
                ⭐ {hasReview ? "Voir l'avis" : "Donner un avis"}
              </button>
            )}

            <button
              onClick={() => toggleExpand(appointment.id)}
              className="col-span-2 cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/90 transition-all hover:bg-white/12 font-one sm:col-auto sm:ml-auto sm:justify-start sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent"
            >
              {isExpanded ? "Réduire" : "Détails"}
              {isExpanded ? (
                <FaChevronUp className="h-3 w-3" />
              ) : (
                <FaChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">
                  Date
                </p>
                <p className="mt-0.5 text-xs text-white font-one">
                  {formatDate(appointment.start)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">
                  Heure
                </p>
                <p className="mt-0.5 text-xs text-white font-one">
                  {formatTime(appointment.start)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">
                  Durée
                </p>
                <p className="mt-0.5 text-xs text-white font-one">
                  {appointment.duration ? `${appointment.duration} min` : "Non spécifié"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">
                  Prix
                </p>
                <p className="mt-0.5 text-xs text-white font-one">
                  {appointment.prestationDetails?.price && appointment.prestationDetails.price > 0
                    ? `${appointment.prestationDetails.price}€`
                    : "Non spécifié"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Infos rendez-vous</span>
                  {getStatusBadge(appointment.status)}
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
                        <span>📞</span>
                        <span>{formatPhoneDisplay(appointment.salon.phone)}</span>
                      </a>
                    )}
                    {appointment.salon.website && (
                      <a
                        href={appointment.salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/60 hover:text-tertiary-400 transition-all"
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
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-2xl text-white/60 hover:text-pink-400 transition-all"
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
                          <span>📞</span>
                          <span>{formatPhoneDisplay(appointment.tatoueur.phone)}</span>
                        </a>
                      )}
                      {appointment.tatoueur.instagram && (
                        <a
                          href={appointment.tatoueur.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-2xl text-white/60 hover:text-pink-400 transition-all"
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
                <div className="space-y-3 rounded-2xl font-one border border-white/10 bg-white/5 p-3 md:col-span-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Brief</span>
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
                    <div className="pt-2 border-t border-white/10 text-xs text-white/80 leading-relaxed">
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

            {appointment.status === "COMPLETED" && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-3.5">
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
