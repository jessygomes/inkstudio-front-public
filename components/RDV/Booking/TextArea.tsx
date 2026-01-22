import React from "react";
import { useFormContext } from "react-hook-form";

interface TextAreaProps {
  name: string;
  label: string;
  placeholder?: string;
}

export default function TextArea({ name, label, placeholder }: TextAreaProps) {
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <label className="text-xs text-white/90 font-one">{label}</label>
      <textarea
        rows={4}
        placeholder={placeholder}
        {...register(name)}
        className="w-full p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded-md text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 resize-y placeholder-white/50 backdrop-blur-sm"
      />
    </div>
  );
}
