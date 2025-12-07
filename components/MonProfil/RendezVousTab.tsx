/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

type Appointment = {
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
  tatoueur: {
    id: string;
    name: string;
    img?: string;
    phone?: string;
    instagram?: string;
  };
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
    new Set()
  );
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<
    string | null
  >(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
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

  console.log("RendezVousTab - rdvData:", rdvData);

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

  const toggleExpand = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const configs = {
      CONFIRMED: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
        border: "border-emerald-500/40",
        icon: <FaCheck className="w-3 h-3" />,
        label: "Confirmé",
      },
      PENDING: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        border: "border-orange-500/40",
        icon: <FaClock className="w-3 h-3" />,
        label: "En attente",
      },
      COMPLETED: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        border: "border-blue-500/40",
        icon: <FaCheck className="w-3 h-3" />,
        label: "Terminé",
      },
      CANCELED: {
        bg: "bg-red-500/20",
        text: "text-red-300",
        border: "border-red-500/40",
        icon: <FaTimes className="w-3 h-3" />,
        label: "Annulé",
      },
    };

    const config = configs[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-one border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

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

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
    setCancelReason("");
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    try {
      setCancelingAppointmentId(appointmentToCancel);
      const result = await cancelAppointmentByClient(
        appointmentToCancel,
        cancelReason || undefined
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
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-white font-one font-semibold text-lg sm:text-xl mb-1">
            Mes rendez-vous
          </h3>
          {rdvData && (
            <p className="text-white/60 font-one text-xs">
              {rdvData.pagination.totalAppointments} rendez-vous au total
            </p>
          )}
        </div>
        <div className="w-10 h-10 bg-tertiary-500/20 rounded-xl flex items-center justify-center">
          <FaCalendarAlt className="w-5 h-5 text-tertiary-400" />
        </div>
      </div>

      {/* Filtres modernisés */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="w-3.5 h-3.5 text-tertiary-400" />
          <span className="text-white/80 font-one text-xs font-semibold uppercase tracking-wider">
            Filtrer
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange("")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs font-medium transition-all duration-300 ${
              statusFilter === ""
                ? "bg-tertiary-500 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleStatusChange("CONFIRMED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs font-medium transition-all duration-300 ${
              statusFilter === "CONFIRMED"
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            Confirmés
          </button>
          <button
            onClick={() => handleStatusChange("PENDING")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs font-medium transition-all duration-300 ${
              statusFilter === "PENDING"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => handleStatusChange("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs font-medium transition-all duration-300 ${
              statusFilter === "COMPLETED"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            Terminés
          </button>
          <button
            onClick={() => handleStatusChange("CANCELED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs font-medium transition-all duration-300 ${
              statusFilter === "CANCELED"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            }`}
          >
            Annulés
          </button>
        </div>
      </div>

      {/* Modal d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-noir-700/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-white font-one font-semibold text-xl mb-4">
              Annuler le rendez-vous
            </h3>

            <p className="text-white/80 font-one text-sm mb-4">
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est
              irréversible.
            </p>

            <div className="mb-6">
              <label className="text-white/90 font-one text-sm mb-2 block">
                Raison de l'annulation (optionnel)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Empêchement personnel, changement de planning..."
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                  setCancelReason("");
                }}
                disabled={cancelingAppointmentId !== null}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retour
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelingAppointmentId !== null}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelingAppointmentId ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-transparent"></div>
                    Annulation...
                  </span>
                ) : (
                  "Confirmer l'annulation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des rendez-vous modernisée */}
          <div className="space-y-3">
            {rdvData.appointments.map((appointment) => {
              const isExpanded = expandedAppointments.has(appointment.id);
              const hasReview = !!appointment.review;

              return (
                <div
                  key={appointment.id}
                  className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  {/* Accent bar */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      appointment.status === "CONFIRMED"
                        ? "bg-emerald-500"
                        : appointment.status === "PENDING"
                        ? "bg-orange-500"
                        : appointment.status === "COMPLETED"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  />

                  {/* Vue compacte */}
                  <div className="p-4 pl-5">
                    <div className="flex items-start gap-3">
                      {/* Avatar salon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 ring-2 ring-white/5">
                          {appointment.salon.image ? (
                            <Image
                              src={appointment.salon.image}
                              alt={appointment.salon.salonName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-tertiary-400 text-sm font-bold">
                              {appointment.salon.salonName.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* En-tête avec titre et status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-one font-semibold text-white text-sm mb-1 line-clamp-1">
                              {appointment.prestation}
                            </h4>
                            <p className="text-white/60 font-one text-xs truncate">
                              {appointment.salon.salonName} •{" "}
                              {appointment.tatoueur.name}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>

                        {/* Date et heure */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-tertiary-300 font-one">
                            <FaCalendarAlt className="w-3 h-3" />
                            {formatDate(appointment.start)}
                          </div>
                          <div className="flex items-center gap-1.5 text-tertiary-300 font-one">
                            <FaClock className="w-3 h-3" />
                            {formatTime(appointment.start)}
                          </div>
                          {appointment.prestationDetails?.price &&
                            appointment.prestationDetails.price > 1 && (
                              <div className="ml-auto px-2 py-0.5 bg-white/10 text-white rounded text-xs font-semibold">
                                {appointment.prestationDetails.price}€
                              </div>
                            )}
                        </div>

                        {/* Actions compactes */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {appointment.status === "CONFIRMED" && (
                            <>
                              <button className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 rounded-lg text-xs font-one transition-all">
                                Modifier
                              </button>
                              <button
                                onClick={() =>
                                  handleCancelClick(appointment.id)
                                }
                                disabled={
                                  cancelingAppointmentId === appointment.id
                                }
                                className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-xs font-one transition-all disabled:opacity-50"
                              >
                                {cancelingAppointmentId === appointment.id
                                  ? "..."
                                  : "Annuler"}
                              </button>
                            </>
                          )}

                          {appointment.status === "COMPLETED" && (
                            <button
                              onClick={() => handleReviewClick(appointment.id)}
                              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-one transition-all"
                            >
                              ⭐ {hasReview ? "Voir l'avis" : "Donner un avis"}
                            </button>
                          )}

                          {appointment.visio &&
                            appointment.status === "CONFIRMED" && (
                              <button className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-one transition-all">
                                📹 Visio
                              </button>
                            )}

                          <Link
                            href={`/salon/${appointment.salon.salonName
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}/${appointment.salon.city.toLowerCase()}-${
                              appointment.salon.postalCode
                            }`}
                            className="px-2.5 py-1 bg-tertiary-500/15 hover:bg-tertiary-500/25 text-tertiary-300 border border-tertiary-500/30 rounded-lg text-xs font-one transition-all"
                          >
                            Voir salon
                          </Link>

                          <button
                            onClick={() => toggleExpand(appointment.id)}
                            className="ml-auto px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg text-xs font-one transition-all flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                Réduire <FaChevronUp className="w-2.5 h-2.5" />
                              </>
                            ) : (
                              <>
                                Détails{" "}
                                <FaChevronDown className="w-2.5 h-2.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vue détaillée */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/10 p-4 space-y-3">
                      {/* Informations détaillées du rendez-vous */}
                      <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <h5 className="text-white font-one font-semibold text-xs sm:text-sm mb-2 sm:mb-3">
                          Informations complètes
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-white/60 font-one text-xs">
                              Adresse:
                            </span>
                            <p className="text-white font-one text-xs">
                              {appointment.salon.address &&
                                `${appointment.salon.address}, `}
                              {appointment.salon.city}{" "}
                              {appointment.salon.postalCode}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/60 font-one text-xs">
                              Durée:
                            </span>
                            <p className="text-white font-one text-xs">
                              {appointment.duration
                                ? `${appointment.duration} min`
                                : "Non spécifié"}
                            </p>
                          </div>
                          {appointment.prestationDetails?.price &&
                            appointment.prestationDetails.price > 1 && (
                              <div>
                                <span className="text-white/60 font-one text-xs">
                                  Prix :
                                </span>
                                <p className="text-white font-one text-xs">
                                  {appointment.prestationDetails.price}€
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Détails du projet si disponibles */}
                      {appointment.prestationDetails && (
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 space-y-3">
                          <h5 className="text-white font-one font-semibold text-sm">
                            Détails du projet
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {appointment.prestationDetails.zone && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Zone:
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.zone}
                                </p>
                              </div>
                            )}

                            {appointment.prestationDetails.size && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Taille:
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.size}
                                </p>
                              </div>
                            )}

                            {appointment.prestationDetails.colorStyle && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Style:
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.colorStyle}
                                </p>
                              </div>
                            )}

                            {appointment.prestationDetails.piercingZone && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Zone piercing:
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.piercingZone}
                                </p>
                              </div>
                            )}

                            {appointment.prestationDetails.piercingDetails && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Détail piercing:
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.piercingDetails
                                    .zoneOreille ||
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
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <span className="text-white/60 font-one text-sm">
                                Description:
                              </span>
                              <p className="text-white/90 font-one text-sm mt-1 leading-relaxed">
                                {appointment.prestationDetails.description}
                              </p>
                            </div>
                          )}

                          {/* Images de référence */}
                          {(appointment.prestationDetails.reference ||
                            appointment.prestationDetails.sketch) && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <span className="text-white/60 font-one text-sm block mb-2">
                                Images de référence:
                              </span>
                              <div className="flex gap-3">
                                {appointment.prestationDetails.reference && (
                                  <div className="relative">
                                    <Image
                                      src={
                                        appointment.prestationDetails.reference
                                      }
                                      alt="Image de référence"
                                      width={120}
                                      height={120}
                                      className="w-30 h-30 object-cover rounded-lg border border-white/20"
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-tertiary-500 text-white text-xs px-2 py-0.5 rounded">
                                      Référence
                                    </span>
                                  </div>
                                )}
                                {appointment.prestationDetails.sketch && (
                                  <div className="relative">
                                    <Image
                                      src={appointment.prestationDetails.sketch}
                                      alt="Croquis"
                                      width={120}
                                      height={120}
                                      className="w-30 h-30 object-cover rounded-lg border border-white/20"
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                                      Croquis
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informations de contact */}
                      <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <h5 className="text-white font-one font-semibold text-sm mb-3">
                          Contacts
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/60 font-one block mb-2">
                              Salon {appointment.salon.salonName}:
                            </span>
                            <div className="space-y-1">
                              {appointment.salon.phone && (
                                <p className="text-white font-one flex items-center gap-2">
                                  📞 {appointment.salon.phone}
                                </p>
                              )}
                              {appointment.salon.website && (
                                <a
                                  href={appointment.salon.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-tertiary-400 hover:text-tertiary-300 font-one transition-colors flex items-center gap-2"
                                >
                                  🌐 Site web
                                </a>
                              )}
                              {appointment.salon.instagram && (
                                <a
                                  href={appointment.salon.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-tertiary-400 hover:text-tertiary-300 font-one transition-colors flex items-center gap-2"
                                >
                                  📷 Instagram
                                </a>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-white/60 font-one block mb-2">
                              Tatoueur {appointment.tatoueur.name}:
                            </span>
                            <div className="space-y-1">
                              {appointment.tatoueur.phone && (
                                <p className="text-white font-one flex items-center gap-2">
                                  📞 {appointment.tatoueur.phone}
                                </p>
                              )}
                              {appointment.tatoueur.instagram && (
                                <a
                                  href={appointment.tatoueur.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-tertiary-400 hover:text-tertiary-300 font-one transition-colors flex items-center gap-2"
                                >
                                  📷 Instagram
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section Avis modernisée */}
                      {appointment.status === "COMPLETED" && (
                        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-4 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-lg">⭐</span>
                            </div>
                            <h5 className="text-white font-one font-semibold text-sm">
                              {hasReview ? "Votre avis" : "Donner votre avis"}
                            </h5>
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
                                <span className="text-white/70 font-one text-xs">
                                  {appointment.review?.rating}/5
                                </span>
                                {appointment.review?.isVerified && (
                                  <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded text-xs">
                                    ✓ Vérifié
                                  </span>
                                )}
                              </div>

                              {appointment.review?.title && (
                                <div>
                                  <p className="text-white font-semibold text-sm">
                                    {appointment.review.title}
                                  </p>
                                </div>
                              )}

                              {appointment.review?.comment && (
                                <div>
                                  <p className="text-white/80 text-sm leading-relaxed">
                                    {appointment.review.comment}
                                  </p>
                                </div>
                              )}

                              <div className="text-white/50 text-xs pt-2 border-t border-white/10">
                                Publié le{" "}
                                {appointment.review?.createdAt
                                  ? new Date(
                                      appointment.review.createdAt
                                    ).toLocaleDateString("fr-FR")
                                  : ""}
                              </div>

                              {appointment.review?.salonResponse && (
                                <div className="bg-white/5 rounded-lg p-3 mt-3 border border-white/10">
                                  <p className="text-white/70 font-one text-xs mb-2 font-semibold">
                                    Réponse du salon :
                                  </p>
                                  <p className="text-white/80 text-sm">
                                    {appointment.review.salonResponse}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Afficher le formulaire si pas d'avis
                            <>
                              <p className="text-white/70 font-one text-xs mb-4">
                                Votre retour d'expérience aide les autres
                                clients et nos artistes !
                              </p>

                              <div className="space-y-3">
                                {/* Note - Rating Stars */}
                                <div className="space-y-2">
                                  <label className="text-white/90 font-one text-xs block">
                                    Note
                                  </label>
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
                                                ? "text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)] scale-105"
                                                : "text-white/30 hover:text-white/60"
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                    <span className="text-white/70 font-one text-xs ml-2">
                                      {reviewForm.rating}/5
                                    </span>
                                  </div>
                                </div>

                                {/* Titre */}
                                <div className="space-y-1">
                                  <label className="text-white/90 font-one text-xs block">
                                    Titre (optionnel)
                                  </label>
                                  <input
                                    type="text"
                                    value={reviewForm.title}
                                    onChange={(e) => {
                                      setReviewForm((f) => ({
                                        ...f,
                                        title: e.target.value,
                                      }));
                                    }}
                                    placeholder="Ex: Excellent travail"
                                    maxLength={100}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/20 transition-all duration-300 placeholder:text-white/40"
                                  />
                                  <div className="text-white/40 text-xs">
                                    {reviewForm.title.length}/100
                                  </div>
                                </div>

                                {/* Commentaire */}
                                <div className="space-y-1">
                                  <label className="text-white/90 font-one text-xs block">
                                    Votre avis
                                  </label>
                                  <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => {
                                      setReviewForm((f) => ({
                                        ...f,
                                        comment: e.target.value,
                                      }));
                                    }}
                                    placeholder="Partagez votre expérience..."
                                    maxLength={500}
                                    rows={3}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/20 transition-all duration-300 placeholder:text-white/40 resize-none"
                                  />
                                  <div className="text-white/40 text-xs">
                                    {reviewForm.comment.length}/500
                                  </div>
                                </div>

                                {/* Bouton d'envoi */}
                                <button
                                  onClick={() =>
                                    handleSubmitReview(appointment)
                                  }
                                  disabled={reviewSubmitting}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded text-xs font-one transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {reviewSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                      Publication...
                                    </>
                                  ) : (
                                    "Publier l'avis"
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                  className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-lg transition-all disabled:cursor-not-allowed"
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
                          className={`w-9 h-9 rounded-lg text-xs font-one font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-tertiary-500 text-white shadow-lg"
                              : "bg-white/5 hover:bg-white/10 text-white/70"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === rdvData.pagination.totalPages}
                  className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-lg transition-all disabled:cursor-not-allowed"
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
