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
      <div className="rounded-2xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-5 backdrop-blur-lg shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-br from-noir-500/6 to-white/3 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
            >
              Découvrir des salons
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-3.5 sm:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Salon Info */}
                    {review.salon && (
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-tertiary-400/30 bg-linear-to-br from-tertiary-400/20 to-tertiary-500/20">
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
                          className="min-w-0 flex-1 transition-opacity hover:opacity-80"
                        >
                          <p className="truncate text-sm font-semibold text-white font-one">
                            {review.salon.salonName}
                          </p>
                          <p className="truncate text-xs text-white/60 font-one">
                            {review.salon.city} ({review.salon.postalCode})
                          </p>
                        </Link>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm text-amber-300">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>
                              {i < (review.rating || 0) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-white/70 font-one">
                          {review.rating}/5
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {review.isVerified && (
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300 font-one">
                              ✓ Vérifié
                            </span>
                          )}
                          {review.isVisible === false && (
                            <span className="flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-0.5 text-[11px] text-orange-300 font-one">
                              <FaEye className="h-2.5 w-2.5" />
                              Caché
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45 font-one">
                        {review.appointment?.prestation && (
                          <span>{review.appointment.prestation}</span>
                        )}
                        {review.createdAt && (
                          <span>
                            {new Date(review.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        )}
                      </div>

                      {review.title && (
                        <p className="text-sm font-semibold text-white font-one">
                          {review.title}
                        </p>
                      )}

                      {review.comment && (
                        <p className="line-clamp-3 text-sm leading-relaxed text-white/80 font-one">
                          {review.comment}
                        </p>
                      )}

                      {/* Réponse du salon */}
                      {review.salonResponse && (
                        <div className="border-t border-white/10 pt-3">
                          <div className="rounded-xl border border-tertiary-500/20 bg-linear-to-br from-tertiary-500/10 to-tertiary-600/5 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-tertiary-500/20">
                                <span className="text-xs">💬</span>
                              </div>
                              <span className="text-xs font-semibold text-tertiary-300 font-one">
                                Réponse du salon
                              </span>
                              {review.salonRespondedAt && (
                                <span className="ml-auto text-[11px] text-white/40 font-one">
                                  {new Date(
                                    review.salonRespondedAt,
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed text-white/90 font-one">
                              {review.salonResponse}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(review)}
                    disabled={deletingId === review.id}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15 text-red-300 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/25 hover:text-red-200 disabled:opacity-50"
                    title="Supprimer cet avis"
                  >
                    {deletingId === review.id ? (
                      <div className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash className="w-3 h-3" />
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
          <div className="bg-linear-to-br from-noir-500/6 to-white/3 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
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
