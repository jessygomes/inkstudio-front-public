import { useId } from "react";
import { BadgeCheck, LoaderCircle, MessageSquare, Send, Star } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import type { RendezVousCardProps } from "./RendezVousCard";

type Props = Pick<RendezVousCardProps, "appointment" | "hasReview" | "reviewForm" | "hoverRating" | "reviewSubmitting" | "setHoverRating" | "setReviewForm" | "handleSubmitReview">;
const ratings = ["Très déçu", "Déçu", "Correct", "Satisfait", "Très satisfait"];
const fieldClass = "w-full rounded-lg border border-white/15 bg-noir-700 px-3.5 py-3 text-base text-white placeholder:text-white/35 outline-none transition-colors hover:border-white/25 focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/15 sm:text-sm";

export default function AppointmentReview({ appointment, hasReview, reviewForm, hoverRating, reviewSubmitting, setHoverRating, setReviewForm, handleSubmitReview }: Props) {
  const id = useId();
  const review = appointment.review;
  const displayedRating = hoverRating ?? reviewForm.rating;
  return (
    <section id={`appointment-review-${appointment.id}`} aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t border-white/10 pt-6 font-one">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        <header className="min-w-0">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-tertiary-400">Votre expérience</p>
          <h3 id={`${id}-heading`} className="font-two text-xl font-medium text-white sm:text-2xl">{hasReview ? "Merci pour votre avis" : "Comment s’est passé votre rendez-vous ?"}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">{hasReview ? "Retrouvez votre retour d’expérience et les échanges avec le salon." : "Votre retour aide le salon à progresser et les autres clients à faire leur choix."}</p>
          <p className="mt-4 flex items-start gap-2 text-sm text-white/75"><MessageSquare size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-white/40" /><span className="wrap-anywhere">{appointment.salon.salonName}</span></p>
        </header>
        {hasReview ? (
          <div className="min-w-0 space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
            <div className="flex flex-wrap items-center gap-3">
              <span aria-label={`Note : ${review?.rating ?? 0} sur 5`} className="flex gap-1 text-tertiary-400">
                {ratings.map((label, index) => <Star key={label} size={20} aria-hidden="true" className={index < (review?.rating ?? 0) ? "fill-current" : "text-white/20"} />)}
              </span>
              <span className="text-sm font-medium text-white">{review?.rating}/5</span>
              {review?.isVerified && <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300"><BadgeCheck size={15} aria-hidden="true" />Avis vérifié</span>}
            </div>
            {review?.title && <h4 className="wrap-anywhere text-base font-medium text-white">{review.title}</h4>}
            {review?.comment && <p className="whitespace-pre-wrap wrap-anywhere text-sm leading-7 text-white/75">{review.comment}</p>}
            {review?.createdAt && <p className="text-xs text-white/45">Publié le {new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>}
            {review?.salonResponse && <div className="border-l-2 border-tertiary-400/40 pl-4"><p className="mb-2 text-xs font-medium text-tertiary-400">Réponse du salon</p><p className="whitespace-pre-wrap wrap-anywhere text-sm leading-6 text-white/75">{review.salonResponse}</p></div>}
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); if (!reviewSubmitting) handleSubmitReview(appointment); }} aria-busy={reviewSubmitting} className="min-w-0 lg:border-l lg:border-white/10 lg:pl-8">
            <fieldset disabled={reviewSubmitting} className="min-w-0 space-y-5 disabled:opacity-60">
              <legend className="sr-only">Rédiger un avis</legend>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-white/85">Votre note</legend>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex" onMouseLeave={() => setHoverRating(null)}>
                    {ratings.map((label, index) => {
                      const value = index + 1;
                      return <label key={value} className="relative flex h-11 w-11 cursor-pointer items-center justify-center" onMouseEnter={() => setHoverRating(value)}>
                        <input type="radio" name={`${id}-rating`} value={value} checked={reviewForm.rating === value} onChange={() => setReviewForm((form) => ({ ...form, rating: value }))} aria-label={`${value} sur 5 : ${label}`} className="peer sr-only" />
                        <span className="rounded-md p-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tertiary-400"><Star size={26} aria-hidden="true" className={`transition-colors ${displayedRating >= value ? "fill-tertiary-400 text-tertiary-400" : "text-white/25"}`} /></span>
                      </label>;
                    })}
                  </div>
                  <p className="text-sm text-white/75">{ratings[displayedRating - 1]} <span className="ml-1 text-white/40">{displayedRating}/5</span></p>
                </div>
              </fieldset>
              <div>
                <label htmlFor={`${id}-title`} className="mb-2 flex items-center justify-between gap-3 text-sm text-white/85">En quelques mots<span className="text-xs text-white/45">Facultatif</span></label>
                <input id={`${id}-title`} type="text" value={reviewForm.title} onChange={(event) => setReviewForm((form) => ({ ...form, title: event.target.value }))} maxLength={100} placeholder="Un accueil chaleureux, un résultat soigné…" className={fieldClass} aria-describedby={`${id}-title-count`} />
                <p id={`${id}-title-count`} className="mt-1.5 text-right text-xs tabular-nums text-white/45">{reviewForm.title.length}/100 caractères</p>
              </div>
              <div>
                <label htmlFor={`${id}-comment`} className="mb-2 flex items-center justify-between gap-3 text-sm text-white/85">Votre retour d’expérience<span className="text-xs text-white/45">Facultatif</span></label>
                <textarea id={`${id}-comment`} value={reviewForm.comment} onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))} maxLength={500} rows={4} placeholder="L’accueil, les conseils, le résultat… Qu’avez-vous pensé de votre rendez-vous ?" className={`${fieldClass} min-h-32 resize-y`} aria-describedby={`${id}-comment-count`} />
                <p id={`${id}-comment-count`} className="mt-1.5 text-right text-xs tabular-nums text-white/45">{reviewForm.comment.length}/500 caractères</p>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-white/50">Une note suffit. Vous pouvez aussi détailler votre expérience.</p>
                <AppButton type="submit" disabled={reviewSubmitting} icon={reviewSubmitting ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Send size={16} aria-hidden="true" />} className="min-h-11 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
                  {reviewSubmitting ? "Publication…" : "Publier mon avis"}
                </AppButton>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}
