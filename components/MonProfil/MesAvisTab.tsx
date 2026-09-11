"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { getClientReviews, deleteReview } from "@/lib/actions/review.action";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import { ArrowUpRight, BadgeCheck, ChevronDown, EyeOff, MessageSquare, Star, Trash2 } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import ConfirmActionModal from "@/components/Shared/ConfirmActionModal";

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
  salon?: { id: string; salonName: string; city: string; postalCode: string; image?: string };
  appointment?: { prestation?: string; date?: string | null } | null;
};

function ReviewDate({ value }: { value?: string | null }) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return <time dateTime={value}>{new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</time>;
}

function ClientReviewCard({ review, onDelete, deleting }: { review: Review; onDelete: () => void; deleting: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const salonHref = review.salon ? `/salon/${toSlug(review.salon.salonName)}/${toSlug([review.salon.city, review.salon.postalCode].filter(Boolean).join("-"))}` : null;
  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-noir-500 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 text-sm text-white/50">{review.salon?.image ? <Image src={review.salon.image} alt="" fill sizes="40px" className="object-cover" /> : review.salon?.salonName.charAt(0) || <Star size={16} />}</div>
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-sm font-semibold text-white">{salonHref ? <Link href={salonHref} className="inline-flex items-start gap-1.5 hover:text-tertiary-400">{review.salon?.salonName}<ArrowUpRight size={13} className="mt-1 shrink-0 text-white/40" /></Link> : "Mon avis"}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">{review.salon?.city && <span>{review.salon.city}</span>}<ReviewDate value={review.createdAt} />{review.appointment?.prestation && <span>{review.appointment.prestation.toUpperCase()}</span>}</div>
        </div>
        <button type="button" onClick={onDelete} disabled={deleting} aria-label={`Supprimer mon avis${review.salon ? ` sur ${review.salon.salonName}` : ""}`} title="Supprimer cet avis" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg text-white/35 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"><Trash2 size={15} /></button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span role="img" aria-label={`${review.rating} sur 5`} className="inline-flex items-center gap-0.5 text-amber-300">{[1,2,3,4,5].map((value) => <Star key={value} aria-hidden="true" size={13} className={value <= review.rating ? "fill-amber-300" : "text-white/20"} />)}</span>
        <span className="text-xs text-white/65">{review.rating}/5</span>
        {review.isVerified && <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300"><BadgeCheck size={12} />Vérifié</span>}
        {review.isVisible === false && <span className="inline-flex items-center gap-1 text-[11px] text-orange-300"><EyeOff size={12} />Masqué</span>}
      </div>
      {review.title && <p className="mt-2 break-words text-sm font-medium text-white/90">{review.title}</p>}
      <div id={id}>
        {review.comment && <p className={`mt-1 whitespace-pre-line break-words text-sm leading-6 text-white/65 ${expanded ? "" : "line-clamp-2"}`}>{review.comment}</p>}
        {expanded && review.salonResponse && <div className="mt-3 rounded-r-lg border-l-2 border-tertiary-400/40 bg-white/3 p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-xs text-white/75"><MessageSquare size={13} />Réponse du salon</span><span className="text-[11px] text-white/40"><ReviewDate value={review.salonRespondedAt} /></span></div><p className="whitespace-pre-line break-words text-sm leading-6 text-white/65">{review.salonResponse}</p></div>}
      </div>
      {(review.comment || review.salonResponse) && <div className="mt-1 flex flex-wrap items-center justify-between gap-2"><button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded((value) => !value)} className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs text-white/65 hover:text-white">{expanded ? "Réduire" : "Lire en détail"}<ChevronDown size={13} className={expanded ? "rotate-180" : ""} /></button>{review.salonResponse && !expanded && <span className="inline-flex items-center gap-1 text-[11px] text-tertiary-400"><MessageSquare size={12} />Le salon a répondu</span>}</div>}
    </article>
  );
}

export default function MesAvisTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const load = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await getClientReviews({ page: requestedPage, limit: 6, sortBy: "recent" });
      if (!res.ok) throw new Error(res.message || "Impossible de charger vos avis.");
      setReviews(res.data.reviews || []);
      setTotalReviews(res.data.statistics?.totalReviews || 0);
      setHasNext(res.data.pagination?.hasNextPage || false);
      setHasPrev(res.data.pagination?.hasPreviousPage || false);
      setPage(res.data.pagination?.currentPage || requestedPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger vos avis. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(1); }, [load]);

  const handleConfirmDelete = async () => {
    if (!reviewToDelete || deletingId) return;
    setDeletingId(reviewToDelete.id);
    try {
      const res = await deleteReview(reviewToDelete.id);
      if (!res.ok) throw new Error(res.message || "Impossible de supprimer cet avis.");
      toast.success("Avis supprimé");
      setReviewToDelete(null);
      await load(reviews.length === 1 && page > 1 ? page - 1 : page);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "La suppression a échoué. Vous pouvez réessayer.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 font-one [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-tertiary-400 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-tertiary-400">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"><div><h3 className="text-xl text-white">Mes avis</h3><p className="mt-1 text-xs text-white/50">Vos expériences et les réponses des salons.</p></div>{!loading && !error && <span className="shrink-0 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/55">{totalReviews} avis</span>}</div>
      {loading ? <div role="status" className="grid gap-3 xl:grid-cols-2"><span className="sr-only">Chargement des avis…</span>{[0,1].map((value) => <div key={value} aria-hidden="true" className="space-y-3 rounded-2xl border border-white/10 bg-noir-500 p-4 motion-safe:animate-pulse"><div className="h-9 w-40 rounded-lg bg-white/10" /><div className="h-3 w-24 rounded bg-white/5" /><div className="h-3 w-3/4 rounded bg-white/5" /></div>)}</div> : error ? <div role="alert" className="rounded-xl border border-white/10 p-5 text-center"><p className="mb-3 text-sm text-white/65">{error}</p><AppButton type="button" variant="secondary" onClick={() => void load(page)} className="min-h-11 cursor-pointer">Réessayer</AppButton></div> : reviews.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 bg-noir-500 px-4 py-6 text-center"><Star size={24} className="mx-auto mb-2 text-white/30" /><p className="mb-4 text-sm text-white/60">Vous n’avez pas encore partagé d’avis.</p><AppButton href="/trouver-un-salon" variant="secondary" className="min-h-11">Découvrir les salons</AppButton></div> : <div className="grid items-start gap-3 xl:grid-cols-2">{reviews.map((review) => <ClientReviewCard key={review.id} review={review} onDelete={() => setReviewToDelete(review)} deleting={deletingId !== null} />)}</div>}
      {!error && (hasPrev || hasNext) && <nav aria-label="Pagination de mes avis" className="flex items-center justify-between gap-2 border-t border-white/10 pt-3"><AppButton type="button" variant="secondary" onClick={() => void load(page - 1)} disabled={!hasPrev || loading} className="min-h-11 cursor-pointer">Précédent</AppButton><span className="text-xs text-white/50">Page {page}</span><AppButton type="button" variant="secondary" onClick={() => void load(page + 1)} disabled={!hasNext || loading} className="min-h-11 cursor-pointer">Suivant</AppButton></nav>}
      <ConfirmActionModal isOpen={reviewToDelete !== null} title="Supprimer cet avis ?" description={`Votre avis${reviewToDelete?.salon ? ` sur ${reviewToDelete.salon.salonName}` : ""} sera supprimé définitivement.`} confirmLabel="Supprimer" intent="danger" loading={deletingId !== null} onConfirm={handleConfirmDelete} onClose={() => { if (!deletingId) setReviewToDelete(null); }} />
    </div>
  );
}
