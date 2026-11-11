import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { SkinToneOption } from "./types";
import { checkBadge, choice } from "./ui";

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
    <fieldset tabIndex={error ? -1 : undefined} aria-describedby={`${name}-help`} aria-invalid={!!error} className="min-w-0 outline-none">
      <legend className="float-left mb-1 w-full text-xs font-medium text-white/60 font-one">{label} <span className="text-tertiary-400" aria-hidden="true">*</span></legend>
      <p id={`${name}-help`} className="clear-both mb-3 text-[11px] leading-5 text-white/40">{error ? <span role="alert" className="text-red-300">{error.message}</span> : helperText}</p>
      {loading ? <p role="status" className="text-xs text-white/45">Chargement des teintes…</p> : options.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map(option => {
            const active = selected === option.value;
            return (
              <button key={option.value} type="button" aria-pressed={active} onClick={() => setValue(name, option.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-left ${choice(active)}`}>
                <span className="size-7 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" style={{ backgroundColor: option.previewHex }} />
                <span className="flex-1 text-xs">{option.label}</span>
                {active && <span className={checkBadge}><Check size={12} strokeWidth={3} /></span>}
              </button>
            );
          })}
        </div>
      ) : <p className="text-xs text-white/45">Aucune teinte disponible pour le moment.</p>}
    </fieldset>
  );
}
