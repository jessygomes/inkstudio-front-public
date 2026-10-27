"use client";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Palette, RotateCcw, ChevronDown } from "lucide-react";
import { Search } from "@/components/Shared/Search/Search";
import AppButton from "@/components/Shared/AppButton";
import { getTattooStyleOptions, parseSelectedTattooStyles, tattooStyleKey } from "@/lib/utils/tattooStyles";
import { parseSelectedCities } from "@/lib/utils/searchCities";

type MultiFilterProps = {
  label: string; placeholder: string; unit: string; icon: ReactNode;
  selected: string[]; options: { value: string; label: string }[];
  normalize: (value: string) => string; onApply: (values: string[]) => void;
  align?: "left" | "right";
};
const cityKey = (value: string) => value.trim().toLocaleLowerCase("fr-FR");

function MultiFilter({ label, placeholder, unit, icon, selected, options, normalize, onApply, align = "right" }: MultiFilterProps) {
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
  return <div ref={containerRef} className="relative min-w-0">
    <button ref={buttonRef} type="button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => { setDraft(selected); setOpen(value => !value); }} className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-noir-700 px-3 text-left text-xs text-white/70 outline-none focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"><span className="shrink-0 text-tertiary-400/70" aria-hidden="true">{icon}</span><span className="flex-1 truncate">{selected.length > 1 ? selected.length + " " + unit + "s" : singleLabel || placeholder}</span><ChevronDown size={12} className={open ? "shrink-0 rotate-180" : "shrink-0"} /></button>
    {open && <div id={id} className={`absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-noir-700 shadow-xl shadow-black/30 ${align === "left" ? "left-0" : "right-0"}`}>
      <div className="border-b border-white/8 px-3 py-3"><p className="text-xs text-white/80">{label}</p><p className="mt-1 text-[10px] leading-5 text-white/40">Vous pouvez sélectionner plusieurs {unit}s.</p></div>
      <div role="group" aria-label={label} className="max-h-64 overflow-y-auto p-1.5">{options.map(option => { const checked = draft.some(value => normalize(value) === normalize(option.value)); return <label key={option.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/70 transition hover:bg-white/5"><input type="checkbox" checked={checked} onChange={() => setDraft(values => checked ? values.filter(value => normalize(value) !== normalize(option.value)) : [...values, option.value])} className="size-3.5 accent-tertiary-400" />{option.label}</label>; })}{!options.length && <p className="px-2 py-3 text-xs text-white/40">Aucune option disponible.</p>}</div>
      <div className="flex justify-between gap-2 border-t border-white/8 p-2"><AppButton type="button" variant="secondary" onClick={() => setDraft([])} className="px-2.5! py-2! text-[11px]! shadow-none!">Tout décocher</AppButton><AppButton type="button" onClick={() => { onApply(draft); setOpen(false); buttonRef.current?.focus(); }} className="px-3! py-2! text-[11px]! shadow-none!">Appliquer{draft.length ? " (" + draft.length + ")" : ""}</AppButton></div>
    </div>}
  </div>;
}

export default function SalonSearchToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const city = params.get("city") || "";
  const style = params.get("style") || "";
  const selectedCities = parseSelectedCities(city);
  const selectedStyles = parseSelectedTattooStyles(style);
  const [cities, setCities] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const results = await Promise.allSettled(["cities", "styleTattoo"].map(async endpoint => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/users/${endpoint}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Filtres indisponibles");
        const data: unknown = await response.json();
        return Array.isArray(data) ? data.filter((value): value is string => typeof value === "string" && !!value.trim()) : [];
      }));
      if (controller.signal.aborted) return;
      if (results[0].status === "fulfilled") setCities(results[0].value);
      if (results[1].status === "fulfilled") setStyles(results[1].value);
    };
    void load();
    return () => controller.abort();
  }, []);
  const update = (key?: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!key) ["query", "city", "style", "page"].forEach(name => next.delete(name));
    else { if (value) next.set(key, value); else next.delete(key); next.set("page", "1"); }
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  return <div className="grid grid-cols-2 items-center gap-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
    <div className="col-span-2 min-w-0 lg:col-span-1"><Search /></div>
    <MultiFilter label="Choisissez vos villes" placeholder="Toutes les villes" unit="ville" icon={<MapPin size={14} />} selected={selectedCities} options={parseSelectedCities([...cities, ...selectedCities].join(",")).map(value => ({ value, label: value.toLocaleUpperCase("fr-FR") }))} normalize={cityKey} onApply={values => update("city", values.join(","))} align="left" />
    <MultiFilter label="Choisissez vos styles" placeholder="Tous les styles" unit="style" icon={<Palette size={14} />} selected={selectedStyles} options={getTattooStyleOptions([...styles, ...selectedStyles])} normalize={tattooStyleKey} onApply={values => update("style", values.join(","))} />
    <AppButton type="button" variant="secondary" onClick={() => update()} disabled={!city && !style && !params.get("query")} className="col-span-2 h-11! px-3! py-2! text-xs! shadow-none! lg:col-span-1"><RotateCcw size={13} />Effacer</AppButton>
  </div>;
}
