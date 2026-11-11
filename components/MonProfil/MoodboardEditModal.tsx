"use client";

import { useEffect, useId, useRef, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";

type Props = {
  open: boolean;
  name: string;
  description: string;
  busy: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const fieldClass = "mt-1.5 w-full min-w-0 rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:bg-white/7 focus:bg-white/8 focus:ring-2 focus:ring-tertiary-400/40 disabled:opacity-50";

/** Petite modale centrée pour renommer un moodboard et modifier sa description. */
export default function MoodboardEditModal({ open, name, description, busy, onNameChange, onDescriptionChange, onSubmit, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();
    nameRef.current?.select();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const close = () => { if (!busy) onClose(); };
  const submit = (event: FormEvent) => { event.preventDefault(); if (!busy && name.trim()) onSubmit(); };

  // Garde le focus clavier dans la modale.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.stopPropagation(); close(); return; }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("input, textarea, button:not([disabled])") ?? []);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  return createPortal(
    <div className="fixed inset-0 z-120 flex items-end justify-center bg-noir-900/70 p-4 backdrop-blur-sm sm:items-center" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown} className="w-full max-w-md rounded-3xl bg-noir-500 p-5 font-one shadow-2xl shadow-black/50 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-tertiary-400/20 to-cuatro-500/15 text-tertiary-400"><Pencil size={16} /></span>
          <h2 id={titleId} className="flex-1 text-base font-semibold tracking-tight text-white">Modifier le moodboard</h2>
          <button type="button" onClick={close} disabled={busy} aria-label="Fermer" className="grid size-9 cursor-pointer place-items-center rounded-xl text-white/50 transition hover:bg-white/6 hover:text-white disabled:opacity-40"><X size={16} /></button>
        </div>
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy} className="min-w-0 space-y-4 p-0">
            <label className="block text-xs font-medium text-white/60">Titre <span className="text-tertiary-400" aria-hidden="true">*</span>
              <input ref={nameRef} required value={name} onChange={event => onNameChange(event.target.value)} placeholder="Mon prochain tatouage" className={`h-12 ${fieldClass}`} />
            </label>
            <label className="block text-xs font-medium text-white/60">Description <span className="font-normal text-white/35">· facultative</span>
              <textarea rows={4} value={description} onChange={event => onDescriptionChange(event.target.value)} placeholder="Une idée, un style, une envie…" className={`resize-y ${fieldClass}`} />
            </label>
          </fieldset>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={close} disabled={busy} className="min-h-10 cursor-pointer rounded-xl bg-white/6 px-4 text-xs text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40">Annuler</button>
            <button type="submit" disabled={busy || !name.trim()} className="min-h-10 cursor-pointer rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-5 text-xs font-medium text-white shadow-lg shadow-tertiary-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
