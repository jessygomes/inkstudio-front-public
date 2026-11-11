"use client";
import { toHourLabel } from "@/lib/utils/date";
import { useId, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";
import { focusRing, surface } from "@/components/Shared/ui";
import SectionHeading from "./SectionHeading";

interface HoursCardProps {
  hours: Array<{ day: string; value: string }>;
  todayFR: string;
  openNow: { open: boolean; today: { start: string; end: string } | null };
}

export default function HoursCard({ hours, todayFR, openNow }: HoursCardProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!hours.length) return null;
  return (
    <section aria-labelledby={`${id}-heading`} className={`${surface} font-one`}>
      <SectionHeading id={`${id}-heading`} icon={<Clock3 size={17} />} eyebrow="Préparer votre visite" title="Les horaires"
        aside={<span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] ${openNow.open ? "bg-emerald-400/15 text-emerald-300" : "bg-white/6 text-white/50"}`}><span className={`size-1.5 rounded-full ${openNow.open ? "bg-emerald-400" : "bg-white/30"}`} />{openNow.open ? "Ouvert" : "Fermé"}</span>} />
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-tertiary-400/15 to-cuatro-500/10 px-4 py-3.5">
        <span className="text-xs text-white/60">Aujourd’hui</span>
        <span className="text-sm font-semibold tabular-nums text-white">{openNow.today ? toHourLabel(`${openNow.today.start} – ${openNow.today.end}`) : "Fermé"}</span>
      </div>
      <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={`${id}-week`} className={`mt-3 flex w-full items-center justify-between rounded-xl bg-white/4 px-4 py-3 text-xs text-white/65 transition hover:bg-white/7 hover:text-white lg:hidden ${focusRing}`}>
        {expanded ? "Masquer la semaine" : "Voir toute la semaine"}<ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <ul id={`${id}-week`} className={`${expanded ? "block" : "hidden"} mt-3 space-y-0.5 lg:block`}>
        {hours.map(hour => {
          const today = hour.day.toLowerCase() === todayFR;
          return (
            <li key={hour.day} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs ${today ? "bg-white/5" : ""}`}>
              <span className={`flex items-center gap-2 ${today ? "font-medium text-white" : "text-white/45"}`}>{today && <span className="size-1.5 rounded-full bg-tertiary-400" aria-label="Aujourd’hui" />}{hour.day}</span>
              <span className={`text-right tabular-nums ${today ? "text-tertiary-400" : "text-white/60"}`}>{hour.value}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
