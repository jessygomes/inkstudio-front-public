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
    <section className="relative isolate overflow-hidden bg-noir-700 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-noir-700 via-noir-500/80 to-noir-700" />
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-tertiary-400/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
        <div className="absolute -left-40 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-tertiary-500/6 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>

      <div className="relative mx-4 sm:mx-8 lg:mx-20">

        {/* Header */}
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-tertiary-400/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary-400 font-one">
              Parcours simple
            </span>
            <span className="h-px w-10 bg-tertiary-400/60" />
          </div>
          <h2 className="text-3xl font-bold text-white font-two sm:text-5xl lg:text-6xl">
            Comment ça marche ?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/50 font-one lg:whitespace-nowrap">
            Trois étapes claires pour trouver un salon, comparer les styles et
            réserver.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(({ step, title, description, icon: Icon, photo }) => (
            <article
              key={step}
              className="group relative h-80 sm:h-120 overflow-hidden rounded-3xl cursor-default border border-white/10 transition-all duration-300 hover:border-tertiary-400/40 hover:shadow-xl hover:shadow-tertiary-500/15"
            >
              {/* Background photo */}
              <Image
                src={photo}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Gradient overlay unifié */}
              <div className="absolute inset-0 bg-linear-to-t from-noir-700/95 via-noir-700/55 to-noir-700/20" />

              {/* Teinte orange subtile au hover */}
              <div className="absolute inset-0 bg-linear-to-bl from-tertiary-500/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-tertiary-500/8" />

              {/* Step number watermark */}
              <span className="absolute -right-2 -top-4 select-none text-[9rem] font-black leading-none text-white/6 font-two transition-all duration-500 group-hover:text-tertiary-400/50">
                {step}
              </span>

              {/* Indicateur d'étape — ligne + chiffre */}
              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span className="h-px w-4 bg-tertiary-400/55" />
                <span className="text-[10px] font-semibold tracking-[0.3em] text-tertiary-400/70 font-one uppercase">
                  {step}
                </span>
              </div>

              {/* Content pinned to bottom */}
              <div className="absolute inset-x-0 bottom-0 p-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-tertiary-500/25 ring-1 ring-tertiary-400/30 backdrop-blur-sm transition-colors duration-300 group-hover:bg-tertiary-500/40">
                  <Icon size={20} className="text-tertiary-400" />
                </div>
                <h3 className="text-2xl font-bold text-white font-two">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75 font-one">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
