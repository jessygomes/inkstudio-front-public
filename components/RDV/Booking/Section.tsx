import React from "react";
import { iconBadge, surface } from "./ui";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  unboxed?: boolean;
}

export default function Section({ title, children, description, eyebrow, icon, unboxed = false }: SectionProps) {
  return (
    <div className={unboxed ? "min-w-0" : surface}>
      <div className="mb-5 flex items-start gap-3">
        {icon && <span aria-hidden="true" className={iconBadge}>{icon}</span>}
        <div>
          {eyebrow && <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/40 font-one">{eyebrow}</p>}
          <h2 className="font-one text-base font-semibold tracking-tight text-white">{title}</h2>
          {description && <p className="mt-1 font-one text-xs leading-5 text-white/45">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
