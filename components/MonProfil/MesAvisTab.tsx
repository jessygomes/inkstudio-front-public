/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { getClientReviews, deleteReview } from "@/lib/actions/review.action";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import { FaTrash, FaEye, FaExclamationTriangle } from "react-icons/fa";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified?: boolean;
  isVisible?: boolean;
  createdAt?: string;
  salonResponse?: string | null;
  salonRespondedAt?: string | null;
  salon?: {
    id: string;
    salonName: string;
    city: string;
    postalCode: string;
    image?: string;
  };
  appointment?: { prestation?: string; date?: string | null } | null;
};

export default function MesAvisTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await getClientReviews({ page: p, sortBy: "recent" });
    if (res.ok) {
      setReviews(res.data.reviews || []);
      setTotalReviews(res.data.statistics?.totalReviews || 0);
      setHasNext(res.data.pagination?.hasNextPage || false);
      setHasPrev(res.data.pagination?.hasPreviousPage || false);
      setPage(res.data.pagination?.currentPage || p);
    } else {
      toast.error(res.message || "Impossible de charger les avis");
    }
    setLoading(false);
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    setDeletingId(reviewToDelete.id);
    const res = await deleteReview(reviewToDelete.id);
    if (res.ok) {
      toast.success("Avis supprimé avec succès");
      setShowDeleteModal(false);
      setReviewToDelete(null);
      load(page);
    } else {
      toast.error(res.message || "Erreur lors de la suppression");
    }
    setDeletingId(null);
  };

  const handleCloseModal = () => {
    if (deletingId === null) {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-one font-semibold text-lg">
            Mes avis
          </h3>
          <span className="text-white/60 font-one text-sm">
            {totalReviews} avis
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white/60 font-one">Chargement...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 font-one mb-4">
              Vous n'avez pas encore laissé d'avis.
            </p>
            <Link
              href="/trouver-un-salon"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
            >
              Découvrir des salons
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/8 transition-all duration-300 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Salon Info */}
                    {review.salon && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 flex-shrink-0">
                          {review.salon.image ? (
                            <Image
                              src={review.salon.image}
                              alt={review.salon.salonName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-tertiary-400 text-xs font-bold">
                              {review.salon.salonName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/salon/${toSlug(review.salon.salonName)}/${toSlug(
                            review.salon.city,
                          )}-${review.salon.postalCode}`}
                          className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                        >
                          <p className="text-white font-one font-semibold text-sm truncate">
                            {review.salon.salonName}
                          </p>
                          <p className="text-white/60 font-one text-xs truncate">
                            {review.salon.city} ({review.salon.postalCode})
                          </p>
                        </Link>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-amber-300 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < (review.rating || 0) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="text-white/70 font-one text-xs">
                        {review.rating}/5
                      </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <p className="text-white font-semibold text-sm mb-2">
                        {review.title}
                      </p>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-2">
                        {review.comment}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-white/50 text-xs">
                      {review.isVerified && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-full">
                          ✓ Vérifié
                        </span>
                      )}
                      {review.isVisible === false && (
                        <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-400/30 text-orange-300 rounded-full flex items-center gap-1">
                          <FaEye className="w-2.5 h-2.5" />
                          Caché
                        </span>
                      )}
                      {review.appointment?.prestation && (
                        <span>• {review.appointment.prestation}</span>
                      )}
                      {review.createdAt && (
                        <span>
                          •{" "}
                          {new Date(review.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      )}
                    </div>

                    {/* Réponse du salon */}
                    {review.salonResponse && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/5 rounded-lg p-3 border border-tertiary-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-tertiary-500/20 flex items-center justify-center">
                              <span className="text-xs">💬</span>
                            </div>
                            <span className="text-tertiary-300 font-one text-xs font-semibold">
                              Réponse du salon
                            </span>
                            {review.salonRespondedAt && (
                              <span className="text-white/40 text-xs ml-auto">
                                {new Date(
                                  review.salonRespondedAt,
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                          <p className="text-white/90 text-xs leading-relaxed">
                            {review.salonResponse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(review)}
                    disabled={deletingId === review.id}
                    className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                    title="Supprimer cet avis"
                  >
                    {deletingId === review.id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalReviews > 0 && (
          <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => load(page - 1)}
              disabled={!hasPrev || loading}
              className="px-3 py-2 bg-white/5 border border-white/15 text-white/80 rounded-lg text-xs disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              Précédent
            </button>
            <span className="text-white/70 text-xs">Page {page}</span>
            <button
              onClick={() => load(page + 1)}
              disabled={!hasNext || loading}
              className="px-3 py-2 bg-white/5 border border-white/15 text-white/80 rounded-lg text-xs disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-noir-700/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-one font-semibold text-lg">
                Supprimer cet avis ?
              </h3>
            </div>

            {reviewToDelete && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-white/80 font-one text-sm mb-2">
                  <strong>{reviewToDelete.salon?.salonName}</strong>
                </p>
                <p className="text-white/60 font-one text-xs line-clamp-2">
                  {reviewToDelete.title || reviewToDelete.comment || "Avis"}
                </p>
              </div>
            )}

            <p className="text-white/70 font-one text-sm">
              Cette action est irréversible. Êtes-vous certain de vouloir
              supprimer cet avis ?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCloseModal}
                disabled={deletingId !== null}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg font-one text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
