"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, LoaderCircle, LogIn, Phone } from "lucide-react";
import { FormProvider } from "react-hook-form";
import styles from "./Booking/BookingFlow.module.css";
import { StepIndicator, PrestationSelector, ClientInfoForm, SlotSelection, RecapStep, ConfirmationStep, useBookingLogic } from "./Booking";
import { ArtistPicker, FlashPicker, PiercingPicker } from "./Booking/ChoicePickers";
import BookingSummary, { SalonIdentity, type BookingSummaryData } from "./Booking/BookingSummary";
import SalonMessageCard from "./Booking/SalonMessageCard";
import { PRESTATION_LABELS, formatDurationMinutes, formatPhoneNumber, getPriceLabel, getSelectedTimeRange, phoneHref } from "./Booking/bookingDisplay";
import { getPiercingServiceLabel } from "./Booking/getPiercingServiceLabel";
import { setAuthReturnPath } from "@/lib/booking-link";
import { formatDateKeyForDisplay } from "@/lib/utils/date";
import { toSlug } from "@/lib/utils";
import { Props } from "@/lib/type";
import AppButton from "@/components/Shared/AppButton";
import { checkBadge, choice, focusRing, surface } from "./Booking/ui";

const STEPS = ["Prestation", "Date et heure", "Vos informations", "Confirmation"];
const TITLES = ["Que souhaitez-vous réserver ?", "Quand souhaitez-vous venir ?", "Faisons connaissance", "Tout est bon ?"];
const NEXT_LABELS = ["Choisir une date", "Continuer", "Vérifier ma réservation"];

export default function BookingFlow({ salon, defaultTatoueurId, defaultPrestation, flashes = [], defaultFlashId }: Props) {
  const {
    navigationError, setNavigationError, handlePrestationChange, bookingConfirmationEnabled,
    linkedVenues, venueSalonId, selectedVenue, handleVenueChange,
    methods, watch, handleSubmit, isSubmitting, step, setStep, appointmentCreated, prestation,
    artists, isParTatoueurMode, projectAppointmentDurationMinutes, projectAppointmentIsFree, projectAppointmentResolvedPrice,
    selectedFlashDurationMinutes, requiredTattooSlots, selectedTatoueur, selectedDate, timeSlots, selectedSlots,
    occupiedSlots, blockedSlots, isLoadingSlots, piercingZones, selectedPiercingZone, setSelectedPiercingZone,
    selectedPiercingService, setSelectedPiercingService, isLoadingPiercingZones, piercingPrice, skinToneOptions,
    isLoadingSkinTones, moodboards, selectedMoodboardId, isLoadingMoodboards, sketchFile, setSketchFile,
    referenceFile, setReferenceFile, selectedFlashId, availableFlashes, handleFlashChange, handleMoodboardChange,
    goNext, goPrev, handleSlotSelection, clearSelectedSlots, handleTatoueurChange, handleDateChange, onSubmit, isAuthenticated, router,
  } = useBookingLogic({ salon, defaultTatoueurId, defaultPrestation, flashes, defaultFlashId });

  const [isAdvancing, setIsAdvancing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef<number | null>(null);
  const furthestStep = useRef(1);
  const busy = isSubmitting || isAdvancing;

  const effectiveSalon = {
    ...salon,
    addConfirmationEnabled: bookingConfirmationEnabled,
    ...(selectedVenue ? {
      address: selectedVenue.address,
      city: selectedVenue.city,
      postalCode: selectedVenue.postalCode,
      name: selectedVenue.salonName,
      profileImage: selectedVenue.profileImage || selectedVenue.image || salon.profileImage,
      profileHref: selectedVenue.salonName && selectedVenue.city && selectedVenue.postalCode ? `/salon/${toSlug(selectedVenue.salonName)}/${toSlug(`${selectedVenue.city}-${selectedVenue.postalCode}`)}` : salon.profileHref,
    } : {}),
  };
  // Messagerie : même règle que le profil public (indisponible en offre FREE).
  const messagingEnabled = salon.saasPlan !== "FREE";

  // Valeurs dérivées pour le résumé, le récapitulatif et la barre d'action.
  const selectedArtist = artists.find(artist => artist.id === selectedTatoueur);
  const selectedFlash = availableFlashes.find(flash => flash.id === selectedFlashId);
  const piercingZone = piercingZones.find(zone => zone.id === selectedPiercingZone);
  const piercingService = piercingZone?.services.find(service => service.id === selectedPiercingService);
  const choiceLabel = prestation === "TATTOO" ? selectedFlash?.title || selectedFlash?.name || null : prestation === "PIERCING" && piercingService ? getPiercingServiceLabel(piercingService, piercingZone?.piercingZone) : null;
  const durationMinutes = prestation === "PROJET" ? projectAppointmentDurationMinutes : prestation === "TATTOO" ? Math.max(60, selectedFlashDurationMinutes) : prestation === "RETOUCHE" ? 60 : selectedSlots.length * 30;
  const priceLabel = getPriceLabel({ prestation, projectIsFree: projectAppointmentIsFree, projectPrice: projectAppointmentResolvedPrice, flashPrice: selectedFlash?.price, piercingPrice });
  const range = getSelectedTimeRange(effectiveSalon, selectedDate, selectedSlots);
  const summary: BookingSummaryData = {
    prestationLabel: prestation ? PRESTATION_LABELS[prestation] : null,
    choiceLabel,
    artistName: selectedArtist?.name ?? null,
    dateLabel: range && selectedDate ? formatDateKeyForDisplay(selectedDate) : null,
    timeLabel: range ? `${range.start} – ${range.end}` : null,
    durationLabel: durationMinutes ? formatDurationMinutes(durationMinutes) : null,
    priceLabel,
  };
  const showArtistPicker = isParTatoueurMode || artists.some(artist => artist.isLinkedUser);
  const needsFollowUp = prestation === "TATTOO" || prestation === "PIERCING" || showArtistPicker;

  // Historique du navigateur aligné sur les étapes ; le titre reçoit le focus à chaque changement.
  useEffect(() => {
    if (step > 4) return;
    furthestStep.current = Math.max(furthestStep.current, step);
    const url = new URL(window.location.href);
    if (url.searchParams.get("step") !== String(step)) {
      url.searchParams.set("step", String(step));
      if (previousStep.current === null) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    }
    if (previousStep.current !== null && previousStep.current !== step) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    const onPopState = () => {
      if (appointmentCreated || isSubmitting) return;
      const requested = Number(new URL(window.location.href).searchParams.get("step") || "1");
      setStep(Number.isInteger(requested) ? Math.min(furthestStep.current, Math.max(1, requested)) : 1);
      setNavigationError("");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setStep, setNavigationError, appointmentCreated, isSubmitting]);

  useEffect(() => {
    if (!navigationError || busy) return;
    const invalid = document.getElementById("booking-fields")?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid || errorRef.current)?.focus();
  }, [navigationError, busy]);

  // Après le choix de la prestation, on amène doucement le choix suivant (flash, piercing, artiste) à l'écran.
  useEffect(() => {
    if (!prestation || step !== 1) return;
    requestAnimationFrame(() => {
      const target = followUpRef.current;
      if (target && target.getBoundingClientRect().top > window.innerHeight - 160) {
        target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      }
    });
  }, [prestation, step]);

  const editStep = (target: number) => {
    if (busy || target >= step) return;
    setNavigationError("");
    setStep(target);
  };
  const advance = async () => {
    if (busy) return;
    setIsAdvancing(true);
    try { await goNext(); } finally { setIsAdvancing(false); }
  };
  const goToLogin = () => {
    setAuthReturnPath(window.location.pathname + window.location.search);
    router.push("/se-connecter");
  };

  if (salon.publicBookingAllowed === false) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-noir-500 p-6 font-one">
        <Info size={22} className="mb-4 text-tertiary-400" />
        <h1 className="text-xl text-white">La réservation en ligne est indisponible</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">Contactez le salon pour organiser votre rendez-vous.</p>
      </div>
    );
  }

  if (appointmentCreated && step === 5) {
    return <ConfirmationStep salon={effectiveSalon} addConfirmationEnabled={bookingConfirmationEnabled} summary={summary} isAuthenticated={isAuthenticated} messaging={messagingEnabled ? { targetUserId: salon.id, recipientName: salon.name } : undefined} />;
  }

  const mobileSummary = [summary.choiceLabel || summary.prestationLabel, summary.dateLabel && range ? `${formatDateKeyForDisplay(selectedDate).split(" ").slice(0, 3).join(" ")} · ${range.start}` : null].filter(Boolean).join(" · ");

  return (
    <FormProvider {...methods}>
      <div className="grid items-start gap-6 font-one lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="min-w-0">
          <StepIndicator steps={STEPS} currentStep={step} onStepClick={editStep} />
          <header className="mb-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-noir-500 p-4 lg:hidden">
              <SalonIdentity salon={effectiveSalon} size={40} />
              {effectiveSalon.phone && <a href={phoneHref(effectiveSalon.phone)} className="inline-flex items-center gap-1.5 text-xs tabular-nums text-white/70 hover:text-white"><Phone size={12} className="text-tertiary-400" aria-hidden="true" />{formatPhoneNumber(effectiveSalon.phone)}</a>}
            </div>
            <p className="mb-1.5 hidden text-[11px] text-white/40 lg:block">Réserver chez {effectiveSalon.name}</p>
            <h1 ref={headingRef} tabIndex={-1} className="scroll-mt-6 text-2xl font-semibold tracking-tight text-white outline-none sm:text-3xl">{TITLES[step - 1]}</h1>
          </header>

          <form className={styles.form} noValidate onSubmit={event => {
            event.preventDefault();
            if (busy) return;
            if (step < 4) { void advance(); return; }
            void handleSubmit(onSubmit, errors => {
              setStep(errors.prestation ? 1 : 3);
              setNavigationError("Il manque quelques informations : vérifiez les champs indiqués.");
            })(event);
          }}>
            <fieldset id="booking-fields" disabled={busy} className="min-w-0 space-y-4 border-0 p-0">
              <div key={step} className={`${styles.step} space-y-4`}>
                {step === 1 && <>
                  {!isAuthenticated && (
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-white/4 px-4 py-3 text-xs text-white/60">
                      Vous avez un compte Inkera ?
                      <button type="button" onClick={goToLogin} className="inline-flex items-center gap-1 text-tertiary-400 underline-offset-2 hover:underline"><LogIn size={12} />Connectez-vous</button>
                      pour préremplir vos informations.
                    </p>
                  )}
                  <PrestationSelector prestations={salon.prestations} onPrestationChange={handlePrestationChange} projectAppointmentDurationMinutes={projectAppointmentDurationMinutes} projectAppointmentIsFree={projectAppointmentIsFree} projectAppointmentPrice={projectAppointmentResolvedPrice} />
                  {prestation && needsFollowUp && (
                    <div ref={followUpRef} className="scroll-mt-6 space-y-4">
                      {prestation === "TATTOO" && <FlashPicker flashes={availableFlashes} selectedFlashId={selectedFlashId} onChange={handleFlashChange} onChooseProject={salon.prestations.includes("PROJET") ? () => handlePrestationChange("PROJET") : undefined} />}
                      {prestation === "PIERCING" && <PiercingPicker zones={piercingZones} loading={isLoadingPiercingZones} selectedZone={selectedPiercingZone} selectedService={selectedPiercingService} onZoneChange={setSelectedPiercingZone} onServiceChange={setSelectedPiercingService} />}
                      {showArtistPicker && <ArtistPicker artists={artists} selectedId={selectedTatoueur} onChange={handleTatoueurChange} required={isParTatoueurMode} />}
                    </div>
                  )}
                </>}

                {step === 2 && <>
                  {linkedVenues.length > 0 && (
                    <section className={surface} aria-labelledby="booking-venue-title">
                      <h2 id="booking-venue-title" className="mb-4 text-base font-semibold tracking-tight text-white">Dans quel salon ?</h2>
                      {linkedVenues.some(venue => venue.publicBookingEnabled) ? (
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {linkedVenues.filter(venue => venue.publicBookingEnabled).map(venue => {
                            const active = venue.id === venueSalonId;
                            return (
                              <button key={venue.id} type="button" aria-pressed={active} onClick={() => handleVenueChange(venue.id)} className={`flex items-start gap-3 rounded-xl p-4 text-left ${choice(active)}`}>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium text-white">{venue.salonName}</span>
                                  <span className="mt-0.5 block text-xs leading-5 text-white/50">{[venue.address, venue.postalCode, venue.city].filter(Boolean).join(" ")}</span>
                                </span>
                                {active && <span className={checkBadge}><Check size={12} strokeWidth={3} /></span>}
                              </button>
                            );
                          })}
                        </div>
                      ) : <p className="text-xs text-white/50">Aucun salon ne propose de réservation en ligne pour cet artiste.</p>}
                    </section>
                  )}
                  {(!linkedVenues.length || selectedVenue?.publicBookingEnabled) && (
                    <SlotSelection prestation={prestation} salon={effectiveSalon} artists={artists} isParTatoueurMode={isParTatoueurMode} selectedTatoueur={selectedTatoueur} selectedDate={selectedDate} onDateChange={handleDateChange} timeSlots={timeSlots} selectedSlots={selectedSlots} onSlotSelection={handleSlotSelection} onClearSelection={clearSelectedSlots} occupiedSlots={occupiedSlots} blockedSlots={blockedSlots} isLoadingSlots={isLoadingSlots} selectedFlashId={selectedFlashId} selectedFlashDurationMinutes={selectedFlashDurationMinutes} requiredTattooSlots={requiredTattooSlots} />
                  )}
                </>}

                {step === 3 && <ClientInfoForm prestation={prestation} hasSelectedFlash={!!selectedFlashId} sketchFile={sketchFile} onSketchChange={setSketchFile} referenceFile={referenceFile} onReferenceChange={setReferenceFile} skinToneOptions={skinToneOptions} isLoadingSkinTones={isLoadingSkinTones} moodboards={moodboards} selectedMoodboardId={selectedMoodboardId} onMoodboardChange={handleMoodboardChange} isAuthenticated={isAuthenticated} isLoadingMoodboards={isLoadingMoodboards} />}

                {step === 4 && <RecapStep prestation={prestation} formData={watch()} selectedDate={selectedDate} selectedSlots={selectedSlots} durationMinutes={durationMinutes} priceLabel={priceLabel} artistName={selectedArtist?.name} choiceLabel={choiceLabel} salon={effectiveSalon} referenceFile={referenceFile} sketchFile={sketchFile} skinToneOptions={skinToneOptions} selectedFlash={selectedFlash} selectedMoodboard={moodboards.find(board => board.id === selectedMoodboardId)} onEdit={editStep} />}
              </div>

              {navigationError && (
                <div ref={errorRef} tabIndex={-1} role="alert" className="flex items-start gap-2.5 rounded-2xl bg-red-400/10 p-4 text-xs leading-5 text-red-200 outline-none">
                  <Info size={15} className="mt-0.5 shrink-0" />{navigationError}
                </div>
              )}

              <footer className="sticky bottom-3 z-20 flex items-center gap-2 rounded-2xl bg-noir-500/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
                {step > 1 && <button type="button" onClick={goPrev} disabled={busy} aria-label="Étape précédente" className={`grid size-10 shrink-0 place-items-center rounded-xl bg-white/6 text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-40 ${focusRing}`}><ArrowLeft size={16} /></button>}
                <p className="min-w-0 flex-1 truncate px-3 text-[11px] text-white/50 lg:hidden">{mobileSummary || `Étape ${step} sur 4`}</p>
                <span className="hidden flex-1 px-3 text-[11px] text-white/40 lg:block">Étape {step} sur 4</span>
                <AppButton type="submit" disabled={busy} className="shrink-0 rounded-xl! px-5! py-2.5! text-xs! font-medium hover:translate-y-0!">
                  {busy
                    ? <><LoaderCircle size={14} className="animate-spin" />{isSubmitting ? "Envoi…" : "Un instant…"}</>
                    : step < 4
                      ? <>{NEXT_LABELS[step - 1]}<ArrowRight size={14} /></>
                      : <>{bookingConfirmationEnabled ? "Envoyer ma demande" : "Confirmer le rendez-vous"}<Check size={14} /></>}
                </AppButton>
              </footer>
            </fieldset>
          </form>
        </div>

        <div className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
          <BookingSummary salon={effectiveSalon} data={summary} />
          {messagingEnabled && <SalonMessageCard targetUserId={salon.id} recipientName={salon.name} />}
        </div>
        {messagingEnabled && step === 1 && <SalonMessageCard targetUserId={salon.id} recipientName={salon.name} className="lg:hidden" />}
      </div>
    </FormProvider>
  );
}
