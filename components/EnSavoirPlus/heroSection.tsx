"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";

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
		<section className="relative isolate min-h-[calc(100vh-4.75rem)] overflow-hidden bg-noir-700 lg:min-h-[calc(100vh-5.25rem)]">
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

			<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-noir-700/70 to-noir-700/85" />

			<motion.div
				className="relative z-10 container mx-auto flex min-h-[calc(100vh-4.75rem)] items-center px-4 py-10 text-center lg:min-h-[calc(100vh-5.25rem)] lg:px-8"
				variants={contentVariants}
				initial="hidden"
				animate="visible"
			>
				<div className="max-w-4xl mx-auto space-y-6">
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-widest leading-tight">
						<span className="block bg-linear-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
							Notre vision
						</span>
						<span className="block">et notre ambition</span>
					</h1>

					<p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-2xl mx-auto">
						Découvrez l'histoire et la philosophie derrière cette plateforme
					</p>

					<div className="flex flex-col items-center gap-4 mt-8">
						<div className="text-white/60 font-one text-md">
							Découvrez notre histoire
						</div>
						<FaArrowDown size={24} className="text-tertiary-400 animate-bounce" />
					</div>
				</div>
			</motion.div>
		</section>
	);
}
