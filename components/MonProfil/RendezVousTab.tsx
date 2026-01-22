/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import {
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { getAllRdvClient } from "@/lib/actions/user.action";
import { toast } from "sonner";
import Image from "next/image";
import { cancelAppointmentByClient } from "@/lib/actions/appointment.action";
import { createReview } from "@/lib/actions/review.action";
import { FaStar } from "react-icons/fa";
import { useEditAppointmentModal } from "@/components/Context/EditAppointmentContext";
import CancelAppointmentModal from "./CancelAppointmentModal";

export type Appointment = {
  id: string;
  title?: string;
  prestation: string;
  start: string;
  end: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELED";
  duration?: number;
  isPayed?: boolean;
  visio?: boolean;
  visioRoom?: string | null;
  salon: {
    id: string;
    salonName: string;
    firstName: string;
    lastName: string;
    image?: string;
    address?: string;
    city: string;
    postalCode: string;
    phone?: string;
    website?: string;
    instagram?: string;
  };
  tatoueur?: {
    id: string;
    name: string;
    img?: string;
    phone?: string;
    instagram?: string;
  } | null;
  prestationDetails?: {
    id: string;
    description?: string;
    zone?: string;
    size?: string;
    colorStyle?: string;
    reference?: string;
    sketch?: string;
    estimatedPrice?: number;
    price?: number;
    piercingZone?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    piercingDetails?: any;
  };
  conversation?: {
    id: string;
    lastMessageAt: string;
    // isRead: boolean;
    unreadCount: number;
  };
  review?: {
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    photos?: string[];
    isVerified?: boolean;
    isVisible?: boolean;
    createdAt?: string;
    salonResponse?: string | null;
    salonRespondedAt?: string | null;
  };
};

type RdvResponse = {
  appointments: Appointment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAppointments: number;
    limit: number;
  };
};

export default function RendezVousTab() {
  const [rdvData, setRdvData] = useState<RdvResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(
    new Set(),
  );
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<
    string | null
  >(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null,
  );
  const { openModal: openEditModal } = useEditAppointmentModal();
  // const [showReviewModal, setShowReviewModal] = useState(false);
  // const [appointmentToReview, setAppointmentToReview] =
  //   useState<Appointment | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  //! Récupération des rendez-vous
  const fetchRdvClient = async (status?: string, page = 1, pageLimit = 10) => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = { page, limit: pageLimit };
      if (status) options.status = status;

      const result = await getAllRdvClient(options);

      if (result.ok) {
        setRdvData(result.data);
      } else {
        console.error("Erreur récupération RDV:", result.message);
        setRdvData(null);
      }
    } catch (error) {
      console.error("Erreur fetch RDV:", error);
      setRdvData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRdvClient(statusFilter, currentPage, limit);
  }, [statusFilter, currentPage, limit]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset à la page 1 lors du changement de filtre
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && rdvData && newPage <= rdvData.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  //! Expansion détails rendez-vous
  const toggleExpand = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  //! Ouverture modal modification rendez-vous
  const handleEditClick = (appointment: Appointment) => {
    openEditModal(appointment, () => {
      fetchRdvClient(statusFilter, currentPage, limit);
    });
  };

  //! Badge statut
  const getStatusBadge = (status: Appointment["status"]) => {
    const configs = {
      CONFIRMED: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-200",
        border: "border-emerald-400/30",
        icon: <FaCheck className="w-3 h-3" />,
        label: "Confirmé",
      },
      PENDING: {
        bg: "bg-orange-500/10",
        text: "text-orange-200",
        border: "border-orange-400/30",
        icon: <FaClock className="w-3 h-3" />,
        label: "En attente",
      },
      COMPLETED: {
        bg: "bg-blue-500/10",
        text: "text-blue-200",
        border: "border-blue-400/30",
        icon: <FaCheck className="w-3 h-3" />,
        label: "Terminé",
      },
      CANCELED: {
        bg: "bg-red-500/10",
        text: "text-red-200",
        border: "border-red-400/30",
        icon: <FaTimes className="w-3 h-3" />,
        label: "Annulé",
      },
    };

    const config = configs[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-one border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  //! Formatage date et heure
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //! Gestion annulation rendez-vous
  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
    setCancelReason("");
  };

  //! Annulation rendez-vous
  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    try {
      setCancelingAppointmentId(appointmentToCancel);
      const result = await cancelAppointmentByClient(
        appointmentToCancel,
        cancelReason || undefined,
      );

      if (result.ok) {
        toast.success("Rendez-vous annulé avec succès");
        setShowCancelModal(false);
        setAppointmentToCancel(null);
        setCancelReason("");
        // Rafraîchir la liste des rendez-vous
        fetchRdvClient(statusFilter, currentPage, limit);
      } else {
        toast.error(result.message || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setCancelingAppointmentId(null);
    }
  };

  const handleReviewClick = (appointmentId: string) => {
    toggleExpand(appointmentId);
  };

  //! Soumission avis
  const handleSubmitReview = async (appointment: Appointment) => {
    try {
      setReviewSubmitting(true);
      const result = await createReview({
        salonId: appointment.salon.id,
        appointmentId: appointment.id,
        rating: reviewForm.rating,
        title: reviewForm.title || undefined,
        comment: reviewForm.comment || undefined,
      });

      if (result.ok) {
        toast.success("Avis publié avec succès");
        setReviewForm({ rating: 5, title: "", comment: "" });
        fetchRdvClient(statusFilter, currentPage, limit);
      } else {
        toast.error(result.message || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Erreur submission avis:", error);
      toast.error("Erreur lors de la publication de l'avis");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h3 className="text-white font-one font-semibold text-xl">
            Mes rendez-vous
          </h3>
          {rdvData && (
            <p className="text-white/60 font-one text-xs">
              {rdvData.pagination.totalAppointments} rendez-vous au total
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/70 text-xs font-one">
            <FaCalendarAlt className="w-3.5 h-3.5 text-tertiary-300" />
            {rdvData
              ? `Page ${rdvData.pagination.currentPage}/${rdvData.pagination.totalPages}`
              : ""}
          </div>
          <div className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-md bg-tertiary-500/10 border border-tertiary-500/30 text-tertiary-200 text-xs font-one">
            <FaFilter className="w-3 h-3" />
            Filtrer par statut
          </div>
        </div>
      </div>

      {/* Filtres modernisés */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Tous", value: "" },
            { label: "Confirmés", value: "CONFIRMED" },
            { label: "En attente", value: "PENDING" },
            { label: "Terminés", value: "COMPLETED" },
            { label: "Annulés", value: "CANCELED" },
          ].map((item) => {
            const isActive = statusFilter === item.value;
            return (
              <button
                key={item.value || "all"}
                onClick={() => handleStatusChange(item.value)}
                className={`cursor-pointer px-3.5 py-2 rounded-md text-xs font-one font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white border-transparent shadow-lg shadow-tertiary-500/30"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal d'annulation */}
      <CancelAppointmentModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setAppointmentToCancel(null);
          setCancelReason("");
        }}
        onConfirm={handleCancelConfirm}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        isLoading={cancelingAppointmentId !== null}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-one">
            Chargement des rendez-vous...
          </p>
        </div>
      ) : !rdvData || rdvData.appointments.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 font-one mb-4">
            {statusFilter
              ? `Aucun rendez-vous ${statusFilter.toLowerCase()} trouvé`
              : "Vous n'avez pas encore de rendez-vous"}
          </p>
          <Link
            href="/trouver-un-salon"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one text-sm shadow-lg hover:-translate-y-0.5"
          >
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des rendez-vous modernisée */}
          <div className="space-y-3">
            {rdvData.appointments
              .sort((a, b) => {
                const aUnread = a.conversation?.unreadCount || 0;
                const bUnread = b.conversation?.unreadCount || 0;
                return bUnread - aUnread;
              })
              .map((appointment) => {
                const isExpanded = expandedAppointments.has(appointment.id);
                const hasReview = !!appointment.review;

                return (
                  <div
                    key={appointment.id}
                    className="group relative border border-white/10 bg-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/25 hover:shadow-xl"
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

                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
                          <div className="flex items-center gap-3 md:w-72">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary-400/15 to-tertiary-500/15 border border-white/10">
                                {appointment.salon.image ? (
                                  <Image
                                    src={appointment.salon.image}
                                    alt={appointment.salon.salonName}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-tertiary-300 text-sm font-bold">
                                    {appointment.salon.salonName.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-4 flex-wrap">
                                <h4 className="font-one font-semibold text-white text-sm leading-tight line-clamp-1">
                                  {appointment.prestation}
                                </h4>
                                <div className="flex-shrink-0">
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                              <p className="text-white/60 font-one text-xs truncate">
                                {appointment.salon.salonName}
                                {appointment.tatoueur && (
                                  <> • {appointment.tatoueur.name}</>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                                <FaCalendarAlt className="w-3 h-3 text-tertiary-300" />
                                {formatDate(appointment.start)}
                                <span className="text-white/30">•</span>
                                <FaClock className="w-3 h-3 text-tertiary-300" />
                                {formatTime(appointment.start)}
                                {appointment.prestationDetails &&
                                  appointment.prestationDetails.price !==
                                    undefined &&
                                  (appointment.prestationDetails.price ?? 0) >
                                    0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold">
                                      {appointment.prestationDetails.price}€
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
                            {appointment.status === "CONFIRMED" && (
                              <>
                                <button
                                  onClick={() => handleEditClick(appointment)}
                                  className="cursor-pointer px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-one transition-all"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelClick(appointment.id)
                                  }
                                  disabled={
                                    cancelingAppointmentId === appointment.id
                                  }
                                  className="cursor-pointer px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-one transition-all disabled:opacity-50"
                                >
                                  {cancelingAppointmentId === appointment.id
                                    ? "..."
                                    : "Annuler"}
                                </button>
                              </>
                            )}

                            {appointment.status === "COMPLETED" && (
                              <button
                                onClick={() =>
                                  handleReviewClick(appointment.id)
                                }
                                className="cursor-pointer px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-one transition-all"
                              >
                                ⭐{" "}
                                {hasReview ? "Voir l'avis" : "Donner un avis"}
                              </button>
                            )}

                            {appointment.visio &&
                              appointment.status === "CONFIRMED" && (
                                <span className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs font-one">
                                  📹 Visio
                                </span>
                              )}

                            <Link
                              href={`/salon/${toSlug(appointment.salon.salonName)}/${toSlug(appointment.salon.city)}-${appointment.salon.postalCode}`}
                              className="cursor-pointer px-3 py-2 rounded-lg bg-tertiary-500/10 hover:bg-tertiary-500/20 border border-tertiary-500/30 text-tertiary-200 text-xs font-one transition-all"
                            >
                              Voir salon
                            </Link>

                            {appointment.conversation && (
                              <Link
                                href={`/mon-profil/messagerie/${appointment.conversation.id}`}
                                className="relative cursor-pointer px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-one transition-all inline-flex items-center gap-2"
                              >
                                Messagerie
                                {appointment.conversation.unreadCount > 0 && (
                                  <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-tertiary-500 text-[10px] font-semibold text-white px-1">
                                    {appointment.conversation.unreadCount > 9
                                      ? "9+"
                                      : appointment.conversation.unreadCount}
                                  </span>
                                )}
                              </Link>
                            )}

                            <button
                              onClick={() => toggleExpand(appointment.id)}
                              className="cursor-pointer px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-one transition-all flex items-center gap-2"
                            >
                              {isExpanded ? "Réduire" : "Détails"}
                              {isExpanded ? (
                                <FaChevronUp className="w-3 h-3" />
                              ) : (
                                <FaChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/10 bg-white/3 p-4 sm:p-5 space-y-4 mt-2">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-white/60">
                                <span>Informations</span>
                                {getStatusBadge(appointment.status)}
                              </div>
                              <div className="space-y-1 text-sm text-white">
                                <p className="text-white/80 text-xs">Adresse</p>
                                <p className="text-white text-xs">
                                  {appointment.salon.address &&
                                    `${appointment.salon.address}, `}
                                  {appointment.salon.city}{" "}
                                  {appointment.salon.postalCode}
                                </p>
                                <p className="text-white/80 text-xs pt-2">
                                  Durée
                                </p>
                                <p className="text-white text-xs">
                                  {appointment.duration
                                    ? `${appointment.duration} min`
                                    : "Non spécifié"}
                                </p>
                                {appointment.prestationDetails &&
                                  appointment.prestationDetails.price !==
                                    undefined &&
                                  appointment.prestationDetails.price > 0 && (
                                    <>
                                      <p className="text-white/80 text-xs pt-2">
                                        Prix
                                      </p>
                                      <p className="text-white text-xs">
                                        {appointment.prestationDetails.price !==
                                        undefined
                                          ? `${appointment.prestationDetails.price}€`
                                          : "Non spécifié"}
                                      </p>
                                    </>
                                  )}
                              </div>
                            </div>

                            {appointment.prestationDetails && (
                              <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3 md:col-span-2">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                  <span>Brief</span>
                                  <span className="text-white/60">Projet</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs text-white">
                                  {appointment.prestationDetails.zone && (
                                    <div>
                                      <p className="text-white/60">Zone</p>
                                      <p>
                                        {appointment.prestationDetails.zone}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.prestationDetails.size && (
                                    <div>
                                      <p className="text-white/60">Taille</p>
                                      <p>
                                        {appointment.prestationDetails.size}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.prestationDetails.colorStyle && (
                                    <div>
                                      <p className="text-white/60">Style</p>
                                      <p>
                                        {
                                          appointment.prestationDetails
                                            .colorStyle
                                        }
                                      </p>
                                    </div>
                                  )}
                                  {appointment.prestationDetails
                                    .piercingZone && (
                                    <div>
                                      <p className="text-white/60">
                                        Zone piercing
                                      </p>
                                      <p>
                                        {
                                          appointment.prestationDetails
                                            .piercingZone
                                        }
                                      </p>
                                    </div>
                                  )}
                                  {appointment.prestationDetails
                                    .piercingDetails && (
                                    <div className="sm:col-span-2 lg:col-span-1">
                                      <p className="text-white/60">
                                        Détail piercing
                                      </p>
                                      <p>
                                        {appointment.prestationDetails
                                          .piercingDetails.zoneOreille ||
                                          appointment.prestationDetails
                                            .piercingDetails.zoneVisage ||
                                          appointment.prestationDetails
                                            .piercingDetails.zoneBouche ||
                                          appointment.prestationDetails
                                            .piercingDetails.zoneCorps ||
                                          appointment.prestationDetails
                                            .piercingDetails.zoneMicrodermal ||
                                          "Non spécifié"}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {appointment.prestationDetails.description && (
                                  <div className="pt-2 border-t border-white/10 text-sm text-white/80 leading-relaxed">
                                    {appointment.prestationDetails.description}
                                  </div>
                                )}

                                {(appointment.prestationDetails.reference ||
                                  appointment.prestationDetails.sketch) && (
                                  <div className="pt-2 border-t border-white/10">
                                    <p className="text-white/60 text-xs mb-2">
                                      Références
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                      {appointment.prestationDetails
                                        .reference && (
                                        <div className="relative">
                                          <Image
                                            src={
                                              appointment.prestationDetails
                                                .reference
                                            }
                                            alt="Image de référence"
                                            width={120}
                                            height={120}
                                            className="w-30 h-30 object-cover rounded-lg border border-white/15"
                                          />
                                          <span className="absolute -bottom-1 -right-1 bg-tertiary-500 text-white text-[11px] px-2 py-0.5 rounded">
                                            Référence
                                          </span>
                                        </div>
                                      )}
                                      {appointment.prestationDetails.sketch && (
                                        <div className="relative">
                                          <Image
                                            src={
                                              appointment.prestationDetails
                                                .sketch
                                            }
                                            alt="Croquis"
                                            width={120}
                                            height={120}
                                            className="w-30 h-30 object-cover rounded-lg border border-white/15"
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

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                              <p className="text-white/60 text-xs mb-3">
                                Contacts salon
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {appointment.salon.phone && (
                                  <a
                                    href={`tel:${appointment.salon.phone}`}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-one transition-all"
                                  >
                                    <span>📞</span>
                                    <span>{appointment.salon.phone}</span>
                                  </a>
                                )}
                                {appointment.salon.website && (
                                  <a
                                    href={appointment.salon.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-tertiary-500/30 bg-tertiary-500/10 hover:bg-tertiary-500/15 text-tertiary-100 text-xs font-one transition-all"
                                  >
                                    <span>🌐</span>
                                    <span>Site web</span>
                                  </a>
                                )}
                                {appointment.salon.instagram && (
                                  <a
                                    href={appointment.salon.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-one transition-all"
                                  >
                                    <span>📷</span>
                                    <span>Instagram</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                              <p className="text-white/60 text-xs mb-3">
                                Contacts tatoueur
                              </p>
                              {appointment.tatoueur ? (
                                <div className="flex flex-wrap gap-2">
                                  {appointment.tatoueur.phone && (
                                    <a
                                      href={`tel:${appointment.tatoueur.phone}`}
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-one transition-all"
                                    >
                                      <span>📞</span>
                                      <span>{appointment.tatoueur.phone}</span>
                                    </a>
                                  )}
                                  {appointment.tatoueur.instagram && (
                                    <a
                                      href={appointment.tatoueur.instagram}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-tertiary-500/30 bg-tertiary-500/10 hover:bg-tertiary-500/15 text-tertiary-100 text-xs font-one transition-all"
                                    >
                                      <span>📷</span>
                                      <span>Instagram</span>
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <p className="text-white/50 text-xs">
                                  Non assigné
                                </p>
                              )}
                            </div>
                          </div>

                          {appointment.status === "COMPLETED" && (
                            <div className="rounded-lg border border-amber-400/30 bg-amber-500/5 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-lg">
                                  ⭐
                                </span>
                                <div>
                                  <p className="text-white font-one text-sm font-semibold">
                                    {hasReview
                                      ? "Votre avis"
                                      : "Donner votre avis"}
                                  </p>
                                  <p className="text-white/60 text-xs">
                                    Partagez votre expérience avec le salon
                                  </p>
                                </div>
                              </div>

                              {hasReview ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="text-amber-300 text-sm">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i}>
                                          {i < (appointment.review?.rating || 0)
                                            ? "★"
                                            : "☆"}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-white/70 text-xs">
                                      {appointment.review?.rating}/5
                                    </span>
                                    {appointment.review?.isVerified && (
                                      <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-[11px]">
                                        ✓ Vérifié
                                      </span>
                                    )}
                                  </div>

                                  {appointment.review?.title && (
                                    <p className="text-white font-semibold text-sm">
                                      {appointment.review.title}
                                    </p>
                                  )}

                                  {appointment.review?.comment && (
                                    <p className="text-white/80 text-sm leading-relaxed">
                                      {appointment.review.comment}
                                    </p>
                                  )}

                                  <p className="text-white/50 text-xs border-t border-white/10 pt-2">
                                    Publié le{" "}
                                    {appointment.review?.createdAt
                                      ? new Date(
                                          appointment.review.createdAt,
                                        ).toLocaleDateString("fr-FR")
                                      : ""}
                                  </p>

                                  {appointment.review?.salonResponse && (
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                      <p className="text-white/70 text-xs mb-1 font-semibold">
                                        Réponse du salon
                                      </p>
                                      <p className="text-white/80 text-sm">
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
                                      const active =
                                        (hoverRating ?? reviewForm.rating) >=
                                        value;
                                      return (
                                        <button
                                          key={value}
                                          type="button"
                                          onMouseEnter={() =>
                                            setHoverRating(value)
                                          }
                                          onMouseLeave={() =>
                                            setHoverRating(null)
                                          }
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
                                    <span className="text-white/70 text-xs ml-2">
                                      {reviewForm.rating}/5
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-white/80 text-xs">
                                      Titre (optionnel)
                                    </label>
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
                                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 placeholder:text-white/40"
                                    />
                                    <p className="text-white/40 text-[11px]">
                                      {reviewForm.title.length}/100
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-white/80 text-xs">
                                      Votre avis
                                    </label>
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
                                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 placeholder:text-white/40 resize-none"
                                    />
                                    <p className="text-white/40 text-[11px]">
                                      {reviewForm.comment.length}/500
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleSubmitReview(appointment)
                                    }
                                    disabled={reviewSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white text-xs font-one transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                  >
                                    {reviewSubmitting ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                        Publication...
                                      </>
                                    ) : (
                                      "Publier l'avis"
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination modernisée */}
          {rdvData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-white/60 font-one text-xs hidden sm:block">
                Page {rdvData.pagination.currentPage} sur{" "}
                {rdvData.pagination.totalPages}
              </div>

              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, rdvData.pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (rdvData.pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        currentPage >=
                        rdvData.pagination.totalPages - 2
                      ) {
                        pageNum = rdvData.pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`cursor-pointer w-9 h-9 rounded-lg text-xs font-one font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-tertiary-500 text-white shadow-lg shadow-tertiary-500/25"
                              : "bg-white/5 hover:bg-white/10 text-white/70"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === rdvData.pagination.totalPages}
                  className="cursor-pointer w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="text-white/60 font-one text-xs hidden sm:block">
                {rdvData.pagination.totalAppointments} résultats
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
