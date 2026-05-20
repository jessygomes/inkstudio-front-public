import Image from "next/image";
import { FaRegCalendarCheck, FaRegChartBar } from "react-icons/fa";
import { BsPeople, BsShieldCheck } from "react-icons/bs";
import AppButton from "@/components/Shared/AppButton";

const perks = [
  {
    icon: FaRegCalendarCheck,
    title: "Gestion des rendez-vous",
    description: "Centralisez vos demandes et organisez votre planning facilement.",
  },
  {
    icon: BsPeople,
    title: "Visibilité accrue",
    description: "Attirez de nouveaux clients grâce à la plateforme Inkera.",
  },
  {
    icon: FaRegChartBar,
    title: "Statistiques & suivi",
    description: "Analysez vos performances et développez votre activité.",
  },
  {
    icon: BsShieldCheck,
    title: "Espace sécurisé",
    description: "Gérez votre salon en toute confiance, vos données sont protégées.",
  },
];

export default function TatoueurCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-tertiary-400/80 bg-noir-700 py-32">
       <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-tertiary-400/25 to-transparent" />
      {/* Background photo */}
      <Image
        src="/images/bv.png"
        alt="Tatoueur Inkera"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-noir-700/80" />

      {/* Content */}
      <div className="relative z-10 mx-4 sm:mx-8 lg:mx-20 py-20 flex flex-col items-center gap-10 text-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-tertiary-400/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary-400 font-one">
              Espace tatoueur
            </span>
            <span className="h-px w-10 bg-tertiary-400/60" />
          </div>
          <h2 className="text-4xl font-bold text-white font-two sm:text-5xl">
            Je suis tatoueur
          </h2>
          <p className="max-w-lg text-base text-white/90 font-one">
            Rejoignez Inkera Studio pour gérer votre salon (rendez-vous, clients, stocks, etc.) et développer votre clientèle en toute simplicité.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <AppButton
            href="https://www.inkera-studio.com/"
            variant="primary"
          >
            Accéder à Inkera Studio
          </AppButton>
        </div>

        {/* Perks */}
        {/* <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 max-w-6xl">
          {perks.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-noir-700/40 p-5 backdrop-blur-lg transition-all duration-300 hover:border-tertiary-400/30 hover:bg-noir-900/55 text-left"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-tertiary-500/25 ring-1 ring-tertiary-400/25 transition-colors duration-300 group-hover:bg-tertiary-500/40">
                <Icon size={20} className="text-tertiary-400 text-sm" />
              </div>
              <div>
                <h3 className="text-md font-bold text-white font-two">{title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-white/80 font-one">{description}</p>
              </div>
            </div>
          ))}
        </div> */}

        {/* CTA button */}
        
      </div>
    </section>
  );
}
