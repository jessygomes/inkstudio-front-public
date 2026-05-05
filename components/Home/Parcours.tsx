import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { FaRegAddressBook } from "react-icons/fa6";

const steps = [
  {
    step: "01",
    title: "Recherchez",
    description:
      "Affinez par ville et style pour trouver rapidement les studios qui correspondent à votre projet.",
    icon: IoSearch,
    photo:
      "/photos/yddd.jpg",
  },
  {
    step: "02",
    title: "Explorez",
    description:
      "Analysez les portfolios, l'univers visuel et la spécialité des artistes avant de faire votre choix.",
    icon: FaRegImages,
    photo: "/photos/recherche.jpg",
  },
  {
    step: "03",
    title: "Réservez",
    description:
      "Contactez votre salon préféré et prenez rendez-vous en ligne, simplement et sans perte de temps.",
    icon: FaRegAddressBook,
    photo:
      "/photos/reserve.jpg",
  },
];

export default function Parcours() {
  return (
    <section className="bg-noir-700 py-24">
      <div className="mx-4 sm:mx-8 lg:mx-20">

        {/* Header */}
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-tertiary-400/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary-400 font-one">
              Parcours simple
            </span>
            <span className="h-px w-10 bg-tertiary-400/60" />
          </div>
          <h2 className="text-4xl font-bold text-white font-two sm:text-5xl lg:text-6xl">
            Comment ça marche ?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/50 font-one">
            Trois étapes claires pour trouver un salon, comparer les styles et
            réserver avec confiance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-6">
          {steps.map(({ step, title, description, icon: Icon, photo }) => (
            <article
              key={step}
              className="group relative h-120 overflow-hidden rounded-2xl cursor-default border-2 border-tertiary-400/50 transition-all duration-300 hover:border-tertiary-400/70 hover:shadow-lg hover:shadow-tertiary-500/30"
            >
              {/* Background photo */}
              <Image
                src={photo}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Gradient overlay global */}
              <div className="absolute inset-0 bg-linear-to-t from-noir-900/80 via-noir-900/20 to-transparent" />
              {/* Gradient bottom renforcé pour la lisibilité du texte */}
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-noir-500 to-transparent" />

              {/* Step number watermark */}
              <span className="absolute -right-1 -top-4 select-none text-[9rem] font-black leading-none text-white/20 font-two transition-all duration-500 group-hover:text-tertiary-400/70">
                {step}
              </span>

              {/* Content pinned to bottom */}
              <div className="absolute inset-x-0 bottom-0 p-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-tertiary-500/25 ring-1 ring-tertiary-400/30 backdrop-blur-sm transition-colors duration-300 group-hover:bg-tertiary-500/40">
                  <Icon size={20} className="text-tertiary-400 text-base" />
                </div>
                <h3 className="text-2xl font-bold text-white font-two">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90 font-one">
                  {description}
                </p>
              </div>

              {/* Top-left step label */}
              <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70 font-one backdrop-blur-sm">
                Étape {step}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
