import { PiStarFourFill } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import AppButton from "@/components/Shared/AppButton";

export default function FinalCtaSection() {
  return (
    <section className="bg-linear-to-t from-noir-700 to-noir-700 py-20">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
              Trouvez votre artiste, <span className="text-tertiary-400">réservez en confiance.</span>
            </h2>
            <p className="text-xl text-white/80 font-one leading-relaxed">
              Parcourez des portfolios précis, comparez les styles et prenez contact avec le studio qui vous correspond vraiment.
              {/* <span className="text-tertiary-400 font-semibold">
                {" "}
                simplifier leur quotidien
              </span> */}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
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
          </div>
        </div>
      </section>
  );
}