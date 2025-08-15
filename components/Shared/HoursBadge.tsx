"use client";

type HoursLine = { day: string; value: string };

type HoursStripProps = {
  hours: HoursLine[]; // ex: résultat de hoursToLines(...)
  todayLabel: string; // ex: "lundi" (minuscule)
  className?: string;
};

export default function HoursStrip({
  hours,
  todayLabel,
  className,
}: HoursStripProps) {
  const abbr: Record<string, string> = {
    lundi: "Lu",
    mardi: "Ma",
    mercredi: "Me",
    jeudi: "Je",
    vendredi: "Ve",
    samedi: "Sa",
    dimanche: "Di",
  };

  return (
    <div className={`overflow-x-auto ${className ?? ""}`}>
      <div className="flex gap-1.5 min-w-max">
        {hours.map((h) => {
          const key = h.day.toLowerCase();
          const isToday = key === todayLabel;
          const isClosed = /^ferm/i.test(h.value || "");
          const label = abbr[key] ?? h.day.slice(0, 2);

          return (
            <div
              key={h.day}
              className={[
                "px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs leading-tight",
                isToday
                  ? "bg-white/[0.07] border-white/20"
                  : "bg-white/[0.04] border-white/10",
                isClosed ? "text-white/60" : "text-white/85",
              ].join(" ")}
              title={`${h.day} : ${h.value}`}
            >
              <div className="font-medium tracking-wider">{label}</div>
              <div
                className={`mt-0.5 tabular-nums ${
                  isClosed ? "opacity-80" : ""
                }`}
              >
                {h.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
