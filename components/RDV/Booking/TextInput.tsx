/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

interface TextInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  errors?: any;
}

export default function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  errors,
}: TextInputProps) {
  const { register } = useFormContext();
  const pathParts = Array.isArray(name) ? name : String(name).split(".");
  const err = pathParts.reduce((acc: any, key: string) => acc?.[key], errors);

  return (
    <div className="space-y-2">
      <label className="text-xs text-white/90 font-one">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={classNames(
          "w-full p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border rounded-md text-white text-sm focus:outline-none transition-all duration-300 placeholder-white/50 backdrop-blur-sm",
          err
            ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-white/20 focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20",
        )}
      />
      {err && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {String(err?.message)}
        </p>
      )}
    </div>
  );
}
