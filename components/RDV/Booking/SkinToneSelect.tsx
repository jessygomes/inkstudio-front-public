import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { SkinToneOption } from "./types";

interface SkinToneSelectProps {
  name: string;
  label: string;
  options: SkinToneOption[];
  errors?: Record<string, unknown>;
  loading?: boolean;
  helperText?: string;
}

export default function SkinToneSelect({ name, label, options, loading, helperText }: SkinToneSelectProps) {
  const { watch, setValue, getFieldState, formState } = useFormContext();
  const selected = watch(name);
  const error = getFieldState(name, formState).error;
  return (
    <fieldset tabIndex={error ? -1 : undefined} aria-describedby={`${name}-help`} aria-invalid={!!error} className="min-w-0 border-t border-white/8 pt-4">
      <legend className="float-left mb-1 w-full text-xs font-medium text-white/70">{label} <span className="text-tertiary-400" aria-hidden="true">*</span></legend>
      <p id={`${name}-help`} className="clear-both mb-3 text-[11px] leading-5 text-white/40">{error ? <span role="alert" className="text-red-300">{error.message}</span> : helperText}</p>
      {loading ? <p role="status" className="text-xs text-white/45">Chargement des teintes…</p> : options.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map(option => {
        const active = selected === option.value;
        return <button key={option.value} type="button" aria-pressed={active} onClick={() => setValue(name, option.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })} className={`flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${active ? "border-tertiary-400/50 bg-tertiary-400/5 text-white" : "border-white/10 bg-noir-800/40 text-white/55 hover:border-white/25"}`}><span className="size-5 shrink-0 rounded-full border border-white/15" style={{ backgroundColor: option.previewHex }} /><span className="flex-1 text-[11px]">{option.label}</span>{active && <Check size={12} className="shrink-0 text-tertiary-400" />}</button>;
      })}</div> : <p className="text-xs text-white/45">Aucune teinte disponible pour le moment.</p>}
    </fieldset>
  );
}
