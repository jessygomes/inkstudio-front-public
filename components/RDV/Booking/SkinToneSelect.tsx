import React from "react";
import { useFormContext } from "react-hook-form";
import { SkinToneOption } from "./types";

interface SkinToneSelectProps {
  name: string;
  label: string;
  options: SkinToneOption[];
  errors?: Record<string, unknown>;
  loading?: boolean;
  helperText?: string;
}

export default function SkinToneSelect({
  name,
  label,
  options,
  errors,
  loading = false,
  helperText,
}: SkinToneSelectProps) {
  const { watch, setValue } = useFormContext();
  const pathParts = Array.isArray(name) ? name : String(name).split(".");
  const err = pathParts.reduce((acc: any, key: string) => acc?.[key], errors);
  const selectedValue = watch(name) as string | undefined;
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className="space-y-2">
      <label className="text-xs text-white/80 font-one uppercase tracking-wide">
        {label}
      </label>
      <div className="rounded-2xl border border-white/10 bg-white/2 p-3">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full border border-white/15 shadow-inner"
            style={{
              backgroundColor: selectedOption?.previewHex || "rgba(255,255,255,0.08)",
            }}
          />
          <div className="min-w-0">
            <p className="text-sm text-white font-one">
              {selectedOption?.label || "Aucune teinte sélectionnée"}
            </p>
            {helperText && (
              <p className="text-xs text-white/60 font-one">{helperText}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 font-one">
            Chargement des teintes...
          </div>
        ) : options.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue(name, option.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                  className={[
                    "cursor-pointer flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center font-one transition-all",
                    isSelected
                      ? "border-tertiary-400 bg-tertiary-500/15 text-white shadow-[0_0_0_1px_rgba(244,178,61,0.25)]"
                      : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white",
                  ].join(" ")}
                  aria-pressed={isSelected}
                >
                  <span
                    className="h-10 w-10 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: option.previewHex }}
                  />
                  <span className="text-xs sm:text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 font-one">
            Aucune teinte disponible.
          </div>
        )}
      </div>

      {err && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {String(err?.message)}
        </p>
      )}
    </div>
  );
}