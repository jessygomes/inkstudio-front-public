"use client";

import { useEffect, useRef } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

const filters = [
  { label: "Tous", value: "" },
  { label: "Confirmés", value: "CONFIRMED" },
  { label: "En attente", value: "PENDING" },
  { label: "Terminés", value: "COMPLETED" },
  { label: "Annulés", value: "CANCELED" },
];

type Props = { value: string; counts: Record<string, number>; onChange: (value: string) => void };

export default function RendezVousFilters({ value, counts, onChange }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  const close = () => {
    if (!ref.current) return;
    ref.current.open = false;
    ref.current.querySelector("summary")?.focus();
  };
  const active = filters.find(filter => filter.value === value) || filters[0];
  return <>
    <details ref={ref} className="group relative min-w-0 sm:hidden" onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); close(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && ref.current) ref.current.open = false; }}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-white/10 bg-noir-500 px-2.5 text-[11px] text-white/75 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-tertiary-400 [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal size={14} aria-hidden="true" />Filtres
        {value && <span className="rounded-md bg-tertiary-400/10 px-1.5 py-0.5 text-[10px] text-tertiary-400">{active.label}</span>}
        <ChevronDown size={12} aria-hidden="true" className="text-white/35 transition-transform group-open:rotate-180" />
      </summary>
      <div role="group" aria-label="Filtrer les rendez-vous" className="absolute left-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] space-y-0.5 rounded-xl border border-white/10 bg-noir-500 p-2 shadow-xl shadow-black/30">
        <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/30">Statut du rendez-vous</p>
        {filters.map(filter => <button key={filter.value || "all"} type="button" aria-pressed={value === filter.value} onClick={() => { onChange(filter.value); close(); }} className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-[11px] transition ${value === filter.value ? "bg-tertiary-400/10 text-tertiary-400" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
          <span className="flex-1">{filter.label}</span>
          {counts[filter.value] !== undefined && <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/45">{counts[filter.value]}</span>}
          <span className="grid size-4 place-items-center">{value === filter.value && <Check size={13} aria-hidden="true" />}</span>
        </button>)}
      </div>
    </details>
    <div className="hidden flex-wrap gap-0.5 sm:flex" role="group" aria-label="Filtrer les rendez-vous">
      {filters.map(filter => <button key={filter.value || "all"} type="button" aria-pressed={value === filter.value} onClick={() => onChange(filter.value)} className={`min-h-9 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs transition-colors ${value === filter.value ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
        {filter.label}{counts[filter.value] !== undefined && <span className="ml-1.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55">{counts[filter.value]}</span>}
      </button>)}
    </div>
  </>;
}
