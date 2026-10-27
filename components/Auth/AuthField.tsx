"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = ComponentProps<"input"> & { id: string; label: string; error?: string; hint?: string };

export default function AuthField({ id, label, error, hint, type = "text", ...inputProps }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  const describedBy = [inputProps["aria-describedby"], hint && id + "-hint", error && id + "-error"].filter(Boolean).join(" ") || undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-xs text-white/75">{label}</label>
      <div className="relative">
        <input {...inputProps} id={id} type={password && visible ? "text" : type} aria-invalid={!!error} aria-describedby={describedBy} className={"h-11 w-full min-w-0 rounded-xl border bg-noir-800 px-3 text-sm text-white outline-none transition placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50 focus:border-tertiary-400/60 focus:ring-2 focus:ring-tertiary-400/10 " + (password ? "pr-11 " : "") + (error ? "border-red-400/60" : "border-white/15 hover:border-white/25") + (type === "date" ? " scheme-dark" : "")} />
        {password && <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={visible} aria-controls={id} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-white/40 transition hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">{visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}</button>}
      </div>
      {hint && <p id={id + "-hint"} className="mt-2 text-[11px] leading-5 text-white/45">{hint}</p>}
      {error && <p id={id + "-error"} className="mt-2 text-xs leading-5 text-red-400">{error}</p>}
    </div>
  );
}
