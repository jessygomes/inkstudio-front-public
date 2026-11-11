import { useFormContext } from "react-hook-form";
import { CalendarRange, Check } from "lucide-react";
import { DESIRED_TATTOO_PERIODS, DESIRED_TATTOO_PERIOD_LABELS, PROJECT_BUDGET_RANGES, getParisTodayKey } from "@/lib/booking-link";
import Section from "./Section";
import TextInput from "./TextInput";
import { choice } from "./ui";

type ChoiceOption = { value: string; label: string };

function ChoiceGroup({ name, legend, options, hint }: { name: string; legend: string; options: ChoiceOption[]; hint?: string }) {
  const { watch, setValue } = useFormContext();
  const selected = watch(name) ?? "";
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-xs font-medium text-white/60">{legend} <span className="ml-1 text-[10px] font-normal text-white/35">Facultatif</span></legend>
      {hint && <p className="mb-3 text-[11px] leading-5 text-white/40">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected === option.value;
          return (
            <button key={option.value || "none"} type="button" aria-pressed={active}
              onClick={() => setValue(name, active ? "" : option.value, { shouldDirty: true, shouldValidate: true })}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-xs ${choice(active)}`}>
              {active && <Check size={12} className="text-tertiary-400" />}{option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Période souhaitée, budget et premier tatouage d'une demande Projet. Tous les champs sont facultatifs. */
export default function ProjectPreferences() {
  const { watch } = useFormContext();
  const period = watch("project.desiredTattooPeriod");
  const today = getParisTodayKey();
  const rangeStart = watch("project.desiredTattooStartDate");

  return (
    <Section unboxed title="Votre projet en pratique" description="Ces informations sont indicatives : elles aident l’artiste à préparer votre rendez-vous et ne bloquent aucun créneau." icon={<CalendarRange size={17} />}>
      <div className="space-y-7">
        <div className="space-y-3">
          <ChoiceGroup name="project.desiredTattooPeriod" legend="Quand aimeriez-vous être tatoué(e) ?" options={DESIRED_TATTOO_PERIODS.map(value => ({ value, label: DESIRED_TATTOO_PERIOD_LABELS[value] }))} />
          {period === "EXACT_DATE" && <div className="max-w-xs"><TextInput name="project.desiredTattooDate" label="Date souhaitée" type="date" required min={today} /></div>}
          {period === "DATE_RANGE" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput name="project.desiredTattooStartDate" label="À partir du" type="date" required min={today} />
              <TextInput name="project.desiredTattooEndDate" label="Jusqu’au (inclus)" type="date" required min={rangeStart || today} />
            </div>
          )}
        </div>
        <div>
          <ChoiceGroup name="project.budget" legend="Votre budget" hint="Une fourchette suffit, l’artiste vous confirmera le tarif." options={[...PROJECT_BUDGET_RANGES.map(range => ({ value: range.key, label: range.label })), { value: "", label: "Je ne sais pas encore" }]} />
        </div>
        <div>
          <ChoiceGroup name="project.isFirstTattoo" legend="S’agit-il de votre premier tatouage ?" options={[{ value: "yes", label: "Oui" }, { value: "no", label: "Non" }, { value: "", label: "Je préfère ne pas répondre" }]} />
        </div>
      </div>
    </Section>
  );
}
