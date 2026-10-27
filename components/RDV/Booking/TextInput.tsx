import { useFormContext } from "react-hook-form";

interface TextInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  errors?: unknown;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  max?: string;
}

export default function TextInput({ name, label, placeholder, type = "text", required, autoComplete, hint, max }: TextInputProps) {
  const { register, getFieldState, formState } = useFormContext();
  const error = getFieldState(name, formState).error;
  const helpId = `${name}-help`;
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-2 flex items-center gap-1 text-xs font-medium text-white/70 font-one">
        {label}{required && <span className="text-tertiary-400" aria-hidden="true">*</span>}
      </label>
      <input {...register(name)} id={name} type={type} placeholder={placeholder} autoComplete={autoComplete} max={max}
        aria-required={required} aria-invalid={!!error} aria-describedby={error || hint ? helpId : undefined}
        className={`h-11 w-full min-w-0 rounded-xl border bg-noir-700/70 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:bg-white/[0.035] focus:ring-2 [color-scheme:dark] ${error ? "border-red-400/50 focus:ring-red-400/10" : "border-white/10 hover:border-white/20 focus:border-tertiary-400/50 focus:ring-tertiary-400/10"}`} />
      {(error || hint) && <p id={helpId} role={error ? "alert" : undefined} className={`mt-1.5 text-[11px] leading-5 ${error ? "text-red-300" : "text-white/40"}`}>{error?.message || hint}</p>}
    </div>
  );
}
