import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Étapes de la réservation" className="mb-6">
      <ol className="grid grid-cols-4 gap-1 rounded-2xl border border-white/8 bg-noir-800 p-1.5">
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = currentStep > number;
          const active = currentStep === number;
          return (
            <li key={label} aria-current={active ? "step" : undefined}>
              <button type="button" onClick={() => onStepClick?.(number)} disabled={!complete || !onStepClick}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-1 py-2.5 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 sm:justify-start sm:px-3 ${active ? "bg-white/7 text-white shadow-sm" : complete ? "cursor-pointer text-white/65 hover:bg-white/5" : "text-white/30"}`}>
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] ${(active || complete) ? "bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white" : "border border-white/10"}`}>
                  {complete ? <Check size={12} aria-label="Terminée" /> : number}
                </span>
                <span className="hidden font-one sm:block">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] text-white/50 sm:hidden">Étape {currentStep} sur {steps.length} · {steps[currentStep - 1]}</p>
    </nav>
  );
}
