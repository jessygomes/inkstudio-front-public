"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export default function HeroSection() {
	const allHeroPhotos = [
		"/photos/recherche.jpg",
		"/photos/reserve.jpg",
		"/photos/yddd.jpg",
		"/photos/complete.jpg",
		"/photos/Gorgeous.jpg",
		"/photos/Instagram.jpg",
		"/photos/AI Art.jpg",
		"/photos/sit.jpg",
		"/photos/metro.jpg",
	];

	const [heroPhotos, setHeroPhotos] = React.useState(allHeroPhotos.slice(0, 9));

	React.useEffect(() => {
		const shuffled = [...allHeroPhotos].sort(() => Math.random() - 0.5);
		setHeroPhotos(shuffled.slice(0, 9));
	}, []);

	const gridVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	};

	const tileVariants = {
		hidden: { opacity: 0, scale: 0.92 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.45 },
		},
	};

	const contentVariants = {
		hidden: { opacity: 0, y: 16 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, delay: 0.35 },
		},
	};

	return (
		<section className="relative isolate min-h-[calc(100vh-4.75rem)] overflow-hidden bg-noir-800 lg:min-h-[calc(100vh-5.25rem)]">
			<motion.div
				className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2"
				variants={gridVariants}
				initial="hidden"
				animate="visible"
			>
				{heroPhotos.map((photo, index) => (
					<motion.div
						key={`${photo}-${index}`}
						className="relative overflow-hidden rounded-xl"
						variants={tileVariants}
					>
						<Image
							src={photo}
							alt={`Inspiration tatouage ${index + 1}`}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 33vw, 33vw"
							priority={index < 3}
						/>
					</motion.div>
				))}
			</motion.div>

			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-noir-800/70 to-noir-800/85" />

			<motion.div
				className="relative z-10 container mx-auto flex min-h-[calc(100vh-4.75rem)] items-center px-4 py-10 text-center lg:min-h-[calc(100vh-5.25rem)] lg:px-8"
				variants={contentVariants}
				initial="hidden"
				animate="visible"
			>
                <div className="mx-auto w-full max-w-4xl font-one">
                  <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md"><span aria-hidden="true" className="size-1.5 rounded-full bg-tertiary-400" />L’esprit Inkera</p>
                  <h1 className="text-balance text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">L’art sur la peau.<br /><span className="inline-block bg-linear-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">Le lien avant tout.</span></h1>
                  <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/70 sm:text-base">Derrière chaque tatouage, il y a une rencontre. Inkera rapproche les personnes, les artistes et les univers qui leur ressemblent.</p>
                  <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                    <AppButton href="/trouver-un-salon" className="min-h-11 px-5! text-xs! shadow-none!">Trouver mon artiste<ArrowUpRight size={15} aria-hidden="true" /></AppButton>
                    <AppButton href="#notre-vision" variant="secondary" className="min-h-11 px-5! text-xs! shadow-none!">Découvrir notre vision<ArrowDown size={14} aria-hidden="true" /></AppButton>
                  </div>
                  <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-[10px] text-white/50 sm:mt-12 sm:text-xs"><span>Des univers singuliers</span><span aria-hidden="true" className="size-0.5 rounded-full bg-white/35" /><span>Des rencontres qui comptent</span><span aria-hidden="true" className="size-0.5 rounded-full bg-white/35" /><span>Une passion commune</span></div>
                </div>
			</motion.div>
		</section>
	);
}
