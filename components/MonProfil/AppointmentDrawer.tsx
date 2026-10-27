"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function AppointmentDrawer({ id, onClose, children }: { id: string; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

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
    <div className="fixed inset-0 z-1000 bg-black/60 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside id={id} ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1}
        className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-white/10 bg-noir-800 text-white shadow-2xl outline-none md:w-2/3 lg:w-1/3"
        onKeyDown={(event) => {
          if (!panelRef.current?.contains(document.activeElement)) return;
          if (event.key === "Escape") { event.stopPropagation(); closeRef.current(); }
          if (event.key !== "Tab") return;
          const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
          const first = controls[0]; const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) { event.preventDefault(); first?.focus(); }
        }}>
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id={`${id}-title`} className="text-sm font-semibold font-one">Votre rendez-vous</h2>
          <button type="button" onClick={onClose} aria-label="Fermer le rendez-vous" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><X size={18}/></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </aside>
    </div>, document.body,
  );
}
