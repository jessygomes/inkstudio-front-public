"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import AppButton from "../Shared/AppButton";
import { IoSearch } from "react-icons/io5";

export default function HeroSection() {
  const allHeroPhotos = [
    "/photos/aakaaaaaa.jpg",
    "/photos/Jordan Clarkson.jpg",
    "/photos/Luka Sabbat.jpg",
    "/photos/old fart.jpg",
    "/photos/Instagram.jpg",
    "/photos/steve lacy bby.jpg",
    "/photos/Village Green Fest 2013.jpg",
    "/photos/AI Art.jpg",
    "/photos/girls night out.jpg",
    "/photos/Gorgeous.jpg",
    "/photos/Lakeith Stanfield.jpg",
    "/photos/LYNNPINNEDIT ✰_.jpg",
    "/photos/mennonoiseless.jpg",
    "/photos/Polynesian Tattoos in the Marquesas Islands.jpg",
    "/photos/Sak Yant Tattoo Festival Day One, A Must-See in Thailand.jpg",
    "/photos/Semerkaoriginal inst.jpg",
    "/photos/Tahitian dance.jpg",
    "/photos/When Anthony Bourdain got a hand-tap tattoo in Malaysia__GM x.jpg",
    "/photos/_samm_roberts_  fit.jpg",
    "/photos/sensitive.jpg",
    "/photos/casqu.jpg",
    "/photos/assis.jpg",
    "/photos/jam.jpg",
    "/photos/red.jpg",
    "/photos/goth.jpg",
    "/photos/blk.jpg",
    "/photos/gun.jpg",
    "/photos/drink.jpg",
    "/photos/cre.jpg",
    "/photos/sit.jpg",
    "/photos/ot.jpg",
    "/photos/fbb.jpg",
    "/photos/metro.jpg",
    "/photos/bi.jpg",
    "/photos/bed.jpg",
  ];

  const [heroPhotos, setHeroPhotos] = React.useState(allHeroPhotos.slice(0, 9));

  React.useEffect(() => {
    const shuffled = [...allHeroPhotos].sort(() => Math.random() - 0.5);
    setHeroPhotos(shuffled.slice(0, 9));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.8 },
    },
  };

  return (
    <section className="w-full -mt-16 md:-mt-21 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center z-20 bg-noir-700">
      <motion.div
        className="relative w-full h-[55vh] max-h-[55vh] md:h-[55vh] md:max-h-[55vh] lg:h-screen lg:max-h-screen p-3 grid grid-cols-3 grid-rows-3 gap-2 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {heroPhotos.map((photo, index) => (
          <motion.div
            key={`${photo}-${index}`}
            className="relative overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src={photo}
              alt={`Inspiration tatouage ${index + 1}`}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 33vw, 16vw"
              priority={index < 3}
            />
          </motion.div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-noir-700/60 flex items-center justify-center">
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <Image
              src="/logo/Logo16.png"
              alt="Logo Inkera"
              width={420}
              height={420}
              className="w-56 h-auto sm:w-64 md:w-72 lg:w-80 opacity-80"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative w-full min-h-0 lg:min-h-screen px-4 lg:px-10 py-2 md:py-2 lg:py-8 flex flex-col items-center justify-start lg:justify-center gap-4 lg:gap-8 lg:items-start -mt-14 md:-mt-26 lg:mt-0">
        <div className="relative z-10 flex flex-col justify-center items-center md:items-start gap-1 sm:gap-2">
          <h1 className="hidden md:block md:text-center lg:text-left text-white font-two">INKERA <span className="text-white/30">PEOPLE</span></h1>
          <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left text-white uppercase font-two tracking-wide">
            Trouvez votre tatoueur idéal
          </h2>
          <p className="text-center md:text-left text-white/50 text-sm font-one max-w-xl">
            Trouvez facilement le tatoueur/tatoueuse qui vous convient proche de
            chez vous. Explorez les portfolios des artistes, consultez les avis
            et prenez rendez-vous en ligne.
          </p>
        </div>
        <div className="flex items-center flex-col sm:flex-row gap-2">
        <AppButton
          href="/trouver-un-salon"
          variant="primary"
          icon={<IoSearch />}
          className="w-fit sm:min-w-48 whitespace-nowrap"
        >
          Trouver un tatoueur
        </AppButton>

        <AppButton
          href={"/inspiration"}
          variant="secondary"
          className="whitespace-nowrap w-fit sm:min-w-48"
        >
          Découvrir des tatouages
        </AppButton>
        </div>
      </div>
    </section>
  );
}