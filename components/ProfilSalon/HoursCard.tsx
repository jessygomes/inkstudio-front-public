"use client";
import { useState } from "react";

interface HoursCardProps {
  hours: Array<{ day: string; value: string }>;
  todayFR: string;
  openNow: {
    open: boolean;
    today: { start: string; end: string } | null;
  };
}

export default function HoursCard({ hours, todayFR, openNow }: HoursCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (hours.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-noir-700/90 p-3 sm:p-4 backdrop-blur-md shadow-xl">
      {/* Header avec bouton d'expansion */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/90 font-one text-xs tracking-widest uppercase flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Horaires
        </h3>
        {/* Bouton d'expansion (mobile et tablette) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          aria-label={isExpanded ? "Réduire" : "Développer"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Résumé aujourd'hui (toujours visible) */}
      {openNow.today && (
        <div className="mb-1 flex items-center gap-2 bg-noir-500 rounded-2xl">
          <span className="w-full inline-flex items-center justify-between gap-3 px-4 py-1 text-sm font-one text-white/90 ">
            <span className="font-semibold tracking-widest">Aujourd'hui</span>
            <span className="text-white/70 font-one">{openNow.today.start}–{openNow.today.end}</span>
          </span>
        </div>
      )}
      {/* <div className="h-px w-2/3 rounded-2xl animate-pulse mx-auto bg-linear-to-r from-tertiary-400/30 to-tertiary-500/30 mb-1" /> */}

      {/* Horaires détaillés (dépliable sur mobile/tablette) */}
      <div className={`${isExpanded ? "block" : "hidden"} lg:block space-y-2`}>
        {hours.map((h) => {
          const isToday = h.day.toLowerCase() === todayFR;
          return (
            <div
              key={h.day}
              className={`flex items-center justify-between py-1 px-2 rounded-xl transition-all duration-200 ${isToday ? "border border-tertiary-400/15 bg-tertiary-400/5" : ""}`}
            >
              <span className={`font-one text-xs ${isToday ? "text-white" : "text-white/70"}`}>
                {h.day}
                {isToday && (
                  <span className="ml-1 text-[11px] text-tertiary-200">(Aujourd'hui)</span>
                )}
              </span>
              <span className={`font-one text-xs ${isToday ? "text-white" : "text-white/80"}`}>{h.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
