"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { homePhotos } from "@/lib/data/homePhotos";
import { ArrowUpRight, Images } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

function PhotoCluster({ photos, reverse = false }: { photos: string[]; reverse?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none hidden w-full max-w-64 grid-cols-2 items-center gap-3 justify-self-center p-3 xl:grid">
      {photos.map((src, index) => (
        <div key={src} className={index === 0
          ? "relative row-span-2 flex aspect-[2/3] w-full items-center justify-center " + (reverse ? "col-start-2 row-start-1 rotate-3" : "-rotate-3")
          : "relative flex aspect-square w-full items-center justify-center " + (reverse ? "-rotate-3" : "rotate-3")}>
          <Image src={src} alt="" width={240} height={360} sizes="120px" className="h-auto max-h-full w-auto max-w-full rounded-2xl object-contain opacity-85" />
        </div>
      ))}
    </div>
  );
}

export default function FinalCtaSection() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const shuffled = [...homePhotos];
      for (let index = shuffled.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
      }
      setPhotos(shuffled.slice(0, 6));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section aria-labelledby="home-closing-title" className="bg-noir-800 font-one">
      <div className="relative isolate mx-4 grid items-center gap-6 bg-noir-800 py-6 sm:mx-8 sm:py-8 lg:mx-20 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,1fr)]">
        <PhotoCluster photos={photos.slice(0, 3)} />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <span aria-hidden="true" className="mb-5 h-px w-10 bg-linear-to-r from-tertiary-400 to-tertiary-500" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/55 sm:text-[11px]">Le prochain pas est à vous</p>
          <h2 id="home-closing-title" className="mt-4 font-two text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl xl:text-5xl">
            <span className="block text-white">Toutes les histoires.</span>{" "}
            <span className="block text-white/65">Tous les styles.</span>{" "}
            <span className="block bg-linear-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">Toutes les peaux.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">À chacun son univers. Trouvez l’artiste qui fera vivre le vôtre.</p>
          <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <AppButton href="/trouver-un-salon" icon={<ArrowUpRight size={16} aria-hidden="true" />} className="px-5!">Trouver mon artiste</AppButton>
            <AppButton href="/inspiration" variant="secondary" icon={<Images size={16} aria-hidden="true" />} className="px-5!">Trouver l’inspiration</AppButton>
          </div>
        </div>

        <PhotoCluster photos={photos.slice(3, 6)} reverse />
      </div>
    </section>
  );
}
