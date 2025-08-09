import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <section className="w-full px-2 sm:px-0 sm:flex justify-center z-20">
      <div className="hidden sm:block w-2/5"></div>
      <div className="w-full sm:w-3/4 mr-20 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col justify-center items-center gap-2">
          <h1 className="text-white font-two">INKSTUDIO</h1>
          <h2 className="text-3xl font-bold text-center text-white uppercase font-two tracking-wide">
            Trouvez votre salon de tatouage
          </h2>
          <p className="text-center text-gray-600 text-md font-semibold font-one">
            Trouvez facilement le salon de tatouage qui vous convient proche de
            chez vous. Explorez les portfolios des artistes, consultez les avis
            et prenez rendez-vous en ligne.
          </p>
        </div>
        <Link
          href={"/trouver-un-salon"}
          className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
        >
          Trouve un salon
        </Link>
      </div>
    </section>
  );
}
