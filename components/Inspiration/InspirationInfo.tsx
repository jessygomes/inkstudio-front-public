"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Heart, Info, MessageCircle, Search } from "lucide-react";

const points = [
  { Icon: Heart, text: "Ajoutez vos coups de cœur en favoris pour les retrouver facilement." },
  { Icon: MessageCircle, text: "Contactez directement l’artiste depuis une photo." },
  { Icon: Search, text: "Trouvez à la fois l’inspiration et l’artiste qui vous correspond." },
];

/** Bouton « i » qui explique d'où viennent les photos de la page inspiration.
 *  S'ouvre au survol (et au focus clavier) ; sur écran tactile, un appui l'ouvre ou le ferme. */
export default function InspirationInfo() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={event => { if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <button ref={buttonRef} type="button" onClick={event => { if (event.nativeEvent instanceof PointerEvent && event.nativeEvent.pointerType === "mouse") return; setOpen(value => !value); }} aria-expanded={open} aria-describedby={open ? id : undefined} aria-label="À propos des inspirations"
        className={`grid size-7 cursor-pointer place-items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 ${open ? "bg-tertiary-400/15 text-tertiary-400" : "text-white/40 hover:bg-white/6 hover:text-white"}`}>
        <Info size={16} aria-hidden="true" />
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute left-0 top-full z-40 block w-[min(20rem,calc(100vw-2.5rem))] pt-2 text-left font-one sm:left-1/2 sm:-translate-x-1/2">
          <span className="block rounded-2xl bg-noir-700 p-4 shadow-2xl shadow-black/60">
          <span className="block text-sm font-semibold text-white">D’où viennent ces photos ?</span>
          <span className="mt-2 block text-xs leading-5 text-white/60">Ce sont les créations publiées dans les portfolios des tatoueurs et tatoueuses inscrits sur Inkera, qui ont accepté de les partager ici.</span>
          <span className="mt-3 block space-y-2">
            {points.map(({ Icon, text }) => (
              <span key={text} className="flex items-start gap-2.5 text-xs leading-5 text-white/75">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-white/6 text-tertiary-400"><Icon size={12} /></span>
                {text}
              </span>
            ))}
          </span>
          </span>
        </span>
      )}
    </span>
  );
}
