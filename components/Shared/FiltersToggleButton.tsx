"use client";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/** Bouton « Filtres » (mobile seulement) qui déplie ou replie la zone des filtres. */
export default function FiltersToggleButton({ open, onToggle, activeCount, controls, className = "" }: { open: boolean; onToggle: () => void; activeCount: number; controls: string; className?: string }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={controls} className={`flex h-11 shrink-0 items-center gap-2 rounded-xl bg-noir-500 px-3 font-one text-xs text-white/80 transition hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 lg:hidden ${className}`}>
      <SlidersHorizontal size={15} aria-hidden="true" className="text-tertiary-400" />
      <span>Filtres</span>
      {activeCount > 0 && <span aria-label={`${activeCount} filtre${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}`} className="grid h-4 min-w-4 place-items-center rounded-full bg-linear-to-r from-tertiary-400 to-cuatro-500 px-1 text-[9px] font-semibold text-white">{activeCount}</span>}
      <ChevronDown size={14} aria-hidden="true" className={`ml-auto text-white/45 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}
