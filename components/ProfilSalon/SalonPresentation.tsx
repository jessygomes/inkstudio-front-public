import { Check, Hand, Palette, PenTool, Sparkles } from "lucide-react";
import { getTattooPracticeDetails, getTattooPracticeLabels } from "@/lib/booking-link";
import { surface } from "@/components/Shared/ui";
import SectionHeading from "./SectionHeading";
import ExpandableText from "@/components/Shared/ExpandableText";

type Props = { description?: string | null; prestations: string[]; styles: string[]; tattooPractices?: unknown; tattooPracticeDetails?: unknown };

const chip = "max-w-full break-words rounded-xl bg-white/6 px-3 py-1.5 text-[11px] text-white/70";

export default function SalonPresentation({ description, prestations, styles, tattooPractices, tattooPracticeDetails }: Props) {
  const serviceLabels: Record<string, string> = { TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Consultation projet", RETOUCHE: "Retouche" };
  const practices = getTattooPracticeLabels(tattooPractices);
  const practiceDetails = practices.length ? getTattooPracticeDetails(tattooPracticeDetails) : null;
  const showStylesColumn = styles.length > 0 || practices.length > 0;
  return (
    <section id="presentation" aria-labelledby="presentation-heading" className={`${surface} scroll-mt-28 font-one sm:p-7`}>
      <SectionHeading id="presentation-heading" icon={<Sparkles size={17} />} eyebrow="Une rencontre, un univers" title="À propos" />
      {description?.trim() ? <ExpandableText text={description.trim()} lines={5} className="text-[15px] leading-7 text-white/70" /> : <p className="text-[15px] leading-7 text-white/70">Ce profil n’a pas encore renseigné sa présentation.</p>}
      {(prestations.length > 0 || showStylesColumn) && (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {!!prestations.length && (
            <div className="min-w-0 rounded-2xl bg-white/3 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-white/80"><PenTool size={14} className="text-tertiary-400" aria-hidden="true" />Les prestations</h3>
              <ul className="flex flex-wrap gap-2">{prestations.map(service => <li key={service} className="inline-flex max-w-full items-center gap-1.5 rounded-xl bg-linear-to-r from-tertiary-400/20 to-cuatro-500/10 px-3 py-1.5 text-[11px] text-white/85"><Check size={12} className="shrink-0 text-tertiary-400" aria-hidden="true" /><span className="break-words">{serviceLabels[service] || service}</span></li>)}</ul>
            </div>
          )}
          {showStylesColumn && (
            <div className="min-w-0 space-y-5 rounded-2xl bg-white/3 p-4">
              {!!styles.length && <div><h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-white/80"><Palette size={14} className="text-tertiary-400" aria-hidden="true" />Les styles de prédilection</h3><ul className="flex flex-wrap gap-2">{styles.map(style => <li key={style} className={chip}>{style}</li>)}</ul></div>}
              {!!practices.length && <div><h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-white/80"><Hand size={14} className="text-tertiary-400" aria-hidden="true" />Les pratiques de tatouage</h3><ul className="flex flex-wrap gap-2">{practices.map(practice => <li key={practice} className={chip}>{practice}</li>)}</ul>{practiceDetails && <p className="mt-2.5 whitespace-pre-line break-words text-[11px] leading-5 text-white/45">{practiceDetails}</p>}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
