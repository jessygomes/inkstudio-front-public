"use client";
import { useEffect, useState } from "react";
import { createReview, getSalonReviews } from "@/lib/actions/review.action";
import { useUser } from "@/components/Context/UserContext";
import { toast } from "sonner";
import { FaStar } from "react-icons/fa";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified?: boolean;
  author?: { name?: string; image?: string | null };
  appointment?: { prestation?: string; date?: string | null } | null;
  createdAt?: string;
};

type Stats = {
  totalReviews: number;
  averageRating: number;
};

type Props = { salonId: string; salonName?: string };

export default function SalonReviews({ salonId, salonName }: Props) {
  const { isAuthenticated, isClient } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await getSalonReviews(salonId, { page: p, sortBy: "recent" });
    if (res.ok) {
      setReviews(res.data.reviews || []);
      setStats({
        totalReviews: res.data.statistics?.totalReviews || 0,
        averageRating: res.data.statistics?.averageRating || 0,
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const submit = async () => {
    if (!isAuthenticated || !isClient) {
      toast.error("Connectez-vous en tant que client pour laisser un avis");
      return;
    }
    if (!form.rating) {
      toast.error("Note requise");
      return;
    }
    setSubmitting(true);
    const res = await createReview({
      salonId,
      rating: form.rating,
      title: form.title || undefined,
      comment: form.comment || undefined,
    });
    if (res.ok) {
      toast.success("Avis publié");
      setForm({ rating: 5, title: "", comment: "" });
      load(1);
    } else {
      toast.error(res.message || "Erreur lors de l'envoi");
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-lg shadow-xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-one font-semibold text-lg">
            Avis sur {salonName || "ce salon"}
          </h3>
          <p className="text-white/60 text-xs">
            {stats.totalReviews > 0
              ? `${stats.totalReviews} avis • ${stats.averageRating.toFixed(
                  1
                )}/5`
              : "Partagez votre expérience"}
          </p>
        </div>
        <div className="flex items-center gap-1 text-amber-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < form.rating ? "★" : "☆"}</span>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Note :</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const active = (hoverRating ?? form.rating) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setForm((f) => ({ ...f, rating: value }))}
                  className="p-1"
                >
                  <FaStar
                    className={`w-6 h-6 transition-all ${
                      active
                        ? "text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] scale-105"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-white/60 text-xs">{form.rating}/5</span>
        </div>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Titre (optionnel)"
          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tertiary-400"
        />
        <textarea
          value={form.comment}
          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          placeholder="Votre avis..."
          rows={3}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-tertiary-400 resize-none"
        />
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-sm font-one transition-all duration-300 disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Publier l'avis"}
        </button>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-white/60 text-sm">Chargement...</p>
        ) : stats.totalReviews === 0 ? (
          <p className="text-white/60 text-sm">Aucun avis pour le moment.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="border border-white/10 rounded-lg p-4 bg-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-amber-300 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < (r.rating || 0) ? "★" : "☆"}</span>
                  ))}
                </div>
                {r.isVerified && (
                  <span className="text-emerald-300 text-xs bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Vérifié
                  </span>
                )}
              </div>
              {r.title && (
                <p className="text-white font-semibold text-sm">{r.title}</p>
              )}
              {r.comment && (
                <p className="text-white/80 text-sm leading-relaxed">
                  {r.comment}
                </p>
              )}
              <div className="text-white/50 text-xs flex flex-wrap gap-2">
                {r.author?.name && <span>Par {r.author.name}</span>}
                {r.appointment?.prestation && (
                  <span>• {r.appointment.prestation}</span>
                )}
                {r.createdAt && (
                  <span>
                    • {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => load(page - 1)}
          disabled={!hasPrev || loading}
          className="px-3 py-2 bg-white/5 border border-white/15 text-white/80 rounded-lg text-xs disabled:opacity-40"
        >
          Précédent
        </button>
        <span className="text-white/70 text-xs">Page {page}</span>
        <button
          onClick={() => load(page + 1)}
          disabled={!hasNext || loading}
          className="px-3 py-2 bg-white/5 border border-white/15 text-white/80 rounded-lg text-xs disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
