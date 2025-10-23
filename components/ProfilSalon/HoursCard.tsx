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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg shadow-xl">
      {/* Header avec bouton d'expansion */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/95 font-one text-sm tracking-wider uppercase flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
          Horaires d&apos;ouverture
        </h3>

        {/* Bouton d'expansion (mobile et tablette) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
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
        <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-tertiary-500/15 to-tertiary-600/10 border border-tertiary-500/25">
          <div className="flex items-center justify-between">
            <span className="text-white font-one text-sm font-semibold">
              Aujourd&apos;hui
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  openNow.open ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <span
                className={`text-sm font-one ${
                  openNow.open ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {openNow.open ? "Ouvert" : "Fermé"}
              </span>
            </div>
          </div>
          <p className="text-white/80 font-one text-sm mt-1">
            {openNow.today.start}–{openNow.today.end}
          </p>
        </div>
      )}

      {/* Horaires détaillés (dépliable sur mobile/tablette) */}
      <div
        className={`${isExpanded ? "block" : "hidden"} lg:block space-y-1.5`}
      >
        {hours.map((h) => {
          const isToday = h.day.toLowerCase() === todayFR;
          return (
            <div
              key={h.day}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isToday
                  ? "bg-gradient-to-r from-tertiary-500/20 to-tertiary-600/10 border border-tertiary-500/30"
                  : "bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <span
                className={`font-one text-sm ${
                  isToday ? "text-tertiary-300 font-semibold" : "text-white/80"
                }`}
              >
                {h.day}
                {isToday && (
                  <span className="ml-2 text-xs text-tertiary-400">
                    (Aujourd&apos;hui)
                  </span>
                )}
              </span>
              <span
                className={`font-one text-sm ${
                  isToday ? "text-white font-semibold" : "text-white/90"
                }`}
              >
                {h.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
