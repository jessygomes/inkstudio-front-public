import React from "react";
import StepBadge from "./StepBadge";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="mb-8 px-4 sm:px-0 w-fit mx-auto">
      <div className="flex items-center justify-center mx-auto">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-3">
              <StepBadge
                n={i + 1}
                active={currentStep === i + 1 || currentStep > i + 1}
              />
              <span
                className={classNames(
                  "text-xs font-one text-center tracking-wide transition-colors duration-300",
                  currentStep >= i + 1 ? "text-white/90" : "text-white/50",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-4 sm:mx-8">
                <div
                  className={classNames(
                    "h-[2px] rounded-full transition-all duration-500",
                    currentStep > i + 1
                      ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500"
                      : "bg-white/15",
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
