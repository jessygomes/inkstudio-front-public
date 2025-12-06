/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { FaArrowDown } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";
import { LuHeartHandshake } from "react-icons/lu";
import { HiMiniRocketLaunch } from "react-icons/hi2";
import { PiTargetBold } from "react-icons/pi";
import { IoIosArrowDropright } from "react-icons/io";
import { MdDataThresholding } from "react-icons/md";
import { TiHeartHalfOutline } from "react-icons/ti";
import Image from "next/image";

export const metadata: Metadata = {
  title: "En savoir plus - Inkera | Notre mission et vision",
  description:
    "Découvrez l'histoire et la philosophie derrière Inkera, plateforme dédiée aux salons de tatouage. Notre mission : valoriser le travail des tatoueurs professionnels en France.",
  keywords: [
    "histoire inkera",
    "mission tatouage",
    "plateforme tatoueurs",
    "vision salon tatouage",
    "communauté tatouage france",
    "saas tatouage",
    "vitrine professionnelle tatoueur",
    "projet tatouage",
  ],
  openGraph: {
    title: "En savoir plus - Inkera | Notre mission et vision",
    description:
      "Découvrez l'histoire et la philosophie derrière Inkera, plateforme dédiée aux salons de tatouage professionnels.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com/en-savoir-plus",
    siteName: "Inkera",
    images: [
      {
        url: "https://theinkera.com/images/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "Inkera - Notre mission pour la communauté tatouage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "En savoir plus - Inkera | Notre mission",
    description:
      "Découvrez l'histoire et la philosophie derrière Inkera, plateforme dédiée aux salons de tatouage.",
    images: ["https://theinkera.com/images/og-about.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com/en-savoir-plus",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EnSavoirPlusPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "En savoir plus sur Inkera",
    description:
      "Histoire, mission et vision de Inkera, plateforme dédiée aux salons de tatouage professionnels",
    url: "https://theinkera.com/en-savoir-plus",
    mainEntity: {
      "@type": "Organization",
      name: "Inkera",
      description:
        "Plateforme SaaS dédiée aux salons de tatouage et piercing en France",
      url: "https://theinkera.com",
      logo: {
        "@type": "ImageObject",
        url: "https://theinkera.com/images/logo13.png",
      },
      foundingDate: "2024",
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      serviceType: [
        "Plateforme de gestion pour salons de tatouage",
        "Vitrine professionnelle pour tatoueurs",
        "Annuaire de salons de tatouage",
      ],
      mission:
        "Valoriser le travail des tatoueurs et créer un espace professionnel centralisé pour la communauté du tatouage",
      knowsAbout: [
        "Gestion de salon de tatouage",
        "Marketing pour tatoueurs",
        "Portfolios artistiques",
        "Réservation en ligne tatouage",
      ],
    },
  };

  return (
    <>
      {/* JSON-LD Script */}
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="min-h-[100vh] bg-noir-700 flex items-center justify-center relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-700/60 via-noir-700/40 to-noir-700/80"></div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Badge moderne */}
            <div className="inline-flex items-center gap-2">
              <Image
                src="/images/logo13.png"
                alt="Logo"
                width={50}
                height={50}
              />
            </div>

            {/* Titre principal */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-widest leading-tight">
              <span className="block mb-1">En savoir plus</span>
              <span className="block bg-gradient-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
                sur notre vision
              </span>
              <span className="block">et notre mission</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-2xl mx-auto">
              Découvrez l'histoire et la philosophie derrière cette plateforme
              dédiée à la
              <span className="text-tertiary-400 font-semibold">
                {" "}
                communauté du tatouage
              </span>
            </p>

            {/* Statistiques rapides */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  100%
                </div>
                <div className="text-sm text-white/80 font-one">
                  Pensé tatoueurs
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  FR
                </div>
                <div className="text-sm text-white/80 font-one">
                  Plateforme francophone
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  ∞
                </div>
                <div className="text-sm text-white/80 font-one">
                  Passion infinie
                </div>
              </div>
            </div>

            {/* CTA d'exploration */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-white/60 font-one text-md">
                Découvrez notre histoire
              </div>
              <FaArrowDown
                size={24}
                className="text-tertiary-400 animate-bounce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des features */}
      <section className="bg-gradient-to-b from-noir-700 to-noir-700 py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Notre parcours en 4 étapes
            </h2>
            <p className="text-white/70 font-one text-lg max-w-2xl mx-auto">
              De l'idée à la réalisation, découvrez comment nous construisons
              l'avenir du tatouage professionnel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card Vision */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">
                    <FaPen className="text-tertiary-500" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Pourquoi ?
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Valoriser le travail des tatoueurs et créer un espace
                  professionnel centralisé
                </p>
              </div>
            </div>

            {/* Card Projet */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">
                    <FaLightbulb className="text-tertiary-500" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Le projet
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Une plateforme SaaS complète qui grandit avec la communauté
                </p>
              </div>
            </div>

            {/* Card Mission */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">
                    <LuHeartHandshake className="text-tertiary-500" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Notre mission
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Réconcilier l'art et la gestion sans perdre l'âme d'artiste
                </p>
              </div>
            </div>

            {/* Card Avenir */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">
                    <HiMiniRocketLaunch className="text-tertiary-500" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  L'avenir
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Devenir LA référence francophone du tatouage professionnel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections détaillées */}
      <div className="bg-gradient-to-b from-noir-700 to-noir-500">
        {/* Section 1: Pourquoi ce site existe */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-tertiary-400 to-transparent animate-pulse"></div>
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">
                      {" "}
                      <FaPen className="text-tertiary-500" />
                    </span>
                    <h2 className="text-3xl font-bold text-white font-two">
                      Pourquoi ce site existe
                    </h2>
                  </div>
                  <p className="text-white/80 font-one text-lg leading-relaxed">
                    Ce site a été créé pour offrir une vitrine moderne et
                    professionnelle aux salons de tatouage et de piercing.
                    Aujourd'hui, beaucoup d'artistes se font connaître sur
                    Instagram, mais leurs œuvres sont noyées dans le flux.
                  </p>
                  <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/5 border border-tertiary-500/30 rounded-2xl p-6">
                    <h3 className="text-tertiary-300 font-semibold mb-4 font-two">
                      Notre objectif :
                    </h3>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">
                          <IoIosArrowDropright className="text-tertiary-500" />
                        </span>
                        <span className="text-white/90 font-one">
                          Valoriser le travail des tatoueurs
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">
                          <IoIosArrowDropright className="text-tertiary-500" />
                        </span>
                        <span className="text-white/90 font-one">
                          Faciliter la recherche d'un salon de confiance
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">
                          <IoIosArrowDropright className="text-tertiary-500" />
                        </span>
                        <span className="text-white/90 font-one">
                          Réunir la communauté autour d'un espace authentique
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
                    <div className="text-6xl text-center mb-6">
                      <PiTargetBold className="text-tertiary-500 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-two text-center mb-4">
                      Une solution centralisée
                    </h3>
                    <p className="text-white/70 font-one text-center">
                      Fini les œuvres perdues dans le flux des réseaux sociaux.
                      Place à un espace dédié et professionnel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Section 2: Un projet qui grandit */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">
                    <FaLightbulb className="text-tertiary-500" />
                  </span>
                  <h2 className="text-3xl font-bold text-white font-two">
                    Un projet qui grandit
                  </h2>
                </div>
                <p className="text-white/80 font-one text-lg leading-relaxed">
                  Ce site public fait partie d'un SaaS de gestion complet pour
                  salons de tatouage & piercing. Chaque salon inscrit dispose
                  automatiquement d'une page publique personnalisée.
                </p>
                <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 font-two">
                    L'annuaire national permettra :
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-tertiary-400 rounded-full mt-2"></span>
                      <span className="text-white/90 font-one">
                        Recherche par style, ville et artiste
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-tertiary-400 rounded-full mt-2"></span>
                      <span className="text-white/90 font-one">
                        Découverte des portfolios des artistes
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-tertiary-400 rounded-full mt-2"></span>
                      <span className="text-white/90 font-one">
                        Prise de rendez-vous en ligne
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
                  <div className="text-6xl text-center mb-6">
                    <MdDataThresholding className="text-tertiary-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-two text-center mb-4">
                    Croissance continue
                  </h3>
                  <p className="text-white/70 font-one text-center">
                    Chaque nouveau salon enrichit l'écosystème et renforce la
                    communauté du tatouage professionnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mission humaine */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-4xl">
                  {" "}
                  <LuHeartHandshake className="text-tertiary-500 mx-auto" />
                </span>
                <h2 className="text-3xl font-bold text-white font-two">
                  Une mission avant tout humaine
                </h2>
              </div>
              <div className="bg-gradient-to-br from-tertiary-500/20 to-cuatro-500/20 border border-pink-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
                <p className="text-2xl text-center italic text-pink-200 font-one">
                  "Offrir aux tatoueurs un outil moderne, sans leur faire perdre
                  leur âme d'artistes."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 font-two">
                  Contrôle total pour chaque salon :
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-tertiary-400 rounded-full"></span>
                    <span className="text-white/90 font-one">
                      Informations publiques
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-tertiary-400 rounded-full"></span>
                    <span className="text-white/90 font-one">
                      Portfolio artistique
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-tertiary-400 rounded-full"></span>
                    <span className="text-white/90 font-one">
                      Disponibilités et rendez-vous
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-6 flex items-center">
                <div className="text-center w-full">
                  <div className="text-4xl mb-4">
                    <TiHeartHalfOutline className="text-tertiary-500 mx-auto" />
                  </div>
                  <p className="text-white/90 font-one">
                    Éthique fondée sur la{" "}
                    <strong className="text-tertiary-300">transparence</strong>,
                    la <strong className="text-tertiary-300">passion</strong> et
                    le <strong className="text-tertiary-300">respect</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section finale CTA */}
      <section className="bg-gradient-to-t from-noir-700 to-noir-500 py-20">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              {/* <span className="text-4xl">📬</span> */}
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
                Rejoignez l'aventure
              </h2>
            </div>
            <p className="text-xl text-white/80 font-one leading-relaxed">
              Ce projet est conçu par des passionnés de web & de tatouage, pour
              des passionnés.
              <span className="text-tertiary-400 font-semibold block mt-2">
                C'est ensemble que cette plateforme évoluera.
              </span>
            </p>

            <div className="bg-gradient-to-br from-tertiary-500/15 to-tertiary-600/10 border border-tertiary-500/40 rounded-3xl p-8 max-w-2xl mx-auto">
              <h3 className="text-tertiary-300 font-semibold text-xl mb-6 font-two">
                Vous êtes tatoueur et vous souhaitez rejoindre l'aventure ?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="https://www.inkera-studio.com/"
                  target="_blank"
                  className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Découvrez l'application complète
                </Link>
                <Link
                  href="/contactez-nous"
                  target="_blank"
                  className="border border-white/20 text-white hover:bg-white/10 font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
