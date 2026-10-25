"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  busy?: boolean;
  onClose: () => void;
  headerAction?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export default function SideDrawer({ open, title, description, busy, onClose, headerAction, footer, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/65 backdrop-blur-sm" onClick={() => { if (!busy) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onClick={event => event.stopPropagation()} onKeyDown={event => {
        if (event.key === "Escape" && !busy) onClose();
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')).filter(element => !element.matches(':disabled') && element.getClientRects().length > 0);
        const first = controls[0]; const last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === event.currentTarget)) { event.preventDefault(); first.focus(); }
      }} className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-white/10 bg-noir-700 font-one text-white shadow-2xl outline-none sm:w-[min(100%,560px)] lg:w-1/3 lg:min-w-[440px]">
        <header className="shrink-0 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-2">
            <h2 id={titleId} className="min-w-0 flex-1 text-sm font-semibold tracking-tight sm:text-base">{title}</h2>
            {headerAction}
            <button type="button" disabled={busy} onClick={onClose} aria-label="Fermer" className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:opacity-40"><X size={17} /></button>
          </div>
          {description && <p className="mt-1.5 break-words text-xs leading-5 text-white/40">{description}</p>}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-white/8 bg-noir-500 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</footer>
      </div>
    </div>, document.body,
  );
}
