import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export function HomeJourney() {
  return (
    <section aria-labelledby="journey-title" className="bg-noir-700 py-16 font-one sm:py-24">
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-tertiary-400">De l’idée au rendez-vous</p><h2 id="journey-title" className="mt-4 text-balance font-two text-3xl font-semibold tracking-tight text-white sm:text-5xl">Votre projet commence<br />par une belle rencontre.</h2></div>
          <p className="max-w-md text-base leading-7 text-white/60">Trouvez un univers qui vous parle, découvrez le travail des artistes et préparez votre prochain tatouage.</p>
        </div>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
          {[
            { title: "Trouvez votre salon", description: "Affinez votre recherche par ville et par style pour découvrir les studios qui correspondent à votre projet.", image: "/photos/yddd.jpg" },
            { title: "Explorez les univers", description: "Prenez le temps de parcourir les portfolios et de découvrir la spécialité de chaque artiste.", image: "/photos/recherche.jpg" },
            { title: "Préparez la rencontre", description: "Échangez avec le salon qui vous plaît et prenez rendez-vous en ligne, simplement.", image: "/photos/reserve.jpg" },
          ].map((step, index) => <li key={step.title}>
            <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-white/5"><Image src={step.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>
            <div className="flex gap-4 border-t border-white/15 pt-5"><span aria-hidden="true" className="pt-1 text-xs text-tertiary-400">0{index + 1}</span><div><h3 className="font-two text-xl font-medium text-white sm:text-2xl">{step.title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-white/60">{step.description}</p></div></div>
          </li>)}
        </ol>
        <div className="mt-8 flex justify-end"><AppButton href="/trouver-un-salon" variant="secondary" icon={<ArrowRight size={16} aria-hidden="true" />} className="min-h-11 focus-visible:outline-2 focus-visible:outline-tertiary-400">Explorer les salons</AppButton></div>
      </div>
    </section>
  );
}

export function HomeClosing() {
  return (
    <section aria-labelledby="home-closing-title" className="bg-noir-700 py-16 font-one sm:py-24">
      <div className="mx-4 grid gap-8 border-y border-white/15 py-10 sm:mx-8 sm:py-14 lg:mx-20 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
        <div><p className="text-xs uppercase tracking-[0.2em] text-tertiary-400">À vous d’écrire la suite</p><h2 id="home-closing-title" className="mt-4 font-two text-3xl font-semibold tracking-tight text-white sm:text-5xl">Une idée en tête ?<br /><span className="text-white/50">Trouvez votre artiste.</span></h2></div>
        <div><p className="max-w-xl text-base leading-8 text-white/65">Parcourez les portfolios, comparez les styles et prenez contact avec le studio qui vous correspond.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><AppButton href="/trouver-un-salon" icon={<Search size={17} aria-hidden="true" />} className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Trouver un salon</AppButton><AppButton href="/en-savoir-plus" variant="secondary" className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Découvrir Inkera</AppButton></div></div>
      </div>
    </section>
  );
}

