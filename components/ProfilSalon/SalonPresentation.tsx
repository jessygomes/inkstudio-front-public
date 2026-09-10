import { ArrowUpRight, Check, Sparkles } from "lucide-react";

type Props = {
  description?: string | null;
  prestations: string[];
  styles: string[];
};

export default function SalonPresentation({ description, prestations, styles }: Props) {
  return (
    <section id="presentation" aria-labelledby="presentation-heading" className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 bg-noir-500 font-one">
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Sparkles size={18} aria-hidden="true" /></span>
          <h2 id="presentation-heading" className="text-lg text-white sm:text-xl">Présentation</h2>
        </div>
        <p className="whitespace-pre-line text-sm leading-7 text-white/70 sm:text-sm">
          {description?.trim() || "Ce profil n’a pas encore renseigné sa présentation."}
        </p>
      </div>
      {(prestations.length > 0 || styles.length > 0) && (
        <div className="grid gap-5 border-t border-white/8 bg-noir-700/30 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">
          {prestations.length > 0 && <div>
            <h3 className="mb-3 text-sm font-semibold text-white/90">Les prestations</h3>
            <ul className="space-y-2 flex gap-4">
              {prestations.map((prestation) => <li key={prestation} className="flex items-start gap-2 text-sm leading-6 text-white/65"><Check size={15} className="mt-1 shrink-0 text-tertiary-400" aria-hidden="true" /><span className="break-words">{prestation}</span></li>)}
            </ul>
          </div>}
          {styles.length > 0 && <div>
            <h3 className="mb-3 text-sm font-semibold text-white/90">L’univers artistique</h3>
            <ul className="flex flex-wrap gap-2">
              {styles.map((style) => <li key={style} className="max-w-full break-words rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-white/75">{style}</li>)}
            </ul>
          </div>}
        </div>
      )}
    </section>
  );
}
