"use client";

import { PiStarFourFill } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import AppButton from "@/components/Shared/AppButton";
import Image from "next/image";
import { motion } from "framer-motion";

export default function FinalCtaSection() {
  const backgroundPhotos = [
    "/photos/womensit.jpg",
    "/photos/tatas.jpg",
    "/photos/conf.jpg",
  ];

  return (
    <section className="relative bg-noir-700 py-20 ">
      {/* Background grid */}
      <motion.div
        className="absolute inset-0 grid grid-cols-3 gap-2 w-full h-full p-10 px-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {backgroundPhotos.slice(0, 3).map((photo, index) => (
          <div key={index} className="relative w-full h-full">
            <Image
              src={photo}
              alt={`Background ${index}`}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
          </div>
        ))}
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-noir-700/70 backdrop-blur-[10px] rounded-2xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
            Trouvez votre artiste, <span className="text-tertiary-400">réservez en confiance.</span>
          </h2>
          <p className="text-xl text-white/80 font-one leading-relaxed">
            Parcourez des portfolios précis, comparez les styles et prenez contact avec le studio qui vous correspond.
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