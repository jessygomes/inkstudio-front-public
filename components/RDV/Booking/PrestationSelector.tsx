/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormContext } from "react-hook-form";
import Section from "./Section";

const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

interface PrestationSelectorProps {
  prestations: string[];
  errors?: any;
}

export default function PrestationSelector({
  prestations,
  errors,
}: PrestationSelectorProps) {
  const { watch, setValue } = useFormContext();
  const prestation = watch("prestation");

  return (
    <Section title="Choisir la prestation">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {prestations.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() =>
              setValue("prestation", p as "TATTOO" | "PIERCING" | "PROJET", {
                shouldValidate: true,
              })
            }
            className={classNames(
              "group relative cursor-pointer rounded-md border-2 px-6 py-4 text-center transition-all duration-300 transform hover:scale-105",
              prestation === p
                ? "border-tertiary-500/70 bg-gradient-to-r from-tertiary-500/20 to-tertiary-400/10"
                : "border-white/20  hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm",
            )}
          >
            <div className="text-sm font-one font-semibold text-white/90 tracking-wide">
              {p}
            </div>
            {prestation === p && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-tertiary-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {errors?.prestation && (
        <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {String(errors.prestation?.message)}
        </p>
      )}
    </Section>
  );
}
