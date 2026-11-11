"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/** Texte limité à `lines` lignes, avec « Voir plus » uniquement s'il dépasse réellement. */
export default function ExpandableText({ text, lines = 5, className = "" }: { text: string; lines?: number; className?: string }) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Mesure dans le callback de l'observateur : le texte replié dépasse-t-il de sa hauteur visible ?
    const observer = new ResizeObserver(() => {
      if (!element.classList.contains("expandable-clamped")) return;
      setOverflowing(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div>
      <p
        id={id}
        ref={ref}
        style={expanded ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" }}
        className={`${expanded ? "" : "expandable-clamped"} whitespace-pre-line break-words ${className}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <div className="flex justify-end">
        <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={id} className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-xl text-xs font-medium text-tertiary-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400">
          {expanded ? "Voir moins" : "Voir plus"}
          <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        </div>
      )}
    </div>
  );
}
