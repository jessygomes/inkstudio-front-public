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

export const dynamic = "force-dynamic";

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
      <section className="min-h-screen bg-noir-700 flex items-center justify-center relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-linear-to-b from-noir-700/60 via-noir-700/40 to-noir-700/80"></div>

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
              <span className="block bg-linear-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
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

      {/* Parcours */}
      <section className="relative isolate overflow-hidden bg-noir-700 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-48 w-80 -translate-x-1/2 rounded-full bg-tertiary-500/10 blur-3xl"></div>
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-tertiary-300 font-one">
              Vision Inkera
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white font-two sm:text-4xl">
              Une plateforme construite autour du métier
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 font-one sm:text-lg">
              Une lecture plus claire du projet, de sa mission et de la façon
              dont Inkera veut faire évoluer la visibilité des salons de
              tatouage professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-tertiary-400/35 hover:bg-white/6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                <FaPen />
              </div>
              <h3 className="text-lg font-bold text-white font-two">Pourquoi</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Donner aux tatoueurs un espace plus durable, plus lisible et
                plus professionnel que le flux social classique.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-tertiary-400/35 hover:bg-white/6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                <FaLightbulb />
              </div>
              <h3 className="text-lg font-bold text-white font-two">Le projet</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Une base SaaS qui alimente à la fois la gestion du salon et sa
                présence publique.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-tertiary-400/35 hover:bg-white/6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                <LuHeartHandshake />
              </div>
              <h3 className="text-lg font-bold text-white font-two">La mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Réconcilier structure, visibilité et gestion sans effacer
                l'identité artistique des studios.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-tertiary-400/35 hover:bg-white/6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                <HiMiniRocketLaunch />
              </div>
              <h3 className="text-lg font-bold text-white font-two">L'avenir</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Devenir la référence francophone pour découvrir, gérer et faire
                rayonner les salons de tatouage.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Contenu éditorial */}
      <section className="bg-primary-500 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px]  bg-linear-to-br from-secondary-500/85 via-secondary-600/80 to-secondary-500 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary-300 font-one">
                <PiTargetBold className="text-sm" />
                Pourquoi ce site existe
              </div>

              <h2 className="mt-5 text-2xl font-bold leading-tight text-white font-two sm:text-3xl">
                Sortir le travail des artistes du bruit des réseaux sociaux
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 font-one sm:text-base">
                Inkera a été pensé pour offrir aux salons de tatouage et de
                piercing une vitrine claire, crédible et durable. Là où les
                créations se perdent souvent dans un flux rapide, la plateforme
                leur redonne du contexte, de la lisibilité et une vraie place.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <IoIosArrowDropright className="mb-3 text-xl text-tertiary-400" />
                  <p className="text-sm text-white/90 font-one">
                    Valoriser le travail des tatoueurs
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <IoIosArrowDropright className="mb-3 text-xl text-tertiary-400" />
                  <p className="text-sm text-white/90 font-one">
                    Faciliter la recherche d'un salon de confiance
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                  <IoIosArrowDropright className="mb-3 text-xl text-tertiary-400" />
                  <p className="text-sm text-white/90 font-one">
                    Réunir la communauté dans un espace plus authentique
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/10 bg-white/4 p-6 backdrop-blur-sm sm:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-500/15 text-2xl text-tertiary-400">
                <MdDataThresholding />
              </div>
              <h3 className="text-2xl font-bold text-white font-two">
                Un projet qui grandit avec les salons
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/75 font-one sm:text-base">
                Le site public n'est pas un simple annuaire. Il s'inscrit dans
                un écosystème plus large où chaque salon peut gérer sa présence,
                son image et sa relation client depuis une seule plateforme.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-noir-700/35 px-4 py-3">
                  <p className="text-sm text-white/90 font-one">
                    Recherche par style, ville et artiste
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-noir-700/35 px-4 py-3">
                  <p className="text-sm text-white/90 font-one">
                    Découverte des portfolios et des univers visuels
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-noir-700/35 px-4 py-3">
                  <p className="text-sm text-white/90 font-one">
                    Prise de rendez-vous plus fluide et centralisée
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-secondary-500 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="rounded-4xl p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary-300 font-one">
                  <TiHeartHalfOutline className="text-sm" />
                  Mission humaine
                </div>

                <h2 className="mt-5 text-2xl font-bold leading-tight text-white font-two sm:text-3xl">
                  Offrir un outil moderne sans faire perdre l'âme d'artiste
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/75 font-one">
                  Inkera veut proposer un cadre professionnel fort tout en
                  respectant ce qui fait la singularité de chaque studio : son
                  identité, sa sensibilité et son lien avec ses clients.
                </p>

                <div className="mt-6 rounded-3xl border border-tertiary-500/25 bg-linear-to-r from-tertiary-500/10 to-cuatro-500/10 p-5">
                  <p className="text-lg italic leading-relaxed text-white/90 font-one sm:text-xl">
                    "Un outil clair, puissant et utile, pensé pour servir le
                    métier sans l'uniformiser."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/4 p-5 sm:col-span-2">
                  <h3 className="text-base font-semibold text-white font-two">
                    Chaque salon garde la main sur
                  </h3>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-noir-700/40 px-4 py-3 text-sm text-white/90 font-one">
                      Ses informations publiques
                    </div>
                    <div className="rounded-2xl bg-noir-700/40 px-4 py-3 text-sm text-white/90 font-one">
                      Son portfolio artistique
                    </div>
                    <div className="rounded-2xl bg-noir-700/40 px-4 py-3 text-sm text-white/90 font-one">
                      Ses disponibilités et rendez-vous
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                    <LuHeartHandshake />
                  </div>
                  <h3 className="text-base font-semibold text-white font-two">
                    Transparence
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70 font-one">
                    Une relation plus claire entre salons, artistes et clients.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary-500/15 text-xl text-tertiary-400">
                    <HiMiniRocketLaunch />
                  </div>
                  <h3 className="text-base font-semibold text-white font-two">
                    Passion et respect
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70 font-one">
                    Une plateforme conçue pour soutenir le métier, pas le lisser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section finale CTA */}
      <section className="relative isolate overflow-hidden bg-noir-700 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-tertiary-500/12 blur-3xl"></div>
        </div>

        <div className="relative container mx-auto max-w-3xl px-4 text-center sm:px-8">
          <span className="inline-flex items-center rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-300 font-one">
            Rejoindre Inkera
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white font-two sm:text-4xl">
            Rejoignez l'aventure
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70 font-one sm:text-lg">
            Ce projet grandit avec des passionnés de tatouage, de web et de
            belles expériences utiles aux studios.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="https://www.inkera-studio.com/"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-tertiary-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 sm:w-auto font-one"
            >
              Découvrir l'application complète
            </Link>
            <Link
              href="/contactez-nous"
              target="_blank"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10 sm:w-auto font-one"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
