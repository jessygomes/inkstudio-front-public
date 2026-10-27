"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, Check, FileCheck2, ShieldCheck } from "lucide-react";

export default function VerifiedProfileBadge({ className = "", iconSize = 15 }: { className?: string; iconSize?: number }) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; above: boolean; width: number } | null>(null);

  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const show = () => {
    cancelClose();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(312, window.innerWidth - 24);
    const above = window.innerHeight - rect.bottom < 240 && rect.top > 240;
    setPosition({ top: above ? rect.top - 10 : rect.bottom + 10, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), above, width });
  };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setPosition(null), 120); };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    const onPointerDown = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !tooltipRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [position]);

  return (
    <>
      <button ref={triggerRef} type="button" aria-describedby={position ? id : undefined}
        onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show} onBlur={scheduleClose} onClick={show}
        className={`inline-flex cursor-pointer items-center gap-1.5 text-xs text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${className}`}>
        <BadgeCheck size={iconSize} aria-hidden="true" /> Profil vérifié
      </button>
      {position && createPortal(
        <div id={id} ref={tooltipRef} role="tooltip" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}
          style={{ top: position.top, left: position.left, width: position.width, transform: position.above ? "translateY(-100%)" : undefined }}
          className="fixed z-100000 overflow-hidden rounded-2xl border border-white/12 bg-noir-800 p-4 font-one text-white shadow-[0_12px_48px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><ShieldCheck size={21} aria-hidden="true" /></span>
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/70">Vérifié par Inkera</p><p className="mt-0.5 text-sm font-semibold">Un professionnel vérifié</p></div>
          </div>
          <p className="mb-3 mt-3 text-xs leading-5 text-white/55">Notre équipe a contrôlé les documents de ce salon ou tatoueur :</p>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="flex items-center gap-2"><FileCheck2 size={15} className="shrink-0 text-emerald-300" aria-hidden="true" />Documents professionnels</li>
            <li className="flex items-center gap-2"><Check size={15} className="shrink-0 text-emerald-300" aria-hidden="true" />Justificatifs d’hygiène et de salubrité</li>
          </ul>
        </div>, document.body,
      )}
    </>
  );
}
