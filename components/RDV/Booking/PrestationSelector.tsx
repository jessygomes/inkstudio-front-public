/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";
import Section from "./Section";
import { Sparkles, PenTool, MessageCircle, RefreshCw } from "lucide-react";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

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

  return (
    <Section title="Quelle est votre envie ?" description="Choisissez le type de rendez-vous que vous souhaitez réserver." icon={<PenTool size={18} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {prestations.map((p) => {
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
                "group relative cursor-pointer grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-2.5 rounded-xl border px-3 py-3 pr-7 text-left transition-colors duration-200 hover:border-tertiary-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50",
                isSelected
                  ? "border-tertiary-400/50 bg-tertiary-400/8"
                  : "border-white/10 bg-noir-800/60 hover:bg-white/4",
              )}
            >
              <span className="row-span-2 flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-tertiary-400" aria-hidden="true">{p === "TATTOO" ? <PenTool size={15} /> : p === "PIERCING" ? <Sparkles size={15} /> : p === "PROJET" ? <MessageCircle size={15} /> : <RefreshCw size={15} />}</span>
              <div className="self-center text-xs font-one font-semibold text-white/90">
                {{ TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Projet / consultation", RETOUCHE: "Retouche" }[p] || p}
              </div>

              <p className="col-start-2 mt-1 text-[11px] leading-4 text-white/45 font-two">{{ TATTOO: "Une création qui vous ressemble.", PIERCING: "Choisissez votre zone et votre bijou.", PROJET: "Un premier échange pour préparer votre idée.", RETOUCHE: "Apportez la dernière touche à votre tatouage." }[p]}</p>
              {isProject && (
                <div className="col-start-2 mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-white/60">
                  <p className="text-[10px] text-white/60 font-one leading-4">
                    Durée : {projectAppointmentDurationMinutes} min
                  </p>
                  <p className="text-[10px] text-white/60 font-one leading-4">
                    Prix : {projectAppointmentIsFree ? "Gratuit" : `${projectAppointmentPrice}€`}
                  </p>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-tertiary-500 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
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
    </Section>
  );
}
