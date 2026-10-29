"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, LoaderCircle, UserRound, Info } from "lucide-react";
import styles from "./Booking/BookingFlow.module.css";
import { FormProvider } from "react-hook-form";

import {
  StepIndicator,
  PrestationSelector,
  ClientInfoForm,
  SlotSelection,
  RecapStep,
  ConfirmationStep,
  useBookingLogic,
} from "./Booking";
import { Props } from "@/lib/type";
import AppButton from "@/components/Shared/AppButton";

export default function BookingFlow({
  salon,
  defaultTatoueurId,
  defaultPrestation,
  flashes = [],
  defaultFlashId,
}: Props) {



  const {
    navigationError,
    setNavigationError,
    handlePrestationChange,
    bookingConfirmationEnabled,
    linkedVenues, venueSalonId, selectedVenue, handleVenueChange,
    methods,
    watch,
    handleSubmit,
    isSubmitting,
    step,
    setStep,
    confirmDisabled,
    appointmentCreated,
    prestation,
    artists,
    isParTatoueurMode,
    projectAppointmentDurationMinutes,
    projectAppointmentIsFree,
    projectAppointmentResolvedPrice,
    selectedFlashDurationMinutes,
    requiredTattooSlots,
    selectedTatoueur,
    selectedDate,
    timeSlots,
    selectedSlots,
    occupiedSlots,
    blockedSlots,
    isLoadingSlots,
    piercingZones,
    selectedPiercingZone,
    setSelectedPiercingZone,
    selectedPiercingService,
    setSelectedPiercingService,
    isLoadingPiercingZones,
    piercingPrice,
    skinToneOptions,
    isLoadingSkinTones,
    moodboards,
    selectedMoodboardId,
    isLoadingMoodboards,
    sketchFile,
    setSketchFile,
    referenceFile,
    setReferenceFile,
    selectedFlashId,
    handleFlashChange,
    handleMoodboardChange,
    goNext,
    goPrev,
    handleSlotSelection,
    clearSelectedSlots,
    handleTatoueurChange,
    handleDateChange,
    onSubmit,
    isAuthenticated,
  } = useBookingLogic({
    salon,
    defaultTatoueurId,
    defaultPrestation,
    flashes,
    defaultFlashId,
  });

  const [isAdvancing, setIsAdvancing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef<number | null>(null);
  const furthestStep = useRef(1);
  const busy = isSubmitting || isAdvancing;
  const selectedArtist = artists.find(artist => artist.id === selectedTatoueur);
  const selectedFlash = flashes.find(flash => flash.id === selectedFlashId);
  const labels: Record<string, string> = { TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Consultation projet", RETOUCHE: "Retouche" };
  const steps = ["Votre envie", "Votre demande", "Date & heure", "Vérification"];
  const titles = ["Un rendez-vous, à votre image.", "Donnons vie à votre demande.", "Trouvons le bon moment.", "Tout est prêt ?"];
  const descriptions = ["Choisissez votre prestation et l’artiste qui vous accompagnera.", "Partagez votre projet et laissez vos coordonnées au salon.", "Choisissez une date et un horaire. Nous nous occupons de la durée.", "Un dernier regard sur les informations avant de les transmettre au salon."];
  const effectiveSalon = {
    ...salon,
    addConfirmationEnabled: bookingConfirmationEnabled,
    ...(selectedVenue ? { address: selectedVenue.address, city: selectedVenue.city, postalCode: selectedVenue.postalCode, name: selectedVenue.salonName } : {}),
  };

  // Keep browser history aligned with steps. A fresh page always starts with a valid form.
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
      headingRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
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

  if (salon.publicBookingAllowed === false) return <div className="rounded-2xl border border-white/10 bg-noir-500 p-6"><Info size={22} className="mb-4 text-tertiary-400" /><h1 className="text-xl text-white">La réservation en ligne est indisponible</h1><p className="mt-2 text-sm leading-6 text-white/50">Contactez le salon pour organiser votre rendez-vous.</p></div>;

  if (appointmentCreated && step === 5) return <ConfirmationStep salon={effectiveSalon} addConfirmationEnabled={bookingConfirmationEnabled} />;

  return (
    <FormProvider {...methods}>
      <div className="min-w-0 pb-4">
        <header className="mb-6">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-tertiary-400"><span className="h-px w-5 bg-tertiary-400/50" />Réserver chez {salon.name}</p>
          <h1 ref={headingRef} tabIndex={-1} className="scroll-mt-6 text-2xl font-semibold tracking-tight text-white outline-none font-one sm:text-3xl">{titles[step - 1]}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">{descriptions[step - 1]}</p>
        </header>
        <StepIndicator steps={steps} currentStep={step} onStepClick={editStep} />
        {step > 1 && <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-[11px]"><span className="font-medium text-white/80">{labels[prestation]}</span>{selectedArtist && <><ChevronRight size={11} className="text-white/25" /><span className="text-white/45">{selectedArtist.name}</span></>}{selectedFlash && <><ChevronRight size={11} className="text-white/25" /><span className="truncate text-white/45">{selectedFlash.title || selectedFlash.name || "Flash"}</span></>}<AppButton type="button" variant="secondary" disabled={busy} onClick={() => editStep(1)} className="ml-auto px-2.5! py-1! text-[10px]! shadow-none!">Modifier</AppButton></div>}
        <form className={styles.form} noValidate onSubmit={event => {
          event.preventDefault();
          if (busy) return;
          if (step < 4) { void advance(); return; }
          void handleSubmit(onSubmit, errors => {
            setStep(errors.prestation ? 1 : 2);
            setNavigationError("Vérifiez les informations indiquées avant de confirmer.");
          })(event);
        }}>
          <fieldset id="booking-fields" disabled={busy} className="min-w-0 space-y-4 border-0 p-0">
            <div key={step} className={styles.step}>
              {step === 1 && <div className="space-y-4">
                <PrestationSelector prestations={salon.prestations} onPrestationChange={handlePrestationChange} projectAppointmentDurationMinutes={projectAppointmentDurationMinutes} projectAppointmentIsFree={projectAppointmentIsFree} projectAppointmentPrice={projectAppointmentResolvedPrice} />
                {(isParTatoueurMode || artists.some(artist => artist.isLinkedUser)) && <section className="rounded-2xl border border-white/10 bg-noir-500 p-4 sm:p-5"><div className="mb-4 flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-tertiary-400/8 text-tertiary-400"><UserRound size={16} /></span><div><h2 className="text-sm font-medium text-white/90">Avec quel artiste ?</h2><p className="mt-1 text-[11px] text-white/40">Choisissez qui vous accompagnera.</p></div></div><div className="grid gap-2 sm:grid-cols-2">{artists.map(artist => <button key={artist.id} type="button" aria-pressed={selectedTatoueur === artist.id} onClick={() => handleTatoueurChange(artist.id)} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${selectedTatoueur === artist.id ? "border-tertiary-400/50 bg-tertiary-400/5" : "border-white/10 bg-noir-800/40 hover:border-white/25"}`}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-xs text-white/55">{artist.name?.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs text-white/85">{artist.name}</span>{artist.isLinkedUser && <span className="mt-0.5 block text-[10px] text-white/35">Réservation sur son profil personnel</span>}</span>{selectedTatoueur === artist.id && <Check size={14} className="text-tertiary-400" />}</button>)}</div>{!artists.length && <p className="text-xs text-white/50">Aucun artiste n’est réservable en ligne actuellement.</p>}</section>}
              </div>}
              {step === 2 && <ClientInfoForm prestation={prestation} errors={methods.formState.errors} sketchFile={sketchFile} onSketchChange={setSketchFile} referenceFile={referenceFile} onReferenceChange={setReferenceFile} piercingZones={piercingZones} selectedPiercingZone={selectedPiercingZone} selectedPiercingService={selectedPiercingService} onPiercingZoneChange={setSelectedPiercingZone} onPiercingServiceChange={setSelectedPiercingService} isLoadingPiercingZones={isLoadingPiercingZones} flashes={flashes} selectedFlashId={selectedFlashId} onFlashChange={handleFlashChange} skinToneOptions={skinToneOptions} isLoadingSkinTones={isLoadingSkinTones} moodboards={moodboards} selectedMoodboardId={selectedMoodboardId} onMoodboardChange={handleMoodboardChange} isAuthenticated={isAuthenticated} isLoadingMoodboards={isLoadingMoodboards} />}
              {step === 3 && <div className="space-y-4">
                {!!linkedVenues.length && <section className="rounded-2xl border border-white/10 bg-noir-500 p-4 sm:p-5"><label htmlFor="booking-venue" className="mb-1 block text-sm font-medium text-white/85">Où souhaitez-vous venir ?</label><p className="mb-3 text-[11px] text-white/40">Choisissez le salon pour afficher les disponibilités de votre artiste.</p><select id="booking-venue" value={venueSalonId} onChange={event => handleVenueChange(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-noir-800 px-3 text-sm text-white outline-none focus:border-tertiary-400/50 [color-scheme:dark]"><option value="">Choisir un salon</option>{linkedVenues.filter(venue => venue.publicBookingEnabled).map(venue => <option key={venue.id} value={venue.id}>{venue.salonName} · {venue.city}</option>)}</select>{selectedVenue && <p className="mt-2 text-xs text-white/45">{[selectedVenue.address, selectedVenue.postalCode, selectedVenue.city].filter(Boolean).join(" ")}</p>}{!linkedVenues.some(venue => venue.publicBookingEnabled) && <p className="mt-3 text-xs text-white/50">Aucun salon ne propose de réservation en ligne pour cet artiste.</p>}</section>}
                {(!linkedVenues.length || selectedVenue?.publicBookingEnabled) && <SlotSelection prestation={prestation} salon={effectiveSalon} artists={artists} isParTatoueurMode={isParTatoueurMode} selectedTatoueur={selectedTatoueur} selectedDate={selectedDate} onDateChange={handleDateChange} timeSlots={timeSlots} selectedSlots={selectedSlots} onSlotSelection={handleSlotSelection} onClearSelection={clearSelectedSlots} occupiedSlots={occupiedSlots} blockedSlots={blockedSlots} isLoadingSlots={isLoadingSlots} selectedFlashId={selectedFlashId} selectedFlashDurationMinutes={selectedFlashDurationMinutes} requiredTattooSlots={requiredTattooSlots} />}
              </div>}
              {step === 4 && <RecapStep selectedMoodboard={moodboards.find(board => board.id === selectedMoodboardId)} piercingServiceId={selectedPiercingService} selectedFlash={selectedFlash} prestation={prestation} formData={watch()} selectedDate={selectedDate} selectedSlots={selectedSlots} selectedTatoueur={selectedTatoueur} artists={artists} piercingZones={piercingZones} piercingPrice={piercingPrice} pierc={selectedPiercingZone} salon={effectiveSalon} referenceFile={referenceFile} sketchFile={sketchFile} skinToneOptions={skinToneOptions} onEdit={editStep} />}
            </div>
            {navigationError && <div ref={errorRef} tabIndex={-1} role="alert" className="outline-none flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><Info size={15} className="mt-0.5 shrink-0" />{navigationError}</div>}
            <footer className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-noir-800 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
              {step > 1 ? <AppButton type="button" variant="secondary" onClick={goPrev} disabled={busy} icon={<ArrowLeft size={14} />} className="px-3! py-2! text-xs! rounded-lg! shadow-none!">Retour</AppButton> : <span className="px-2 text-[10px] text-white/35">Étape 1 sur 4</span>}
              <AppButton type="submit" disabled={busy || confirmDisabled} className="ml-auto px-3.5! py-2.5! text-xs! rounded-lg! shadow-none! hover:translate-y-0!">
                {busy ? <><LoaderCircle size={14} className="animate-spin" />{isSubmitting ? "Envoi en cours…" : "Vérification…"}</> : <>{step === 1 ? "Décrire ma demande" : step === 2 ? "Choisir un horaire" : step === 3 ? "Vérifier ma demande" : bookingConfirmationEnabled ? "Envoyer ma demande" : "Confirmer le rendez-vous"}{step === 4 ? <Check size={14} /> : <ArrowRight size={14} />}</>}
              </AppButton>
            </footer>
          </fieldset>
        </form>
      </div>
    </FormProvider>
  );
}