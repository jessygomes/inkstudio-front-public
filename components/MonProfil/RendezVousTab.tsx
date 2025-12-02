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
} from "react-icons/fa";
import { getAllRdvClient } from "@/lib/actions/user.action";

type Appointment = {
  id: string;
  title?: string;
  salonName?: string;
  tatoueurName?: string;
  prestation: string;
  start: string;
  end: string;
  status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  price?: number;
  description?: string;
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
            {rdvData.appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-one font-semibold text-white mb-1">
                          {appointment.title ||
                            appointment.salonName ||
                            "Rendez-vous"}
                        </h4>
                        {appointment.tatoueurName && (
                          <p className="text-white/70 font-one text-sm">
                            avec {appointment.tatoueurName}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-white/60 font-one text-sm">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        {formatDate(appointment.start)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {formatTime(appointment.start)}
                        {appointment.end && ` - ${formatTime(appointment.end)}`}
                      </div>
                      <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-300 rounded text-xs">
                        {appointment.prestation}
                      </div>
                      {appointment.price && (
                        <div className="font-semibold text-white">
                          {appointment.price}€
                        </div>
                      )}
                    </div>

                    {appointment.description && (
                      <p className="text-white/60 font-one text-sm mt-2">
                        {appointment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {appointment.status === "CONFIRMED" && (
                      <>
                        <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-xs transition-all duration-300">
                          Modifier
                        </button>
                        <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg font-one text-xs transition-all duration-300">
                          Annuler
                        </button>
                      </>
                    )}
                    {appointment.status === "COMPLETED" && (
                      <button className="px-3 py-2 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-300 hover:text-tertiary-200 border border-tertiary-500/30 hover:border-tertiary-400/50 rounded-lg font-one text-xs transition-all duration-300">
                        Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
