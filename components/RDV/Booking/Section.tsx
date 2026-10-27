import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
}

export default function Section({ title, children, description, eyebrow, icon }: SectionProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-noir-500 p-4 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon && <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400">{icon}</span>}
        <div>
        {eyebrow && <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/40 font-one">{eyebrow}</p>}
        <h2 className="text-white/90 font-one text-base tracking-tight font-semibold">
          {title}
        </h2>
        {description && <p className="mt-1 text-xs leading-5 text-white/45 font-two">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
