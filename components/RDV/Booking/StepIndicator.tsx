import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

/** Progression compacte : les étapes terminées restent cliquables pour revenir en arrière. */
export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Étapes de la réservation" className="mb-6">
      {/* Barre continue orange → violet, révélée au fil des étapes. */}
      <div aria-hidden="true" className="relative mb-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 transition-[clip-path] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: "100%", clipPath: `inset(0 ${100 - (Math.min(currentStep, steps.length) / steps.length) * 100}% 0 0 round 9999px)` }}
        />
      </div>
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((label, index) => {
          const number = index + 1;
          const complete = currentStep > number;
          const active = currentStep === number;
          return (
            <li key={label} aria-current={active ? "step" : undefined} className="flex min-w-0 flex-1 flex-col">
              <button
                type="button"
                onClick={() => onStepClick?.(number)}
                disabled={!complete || !onStepClick}
                className={`flex min-w-0 items-center gap-1.5 rounded-xl text-left text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 ${active ? "text-white" : complete ? "cursor-pointer text-white/60 hover:text-white" : "text-white/30"}`}
              >
                {complete ? <Check size={12} className="shrink-0 text-tertiary-400" aria-label="Terminée" /> : <span className="shrink-0 tabular-nums">{number}.</span>}
                <span className={`truncate font-one ${active ? "" : "hidden sm:inline"}`}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
