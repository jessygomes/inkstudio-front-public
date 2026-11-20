/* eslint-disable @next/next/no-img-element */
"use client";
import { userErrorMessage } from "@/lib/user-error";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import imageCompression from "browser-image-compression";
import { ArrowUpRight, CalendarDays, Check, CheckCircle2, Clock3, ImagePlus, Loader2, LockKeyhole, MessageCircle, Plus, RefreshCw, Send, Star, TriangleAlert, X } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import { checkBadge, choice, field, iconBadge, inset, label, surface } from "@/components/Shared/ui";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { CLIENT_BENEFITS } from "@/lib/client-benefits";
import { FOLLOW_UP_MAX_PHOTOS, HEALING_OPTIONS, SATISFACTION_LABELS, type HealingStatus } from "@/lib/follow-up";

type Appointment = { title?: string; start?: string; prestation?: string; salonName?: string; artistName?: string };
type Status = "loading" | "ready" | "invalid" | "expired" | "used" | "unavailable";

const SATISFACTION = SATISFACTION_LABELS;
const PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_PHOTO = 8 * 1024 * 1024;
const apiBase = process.env.NEXT_PUBLIC_BACK_URL;
const messageOf = (data: { message?: string | string[] } | null, fallback: string) =>
  Array.isArray(data?.message) ? data.message.join(" ") : data?.message || fallback;
const dateFr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }) : "";

/** Suivi de cicatrisation : 1 à 3 photos, état de la cicatrisation, satisfaction et avis, envoyés au salon depuis le lien reçu. */
export default function FollowUpFlow({ token }: { token: string }) {
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status>(token ? "loading" : "invalid");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [retry, setRetry] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [healing, setHealing] = useState<HealingStatus | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [publicPhoto, setPublicPhoto] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"idle" | "uploading" | "sending" | "done">("idle");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Photos déjà transférées (un nouvel essai ne les renvoie pas).
  const uploaded = useRef(new Map<File, string>());
  const { startUpload } = useUploadThing("imageUploader");
  const busy = stage === "uploading" || stage === "sending";

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    (async () => {
      try {
        if (!apiBase) throw new Error("Service indisponible");
        const response = await fetch(`${apiBase}/follow-up/requests/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (controller.signal.aborted) return;
        if (response.ok && data?.ok) { setAppointment(data.appointment ?? null); setStatus("ready"); return; }
        const message = messageOf(data, "");
        setStatus(response.status >= 500 || response.status === 429 ? "unavailable" : /déjà/i.test(message) ? "used" : /expir/i.test(message) ? "expired" : "invalid");
      } catch {
        if (!controller.signal.aborted) setStatus("unavailable");
      }
    })();
    return () => controller.abort();
  }, [token, retry]);

  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const addPhotos = (files: File[]) => {
    if (busy || !files.length) return;
    setError("");
    const room = FOLLOW_UP_MAX_PHOTOS - photos.length;
    if (room <= 0) { setError(`Vous pouvez ajouter ${FOLLOW_UP_MAX_PHOTOS} photos au maximum.`); return; }
    const valid: File[] = [];
    for (const file of files.slice(0, room)) {
      if (!PHOTO_TYPES.includes(file.type)) { setError("Choisissez des photos JPG, PNG ou WebP."); continue; }
      if (file.size > MAX_PHOTO) { setError("Chaque photo doit faire 8 Mo au maximum."); continue; }
      valid.push(file);
    }
    if (files.length > room) setError(`Vous pouvez ajouter ${FOLLOW_UP_MAX_PHOTOS} photos au maximum.`);
    if (valid.length) setPhotos((current) => [...current, ...valid]);
  };
  const removePhoto = (index: number) => { if (!busy) setPhotos((current) => current.filter((_, i) => i !== index)); };
  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => { addPhotos(Array.from(event.target.files ?? [])); event.target.value = ""; };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); addPhotos(Array.from(event.dataTransfer.files)); };

  const submit = async () => {
    if (busy || status !== "ready") return;
    if (!photos.length) { setError("Ajoutez au moins une photo pour envoyer votre suivi."); return; }
    if (!healing) { setError("Dites-nous comment se passe la cicatrisation."); return; }
    if (rating < 1) { setError("Choisissez une note de 1 à 5 étoiles."); return; }
    setError("");
    try {
      const urls: string[] = [];
      for (const file of photos) {
        let url = uploaded.current.get(file) ?? "";
        if (!url) {
          setStage("uploading");
          const compressed = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp", initialQuality: 0.85 });
          const result = await startUpload([compressed], { followUpToken: token });
          url = result?.[0]?.ufsUrl ?? result?.[0]?.url ?? "";
          if (!url) throw new Error("Une photo n’a pas pu être transférée. Réessayez : vos réponses sont conservées.");
          uploaded.current.set(file, url);
        }
        urls.push(url);
      }
      setStage("sending");
      const response = await fetch(`${apiBase}/follow-up/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, healingStatus: healing, review: review.trim() || undefined, photoUrls: urls, isPhotoPublic: publicPhoto }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        const message = messageOf(data, "L’envoi n’a pas abouti. Vos réponses sont conservées, vous pouvez réessayer.");
        if (/déjà/i.test(message)) { setStatus("used"); setStage("idle"); return; }
        if (/expir/i.test(message)) { setStatus("expired"); setStage("idle"); return; }
        throw new Error(message);
      }
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(userErrorMessage(err, "Impossible d’envoyer votre suivi. Réessayez dans un instant."));
      setStage("idle");
    }
  };

  const salon = appointment?.salonName || "votre salon";

  if (status === "loading")
    return <StateCard icon={<Loader2 size={22} className="animate-spin" />} title="Un instant…" text="Nous retrouvons votre suivi." />;

  if (stage === "done" || status === "used")
    return (
      <div className="space-y-4">
        <StateCard
          icon={<CheckCircle2 size={22} />}
          title={stage === "done" ? "Merci, votre suivi est envoyé !" : "Votre suivi a déjà été envoyé."}
          text={stage === "done" ? `Vos photos et votre retour ont bien été transmis à ${salon}. Le salon pourra vous répondre.` : "Ce lien a déjà servi : vous n’avez rien à renvoyer."}
        />
        {sessionStatus !== "authenticated" && <AccountCard salon={salon} />}
      </div>
    );

  if (status !== "ready")
    return (
      <StateCard
        icon={status === "expired" ? <Clock3 size={22} /> : <TriangleAlert size={22} />}
        title={status === "unavailable" ? "Le suivi est momentanément indisponible." : status === "expired" ? "Ce lien de suivi a expiré." : "Ce lien de suivi est introuvable."}
        text={status === "unavailable" ? "La connexion au service n’a pas abouti. Réessayez dans un instant : votre lien reste valable." : status === "expired" ? "Les liens de suivi sont valables 14 jours. Demandez-en un nouveau à votre salon." : "Vérifiez que le lien est complet, ou demandez à votre salon de vous le renvoyer."}
      >
        {status === "unavailable" && <AppButton type="button" onClick={() => { setStatus("loading"); setRetry((n) => n + 1); }} icon={<RefreshCw size={15} aria-hidden="true" />} className="mt-5 min-h-11! rounded-xl! px-5!">Réessayer</AppButton>}
      </StateCard>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      {/* Présentation */}
      <aside className="lg:sticky lg:top-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-tertiary-400">Après votre séance</p>
        <h1 className="mt-2 font-two text-3xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">Et depuis,<br />comment ça va ?</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/60">Quelques photos et deux questions suffisent : {salon === "votre salon" ? "votre salon suit" : `${salon} suit`} l’évolution de votre cicatrisation et peut vous conseiller.</p>
        {appointment?.title && (
          <div className={`${inset} mt-6 flex items-start gap-3 p-4`}>
            <span aria-hidden="true" className={iconBadge}><CalendarDays size={18} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{appointment.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-white/55">{[appointment.salonName, dateFr(appointment.start)].filter(Boolean).join(" · ")}</p>
              {appointment.artistName && <p className="text-xs leading-5 text-white/55">Avec {appointment.artistName}</p>}
            </div>
          </div>
        )}
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/45"><LockKeyhole size={14} aria-hidden="true" className="mt-0.5 shrink-0" />Aucun compte nécessaire. Vos photos restent privées, sauf si vous autorisez le salon à les partager.</p>
      </aside>

      {/* Formulaire */}
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="space-y-4" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-4">
          <section className={surface} aria-labelledby="followup-photo">
            <StepTitle n={1} id="followup-photo" title="Vos photos" text={`1 à ${FOLLOW_UP_MAX_PHOTOS} photos nettes et récentes, à la lumière du jour.`} />
            <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choisir des photos de suivi" onChange={onPhotoChange} />
            <div
              onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`mt-4 rounded-2xl transition ${dragging ? "bg-tertiary-400/10" : ""}`}
            >
              {photos.length === 0 ? (
                <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl bg-white/4 px-6 py-10 text-center transition hover:bg-white/6">
                  <span aria-hidden="true" className={iconBadge}><ImagePlus size={20} /></span>
                  <span className="text-sm font-semibold text-white">Ajouter mes photos</span>
                  <span className="text-xs leading-5 text-white/50">Touchez pour prendre ou choisir des photos, ou glissez-les ici.<br />JPG, PNG ou WebP · 8 Mo maximum par photo</span>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, index) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-white/4">
                      <img src={url} alt={`Photo de suivi ${index + 1}`} className="size-full object-cover" />
                      <button type="button" onClick={() => removePhoto(index)} aria-label={`Retirer la photo ${index + 1}`} className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-xl bg-noir-800/80 text-white backdrop-blur-sm transition hover:bg-noir-800"><X size={14} aria-hidden="true" /></button>
                    </div>
                  ))}
                  {photos.length < FOLLOW_UP_MAX_PHOTOS && (
                    <button type="button" onClick={() => inputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/4 text-xs text-white/60 transition hover:bg-white/8 hover:text-white">
                      <Plus size={20} aria-hidden="true" />Ajouter
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] text-white/40">{photos.length}/{FOLLOW_UP_MAX_PHOTOS} photo{photos.length > 1 ? "s" : ""}</p>
          </section>

          <section className={surface} aria-labelledby="followup-healing">
            <StepTitle n={2} id="followup-healing" title="Comment se passe la cicatrisation ?" text="Choisissez la réponse la plus proche." />
            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="État de la cicatrisation">
              {HEALING_OPTIONS.map((option) => {
                const active = healing === option.value;
                return (
                  <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => setHealing(option.value)} className={`flex items-start gap-3 rounded-2xl p-4 text-left ${choice(active)}`}>
                    <span className={active ? checkBadge : "grid size-5 shrink-0 place-items-center rounded-full bg-white/10"} aria-hidden="true">{active && <Check size={12} />}</span>
                    <span>
                      <span className="block text-sm font-medium text-white">{option.label}</span>
                      <span className={`mt-0.5 block text-xs leading-5 ${option.concern ? "text-amber-200/80" : "text-white/50"}`}>{option.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={surface} aria-labelledby="followup-rating">
            <StepTitle n={3} id="followup-rating" title="Votre satisfaction" text="Comment s’est passée votre expérience avec le salon ?" />
            <div className="mt-4 flex items-center gap-1.5" role="radiogroup" aria-label="Votre satisfaction">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} sur 5 : ${SATISFACTION[value]}`}
                  onClick={() => setRating(value)}
                  className={`grid size-12 place-items-center rounded-2xl ${choice(value <= rating)}`}
                >
                  <Star size={22} aria-hidden="true" className={value <= rating ? "text-tertiary-400" : ""} fill={value <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/55" aria-live="polite">{SATISFACTION[rating]}</p>
            <label htmlFor="followup-review" className={`${label} mt-5`}>Quelques mots pour votre salon <span className="text-white/35">(facultatif)</span></label>
            <textarea id="followup-review" rows={4} maxLength={5000} value={review} onChange={(event) => setReview(event.target.value)} placeholder="Comment se passe la cicatrisation ? Une question pour votre tatoueur ?" className={`${field()} resize-none py-3`} />
          </section>

          <section className={surface} aria-labelledby="followup-share">
            <StepTitle n={4} id="followup-share" title="Vos photos, votre choix" text="Le partage est facultatif." />
            <button type="button" role="checkbox" aria-checked={publicPhoto} onClick={() => setPublicPhoto((v) => !v)} className={`mt-4 flex w-full items-start gap-3 rounded-2xl p-4 text-left ${choice(publicPhoto)}`}>
              <span className={publicPhoto ? checkBadge : "grid size-5 shrink-0 place-items-center rounded-full bg-white/10"} aria-hidden="true">{publicPhoto && <Check size={12} />}</span>
              <span>
                <span className="block text-sm font-medium text-white">J’autorise le salon à partager ces photos</span>
                <span className="mt-1 block text-xs leading-5 text-white/55">Dans sa galerie ou ses réseaux. Sans votre accord, elles restent réservées à votre suivi.</span>
              </span>
            </button>
          </section>
        </fieldset>

        {error && <p role="alert" className="flex items-start gap-2 rounded-2xl bg-red-400/8 px-4 py-3 text-xs leading-5 text-red-300"><TriangleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0" />{error}</p>}
        <AppButton type="submit" fullWidth disabled={busy} icon={busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />} className="min-h-12! rounded-2xl!">
          {stage === "uploading" ? "Envoi des photos…" : stage === "sending" ? "Envoi de votre suivi…" : "Envoyer mon suivi"}
        </AppButton>
      </form>
    </div>
  );
}

function StepTitle({ n, id, title, text }: { n: number; id: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-tertiary-400 to-tertiary-500 text-xs font-bold text-white">{n}</span>
      <div>
        <h2 id={id} className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-white/50">{text}</p>
      </div>
    </div>
  );
}

function StateCard({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return (
    <section className={`${surface} mx-auto max-w-xl text-center`} aria-live="polite">
      <span aria-hidden="true" className={`${iconBadge} mx-auto`}>{icon}</span>
      <h1 className="mt-4 font-two text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm leading-7 text-white/60">{text}</p>
      {children}
    </section>
  );
}

/** Après l'envoi, sans compte : proposer Inkera People (rendez-vous, messagerie, moodboards). */
function AccountCard({ salon }: { salon: string }) {
  return (
    <section className={`${surface} mx-auto max-w-xl`} aria-labelledby="followup-account">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={iconBadge}><MessageCircle size={18} /></span>
        <div>
          <h2 id="followup-account" className="text-base font-semibold text-white">Gardez le lien avec {salon}</h2>
          <p className="mt-0.5 text-xs leading-5 text-white/55">Avec votre compte Inkera, gratuit :</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {CLIENT_BENEFITS.map(({ Icon, title, short }) => (
          <li key={title} className="flex gap-2.5"><Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-tertiary-400" /><div><p className="text-xs font-medium text-white/90">{title}</p><p className="text-[11px] leading-5 text-white/55">{short}</p></div></li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        <AppButton href="/creer-un-compte" icon={<ArrowUpRight size={15} aria-hidden="true" />} className="min-h-11! rounded-xl! px-5!">Créer mon compte</AppButton>
        <AppButton href="/se-connecter" variant="secondary" className="min-h-11! rounded-xl! border-0! bg-white/6! px-5! hover:bg-white/10!">Me connecter</AppButton>
      </div>
    </section>
  );
}
