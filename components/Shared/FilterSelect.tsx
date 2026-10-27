"use client";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import AppButton from "./AppButton";

type FilterSelectProps = {
  label: string;
  placeholder: string;
  unit: string;
  icon: ReactNode;
  selected: string[];
  options: { value: string; label: string }[];
  normalize?: (value: string) => string;
  onApply: (values: string[]) => void;
  align?: "left" | "right";
  multiple?: boolean;
};
const identity = (value: string) => value;

export default function FilterSelect({ label, placeholder, unit, icon, selected, options, normalize = identity, onApply, align = "right", multiple = true }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const singleLabel = options.find(option => normalize(option.value) === normalize(selected[0] || ""))?.label || selected[0];
  const displayOptions = multiple ? options : [{ value: "", label: placeholder }, ...options.filter(option => option.value)];
  return <div ref={containerRef} className="relative min-w-0 font-one">
    <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={id} onClick={() => { setDraft(selected); setOpen(value => !value); }} className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-noir-800 px-3 text-left text-xs text-white/70 outline-none transition hover:border-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"><span className="shrink-0 text-tertiary-400/70" aria-hidden="true">{icon}</span><span className="sr-only">{label} : </span><span className="flex-1 truncate">{selected.length > 1 ? selected.length + " " + unit + "s" : singleLabel || placeholder}</span><ChevronDown size={12} aria-hidden="true" className={open ? "shrink-0 rotate-180" : "shrink-0"} /></button>
    {open && <div id={id} className={`absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-noir-800 shadow-xl shadow-black/30 ${align === "left" ? "left-0" : "right-0"}`}>
      <div className="border-b border-white/8 px-3 py-3"><p className="text-xs text-white/80">{label}</p><p className="mt-1 text-[10px] leading-5 text-white/40">{multiple ? `Vous pouvez sélectionner plusieurs ${unit}s.` : `Sélectionnez votre ${unit}.`}</p></div>
      <div role={multiple ? "group" : "radiogroup"} aria-label={label} className="max-h-64 overflow-y-auto p-1.5">{displayOptions.map(option => {
        const checked = !multiple && !option.value ? !draft.length : draft.some(value => normalize(value) === normalize(option.value));
        return <label key={option.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/70 transition hover:bg-white/5"><input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : id} checked={checked} onChange={() => setDraft(values => !multiple ? option.value ? [option.value] : [] : checked ? values.filter(value => normalize(value) !== normalize(option.value)) : [...values, option.value])} className="size-3.5 accent-tertiary-400" />{option.label}</label>;
      })}{!displayOptions.length && <p className="px-2 py-3 text-xs text-white/40">Aucune option disponible.</p>}</div>
      <div className="flex justify-between gap-2 border-t border-white/8 p-2"><AppButton type="button" variant="secondary" onClick={() => setDraft([])} className="px-2.5! py-2! text-[11px]! shadow-none!">{multiple ? "Tout décocher" : "Effacer"}</AppButton><AppButton type="button" onClick={() => { onApply(draft); setOpen(false); buttonRef.current?.focus(); }} className="px-3! py-2! text-[11px]! shadow-none!">Appliquer{multiple && draft.length ? " (" + draft.length + ")" : ""}</AppButton></div>
    </div>}
  </div>;
}
