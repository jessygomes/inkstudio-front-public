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
import Image from "next/image";

type Appointment = {
  id: string;
  title?: string;
  prestation: string;
  start: string;
  end: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
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
};

type RdvResponse = {
  appointments: Appointment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
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
      CANCELLED: {
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

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-one font-semibold text-lg">
          Mes rendez-vous
        </h3>
        <div className="flex items-center gap-4">
          {rdvData && (
            <span className="text-white/60 font-one text-sm">
              {rdvData.pagination.totalItems} rendez-vous
            </span>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-white/60" />
          <span className="text-white/70 font-one text-sm">
            Filtrer par statut :
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange("")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs transition-all duration-300 ${
              statusFilter === ""
                ? "bg-tertiary-500 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleStatusChange("CONFIRMED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs transition-all duration-300 ${
              statusFilter === "CONFIRMED"
                ? "bg-emerald-500 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Confirmés
          </button>
          <button
            onClick={() => handleStatusChange("PENDING")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs transition-all duration-300 ${
              statusFilter === "PENDING"
                ? "bg-orange-500 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => handleStatusChange("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs transition-all duration-300 ${
              statusFilter === "COMPLETED"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Terminés
          </button>
          <button
            onClick={() => handleStatusChange("CANCELLED")}
            className={`px-3 py-1.5 rounded-lg font-one text-xs transition-all duration-300 ${
              statusFilter === "CANCELLED"
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Annulés
          </button>
        </div>
      </div>

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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Prendre un rendez-vous
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des rendez-vous */}
          <div className="space-y-4">
            {rdvData.appointments.map((appointment) => {
              const isExpanded = expandedAppointments.has(appointment.id);

              return (
                <div
                  key={appointment.id}
                  className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300"
                >
                  {/* Vue compacte - toujours visible */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar du salon */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 flex-shrink-0">
                          {appointment.salon.image ? (
                            <Image
                              src={appointment.salon.image}
                              alt={appointment.salon.salonName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-tertiary-400 text-lg font-bold">
                              {appointment.salon.salonName.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-one font-semibold text-white text-lg mb-1 truncate">
                            {` ${appointment.title || ""} - ${
                              appointment.salon.salonName
                            }`}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 font-one mb-2">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt className="w-3 h-3 text-tertiary-400" />
                              {formatDate(appointment.start)}
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock className="w-3 h-3 text-tertiary-400" />
                              {formatTime(appointment.start)} -{" "}
                              {formatTime(appointment.end)}
                            </div>
                            <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-300 rounded text-xs">
                              {appointment.prestation}
                            </div>
                            {appointment.prestationDetails?.price &&
                              appointment.prestationDetails.price > 1 && (
                                <div className="font-semibold text-white">
                                  {appointment.prestationDetails.price}€
                                </div>
                              )}
                          </div>
                          <p className="text-white/60 font-one text-sm">
                            Salon : {appointment.salon.salonName} • Artiste :{" "}
                            {appointment.tatoueur.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    {/* Actions principales - toujours visibles */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "CONFIRMED" && (
                          <>
                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-xs transition-all duration-300">
                              Modifier
                            </button>
                            <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg font-one text-xs transition-all duration-300">
                              Annuler
                            </button>
                          </>
                        )}

                        {appointment.status === "COMPLETED" && (
                          <button className="px-3 py-1.5 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-300 hover:text-tertiary-200 border border-tertiary-500/30 hover:border-tertiary-400/50 rounded-lg font-one text-xs transition-all duration-300">
                            Laisser un avis
                          </button>
                        )}

                        {appointment.visio &&
                          appointment.status === "CONFIRMED" && (
                            <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-400/50 rounded-lg font-one text-xs transition-all duration-300">
                              Rejoindre la visio
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
                          className="px-3 py-1.5 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-300 hover:text-tertiary-200 border border-tertiary-500/30 hover:border-tertiary-400/50 rounded-lg font-one text-xs transition-all duration-300"
                        >
                          Voir le salon
                        </Link>
                      </div>

                      {/* Bouton déplier/replier */}
                      <button
                        onClick={() => toggleExpand(appointment.id)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-xs transition-all duration-300 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Moins <FaChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Détails <FaChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Vue détaillée - dépliable */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-white/[0.02] p-4 space-y-4">
                      {/* Informations détaillées du rendez-vous */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-one font-semibold text-sm mb-3">
                          Informations complètes
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-white/60 font-one">
                              Adresse:
                            </span>
                            <p className="text-white font-one">
                              {appointment.salon.address &&
                                `${appointment.salon.address}, `}
                              {appointment.salon.city}{" "}
                              {appointment.salon.postalCode}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/60 font-one">
                              Durée:
                            </span>
                            <p className="text-white font-one">
                              {appointment.duration
                                ? `${appointment.duration} min`
                                : "Non spécifié"}
                            </p>
                          </div>
                          {appointment.prestationDetails?.price &&
                            appointment.prestationDetails.price > 1 && (
                              <div>
                                <span className="text-white/60 font-one">
                                  Prix :
                                </span>
                                <p className="text-white font-one">
                                  {appointment.prestationDetails.price}€
                                </p>
                              </div>
                            )}
                        </div>

                        {appointment.visio && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                📹 Rendez-vous en visioconférence
                              </span>
                              {appointment.visioRoom && (
                                <span className="text-blue-300 text-xs">
                                  Salon: {appointment.visioRoom}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Détails du projet si disponibles */}
                      {appointment.prestationDetails && (
                        <div className="bg-white/5 rounded-lg p-4 space-y-3">
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
                      <div className="bg-white/5 rounded-lg p-4">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {rdvData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div className="text-white/60 font-one text-sm">
                Page {rdvData.pagination.currentPage} sur{" "}
                {rdvData.pagination.totalPages}
                {` • ${rdvData.pagination.totalItems} résultats au total`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white/80 hover:text-white disabled:text-white/40 border border-white/20 hover:border-white/30 disabled:border-white/10 rounded-lg font-one text-xs transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Précédent
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
                          className={`w-8 h-8 rounded-lg font-one text-xs transition-all duration-300 ${
                            currentPage === pageNum
                              ? "bg-tertiary-500 text-white"
                              : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
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
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white/80 hover:text-white disabled:text-white/40 border border-white/20 hover:border-white/30 disabled:border-white/10 rounded-lg font-one text-xs transition-all duration-300 disabled:cursor-not-allowed"
                >
                  Suivant
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
