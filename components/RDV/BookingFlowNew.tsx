"use client";

import React from "react";
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

export default function BookingFlow({ salon, defaultTatoueurId }: Props) {
  const {
    methods,
    watch,
    handleSubmit,
    isSubmitting,
    step,
    confirmDisabled,
    appointmentCreated,
    prestation,
    artists,
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
    sketchFile,
    setSketchFile,
    referenceFile,
    setReferenceFile,
    goNext,
    goPrev,
    handleSlotSelection,
    handleTatoueurChange,
    handleDateChange,
    onSubmit,
  } = useBookingLogic({ salon, defaultTatoueurId });

  const steps = ["Prestation", "Infos", "Disponibilité", "Récap"];

  // Étape 5: Confirmation (après soumission)
  if (appointmentCreated && step === 5) {
    return (
      <ConfirmationStep
        salon={salon}
        addConfirmationEnabled={salon.addConfirmationEnabled}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-b from-noir-500 via-noir-600 to-noir-700 py-8 sm:py-12 px-2 sm:px-4 rounded-xl flex items-center justify-center">
        <div className="w-full max-w-5xl">
          {/* Header avec indicateur de progression */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-one font-bold text-white mb-3">
                Réserver un rendez-vous
              </h1>
              {/* <p className="text-white/60 font-one text-sm sm:text-base">
                Chez {salon.name}
              </p> */}
            </div>

            <StepIndicator steps={steps} currentStep={step} />
          </div>

          {/* Contenu des étapes */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Étape 1: Choix de la prestation */}
            {step === 1 && (
              <PrestationSelector prestations={salon.prestations} />
            )}

            {/* Étape 2: Informations client */}
            {step === 2 && (
              <ClientInfoForm
                prestation={prestation}
                errors={methods.formState.errors}
                sketchFile={sketchFile}
                onSketchChange={setSketchFile}
                referenceFile={referenceFile}
                onReferenceChange={setReferenceFile}
                piercingZones={piercingZones}
                selectedPiercingZone={selectedPiercingZone}
                selectedPiercingService={selectedPiercingService}
                onPiercingZoneChange={setSelectedPiercingZone}
                onPiercingServiceChange={setSelectedPiercingService}
                isLoadingPiercingZones={isLoadingPiercingZones}
              />
            )}

            {/* Étape 3: Sélection des créneaux */}
            {step === 3 && (
              <SlotSelection
                prestation={prestation}
                salon={salon}
                artists={artists}
                selectedTatoueur={selectedTatoueur}
                onTatoueurChange={handleTatoueurChange}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                timeSlots={timeSlots}
                selectedSlots={selectedSlots}
                onSlotSelection={handleSlotSelection}
                occupiedSlots={occupiedSlots}
                blockedSlots={blockedSlots}
                isLoadingSlots={isLoadingSlots}
              />
            )}

            {/* Étape 4: Récapitulatif */}
            {step === 4 && (
              <RecapStep
                prestation={prestation}
                formData={watch()}
                selectedDate={selectedDate}
                selectedSlots={selectedSlots}
                selectedTatoueur={selectedTatoueur}
                artists={artists}
                piercingZones={piercingZones}
                piercingPrice={piercingPrice}
                pierc={selectedPiercingZone}
                salon={salon}
                referenceFile={referenceFile}
                sketchFile={sketchFile}
              />
            )}

            {/* Boutons de navigation */}
            <div className="flex flex-row gap-4 justify-between pt-6">
              {step > 1 && step < 5 && (
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={isSubmitting}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-2 border border-white/20 text-white rounded-md font-one hover:bg-white/[0.12] transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Précédent
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={isSubmitting}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-tertiary-500 to-tertiary-400 text-white rounded-md font-one transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  Suivant
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || confirmDisabled}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-base rounded-md font-one hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Envoi en cours...
                    </>
                  ) : confirmDisabled ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Vérifier le récapitulatif
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Confirmer le rendez-vous
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
