import { useFormContext } from "react-hook-form";

interface TextAreaProps { name: string; label: string; placeholder?: string; }

export default function TextArea({ name, label, placeholder }: TextAreaProps) {
  const { register, getFieldState, formState } = useFormContext();
  const error = getFieldState(name, formState).error;
  return <div className="min-w-0"><label htmlFor={name} className="mb-2 block text-xs font-medium text-white/70 font-one">{label}</label><textarea {...register(name)} id={name} rows={3} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? name + "-error" : undefined} className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-tertiary-400/50 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10" />{error && <p id={name + "-error"} role="alert" className="mt-1 text-[11px] text-red-300">{error.message}</p>}</div>;
}
