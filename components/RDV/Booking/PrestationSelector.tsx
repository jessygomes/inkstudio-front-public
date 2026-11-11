import { useFormContext } from "react-hook-form";
import { ArrowRight, Check, Clock3, Lightbulb, MessageCircle, PenTool, RefreshCw, Sparkles } from "lucide-react";
import { formatDurationMinutes } from "@/lib/booking-link";
import { checkBadge, choice, focusRing } from "./ui";

const ORDER = ["PROJET", "TATTOO", "RETOUCHE", "PIERCING"];

const CONTENT: Record<string, { label: string; text: string; icon: React.ReactNode; tip?: string }> = {
  PROJET: { label: "Parler de mon projet", text: "Échangez avec l’artiste sur votre idée. Pas de tatouage ce jour-là.", icon: <MessageCircle size={18} /> },
  TATTOO: { label: "Me faire tatouer un flash", text: "Choisissez un dessin disponible et réservez votre séance.", icon: <PenTool size={18} /> },
  RETOUCHE: { label: "Une retouche", text: "Raviver ou corriger un tatouage existant.", icon: <RefreshCw size={18} />, tip: "Conseil : commencez par un RDV projet" },
  PIERCING: { label: "Un piercing", text: "Choisissez la zone et le type de piercing, puis l’horaire.", icon: <Sparkles size={18} /> },
};

interface PrestationSelectorProps {
  prestations: string[];
  onPrestationChange?: (prestation: string) => void;
  projectAppointmentDurationMinutes?: number;
  projectAppointmentIsFree?: boolean;
  projectAppointmentPrice?: number;
}

export default function PrestationSelector({
  prestations,
  onPrestationChange,
  projectAppointmentDurationMinutes = 60,
  projectAppointmentIsFree = true,
  projectAppointmentPrice = 0,
}: PrestationSelectorProps) {
  const { watch, setValue } = useFormContext();
  const prestation = watch("prestation");
  const ordered = [...prestations].sort((a, b) => {
    const rank = (value: string) => (ORDER.indexOf(value) === -1 ? ORDER.length : ORDER.indexOf(value));
    return rank(a) - rank(b);
  });

  const meta = (p: string): { text: string; duration?: boolean }[] => {
    if (p === "PROJET") return [{ text: formatDurationMinutes(projectAppointmentDurationMinutes), duration: true }, { text: projectAppointmentIsFree ? "Gratuit" : `${projectAppointmentPrice} €` }];
    if (p === "RETOUCHE") return [{ text: "1 h", duration: true }];
    if (p === "TATTOO") return [{ text: "Durée selon le flash", duration: true }];
    if (p === "PIERCING") return [{ text: "30 min ou 1 h", duration: true }];
    return [];
  };

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Type de rendez-vous</legend>
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
        {ordered.map(p => {
          const content = CONTENT[p] ?? { label: p, text: "", icon: <PenTool size={18} /> };
          const selected = prestation === p;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (selected) return;
                if (onPrestationChange) onPrestationChange(p);
                else setValue("prestation", p, { shouldDirty: true, shouldValidate: true });
              }}
              className={`group flex h-full min-h-32 items-start gap-3.5 rounded-3xl p-4 text-left sm:p-5 ${selected ? choice(true) : `bg-noir-500 text-white/70 transition hover:bg-white/8 ${focusRing}`}`}
            >
              <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-colors ${selected ? "bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900" : "bg-white/6 text-white/60 group-hover:text-tertiary-400"}`}>{content.icon}</span>
              <span className="flex h-full min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-tight text-white">{content.label}</span>
                  {selected && <span className={`ml-auto ${checkBadge}`}><Check size={12} strokeWidth={3} aria-label="Sélectionné" /></span>}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/55">{content.text}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {meta(p).map(item => <span key={item.text} className="inline-flex items-center gap-1 rounded-xl bg-white/8 px-2.5 py-1 text-[10px] text-white/70">{item.duration && <Clock3 size={10} aria-hidden="true" />}{item.text}</span>)}
                  {content.tip && prestations.includes("PROJET") && <span className="inline-flex items-center gap-1 rounded-xl bg-tertiary-400/12 px-2.5 py-1 text-[10px] text-tertiary-400"><Lightbulb size={10} aria-hidden="true" />{content.tip}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {prestation === "RETOUCHE" && prestations.includes("PROJET") && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-linear-to-r from-tertiary-400/12 to-cuatro-500/8 p-4">
          <p className="min-w-0 flex-1 text-xs leading-5 text-white/70">Une retouche se prépare : un rendez-vous projet permet à l’artiste de voir le tatouage et de vous conseiller avant la séance.</p>
          <button type="button" onClick={() => onPrestationChange ? onPrestationChange("PROJET") : setValue("prestation", "PROJET", { shouldDirty: true, shouldValidate: true })} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-tertiary-400/15 px-3.5 py-2 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-400/25 ${focusRing}`}>Prendre un rendez-vous projet<ArrowRight size={12} /></button>
        </div>
      )}
    </fieldset>
  );
}
