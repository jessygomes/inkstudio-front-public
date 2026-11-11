"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from "next-auth/react";
import {
  AlertTriangle, ArrowRight, CalendarCheck2, CalendarDays, CalendarSearch, Check, ChevronLeft, ChevronRight,
  Clock3, Hourglass, Info, LinkIcon, LoaderCircle, LogIn, MapPin, UserRound,
} from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import { focusRing, iconBadge, inset, surface } from "@/components/Shared/ui";
import Section from "@/components/RDV/Booking/Section";
import TextInput from "@/components/RDV/Booking/TextInput";
import SkinToneSelect from "@/components/RDV/Booking/SkinToneSelect";
import type { SkinToneOption, SkinToneValue } from "@/components/RDV/Booking/types";
import { getSkinTones } from "@/lib/actions/appointment.action";
import { confirmBookingLink, getBookingLinkAvailability, getBookingLinkPublic } from "@/lib/actions/bookingLink.action";
import {
  type ApiResult,
  type BookingLinkAvailability,
  type BookingLinkConfirmation,
  type BookingLinkPublicInfo,
  type TerminalLinkCode,
  BOOKING_TIME_ZONE,
  PRESTATION_LABELS,
  SAME_DAY_BOOKING_MESSAGE,
  addDaysToDateKey,
  clearAuthReturnPath,
  formatDateKey,
  formatDurationMinutes,
  getParisTodayKey,
  isDateKey,
  isTerminalLinkCode,
  peekAuthReturnPath,
  setAuthReturnPath,
  terminalCodeFromHttp,
  terminalCodeFromStatus,
} from "@/lib/booking-link";
import { getDateKeyInTimeZone, getTimeInTimeZone, toHourLabel } from "@/lib/utils/date";

export type BookingLinkViewer =
  | { state: "anonymous" }
  | { state: "expired" }
  | { state: "authenticated"; role: string; firstName: string; lastName: string; email: string; phone: string; birthDate: string };

type InitialError = { status: number; code?: string; retryAfterSeconds?: number } | null;

type Props = { token: string; info: BookingLinkPublicInfo | null; initialError: InitialError; viewer: BookingLinkViewer };

type TerminalKind = TerminalLinkCode | "ASSOCIATION_CHANGED";
type Banner = { tone: "error" | "info"; text: string; messages?: string[]; action?: "login" | "switch-account" };

const SKIN_VALUES = ["tres_claire", "claire", "claire_moyenne", "mate", "foncee", "tres_foncee"] as const satisfies readonly SkinToneValue[];
const SKIN_LABELS: Record<SkinToneValue, string> = { tres_claire: "Très claire", claire: "Claire", claire_moyenne: "Claire à moyenne", mate: "Mate", foncee: "Foncée", tres_foncee: "Très foncée" };
// Utilisé seulement si la liste du backend est indisponible, pour ne pas bloquer la réservation.
const FALLBACK_SKIN_TONES: SkinToneOption[] = [
  { value: "tres_claire", label: SKIN_LABELS.tres_claire, previewHex: "#f6e0d1" },
  { value: "claire", label: SKIN_LABELS.claire, previewHex: "#eac7ab" },
  { value: "claire_moyenne", label: SKIN_LABELS.claire_moyenne, previewHex: "#d6a881" },
  { value: "mate", label: SKIN_LABELS.mate, previewHex: "#b98260" },
  { value: "foncee", label: SKIN_LABELS.foncee, previewHex: "#8a5a3c" },
  { value: "tres_foncee", label: SKIN_LABELS.tres_foncee, previewHex: "#5a3a26" },
];

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100, "Prénom trop long"),
  lastName: z.string().trim().min(1, "Nom requis").max(100, "Nom trop long"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().max(20, "Numéro trop long").refine(value => !value || value.replace(/\D/g, "").length >= 10, "Numéro de téléphone incomplet"),
  birthDate: z.string().refine(value => !value || isDateKey(value), "Date invalide"),
  skin: z.enum(SKIN_VALUES, { error: "Choisissez votre teinte de peau" }),
});
type FormValues = z.input<typeof schema>;

const TERMINAL_COPY: Record<TerminalKind, { title: string; text: string }> = {
  BOOKING_LINK_NOT_FOUND: { title: "Ce lien de réservation est invalide", text: "Vérifiez que vous avez copié le lien en entier, ou demandez un nouveau lien à votre tatoueur." },
  BOOKING_LINK_USED: { title: "Ce lien a déjà été utilisé", text: "Une réservation a déjà été effectuée avec ce lien. Si c’est vous, retrouvez-la dans vos rendez-vous ou dans l’email de confirmation." },
  BOOKING_LINK_EXPIRED: { title: "Ce lien a expiré", text: "La période de réservation de ce lien est terminée. Contactez votre tatoueur pour recevoir un nouveau lien." },
  BOOKING_LINK_REVOKED: { title: "Ce lien n’est plus actif", text: "Le professionnel a désactivé ce lien. Contactez-le pour convenir d’un rendez-vous." },
  ASSOCIATION_CHANGED: { title: "Ce lien doit être renouvelé", text: "Les informations liées à cette réservation ont changé. Demandez un nouveau lien au professionnel." },
};

function formatTime(iso: string, timeZone: string) {
  return toHourLabel(getTimeInTimeZone(iso, timeZone));
}

function formatExpiry(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  const day = new Intl.DateTimeFormat("fr-FR", { timeZone: BOOKING_TIME_ZONE, day: "numeric", month: "long", year: "numeric" }).format(date);
  return `${day} à ${toHourLabel(getTimeInTimeZone(date, BOOKING_TIME_ZONE))}`;
}

function goToLogin() {
  // Le chemin de retour est stocké hors URL : l'URL de connexion ne contient jamais le token.
  setAuthReturnPath(window.location.pathname);
  // Navigation complète voulue : la page suivante ne conserve aucun état lié au token.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/se-connecter");
}

export default function BookingLinkFlow({ token, info: initialInfo, initialError, viewer }: Props) {
  const initialTerminal: TerminalKind | null = initialError
    ? (isTerminalLinkCode(initialError.code) ? initialError.code : terminalCodeFromHttp(initialError.status))
    : null;
  const [info] = useState(initialInfo);
  const [terminal, setTerminal] = useState<TerminalKind | null>(initialTerminal);
  const [phase, setPhase] = useState<"booking" | "done" | "uncertain">("booking");
  const [confirmation, setConfirmation] = useState<BookingLinkConfirmation["appointment"] | null>(null);

  useEffect(() => {
    if (peekAuthReturnPath() === window.location.pathname) clearAuthReturnPath();
  }, []);

  if (terminal) return <TerminalState kind={terminal} info={info} viewer={viewer} />;

  if (!info) {
    const retry = initialError?.status === 429 ? `Trop de tentatives. Réessayez dans ${initialError.retryAfterSeconds ?? 60} secondes.` : "Le service de réservation ne répond pas pour le moment. Réessayez dans quelques instants.";
    return (
      <StatusCard icon={<AlertTriangle size={22} />} title="Réservation momentanément indisponible" text={retry}>
        <AppButton type="button" variant="secondary" onClick={() => window.location.reload()} className="px-3! py-2! text-xs! shadow-none!">Réessayer</AppButton>
      </StatusCard>
    );
  }

  if (phase === "done" && confirmation) return <SuccessState info={info} appointment={confirmation} viewer={viewer} />;

  if (phase === "uncertain") {
    return <UncertainState token={token} info={info} viewer={viewer} onStillActive={() => setPhase("booking")} onTerminal={setTerminal} />;
  }

  return (
    <BookingForm
      token={token}
      info={info}
      viewer={viewer}
      onTerminal={setTerminal}
      onConfirmed={appointment => { setConfirmation(appointment); setPhase("done"); window.scrollTo({ top: 0 }); }}
      onUncertain={() => { setPhase("uncertain"); window.scrollTo({ top: 0 }); }}
    />
  );
}

// ---------------------------------------------------------------------------
// Formulaire principal
// ---------------------------------------------------------------------------

function BookingForm({ token, info, viewer, onTerminal, onConfirmed, onUncertain }: {
  token: string;
  info: BookingLinkPublicInfo;
  viewer: BookingLinkViewer;
  onTerminal: (kind: TerminalKind) => void;
  onConfirmed: (appointment: BookingLinkConfirmation["appointment"]) => void;
  onUncertain: () => void;
}) {
  const timeZone = info.timeZone || BOOKING_TIME_ZONE;
  const isFixed = info.mode === "FIXED_START";
  const authenticated = viewer.state === "authenticated";
  const needsLogin = info.requiresAuthentication && !authenticated;

  // Fenêtre réservable : du premier jour autorisé (au plus tôt aujourd'hui, Europe/Paris) jusqu'à allowedTo.
  const today = useMemo(() => getParisTodayKey(), []);
  const earliest = info.allowSameDayBooking === false ? addDaysToDateKey(today, 1) : today;
  const firstDay = isDateKey(info.allowedFrom) && info.allowedFrom > earliest ? info.allowedFrom : earliest;
  const lastDay = isDateKey(info.allowedTo) ? info.allowedTo : firstDay;
  const hasWindow = firstDay <= lastDay;

  const [weekStart, setWeekStart] = useState(firstDay);
  const weekEnd = useMemo(() => { const end = addDaysToDateKey(weekStart, 6); return end > lastDay ? lastDay : end; }, [weekStart, lastDay]);
  const [reloadKey, setReloadKey] = useState(0);
  // Chaque requête de disponibilités est identifiée : tant que sa réponse n'est pas arrivée, la semaine est « en chargement ».
  const requestKey = `${weekStart}|${weekEnd}|${reloadKey}`;
  const [slotsResult, setSlotsResult] = useState<{ key: string; dates: BookingLinkAvailability["dates"]; error: string | null } | null>(null);
  const currentSlots = slotsResult?.key === requestKey ? slotsResult : null;
  const loadingSlots = hasWindow && !currentSlots;
  const availability = useMemo(() => currentSlots?.dates ?? [], [currentSlots]);
  const slotsError = currentSlots?.error ?? null;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [banner, setBanner] = useState<Banner | null>(viewer.state === "expired" ? { tone: "info", text: "Votre session a expiré. Reconnectez-vous pour réserver avec votre compte, ou continuez sans compte.", action: "login" } : null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [skinTones, setSkinTones] = useState<SkinToneOption[]>([]);
  const [loadingSkinTones, setLoadingSkinTones] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      firstName: viewer.state === "authenticated" ? viewer.firstName : "",
      lastName: viewer.state === "authenticated" ? viewer.lastName : "",
      email: viewer.state === "authenticated" ? viewer.email : "",
      phone: viewer.state === "authenticated" ? viewer.phone : "",
      birthDate: viewer.state === "authenticated" ? viewer.birthDate : "",
      skin: undefined,
    },
  });

  // Limitation de débit : compte à rebours jusqu'à la prochaine tentative autorisée.
  useEffect(() => {
    if (!retryUntil) return;
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= retryUntil) setRetryUntil(null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryUntil]);
  const retrySeconds = retryUntil ? Math.max(0, Math.ceil((retryUntil - now) / 1000)) : 0;

  useEffect(() => {
    let active = true;
    getSkinTones()
      .then(result => {
        if (!active) return;
        const data = result.ok && Array.isArray(result.data) ? (result.data as SkinToneOption[]) : [];
        const known = data.filter(option => (SKIN_VALUES as readonly string[]).includes(option.value)).map(option => ({ ...option, label: SKIN_LABELS[option.value] || option.label }));
        setSkinTones(known.length ? known : FALLBACK_SKIN_TONES);
      })
      .catch(() => { if (active) setSkinTones(FALLBACK_SKIN_TONES); })
      .finally(() => { if (active) setLoadingSkinTones(false); });
    return () => { active = false; };
  }, []);

  const handleRateLimit = useCallback((seconds?: number) => {
    const wait = seconds && seconds > 0 ? seconds : 60;
    setRetryUntil(Date.now() + wait * 1000);
    setNow(Date.now());
    return wait;
  }, []);

  // Disponibilités : une semaine (7 dates civiles max) à la fois.
  useEffect(() => {
    if (!hasWindow) return;
    let active = true;
    const [from, to] = requestKey.split("|");
    const failed = (error: string) => { if (active) setSlotsResult({ key: requestKey, dates: [], error }); };
    getBookingLinkAvailability(token, from, to)
      .then((result: ApiResult<BookingLinkAvailability>) => {
        if (!active) return;
        if (result.ok) {
          const dates = result.data.dates
            .filter(entry => isDateKey(entry.date) && entry.date >= firstDay && entry.date <= lastDay && Array.isArray(entry.slots) && entry.slots.length > 0)
            .map(entry => ({ ...entry, slots: [...entry.slots].sort((a, b) => Date.parse(a.start) - Date.parse(b.start)) }));
          setSlotsResult({ key: requestKey, dates, error: null });
          return;
        }
        const terminalCode = isTerminalLinkCode(result.code) ? result.code : terminalCodeFromHttp(result.status);
        if (terminalCode) { onTerminal(terminalCode); return; }
        if (result.status === 429) { const wait = handleRateLimit(result.retryAfterSeconds); failed(`Trop de demandes. Réessayez dans ${wait} secondes.`); return; }
        failed("Impossible de charger les disponibilités pour le moment.");
      })
      .catch(() => failed("Impossible de charger les disponibilités pour le moment."));
    return () => { active = false; };
  }, [token, requestKey, firstDay, lastDay, hasWindow, onTerminal, handleRateLimit]);

  const availableByDate = useMemo(() => new Map(availability.map(entry => [entry.date, entry.slots])), [availability]);
  const weekDays = useMemo(() => {
    const days: string[] = [];
    for (let day = weekStart; day <= weekEnd; day = addDaysToDateKey(day, 1)) days.push(day);
    return days;
  }, [weekStart, weekEnd]);
  // Sélection dérivée des disponibilités chargées : un créneau disparu après rechargement n'est plus sélectionné.
  const selectedSlots = selectedDate ? availableByDate.get(selectedDate) ?? [] : [];

  const changeWeek = (next: string) => {
    setSelectedDate(null);
    setSelectedStart(null);
    setWeekStart(next);
  };

  const chooseDate = (date: string) => {
    const slots = availableByDate.get(date);
    if (!slots?.length) return;
    setBanner(current => (current?.action ? current : null));
    setSelectedDate(date);
    // Heure fixe : la date suffit, on retient le start de l'unique créneau du jour.
    setSelectedStart(isFixed ? slots[0].start : null);
  };

  const reloadAfterConflict = (text: string) => {
    setSelectedStart(null);
    setSelectedDate(null);
    setBanner({ tone: "error", text });
    setReloadKey(key => key + 1);
  };

  const showBanner = (next: Banner) => {
    setBanner(next);
    requestAnimationFrame(() => bannerRef.current?.focus());
  };

  const onValid = async (values: FormValues) => {
    if (submittingRef.current || retrySeconds > 0) return;
    if (needsLogin) { showBanner({ tone: "info", text: "Connectez-vous avec le compte destinataire pour confirmer.", action: "login" }); return; }
    const slot = selectedSlots.find(item => item.start === selectedStart);
    if (!selectedDate || !slot) { showBanner({ tone: "error", text: isFixed ? "Choisissez une date." : "Choisissez une date et une heure." }); return; }

    submittingRef.current = true;
    setSubmitting(true);
    setBanner(null);
    let result: ApiResult<BookingLinkConfirmation>;
    try {
      result = await confirmBookingLink(token, {
        start: slot.start,
        rdvBody: {
          clientFirstname: values.firstName.trim(),
          clientLastname: values.lastName.trim(),
          clientEmail: values.email.trim(),
          clientPhone: values.phone?.trim() || undefined,
          clientBirthdate: values.birthDate || undefined,
          skin: values.skin as string,
        },
      });
    } catch {
      result = { ok: false, status: 0 };
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }

    if (result.ok) { onConfirmed(result.data.appointment); return; }

    const { status, code } = result;
    // Aucune réponse ou erreur serveur : la réservation a pu être enregistrée, on ne suppose pas un échec.
    if (status === 0 || status === 500 || status === 502 || status === 504) { onUncertain(); return; }
    if (code === "ASSOCIATION_CHANGED") { onTerminal("ASSOCIATION_CHANGED"); return; }
    const terminalCode = isTerminalLinkCode(code) ? code : terminalCodeFromHttp(status);
    if (terminalCode) { onTerminal(terminalCode); return; }

    switch (code) {
      case "SLOT_UNAVAILABLE": reloadAfterConflict("Ce créneau vient d’être réservé. Les disponibilités ont été mises à jour : choisissez un autre horaire."); return;
      case "SAME_DAY_BOOKING_DISABLED": reloadAfterConflict(`${SAME_DAY_BOOKING_MESSAGE}. Choisissez une autre date.`); return;
      case "BOOKING_CLIENT_MISMATCH": showBanner({ tone: "error", text: "Ce lien est réservé à un autre destinataire. Connectez-vous avec le compte dont l’adresse email vérifiée correspond à l’invitation.", action: authenticated ? "switch-account" : "login" }); return;
      case "BOOKING_LINK_FORBIDDEN":
      case "BOOKING_PROFILE_UNAVAILABLE": showBanner({ tone: "error", text: "La réservation n’est pas disponible pour le moment. Contactez le professionnel." }); return;
      case "CLIENT_LINK_REQUIRED": showBanner({ tone: "error", text: "Le professionnel doit d’abord confirmer le rattachement de votre fiche client. Contactez-le pour finaliser votre réservation." }); return;
    }
    if (status === 401 || code === "SESSION_EXPIRED") { showBanner({ tone: "info", text: "Votre session a expiré. Reconnectez-vous pour confirmer la réservation.", action: "login" }); return; }
    if (status === 403) { showBanner({ tone: "error", text: "La réservation n’est pas disponible pour le moment. Contactez le professionnel." }); return; }
    if (status === 429) { const wait = handleRateLimit(result.retryAfterSeconds); showBanner({ tone: "error", text: `Trop de tentatives. Réessayez dans ${wait} secondes.` }); return; }
    if (status === 503) { showBanner({ tone: "error", text: "Le service est momentanément indisponible. Réessayez dans quelques instants." }); return; }
    if (code === "INVALID_AVAILABILITY_WINDOW" || code === "INVALID_DATE") { reloadAfterConflict("Ce créneau n’est plus valide. Choisissez un autre horaire."); return; }
    if (status === 400) { showBanner({ tone: "error", text: "Certaines informations ne sont pas valides. Vérifiez votre saisie.", messages: result.messages ?? (result.message ? [result.message] : undefined) }); return; }
    showBanner({ tone: "error", text: result.message || "La réservation n’a pas pu être confirmée. Réessayez." });
  };
  const onInvalid = () => showBanner({ tone: "error", text: "Vérifiez les champs indiqués avant de confirmer." });

  const continueAsGuest = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };
  const switchAccount = async () => {
    setAuthReturnPath(window.location.pathname);
    await signOut({ redirect: false });
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/se-connecter");
  };

  const selectedSlot = selectedSlots.find(slot => slot.start === selectedStart);
  const canConfirm = !!selectedSlot && !submitting && !needsLogin && retrySeconds === 0;

  return (
    <FormProvider {...methods}>
      <div className="grid items-start gap-6 font-one lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
        <div className="lg:order-last"><LinkSummary info={info} /></div>

        <form noValidate onSubmit={event => { void methods.handleSubmit(onValid, onInvalid)(event); }} className="min-w-0 space-y-5">
          <header>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-tertiary-400">Lien de réservation personnel</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Choisissez votre rendez-vous</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">{isFixed ? `Sélectionnez une date : la séance débute à l’heure fixée par ${info.professional.name}.` : "Sélectionnez une date puis l’heure qui vous convient."}</p>
          </header>

          <Section title={isFixed ? "Votre date" : "Votre date et votre heure"} description={`${formatDateKey(firstDay, { day: "numeric", month: "long" })} – ${formatDateKey(lastDay, { day: "numeric", month: "long", year: "numeric" })} · heure de Paris`} icon={<CalendarDays size={17} />}>
            {!hasWindow ? (
              <EmptyState title="Aucune date réservable" text="La période de ce lien ne contient plus de date disponible. Contactez le professionnel." />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">Semaine du {formatDateKey(weekStart, { day: "numeric", month: "long" })}</p>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Semaine précédente" disabled={weekStart <= firstDay || loadingSlots} onClick={() => { const prev = addDaysToDateKey(weekStart, -7); changeWeek(prev < firstDay ? firstDay : prev); }} className={`grid size-9 place-items-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-20 ${focusRing}`}><ChevronLeft size={15} /></button>
                    <button type="button" aria-label="Semaine suivante" disabled={addDaysToDateKey(weekStart, 7) > lastDay || loadingSlots} onClick={() => changeWeek(addDaysToDateKey(weekStart, 7))} className={`grid size-9 place-items-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-20 ${focusRing}`}><ChevronRight size={15} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7" aria-busy={loadingSlots}>
                  {weekDays.map(day => {
                    const available = !loadingSlots && (availableByDate.get(day)?.length ?? 0) > 0;
                    const active = selectedDate === day;
                    return (
                      <button key={day} type="button" disabled={!available} aria-pressed={active} aria-label={`${formatDateKey(day, { weekday: "long", day: "numeric", month: "long" })}${available ? "" : ", indisponible"}`} onClick={() => chooseDate(day)}
                        className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-3 transition disabled:cursor-not-allowed ${focusRing} ${active ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900 shadow-lg shadow-tertiary-500/20" : available ? "bg-white/4 text-white/80 hover:bg-white/8" : "bg-white/1.5 text-white/20"}`}>
                        <span className="text-[9px] capitalize">{formatDateKey(day, { weekday: "short" }).replace(".", "")}</span>
                        <span className="text-base font-semibold tabular-nums">{Number(day.slice(8, 10))}</span>
                        <span className="text-[9px] capitalize">{formatDateKey(day, { month: "short" }).replace(".", "")}</span>
                      </button>
                    );
                  })}
                </div>

                <div aria-live="polite">
                  {loadingSlots ? (
                    <p role="status" className="flex items-center gap-2 text-xs text-white/45"><LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" />Recherche des disponibilités…</p>
                  ) : slotsError ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-400/10 p-4 text-xs text-red-200"><span>{slotsError}</span><AppButton type="button" variant="secondary" disabled={retrySeconds > 0} onClick={() => setReloadKey(key => key + 1)} className="px-2.5! py-1.5! text-[11px]! shadow-none!">Réessayer</AppButton></div>
                  ) : availability.length === 0 ? (
                    <EmptyState title="Aucune disponibilité cette semaine" text={addDaysToDateKey(weekStart, 7) <= lastDay ? "Consultez la semaine suivante." : "Il n’y a plus de disponibilité sur la période de ce lien. Contactez le professionnel."}>
                      {addDaysToDateKey(weekStart, 7) <= lastDay && <AppButton type="button" variant="secondary" onClick={() => changeWeek(addDaysToDateKey(weekStart, 7))} className="px-3! py-1.5! text-[11px]! shadow-none!">Semaine suivante<ChevronRight size={13} /></AppButton>}
                    </EmptyState>
                  ) : !selectedDate || selectedDate < weekStart || selectedDate > weekEnd ? (
                    <p className="text-xs text-white/45">{availability.length} date{availability.length > 1 ? "s" : ""} disponible{availability.length > 1 ? "s" : ""} cette semaine. Choisissez un jour.</p>
                  ) : isFixed ? null : (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90"><Clock3 size={15} className="text-tertiary-400" /><span className="capitalize">{formatDateKey(selectedDate)}</span></h3>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {selectedSlots.map(slot => {
                          const active = slot.start === selectedStart;
                          return <button key={slot.start} type="button" aria-pressed={active} onClick={() => { setSelectedStart(slot.start); setBanner(current => (current?.action ? current : null)); }} className={`flex min-h-12 items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-semibold tabular-nums transition ${focusRing} ${active ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900 shadow-lg shadow-tertiary-500/20" : "bg-white/4 text-white/85 hover:bg-white/8"}`}>{active && <Check size={12} />}{formatTime(slot.start, timeZone)}</button>;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedSlot && (
                  <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-tertiary-400/15 to-cuatro-500/10 p-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900"><Check size={15} /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium capitalize text-white/90">{formatDateKey(getDateKeyInTimeZone(selectedSlot.start, timeZone))}</p>
                      <p className="mt-1 text-[11px] tabular-nums text-white/55">{formatTime(selectedSlot.start, timeZone)} – {formatTime(selectedSlot.end, timeZone)} · {formatDurationMinutes(info.durationMinutes)}</p>
                    </div>
                  </div>
                )}
                {info.allowSameDayBooking === false && <p className="text-[11px] text-white/40">{SAME_DAY_BOOKING_MESSAGE}.</p>}
              </div>
            )}
          </Section>

          <Section title="Vos coordonnées" description={needsLogin ? "Ce lien est réservé à un compte client précis." : "Le professionnel utilisera ces informations pour votre rendez-vous. Les champs marqués d’un * sont obligatoires."} icon={<UserRound size={17} />}>
            {needsLogin ? (
              <div className="space-y-3">
                <p className="text-xs leading-6 text-white/60">Connectez-vous avec le compte auquel ce lien est destiné (adresse email vérifiée) pour confirmer votre rendez-vous. Vous reviendrez ensuite sur cette page.</p>
                <AppButton type="button" onClick={goToLogin} icon={<LogIn size={14} />} className="px-3.5! py-2.5! text-xs! shadow-none!">Se connecter</AppButton>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput name="firstName" label="Prénom" placeholder="Votre prénom" required autoComplete="given-name" />
                  <TextInput name="lastName" label="Nom" placeholder="Votre nom" required autoComplete="family-name" />
                  <TextInput name="email" label="Adresse email" placeholder="vous@exemple.fr" type="email" required autoComplete="email" />
                  <TextInput name="phone" label="Téléphone" placeholder="06 12 34 56 78" type="tel" autoComplete="tel" hint="Facultatif" />
                  <TextInput name="birthDate" label="Date de naissance" type="date" autoComplete="bday" hint="Facultatif" max={getParisTodayKey()} />
                </div>
                {authenticated && <p className="flex items-center gap-2 text-[11px] text-white/40"><Check size={12} className="text-tertiary-400" />Vos coordonnées sont préremplies depuis votre compte, dont l’identité sera utilisée pour la réservation.</p>}
                <SkinToneSelect name="skin" label="Votre teinte de peau" options={skinTones} loading={loadingSkinTones} helperText="Cette information aide l’artiste à préparer votre séance." />
              </div>
            )}
          </Section>

          {banner && (
            <div ref={bannerRef} tabIndex={-1} role="alert" className={`flex flex-col gap-3 rounded-2xl p-4 text-xs leading-5 outline-none sm:flex-row sm:items-start ${banner.tone === "error" ? "bg-red-400/10 text-red-200" : "bg-linear-to-r from-tertiary-400/12 to-cuatro-500/8 text-white/80"}`}>
              <Info size={15} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p>{banner.text}</p>
                {!!banner.messages?.length && <ul className="mt-1 list-disc pl-4">{banner.messages.map(message => <li key={message}>{message}</li>)}</ul>}
              </div>
              {banner.action === "login" && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <AppButton type="button" variant="secondary" onClick={goToLogin} className="px-2.5! py-1.5! text-[11px]! shadow-none!">Se connecter</AppButton>
                  {viewer.state === "expired" && !info.requiresAuthentication && <AppButton type="button" variant="secondary" onClick={continueAsGuest} className="px-2.5! py-1.5! text-[11px]! shadow-none!">Continuer sans compte</AppButton>}
                </div>
              )}
              {banner.action === "switch-account" && <AppButton type="button" variant="secondary" onClick={switchAccount} className="shrink-0 px-2.5! py-1.5! text-[11px]! shadow-none!">Changer de compte</AppButton>}
            </div>
          )}

          <footer className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-noir-500/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <span className="px-3 text-[11px] text-white/50">{selectedSlot ? `${formatDateKey(getDateKeyInTimeZone(selectedSlot.start, timeZone), { weekday: "short", day: "numeric", month: "short" })} · ${formatTime(selectedSlot.start, timeZone)}` : "Aucun horaire choisi"}</span>
            <AppButton type="submit" disabled={!canConfirm} className="ml-auto rounded-xl! px-5! py-2.5! text-xs! font-medium hover:translate-y-0!">
              {submitting ? <><LoaderCircle size={14} className="animate-spin" />Confirmation…</> : retrySeconds > 0 ? `Réessayer dans ${retrySeconds} s` : <>Confirmer le rendez-vous<Check size={14} /></>}
            </AppButton>
          </footer>
        </form>
      </div>
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------
// Composants d'affichage
// ---------------------------------------------------------------------------

function Avatar({ src, name, size = 44 }: { src: string | null; name: string; size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8 text-base text-white/50" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : <span aria-hidden="true">{name.trim().charAt(0).toUpperCase() || "?"}</span>}
    </span>
  );
}

function LinkSummary({ info }: { info: BookingLinkPublicInfo }) {
  const { professional, artist } = info;
  const location = [professional.address, [professional.postalCode, professional.city].filter(Boolean).join(" ")].filter(Boolean);
  const expiry = info.expiresAt ? formatExpiry(info.expiresAt) : null;
  return (
    <aside aria-label="Votre rendez-vous" className="space-y-4 rounded-3xl bg-noir-500 p-5 lg:sticky lg:top-24">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">Vous avez rendez-vous chez</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar src={professional.image} name={professional.name} />
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold tracking-tight text-white">{professional.name}</h2>
            {professional.city && <p className="mt-0.5 text-xs text-white/40">{professional.city}</p>}
          </div>
        </div>
      </div>
      {artist?.name && (
        <div className={`flex items-center gap-3 ${inset} p-3`}>
          <Avatar src={artist.image} name={artist.name} size={36} />
          <div className="min-w-0"><p className="text-[10px] text-white/40">Avec</p><p className="truncate text-sm text-white/85">{artist.name}</p></div>
        </div>
      )}
      <dl className={`space-y-2.5 ${inset} p-4 text-xs`}>
        <div className="flex items-center justify-between gap-3"><dt className="text-white/40">Prestation</dt><dd className="text-white/85">{PRESTATION_LABELS[info.prestation] || info.prestation}</dd></div>
        <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-1.5 text-white/40"><Clock3 size={12} />Durée</dt><dd className="tabular-nums text-white/85">{formatDurationMinutes(info.durationMinutes)}</dd></div>
        {info.mode === "FIXED_START" && info.fixedStartTime && <div className="flex items-center justify-between gap-3"><dt className="text-white/40">Début de séance</dt><dd className="tabular-nums text-white/85">{toHourLabel(info.fixedStartTime)}</dd></div>}
      </dl>
      {location.length > 0 && <p className="flex gap-2 px-1 text-[11px] leading-5 text-white/60"><MapPin size={14} className="mt-0.5 shrink-0 text-tertiary-400" /><span>{location.map(line => <span key={line} className="block">{line}</span>)}</span></p>}
      {expiry && <p className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-tertiary-400/12 to-cuatro-500/8 p-3 text-[11px] text-white/70"><Hourglass size={13} className="shrink-0 text-tertiary-400" />Lien valable jusqu’au {expiry}</p>}
    </aside>
  );
}

function EmptyState({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div role="status" className={`flex flex-col items-center gap-2 ${inset} p-6 text-center`}>
      <CalendarSearch size={23} className="text-white/25" />
      <p className="text-xs font-medium text-white/80">{title}</p>
      <p className="text-[11px] leading-5 text-white/45">{text}</p>
      {children}
    </div>
  );
}

function StatusCard({ icon, title, text, tone = "neutral", children }: { icon: React.ReactNode; title: string; text: string; tone?: "neutral" | "success" | "warning"; children?: React.ReactNode }) {
  const toneClass = tone === "success" ? "bg-linear-to-br from-tertiary-400 via-tertiary-500 to-cuatro-500 text-white shadow-xl shadow-tertiary-500/25" : tone === "warning" ? "bg-amber-400/15 text-amber-300" : iconBadge;
  return (
    <section className={`mx-auto max-w-xl ${surface} font-one sm:p-8`}>
      <div>
        <span className={`mb-5 grid size-14! place-items-center rounded-2xl ${toneClass}`}>{icon}</span>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

function ExitLink({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  // Navigation complète : la page suivante ne garde aucune trace de cette URL.
  return <a href={href} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-tertiary-400 ${primary ? "bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/20 hover:brightness-110" : "bg-white/6 text-white/80 hover:bg-white/10 hover:text-white"}`}>{children}</a>;
}

function TerminalState({ kind, info, viewer }: { kind: TerminalKind; info: BookingLinkPublicInfo | null; viewer: BookingLinkViewer }) {
  const copy = TERMINAL_COPY[kind];
  const professional = kind !== "BOOKING_LINK_USED" && info?.professional.name ? ` Professionnel : ${info.professional.name}.` : "";
  return (
    <StatusCard icon={kind === "BOOKING_LINK_USED" ? <CalendarCheck2 size={22} /> : <LinkIcon size={22} />} title={copy.title} text={copy.text + professional} tone={kind === "BOOKING_LINK_USED" ? "neutral" : "warning"}>
      {kind === "BOOKING_LINK_USED" && viewer.state === "authenticated" && <ExitLink href="/mon-profil" primary>Mes rendez-vous<ArrowRight size={14} /></ExitLink>}
      <ExitLink href="/">Retour à l’accueil</ExitLink>
    </StatusCard>
  );
}

function SuccessState({ info, appointment, viewer }: { info: BookingLinkPublicInfo; appointment: BookingLinkConfirmation["appointment"]; viewer: BookingLinkViewer }) {
  const timeZone = info.timeZone || BOOKING_TIME_ZONE;
  const day = formatDateKey(getDateKeyInTimeZone(appointment.start, timeZone));
  return (
    <StatusCard tone="success" icon={<Check size={24} />} title="Votre rendez-vous est confirmé." text={`C’est noté ! ${PRESTATION_LABELS[appointment.prestation] || "Votre rendez-vous"} chez ${info.professional.name}${info.artist?.name ? ` avec ${info.artist.name}` : ""}, le ${day} de ${formatTime(appointment.start, timeZone)} à ${formatTime(appointment.end, timeZone)} (heure de Paris). Un email récapitulatif vous sera envoyé.`}>
      {viewer.state === "authenticated" && <ExitLink href="/mon-profil" primary>Mes rendez-vous<ArrowRight size={14} /></ExitLink>}
      <ExitLink href="/">Retour à l’accueil</ExitLink>
    </StatusCard>
  );
}

function UncertainState({ token, info, viewer, onStillActive, onTerminal }: { token: string; info: BookingLinkPublicInfo; viewer: BookingLinkViewer; onStillActive: () => void; onTerminal: (kind: TerminalKind) => void }) {
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const check = async () => {
    setChecking(true);
    setNote(null);
    try {
      const result = await getBookingLinkPublic(token);
      if (result.ok) {
        const code = terminalCodeFromStatus(result.data.status);
        if (code === "BOOKING_LINK_USED") { setNote("Ce lien a bien été utilisé : votre rendez-vous a très probablement été enregistré. Consultez vos emails ou vos rendez-vous."); return; }
        if (code) { onTerminal(code); return; }
        // Lien encore actif : la consommation étant atomique avec la création du RDV, rien n'a été enregistré.
        onStillActive();
        return;
      }
      if (result.code === "BOOKING_LINK_USED") { setNote("Ce lien a bien été utilisé : votre rendez-vous a très probablement été enregistré. Consultez vos emails ou vos rendez-vous."); return; }
      const terminalCode = isTerminalLinkCode(result.code) ? result.code : null;
      if (terminalCode) { onTerminal(terminalCode); return; }
      setNote("Impossible de vérifier pour le moment. Réessayez dans quelques instants ou contactez le professionnel.");
    } catch {
      setNote("Impossible de vérifier pour le moment. Réessayez dans quelques instants ou contactez le professionnel.");
    } finally {
      setChecking(false);
    }
  };
  return (
    <StatusCard tone="warning" icon={<AlertTriangle size={22} />} title="Nous n’avons pas reçu de confirmation" text={`La connexion a été interrompue pendant l’envoi. Votre rendez-vous a peut-être bien été enregistré : avant de réessayer, ${viewer.state === "authenticated" ? "consultez vos rendez-vous" : "vérifiez vos emails"} ou contactez ${info.professional.name}.`}>
      <AppButton type="button" onClick={check} disabled={checking} className="px-3.5! py-2.5! text-xs! shadow-none!">{checking ? <><LoaderCircle size={14} className="animate-spin" />Vérification…</> : "Vérifier l’état de ma réservation"}</AppButton>
      {viewer.state === "authenticated" && <ExitLink href="/mon-profil">Mes rendez-vous</ExitLink>}
      {note && <p role="status" className="w-full text-xs leading-5 text-white/60">{note}</p>}
    </StatusCard>
  );
}
