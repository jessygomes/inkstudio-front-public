"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Search } from "lucide-react";
import { homePhotos as allHeroPhotos } from "@/lib/data/homePhotos";
import AppButton from "../Shared/AppButton";

// Mosaïque : 6 × 3 sur ordinateur, 4 × 4 sur tablette, 3 × 5 sur mobile.
const TILE_COUNT = 18;

/** Masque les tuiles en trop selon la grille affichée. */
function tileVisibility(index: number) {
  if (index >= 16) return "hidden lg:block";
  if (index >= 15) return "hidden sm:block";
  return "";
}

export default function HeroSection() {
  const [heroPhotos, setHeroPhotos] = React.useState(allHeroPhotos.slice(0, TILE_COUNT));

  React.useEffect(() => {
    // Mélange côté client uniquement, pour éviter un écart d'hydratation.
    const frame = requestAnimationFrame(() => {
      const shuffled = [...allHeroPhotos].sort(() => Math.random() - 0.5);
      setHeroPhotos(shuffled.slice(0, TILE_COUNT));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative z-20 -mt-16 flex min-h-dvh w-full items-center justify-center overflow-hidden bg-noir-800 md:-mt-21 lg:-mt-16">
      {/* Mosaïque plein écran */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-2 p-2 sm:grid-cols-4 sm:grid-rows-4 lg:grid-cols-6 lg:grid-rows-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {heroPhotos.map((photo, index) => (
          <motion.div
            key={`${photo}-${index}`}
            className={`relative overflow-hidden rounded-xl ${tileVisibility(index)}`}
            variants={{ hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } } }}
          >
            <Image src={photo} alt="" fill className="object-cover" sizes="(min-width: 1024px) 17vw, (min-width: 640px) 25vw, 34vw" priority={index < 6} />
          </motion.div>
        ))}
      </motion.div>

      {/* Voiles : assombrit la mosaïque, éclaire le centre et fond vers le noir en bas. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-noir-800/55" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,13,13,0.85)_0%,rgba(13,13,13,0.55)_40%,transparent_75%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-noir-800/90 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-noir-800 via-noir-800/80 to-transparent" />

      {/* Contenu centré */}
      <div className="relative z-10 mx-5 flex max-w-3xl flex-col items-center pb-20 pt-28 text-center font-one sm:mx-10">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}>
          <Image src="/logo/Logo16.png" alt="Inkera" width={320} height={320} priority className="h-auto w-24 drop-shadow-2xl sm:w-28 lg:w-32" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }} className="mt-6 flex flex-col items-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Inkera People</span>
          <h1 id="hero-title" className="mt-1.5 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl lg:text-5xl">
            Trouvez votre tatoueur <span className="bg-linear-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">idéal</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Explorez les portfolios des artistes près de chez vous, consultez les avis et prenez rendez-vous en ligne.
          </p>
          <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-2.5 sm:flex sm:w-auto sm:max-w-none sm:justify-center">
            <AppButton href="/trouver-un-salon" variant="primary" icon={<Search size={16} />} className="min-h-12! whitespace-nowrap px-6! text-sm!">
              Trouver un tatoueur
            </AppButton>
            <AppButton href="/inspiration" variant="secondary" className="min-h-12! whitespace-nowrap border-0! bg-white/10! px-6! text-sm! backdrop-blur-md hover:bg-white/15!">
              Découvrir des tatouages
            </AppButton>
          </div>
        </motion.div>
      </div>

      {/* Invitation à défiler */}
      <motion.a
        href="#home-content"
        aria-label="Découvrir la suite"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 place-items-center rounded-xl p-2 text-white/40 transition hover:text-white sm:grid"
      >
        <ArrowDown size={18} className="motion-safe:animate-bounce" />
      </motion.a>
    </section>
  );
}
