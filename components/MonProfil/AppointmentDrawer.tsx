"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function AppointmentDrawer({ id, onClose, children }: { id: string; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside id={id} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-noir-700 text-white shadow-2xl shadow-black/60 outline-none sm:max-h-[88dvh] sm:rounded-3xl"
        onKeyDown={(event) => {
          if (!panelRef.current?.contains(document.activeElement)) return;
          if (event.key === "Escape") { event.stopPropagation(); closeRef.current(); }
          if (event.key !== "Tab") return;
          const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
          const first = controls[0]; const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) { event.preventDefault(); first?.focus(); }
        }}>
        <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4 sm:px-6">
          <h2 id={`${id}-title`} className="text-sm font-semibold font-one">Votre rendez-vous</h2>
          <button type="button" onClick={onClose} aria-label="Fermer le rendez-vous" className="grid size-9 cursor-pointer place-items-center rounded-xl bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><X size={18}/></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-6">{children}</div>
      </aside>
    </div>, document.body,
  );
}
