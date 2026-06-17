/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { getAllRdvClient } from "@/lib/actions/appointment.action";
import { toast } from "sonner";
import Image from "next/image";
import { cancelAppointmentByClient } from "@/lib/actions/appointment.action";
import { createReview } from "@/lib/actions/review.action";
import {
  getMoodboardByIdAction,
  getMyMoodboardsAction,
  connectMoodboardToAppointmentAction,
  disconnectMoodboardFromAppointmentAction,
  type Moodboard,
} from "@/lib/actions/moodboard.action";
import { createPortal } from "react-dom";
import { useEditAppointmentModal } from "@/components/Context/EditAppointmentContext";
import CancelAppointmentModal from "./CancelAppointmentModal";
import RendezVousCard from "./RendezVousCard";

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
    salonHours?: string | null;
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
  moodboard?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
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
  const [moodboardModal, setMoodboardModal] = useState<{ id: string; name: string; appointmentId: string; appointmentStatus: Appointment["status"] } | null>(null);
  const [moodboardDetail, setMoodboardDetail] = useState<Moodboard | null>(null);
  const [moodboardLoading, setMoodboardLoading] = useState(false);
  const [connectModal, setConnectModal] = useState<{ appointmentId: string } | null>(null);
  const [connectMoodboards, setConnectMoodboards] = useState<Moodboard[]>([]);
  const [connectMoodboardsLoading, setConnectMoodboardsLoading] = useState(false);
  const [connectingMoodboardId, setConnectingMoodboardId] = useState<string | null>(null);
  const [disconnectingAppointmentId, setDisconnectingAppointmentId] = useState<string | null>(null);
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
  const listTopRef = useRef<HTMLDivElement | null>(null);

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
      listTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-[11px] font-one border ${config.bg} ${config.text} ${config.border}`}
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

  const formatPhoneDisplay = (phone?: string | null) => {
    if (!phone) return "";

    const digits = phone.replace(/\D/g, "");

    let localDigits = digits;

    // +33XXXXXXXXX ou 33XXXXXXXXX
    if (localDigits.startsWith("33") && localDigits.length >= 11) {
      localDigits = localDigits.slice(2);
    }

    // 0033XXXXXXXXX
    if (localDigits.startsWith("0033") && localDigits.length >= 13) {
      localDigits = localDigits.slice(4);
    }

    // Numéro FR sans le 0 initial (9 chiffres)
    if (localDigits.length === 9) {
      localDigits = `0${localDigits}`;
    }

    if (localDigits.length === 10) {
      return localDigits.match(/.{1,2}/g)?.join(".") || phone;
    }

    return phone;
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

  //! Ouverture modal moodboard lié au RDV
  const handleOpenMoodboard = async (id: string, name: string, appointmentId: string, appointmentStatus: Appointment["status"]) => {
    setMoodboardModal({ id, name, appointmentId, appointmentStatus });
    setMoodboardDetail(null);
    setMoodboardLoading(true);
    try {
      const result = await getMoodboardByIdAction(id);
      if (result.ok && result.data) {
        setMoodboardDetail(result.data);
      } else {
        toast.error("Impossible de charger le moodboard");
      }
    } catch {
      toast.error("Erreur lors du chargement du moodboard");
    } finally {
      setMoodboardLoading(false);
    }
  };

  //! Ouverture modal de connexion moodboard
  const handleOpenConnectModal = async (appointmentId: string) => {
    setConnectModal({ appointmentId });
    setConnectMoodboards([]);
    setConnectMoodboardsLoading(true);
    try {
      const result = await getMyMoodboardsAction();
      if (result.ok && result.data) {
        setConnectMoodboards(result.data);
      } else {
        toast.error("Impossible de charger vos moodboards");
      }
    } catch {
      toast.error("Erreur lors du chargement des moodboards");
    } finally {
      setConnectMoodboardsLoading(false);
    }
  };

  //! Connexion d'un moodboard à un RDV
  const handleConnectMoodboard = async (moodboardId: string, appointmentId: string) => {
    setConnectingMoodboardId(moodboardId);
    try {
      const result = await connectMoodboardToAppointmentAction(moodboardId, appointmentId);
      if (result.ok) {
        toast.success("Moodboard lié au rendez-vous");
        setConnectModal(null);
        fetchRdvClient(statusFilter, currentPage, limit);
      } else {
        toast.error(result.message || "Erreur lors de la liaison");
      }
    } catch {
      toast.error("Erreur lors de la liaison du moodboard");
    } finally {
      setConnectingMoodboardId(null);
    }
  };

  //! Déconnexion d'un moodboard d'un RDV
  const handleDisconnectMoodboard = async (moodboardId: string, appointmentId: string) => {
    setDisconnectingAppointmentId(appointmentId);
    try {
      const result = await disconnectMoodboardFromAppointmentAction(moodboardId, appointmentId);
      if (result.ok) {
        toast.success("Moodboard délié du rendez-vous");
        fetchRdvClient(statusFilter, currentPage, limit);
      } else {
        toast.error(result.message || "Erreur lors de la suppression du lien");
      }
    } catch {
      toast.error("Erreur lors de la suppression du lien");
    } finally {
      setDisconnectingAppointmentId(null);
    }
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
    <div
      ref={listTopRef}
      className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-4 shadow-xl sm:p-5"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-white font-one sm:text-xl">
            Mes rendez-vous
          </h3>
          {rdvData && (
            <p className="truncate text-white/60 font-one text-xs">
              {rdvData.pagination.totalAppointments} rendez-vous au total
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70 font-one">
            <FaCalendarAlt className="w-3.5 h-3.5 text-tertiary-300" />
            {rdvData
              ? `Page ${rdvData.pagination.currentPage}/${rdvData.pagination.totalPages}`
              : ""}
          </div>
        </div>
      </div>

      {/* Filtres modernisés */}
      <div className="mb-5">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:py-0">
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
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 font-one ${
                  isActive
                    ? "border-transparent bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/30"
                    : "border-white/12 bg-white/6 text-white/70 hover:border-white/25 hover:text-white"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one text-sm shadow-lg hover:-translate-y-0.5"
          >
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des rendez-vous modernisée */}
          <div className="space-y-2.5 grid sm:grid-cols-2 gap-3">
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
                  <RendezVousCard
                    key={appointment.id}
                    appointment={appointment}
                    isExpanded={isExpanded}
                    hasReview={hasReview}
                    cancelingAppointmentId={cancelingAppointmentId}
                    reviewForm={reviewForm}
                    hoverRating={hoverRating}
                    reviewSubmitting={reviewSubmitting}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPhoneDisplay={formatPhoneDisplay}
                    toggleExpand={toggleExpand}
                    handleOpenMoodboard={handleOpenMoodboard}
                    handleOpenConnectModal={handleOpenConnectModal}
                    handleEditClick={handleEditClick}
                    handleCancelClick={handleCancelClick}
                    handleReviewClick={handleReviewClick}
                    handleSubmitReview={handleSubmitReview}
                    setHoverRating={setHoverRating}
                    setReviewForm={setReviewForm}
                  />
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
                  className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-2xl transition-all disabled:cursor-not-allowed"
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
                          className={`cursor-pointer w-7 h-7 rounded-2xl text-xs font-one font-medium transition-all ${
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
                  className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white/80 disabled:text-white/30 border border-white/10 rounded-2xl transition-all disabled:cursor-not-allowed"
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

      {/* Modal moodboard lié au RDV */}
      {moodboardModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setMoodboardModal(null)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-noir-700 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 shrink-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-white/45 font-one uppercase tracking-wide mb-0.5">
                    Moodboard lié au rendez-vous
                  </p>
                  <h3 className="text-base font-semibold text-white font-one truncate">
                    🎨 {moodboardModal.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {moodboardModal.appointmentStatus !== "CANCELED" &&
                    moodboardModal.appointmentStatus !== "COMPLETED" && (
                      <button
                        onClick={() =>
                          handleDisconnectMoodboard(
                            moodboardModal.id,
                            moodboardModal.appointmentId,
                          ).then(() => setMoodboardModal(null))
                        }
                        disabled={disconnectingAppointmentId === moodboardModal.appointmentId}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-50 font-one"
                      >
                        {disconnectingAppointmentId === moodboardModal.appointmentId
                          ? "..."
                          : "Délier"}
                      </button>
                    )}
                  <button
                    onClick={() => setMoodboardModal(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-all text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-5">
                {moodboardLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-400 border-t-transparent" />
                    <p className="text-white/50 text-sm font-one">Chargement du moodboard...</p>
                  </div>
                ) : moodboardDetail ? (
                  <>
                    {moodboardDetail.description && (
                      <p className="text-white/60 text-sm font-one mb-4 leading-relaxed">
                        {moodboardDetail.description}
                      </p>
                    )}

                    {moodboardDetail.images.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-white/40 text-sm font-one">
                          Ce moodboard ne contient pas encore d&apos;images
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {moodboardDetail.images.map((img) => (
                          <div
                            key={img.id}
                            className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-square"
                          >
                            <Image
                              src={img.url}
                              alt={img.caption || "Image moodboard"}
                              fill
                              sizes="(max-width: 640px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {img.caption && (
                              <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[11px] font-one truncate">
                                  {img.caption}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal connexion moodboard */}
      {connectModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConnectModal(null)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col rounded-3xl border border-white/15 bg-noir-700 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 shrink-0">
                <div>
                  <h3 className="text-base font-semibold text-white font-one">
                    Lier un moodboard
                  </h3>
                  <p className="text-[11px] text-white/45 font-one mt-0.5">
                    Choisissez un moodboard à associer à ce rendez-vous
                  </p>
                </div>
                <button
                  onClick={() => setConnectModal(null)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-all text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-4">
                {connectMoodboardsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-400 border-t-transparent" />
                    <p className="text-white/50 text-sm font-one">
                      Chargement de vos moodboards...
                    </p>
                  </div>
                ) : connectMoodboards.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">🎨</p>
                    <p className="text-white/50 text-sm font-one">
                      Vous n&apos;avez pas encore de moodboard
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectMoodboards.map((mb) => (
                      <button
                        key={mb.id}
                        onClick={() =>
                          handleConnectMoodboard(mb.id, connectModal.appointmentId)
                        }
                        disabled={connectingMoodboardId !== null}
                        className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/4 hover:bg-white/8 hover:border-white/20 transition-all text-left disabled:opacity-60"
                      >
                        {mb.images[0] ? (
                          <Image
                            src={mb.images[0].url}
                            alt={mb.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0 text-xl">
                            🎨
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-semibold font-one truncate">
                            {mb.name}
                          </p>
                          {mb.description && (
                            <p className="text-white/50 text-xs font-one truncate">
                              {mb.description}
                            </p>
                          )}
                          <p className="text-white/40 text-[11px] font-one">
                            {mb.images.length} image
                            {mb.images.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {connectingMoodboardId === mb.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-400 border-t-transparent shrink-0" />
                        ) : (
                          <span className="text-white/40 shrink-0 text-xs font-one">
                            Choisir →
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
