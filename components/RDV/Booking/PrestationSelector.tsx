/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";
import { Check, Sparkles, PenTool, MessageCircle, RefreshCw } from "lucide-react";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const prestationOrder = ["PROJET", "TATTOO", "RETOUCHE", "PIERCING"];
const prestationLabels: Record<string, string> = {
  TATTOO: "Tatouage",
  PIERCING: "Piercing",
  PROJET: "Projet / consultation",
  RETOUCHE: "Retouche",
};
const prestationDescriptions: Record<string, string> = {
  TATTOO: "En ligne, vous pouvez réserver uniquement un flash. Pour un projet personnalisé, échangez avec le salon ou le tatoueur, qui fixera ensuite le rendez-vous avec vous.",
  PIERCING: "Le rendez-vous pendant lequel vous vous faites percer.",
  PROJET: "Un rendez-vous pour discuter de votre projet avec le salon, sans réaliser le tatouage.",
  RETOUCHE: "Pour une retouche, échangez d’abord avec le salon ou le tatoueur, qui fixera ensuite le rendez-vous avec vous.",
};

interface PrestationSelectorProps {
  prestations: string[];
  onPrestationChange?: (prestation: string) => void;
  errors?: any;
  projectAppointmentDurationMinutes?: number;
  projectAppointmentIsFree?: boolean;
  projectAppointmentPrice?: number;
}

export default function PrestationSelector({
  prestations,
  onPrestationChange,
  errors,
  projectAppointmentDurationMinutes = 60,
  projectAppointmentIsFree = true,
  projectAppointmentPrice = 0,
}: PrestationSelectorProps) {
  const { watch, setValue } = useFormContext();
  const prestation = watch("prestation");
  const orderedPrestations = [...prestations].sort((a, b) => {
    const aIndex = prestationOrder.indexOf(a);
    const bIndex = prestationOrder.indexOf(b);
    return (aIndex === -1 ? prestationOrder.length : aIndex) -
      (bIndex === -1 ? prestationOrder.length : bIndex);
  });

  return (
    <>
      <div className="mb-5 flex items-start gap-3">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400">
          <PenTool size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white/90 font-one">
            Quelle est votre envie ?
          </h2>
          <p className="mt-1 text-xs leading-5 text-white/45 font-one">
            Choisissez le rendez-vous adapté : discuter d’un projet, réserver un flash, faire retoucher un tatouage ou vous faire percer.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {orderedPrestations.map((p) => {
          const isSelected = prestation === p;
          const isProject = p === "PROJET";

          return (
            <button
              key={p}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                if (prestation === p) return;
                if (onPrestationChange) onPrestationChange(p);
                else setValue("prestation", p, { shouldDirty: true, shouldValidate: true });
              }}
              className={classNames(
                "group relative flex h-full min-h-40 cursor-pointer flex-col rounded-2xl border p-4 text-left transition duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50",
                isSelected
                  ? "border-tertiary-400/50 bg-tertiary-400/8"
                  : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]",
              )}
            >
              <div className="flex items-center gap-3">
                <span className={classNames(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isSelected
                    ? "border-tertiary-400/30 bg-tertiary-400/15 text-tertiary-300"
                    : "border-white/10 bg-white/5 text-white/65 group-hover:text-tertiary-300",
                )} aria-hidden="true">
                  {p === "TATTOO" ? <PenTool size={18} /> : p === "PIERCING" ? <Sparkles size={18} /> : p === "PROJET" ? <MessageCircle size={18} /> : <RefreshCw size={18} />}
                </span>
                <span className="text-sm font-one font-semibold text-white/90">
                  {prestationLabels[p] || p}
                </span>
                {isSelected && (
                  <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-tertiary-400 text-noir-900" aria-label="Sélectionné">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-white/55 font-one">
                {prestationDescriptions[p]}
              </p>
              {isProject && (
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] leading-4 text-white/65 font-one">
                    Durée : {projectAppointmentDurationMinutes} min
                  </p>
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] leading-4 text-white/65 font-one">
                    Prix : {projectAppointmentIsFree ? "Gratuit" : `${projectAppointmentPrice}€`}
                  </p>
                </div>
              )}

            </button>
          );
        })}
      </div>

      {errors?.prestation && (
        <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {String(errors.prestation?.message)}
        </p>
      )}
    </>
  );
}
