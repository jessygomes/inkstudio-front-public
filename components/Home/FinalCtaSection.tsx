import { Search } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export default function FinalCtaSection() {
  return (
    <section aria-labelledby="home-closing-title" className="bg-noir-700 py-16 font-one sm:py-24">
      <div className="mx-4 grid gap-8 border-y border-white/15 py-10 sm:mx-8 sm:py-14 lg:mx-20 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
        <div><p className="text-xs uppercase tracking-[0.2em] text-tertiary-400">À vous d’écrire la suite</p><h2 id="home-closing-title" className="mt-4 font-two text-3xl font-semibold tracking-tight text-white sm:text-5xl">Une idée en tête ?<br /><span className="text-white/50">Trouvez votre artiste.</span></h2></div>
        <div><p className="max-w-xl text-base leading-8 text-white/65">Parcourez les portfolios, comparez les styles et prenez contact avec le studio qui vous correspond.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><AppButton href="/trouver-un-salon" icon={<Search size={17} aria-hidden="true" />} className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Trouver un salon</AppButton><AppButton href="/en-savoir-plus" variant="secondary" className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Découvrir Inkera</AppButton></div></div>
      </div>
    </section>
  );
}
