import { useFormContext } from "react-hook-form";
import { field, label as labelClass } from "./ui";

interface TextAreaProps { name: string; label: string; placeholder?: string; }

export default function TextArea({ name, label, placeholder }: TextAreaProps) {
  const { register, getFieldState, formState } = useFormContext();
  const error = getFieldState(name, formState).error;
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={`${labelClass} font-one`}>{label}</label>
      <textarea {...register(name)} id={name} rows={3} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? name + "-error" : undefined} className={`min-h-28 resize-y py-3 leading-6 ${field(!!error)}`} />
      {error && <p id={name + "-error"} role="alert" className="mt-1.5 px-1 text-[11px] text-red-300">{error.message}</p>}
    </div>
  );
}
