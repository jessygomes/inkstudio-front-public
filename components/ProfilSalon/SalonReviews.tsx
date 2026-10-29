"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import AppButton from "@/components/Shared/AppButton";
import { BadgeCheck, ChevronLeft, ChevronRight, MessageSquare, PenLine, Star, X } from "lucide-react";
import { createReview, getSalonReviews } from "@/lib/actions/review.action";
import { useUser } from "@/components/Context/UserContext";
import { toast } from "sonner";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified?: boolean;
  author?: { name?: string; image?: string | null };
  appointment?: { prestation?: string; date?: string | null } | null;
  createdAt?: string;
  salonResponse?: string | null;
  salonRespondedAt?: string | null;
};
type Sort = "recent" | "rating" | "oldest";
type Props = { salonId: string; salonName?: string };

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating.toLocaleString("fr-FR")} sur 5`} className="inline-flex shrink-0 gap-0.5 text-tertiary-400">
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className="relative block size-3.5" aria-hidden="true">
          <Star size={14} className="text-white/20" />
          <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, rating - value + 1)) * 100}%` }}><Star size={14} className="fill-tertiary-400" /></span>
        </span>
      ))}
    </span>
  );
}

function ReviewDate({ value }: { value?: string | null }) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return <time dateTime={value}>{new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</time>;
}

const buttonClass = "px-3! py-2! text-xs! rounded-lg! shadow-none!";
const fieldClass = "mt-2 w-full rounded-xl border border-white/10 bg-noir-800 px-3.5 py-3 font-one text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10";

export default function SalonReviews({ salonId, salonName }: Props) {
  const { isAuthenticated, isClient } = useUser();
  const id = useId();
  const requestId = useRef(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>("recent");
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const load = useCallback(async (requestedPage: number, requestedSort: Sort) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const res = await getSalonReviews(salonId, { page: requestedPage, limit: 3, sortBy: requestedSort });
      if (currentRequest !== requestId.current) return;
      if (!res.ok) throw new Error(res.message || "Impossible de charger les avis.");
      setReviews(res.data.reviews || []);
      setStats({ totalReviews: res.data.statistics?.totalReviews || 0, averageRating: res.data.statistics?.averageRating || 0 });
      setHasNext(res.data.pagination?.hasNextPage || false);
      setHasPrev(res.data.pagination?.hasPreviousPage || false);
      setPage(res.data.pagination?.currentPage || requestedPage);
    } catch (cause) {
      if (currentRequest === requestId.current) setError(cause instanceof Error ? cause.message : "Impossible de charger les avis. Réessayez dans un instant.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    void load(1, sort);
    return () => { requestId.current += 1; };
  }, [load, sort]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !isAuthenticated || !isClient) return;
    setSubmitting(true);
    try {
      const res = await createReview({ salonId, rating: form.rating, title: form.title.trim() || undefined, comment: form.comment.trim() || undefined });
      if (!res.ok) throw new Error(res.message || "Impossible de publier votre avis.");
      toast.success("Votre avis a été publié. Merci pour votre retour !");
      setForm({ rating: 5, title: "", comment: "" });
      setFormOpen(false);
      setListOpen(true);
      if (sort === "recent") await load(1, "recent");
      else setSort("recent");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "L’envoi a échoué. Votre texte a été conservé, vous pouvez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-noir-800 font-one">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><MessageSquare size={17} aria-hidden="true" /></span><div><p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/35">Leurs expériences</p><h2 className="text-lg font-medium text-white/90" title={"Avis sur " + (salonName || "ce salon")}>Les avis clients</h2><p className="mt-1 text-[11px] leading-5 text-white/40">Des retours pour imaginer votre prochaine séance.</p></div></div>
          <AppButton type="button" variant="secondary" aria-expanded={formOpen} aria-controls={id + "-form"} onClick={() => setFormOpen(open => !open)} className={buttonClass}>{formOpen ? <X size={14} /> : <PenLine size={14} />}{formOpen ? "Fermer" : "Donner mon avis"}</AppButton>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
          {loading ? <span role="status" className="text-xs text-white/45">Chargement des avis…</span> : error ? <span role="alert" className="text-xs text-white/50">Les avis n’ont pas pu être chargés.</span> : stats.totalReviews ? <div className="flex flex-wrap items-center gap-4"><div className="flex items-baseline gap-1"><span className="text-2xl font-semibold tracking-tight text-white">{stats.averageRating.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span><span className="text-xs text-white/30">/ 5</span></div><div><Stars rating={stats.averageRating} /><p className="mt-1 text-[10px] text-white/40">{stats.totalReviews} avis {stats.totalReviews > 1 ? "partagés" : "partagé"}</p></div></div> : <div><p className="text-sm text-white/80">Le premier avis sera peut-être le vôtre</p><p className="mt-1 text-[11px] text-white/40">Partagez votre expérience après votre visite.</p></div>}
          {(stats.totalReviews > 0 || error) && <AppButton type="button" variant="secondary" aria-expanded={listOpen} aria-controls={id + "-reviews"} onClick={() => setListOpen(open => !open)} className={buttonClass}>{listOpen ? "Masquer les avis" : "Lire les avis"}<ChevronRight size={13} className={listOpen ? "rotate-90" : ""} /></AppButton>}
        </div>
        {formOpen && (
          <div id={`${id}-form`} className="mt-6 rounded-2xl border border-white/10 bg-noir-800/40 p-4 sm:p-6">
            {!isAuthenticated ? (
              <div className="space-y-3"><h3 className="text-lg text-white">Votre expérience compte</h3><p className="text-sm text-white/65">Connectez-vous à votre compte client pour partager votre avis.</p><AppButton href="/se-connecter" variant="secondary" className={buttonClass}>Se connecter</AppButton></div>
            ) : !isClient ? <p className="text-sm text-white/70">Les avis sont réservés aux comptes clients.</p> : (
              <form onSubmit={submit} className="space-y-5">
                <div><h3 className="text-lg text-white">Racontez votre expérience</h3><p className="mt-1 text-sm text-white/55">Votre retour aide les prochains visiteurs à choisir leur salon.</p></div>
                <fieldset disabled={submitting}>
                  <legend className="mb-2 text-sm text-white/80">Votre note</legend>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex" onMouseLeave={() => setHoverRating(null)}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-lg hover:bg-white/5">
                          <input type="radio" name={`${id}-rating`} value={value} checked={form.rating === value} onChange={() => setForm((f) => ({ ...f, rating: value }))} aria-label={`${value} sur 5`} className="peer sr-only" />
                          <Star onMouseEnter={() => setHoverRating(value)} size={27} aria-hidden="true" className={`rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-tertiary-400 ${(hoverRating ?? form.rating) >= value ? "fill-tertiary-400 text-tertiary-400" : "text-white/25"}`} />
                        </label>
                      ))}
                    </div>
                    <span className="text-sm text-white/65">{["", "Décevant", "Peu satisfaisant", "Correct", "Très bien", "Excellent"][form.rating]}</span>
                  </div>
                </fieldset>
                <label className="block text-sm text-white/80" htmlFor={`${id}-title`}>Titre <span className="text-white/40">(facultatif)</span><input id={`${id}-title`} disabled={submitting} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="En quelques mots…" className={fieldClass} /></label>
                <label className="block text-sm text-white/80" htmlFor={`${id}-comment`}>Votre expérience <span className="text-white/40">(facultatif)</span><textarea id={`${id}-comment`} disabled={submitting} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="L’accueil, les échanges, le résultat… Qu’avez-vous apprécié ?" rows={4} className={`${fieldClass} resize-y`} /></label>
                <div className="flex justify-end"><AppButton type="submit" disabled={submitting} className={buttonClass}>{submitting ? "Publication en cours…" : "Publier mon avis"}</AppButton></div>
              </form>
            )}
          </div>
        )}
      </div>
      {listOpen && <div id={`${id}-reviews`} className="border-t border-white/10 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white/80">Les témoignages</h3>
          <label className="flex items-center gap-2 text-[11px] text-white/45">Trier par<select value={sort} disabled={loading} onChange={(event) => setSort(event.target.value as Sort)} className="min-h-10 rounded-lg border border-white/10 bg-noir-800 px-3 font-one text-xs text-white focus-visible:outline-tertiary-400"><option value="recent">Les plus récents</option><option value="rating">Les mieux notés</option><option value="oldest">Les plus anciens</option></select></label>
        </div>
        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div role="status" className="space-y-3"><span className="sr-only">Chargement des avis…</span>{[0, 1].map((i) => <div key={i} aria-hidden="true" className="space-y-3 rounded-2xl border border-white/5 p-5 motion-safe:animate-pulse"><div className="h-9 w-40 rounded-lg bg-white/10" /><div className="h-3 w-full rounded bg-white/5" /><div className="h-3 w-2/3 rounded bg-white/5" /></div>)}</div>
          ) : error ? (
            <div role="alert" className="rounded-xl border border-white/10 p-6 text-center"><p className="mb-4 text-sm text-white/70">{error}</p><AppButton type="button" variant="secondary" onClick={() => void load(page, sort)} className={buttonClass}>Réessayer</AppButton></div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl bg-white/3 px-4 py-5 text-center"><MessageSquare size={22} className="mx-auto mb-2 text-white/35" /><p className="text-lg text-white">L’histoire reste à écrire</p><p className="mt-2 text-sm text-white/60">Aucun avis pour le moment. Partagez votre expérience avec la communauté.</p></div>
          ) : (
            <ul className="space-y-2.5">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent p-3.5 transition-colors hover:border-white/15">
                  <article>
                    <div className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-white/8 bg-white/5 text-xs font-medium text-white/65">{review.author?.name?.trim().charAt(0).toUpperCase() || "C"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><p className="break-words text-xs font-medium text-white/90">{review.author?.name || "Client"}</p>{review.isVerified && <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300/80"><BadgeCheck size={12} aria-hidden="true" />Vérifié</span>}</div>
                          <Stars rating={review.rating || 0} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/35"><ReviewDate value={review.createdAt} />{review.appointment?.prestation && <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-white/50">{review.appointment.prestation}</span>}</div>
                      </div>
                    </div>
                    {review.title && <h4 className="mt-2.5 break-words text-sm font-medium text-white/90">{review.title}</h4>}
                    {review.comment && <p className="mt-1.5 whitespace-pre-line break-words text-xs leading-5 text-white/65">{review.comment}</p>}
                    {review.salonResponse && <div className="mt-3 rounded-r-lg border-l-2 border-tertiary-400/35 bg-white/[0.025] px-3 py-2.5"><div className="mb-1.5 flex flex-wrap items-center justify-between gap-2"><p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/75"><MessageSquare size={12} className="text-tertiary-400/70" />Réponse du salon</p><span className="text-[10px] text-white/35"><ReviewDate value={review.salonRespondedAt} /></span></div><p className="whitespace-pre-line break-words text-xs leading-5 text-white/55">{review.salonResponse}</p></div>}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!error && (hasPrev || hasNext) && <nav aria-label="Pagination des avis" className="mt-4 flex items-center justify-between gap-2"><AppButton type="button" variant="secondary" onClick={() => void load(page - 1, sort)} disabled={!hasPrev || loading} className={buttonClass}><ChevronLeft size={16} /><span className="hidden sm:inline">Précédent</span><span className="sr-only sm:hidden">Page précédente</span></AppButton><span className="text-sm text-white/55">Page {page}</span><AppButton type="button" variant="secondary" onClick={() => void load(page + 1, sort)} disabled={!hasNext || loading} className={buttonClass}><span className="hidden sm:inline">Suivant</span><span className="sr-only sm:hidden">Page suivante</span><ChevronRight size={16} /></AppButton></nav>}
      </div>}
    </div>
  );
}
