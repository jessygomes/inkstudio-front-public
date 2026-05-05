import { PiStarFourFill } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import AppButton from "@/components/Shared/AppButton";

export default function FinalCtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-noir-700 py-12 sm:py-16">
      <div className="relative container mx-auto px-4 sm:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-4xl border border-white/10 bg-noir-900/35 px-6 py-7 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:px-10 sm:py-9">
          <div className="relative">
            <span className="pointer-events-none absolute right-0 top-0 hidden select-none text-4xl font-bold text-white/6 font-two sm:block">
              INKERA
            </span>

            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-tertiary-400/30 bg-tertiary-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary-300 font-one">
              <PiStarFourFill className="text-xs" />
              Selection premium
            </span>

            <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white font-two sm:text-4xl">
              Trouvez votre artiste,
              <span className="block text-tertiary-300">réservez en confiance.</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 font-one sm:text-[15px]">
              Parcourez des portfolios précis, comparez les styles et prenez
              contact avec le studio qui vous correspond vraiment.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <AppButton
                href="/trouver-un-salon"
                variant="primary"
                icon={<IoSearch />}
                className="sm:min-w-48"
              >
                Trouver un salon
              </AppButton>
              <AppButton
                href="/en-savoir-plus"
                variant="secondary"
                className="sm:min-w-40"
              >
                En savoir plus
              </AppButton>
            </div>

            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/45 font-one">
              Plus clair. Plus rapide. Plus inspire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}