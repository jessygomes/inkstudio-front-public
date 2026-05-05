"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function HeroSection() {
  const allHeroPhotos = [
    "/photos/aakaaaaaa.jpg",
    "/photos/Jordan Clarkson.jpg",
    "/photos/Luka Sabbat.jpg",
    "/photos/old fart.jpg",
    "/photos/Instagram.jpg",
    "/photos/steve lacy bby.jpg",
    "/photos/Village Green Fest 2013.jpg",
    "/photos/X.jpg",
    "/photos/AI Art.jpg",
    "/photos/girls night out.jpg",
    "/photos/Gorgeous.jpg",
    "/photos/Lakeith Stanfield.jpg",
    "/photos/LYNNPINNEDIT ✰_.jpg",
    "/photos/Maestro tatuador tahitiano.jpg",
    "/photos/mennonoiseless.jpg",
    "/photos/Polynesian Tattoos in the Marquesas Islands.jpg",
    "/photos/Sak Yant Tattoo Festival Day One, A Must-See in Thailand.jpg",
    "/photos/Sak Yant_ Visit Wat Bang Phra in Thailand in 2023.jpg",
    "/photos/Semerkaoriginal inst.jpg",
    "/photos/Tahitian dance.jpg",
    "/photos/When Anthony Bourdain got a hand-tap tattoo in Malaysia__GM x.jpg",
    "/photos/young-adult-artist-tattooing-with-creativity-skill-generated-by-ai.jpg",
    "/photos/_samm_roberts_  fit.jpg",
  ];

  const [heroPhotos, setHeroPhotos] = React.useState(allHeroPhotos.slice(0, 9));

  React.useEffect(() => {
    const shuffled = [...allHeroPhotos].sort(() => Math.random() - 0.5);
    setHeroPhotos(shuffled.slice(0, 9));
  }, []);

  return (
    <section className="w-full -mt-16 md:-mt-21 min-h-screen md:min-h-screen grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 items-center z-20 bg-noir-700">
      <div className="relative w-full h-[55vh] max-h-[55vh] md:h-screen md:max-h-screen grid grid-cols-3 grid-rows-3 gap-2 overflow-hidden">
        {heroPhotos.map((photo, index) => (
          <div
            key={`${photo}-${index}`}
            className="relative overflow-hidden"
          >
            <Image
              src={photo}
              alt={`Inspiration tatouage ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 16vw"
              priority={index < 3}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-noir-700/60 flex items-center justify-center">
          <Image
            src="/logo/Logo16.png"
            alt="Logo Inkera"
            width={420}
            height={420}
            className="w-56 h-auto sm:w-64 md:w-72 lg:w-80 opacity-80"
          />
        </div>
      </div>

      <div className="relative w-full min-h-0 md:min-h-screen px-4 lg:px-10 py-4 md:py-8 flex flex-col items-center justify-start md:justify-center gap-4 md:gap-8 md:items-start -mt-10 sm:mt-0">
        <div className="relative z-10 flex flex-col justify-center items-center md:items-start gap-1 sm:gap-2">
          <h1 className="hidden md:block text-white font-two">INKERA</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left text-white uppercase font-two tracking-wide">
            Trouvez votre salon de tatouage
          </h2>
          <p className="text-center md:text-left text-gray-600 text-sm font-semibold font-one max-w-xl">
            Trouvez facilement le salon de tatouage qui vous convient proche de
            chez vous. Explorez les portfolios des artistes, consultez les avis
            et prenez rendez-vous en ligne.
          </p>
        </div>
        <div>
        <Link
          href={"/trouver-un-salon"}
          className="relative z-10 cursor-pointer px-8 py-2 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
        >
          Trouver un salon
        </Link>

        <Link
          href={"/decouvrir-des-tatouages"}
          className="relative z-10 ml-4 cursor-pointer px-8 py-2 bg-linear-to-r from-cuatro-500 to-cuatro-600 hover:bg-cuatro-600 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
        >
          Découvrir des tatouages
        </Link>

        </div>
      </div>
    </section>
  );
}