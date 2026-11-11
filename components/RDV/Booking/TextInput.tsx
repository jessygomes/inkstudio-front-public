import { useFormContext } from "react-hook-form";
import { field, label as labelClass } from "./ui";

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
  min?: string;
}

export default function TextInput({ name, label, placeholder, type = "text", required, autoComplete, hint, max, min }: TextInputProps) {
  const { register, getFieldState, formState } = useFormContext();
  const error = getFieldState(name, formState).error;
  const helpId = `${name}-help`;
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={`${labelClass} font-one`}>
        {label}{required && <span className="text-tertiary-400" aria-hidden="true">*</span>}
      </label>
      <input {...register(name)} id={name} type={type} placeholder={placeholder} autoComplete={autoComplete} max={max} min={min}
        aria-required={required} aria-invalid={!!error} aria-describedby={error || hint ? helpId : undefined}
        className={`h-12 ${field(!!error)}`} />
      {(error || hint) && <p id={helpId} role={error ? "alert" : undefined} className={`mt-1.5 px-1 text-[11px] leading-5 ${error ? "text-red-300" : "text-white/40"}`}>{error?.message || hint}</p>}
    </div>
  );
}
