import { Check, Palette, PenTool, Sparkles } from "lucide-react";

type Props = { description?: string | null; prestations: string[]; styles: string[]; };

export default function SalonPresentation({ description, prestations, styles }: Props) {
  const serviceLabels: Record<string, string> = { TATTOO: "Tatouage", PIERCING: "Piercing", PROJET: "Consultation projet", RETOUCHE: "Retouche" };
  return (
    <section id="presentation" aria-labelledby="presentation-heading" className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 bg-noir-800 font-one">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Sparkles size={17} aria-hidden="true" /></span><div><p className="mb-1 text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">Une rencontre, un univers</p><h2 id="presentation-heading" className="text-lg font-medium text-white/90">À propos</h2></div></div>
        <div className="rounded-xl border border-white/8 bg-white/[0.015] p-4 sm:p-5"><p className="whitespace-pre-line break-words text-sm leading-7 text-white/65">{description?.trim() || "Ce profil n’a pas encore renseigné sa présentation."}</p></div>
      </div>
      {(prestations.length > 0 || styles.length > 0) && <div className="grid gap-5 border-t border-white/8 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">
        {!!prestations.length && <div className="min-w-0"><h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-white/75"><PenTool size={14} className="text-tertiary-400/80" aria-hidden="true" />Les prestations</h3><ul className="flex flex-wrap gap-2">{prestations.map(service => <li key={service} className="inline-flex max-w-full items-start gap-1.5 rounded-lg border border-tertiary-400/15 bg-tertiary-400/5 px-2.5 py-2 text-[11px] text-white/75"><Check size={12} className="mt-0.5 shrink-0 text-tertiary-400" aria-hidden="true" /><span className="break-words">{serviceLabels[service] || service}</span></li>)}</ul></div>}
        {!!styles.length && <div className="min-w-0"><h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-white/75"><Palette size={14} className="text-tertiary-400/80" aria-hidden="true" />Les styles de prédilection</h3><ul className="flex flex-wrap gap-2">{styles.map(style => <li key={style} className="max-w-full break-words rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2 text-[11px] text-white/55">{style}</li>)}</ul></div>}
      </div>}
    </section>
  );
}
