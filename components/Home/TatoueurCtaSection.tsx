import Image from "next/image";
import { ArrowUpRight, CalendarDays, MessagesSquare, PenTool, Sparkles } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

const benefits = [
  { Icon: CalendarDays, label: "Rendez-vous organisés" },
  { Icon: MessagesSquare, label: "Clients et échanges réunis" },
  { Icon: Sparkles, label: "Votre travail mis en lumière" },
];

export default function TatoueurCtaSection() {
  return (
    <section aria-labelledby="studio-title" className="bg-noir-800 font-one">
      <div className="mx-4 grid overflow-hidden rounded-2xl border border-white/10 bg-noir-800 sm:mx-8 lg:mx-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-[10px]"><span className="flex items-center gap-2 text-white/80"><PenTool size={14} className="text-tertiary-400" aria-hidden="true" />INKERA STUDIO</span><span className="h-3 w-px bg-white/15" aria-hidden="true" /><span className="text-white/40">Je suis tatoueur.se</span></div>
          <h2 id="studio-title" className="mt-5 max-w-lg font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Vous faites de l’art.<br /><span className="text-white/40">On simplifie le reste.</span></h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/50">Un espace pensé pour les artistes et les salons. Moins de dispersion dans votre quotidien, plus de temps pour vos projets.</p>
          <ul className="mt-5 flex flex-col gap-3 text-xs text-white/65">{benefits.map(({ Icon, label }) => <li key={label} className="flex items-center gap-2.5"><Icon size={15} className="text-tertiary-400" aria-hidden="true" />{label}</li>)}</ul>
          <AppButton href="https://www.inkera-studio.com/" icon={<ArrowUpRight size={16} aria-hidden="true" />} className="mt-6 px-5!">Découvrir Inkera Studio</AppButton>
        </div>
        <div className="relative min-h-48 overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0">
          <Image src="/images/bv.png" alt="" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover grayscale" />
          <div className="absolute inset-0 bg-noir-800/25" />
          <div className="absolute inset-0 bg-linear-to-t from-noir-800 via-transparent to-transparent lg:bg-linear-to-r" />
          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4"><p className="font-two text-2xl leading-tight tracking-wide text-white/85">L’art est à vous.<br /><span className="text-white/45">Les outils aussi.</span></p><PenTool size={25} className="shrink-0 text-tertiary-400" aria-hidden="true" /></div>
        </div>
      </div>
    </section>
  );
}
