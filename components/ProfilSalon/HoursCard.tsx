"use client";
import { useId, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";

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
    <section aria-labelledby={`${id}-heading`} className="overflow-hidden rounded-2xl border border-white/10 bg-noir-800 font-one">
      <div className="flex items-center gap-3 p-5 pb-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Clock3 size={17} /></span><div className="min-w-0 flex-1"><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Préparer votre visite</p><h2 id={`${id}-heading`} className="mt-1 text-base font-medium text-white/90">Les horaires</h2></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] ${openNow.open ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/45"}`}><span className={`size-1 rounded-full ${openNow.open ? "bg-emerald-400" : "bg-white/30"}`} />{openNow.open ? "Ouvert" : "Fermé"}</span></div>
      <div className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-3"><span className="text-xs text-white/50">Aujourd’hui</span><span className="text-xs font-medium tabular-nums text-white/85">{openNow.today ? `${openNow.today.start} – ${openNow.today.end}` : "Fermé"}</span></div>
      <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={`${id}-week`} className="flex w-full items-center justify-between border-t border-white/8 px-5 py-3 text-xs text-white/55 transition hover:bg-white/3 hover:text-white lg:hidden">{expanded ? "Masquer la semaine" : "Voir toute la semaine"}<ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} /></button>
      <div id={`${id}-week`} className={`${expanded ? "block" : "hidden"} space-y-1 border-t border-white/8 p-3 lg:block`}>
        {hours.map(hour => { const today = hour.day.toLowerCase() === todayFR; return <div key={hour.day} className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-xs ${today ? "border border-tertiary-400/15 bg-tertiary-400/5" : "border border-transparent"}`}><span className={`flex items-center gap-2 ${today ? "text-white/90" : "text-white/45"}`}>{today && <span className="size-1 rounded-full bg-tertiary-400" aria-label="Aujourd’hui" />}{hour.day}</span><span className={`text-right tabular-nums ${today ? "text-tertiary-400" : "text-white/60"}`}>{hour.value}</span></div>; })}
      </div>
    </section>
  );
}
