import React from "react";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

interface StepBadgeProps {
  n: number;
  active: boolean;
}

export default function StepBadge({ n, active }: StepBadgeProps) {
  return (
    <div
      className={classNames(
        "w-8 h-8 rounded-full grid place-items-center text-xs font-one border-2 transition-all duration-300",
        active
          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white border-tertiary-400/50 shadow-lg shadow-tertiary-400/25"
          : "bg-noir-600/50 text-white/50 border-white/20 backdrop-blur-sm",
      )}
    >
      {n}
    </div>
  );
}
