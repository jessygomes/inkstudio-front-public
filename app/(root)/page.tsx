/* eslint-disable react/no-unescaped-entities */
import { FaArrowDown } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Metadata } from "next";
import { IoSearch } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { FaRegAddressBook } from "react-icons/fa6";
import { LuHeartHandshake } from "react-icons/lu";
import { PiStarFourFill } from "react-icons/pi";
import ClientAccountPromoSection from "@/components/Auth/ClientAccountPromoSection";

export const metadata: Metadata = {
  title: "Inkera - Trouvez votre salon de tatouage idéal en France",
  description:
    "Découvrez les meilleurs salons de tatouage près de chez vous. Consultez les portfolios des artistes tatoueurs, explorez leurs créations et trouvez votre salon idéal en France.",
  keywords: [
    "salon tatouage",
    "tatoueur professionnel",
    "studio tatouage",
    "art corporel",
    "tattoo france",
    "piercing",
    "réservation tatouage",
    "portfolio tatoueur",
    "ink",
    "tatouage personnalisé",
  ],
  openGraph: {
    title: "Inkera - Trouvez votre salon de tatouage idéal",
    description:
      "Découvrez les meilleurs salons de tatouage près de chez vous. Consultez les portfolios des artistes et trouvez votre salon idéal.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com",
    siteName: "TheInkera",
    images: [
      {
        url: "https://theinkera.fr/images/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Inkera - Plateforme de salons de tatouage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inkera - Trouvez votre salon de tatouage idéal",
    description:
      "Découvrez les meilleurs salons de tatouage près de chez vous.",
    images: ["https://theinkera.com/images/og-homepage.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Inkera",
    description: "Plateforme de découverte de salons de tatouage en France",
    url: "https://theinkera.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://theinkera.com/trouver-un-salon?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Inkera",
      logo: {
        "@type": "ImageObject",
        url: "https://theinkera.com/images/logo13.png",
        width: 50,
        height: 50,
      },
    },
    sameAs: [
      "https://www.instagram.com/theinkera",
      "https://www.facebook.com/theinkera",
    ],
    mainEntity: {
      "@type": "Service",
      name: "Recherche de salons de tatouage",
      description:
        "Service de mise en relation avec des salons de tatouage professionnels en France",
      provider: {
        "@type": "Organization",
        name: "Inkera",
      },
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      serviceType: "Annuaire de salons de tatouage",
    },
  };

  return (
    <>
      {/* JSON-LD Script */}
      <Script
        id="homepage-jsonld"
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
                src="/images/Logo22.png"
                alt="Logo"
                width={40}
                height={100}
              />
            </div>

            {/* Titre principal */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-widest leading-tight">
              <span className="block mb-1">Trouvez votre</span>
              <span className="block bg-linear-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
                salon de tatouage
              </span>
              <span className="block">idéal</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-3xl mx-auto">
              Trouvez facilement le salon de tatouage qui vous convient proche
              de chez vous.
              <span className="text-tertiary-400 font-semibold block tracking-wider">
                Explorez les portfolios des artistes et prenez rendez-vous en
                ligne.
              </span>
            </p>

            {/* Statistiques rapides */}
            {/* <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  100+
                </div>
                <div className="text-sm text-white/80 font-one">
                  Salons partenaires
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  24/7
                </div>
                <div className="text-sm text-white/80 font-one">
                  Réservation en ligne
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  FR
                </div>
                <div className="text-sm text-white/80 font-one">
                  Partout en France
                </div>
              </div>
            </div> */}

            {/* CTA d'exploration */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-white/60 font-one text-md">
                Découvrez nos salons
              </div>
              <FaArrowDown
                size={24}
                className="text-tertiary-400 animate-bounce mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des features */}
      <section className="relative isolate overflow-hidden bg-noir-700 py-20 sm:pt-20 sm:pb-10">
        <div className="relative container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-tertiary-400/40 bg-tertiary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-tertiary-300 font-one">
              Parcours simple
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white font-two sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75 font-one">
              Trois étapes claires pour trouver un salon, comparer les styles et
              réserver avec confiance.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div className="pointer-events-none absolute left-1/2 top-14 hidden h-px w-[74%] -translate-x-1/2 bg-linear-to-r from-transparent via-tertiary-400/30 to-transparent lg:block"></div>

            <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-noir-600/70 via-noir-700/60 to-noir-800/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-tertiary-400/40">
              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 font-one">
                Étape 1
              </span>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-500/20 text-2xl transition-colors duration-300 group-hover:bg-tertiary-500/35">
                <IoSearch className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two">Recherchez</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Affinez par ville et style pour trouver rapidement les studios
                qui correspondent à votre projet.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-noir-600/70 via-noir-700/60 to-noir-800/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-tertiary-400/40">
              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 font-one">
                Étape 2
              </span>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-500/20 text-2xl transition-colors duration-300 group-hover:bg-tertiary-500/35">
                <FaRegImages className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two">Explorez</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Analysez les portfolios, l'univers visuel et la spécialité des
                artistes avant de faire votre choix.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-noir-600/70 via-noir-700/60 to-noir-800/80 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-tertiary-400/40">
              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 font-one">
                Étape 3
              </span>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-500/20 text-2xl transition-colors duration-300 group-hover:bg-tertiary-500/35">
                <FaRegAddressBook className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two">Réservez</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 font-one">
                Contactez votre salon préféré et prenez rendez-vous en ligne,
                simplement et sans perte de temps.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Section détaillée */}
      <section className="bg-noir-700 pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-2">

            {/* Panel gauche — image + titre en overlay */}
            <div className="relative min-h-72 sm:min-h-96 lg:min-h-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/zeze.jpg')" }}
              />
              <div className="absolute inset-0 bg-linear-to-br from-noir-700/80 via-noir-700/60 to-noir-900/85" />
              <div className="relative flex h-full flex-col justify-end p-7 sm:p-10">
                <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-tertiary-400/40 bg-tertiary-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary-300 font-one">
                  Pourquoi Inkera
                </span>
                <h2 className="text-2xl font-bold leading-tight text-white font-two sm:text-3xl">
                  Une plateforme pensée pour vous aider à choisir
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75 font-one">
                  Chaque salon dispose d'un profil complet, visuel et structuré
                  pour faciliter votre décision.
                </p>
                <div className="mt-6">
                  <Link
                    href="/trouver-un-salon"
                    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-tertiary-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600"
                  >
                    Découvrir les salons
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Panel droit — grille 2×2 de cards */}
            <div className="grid grid-cols-2 bg-noir-800/90">
              <div className="border-b border-r border-white/8 p-6 transition-colors duration-200 hover:bg-white/4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20">
                  <IoSearch className="text-xl text-tertiary-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-two">
                  Studios sélectionnés
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65 font-one">
                  Des salons professionnels, vérifiés et passionnés par leur art.
                </p>
              </div>

              <div className="border-b border-white/8 p-6 transition-colors duration-200 hover:bg-white/4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20">
                  <FaRegImages className="text-xl text-tertiary-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-two">
                  Portfolios visuels
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65 font-one">
                  Comparez les styles, les lignes et les univers artistiques avant de choisir.
                </p>
              </div>

              <div className="border-r border-white/8 p-6 transition-colors duration-200 hover:bg-white/4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20">
                  <FaRegAddressBook className="text-xl text-tertiary-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-two">
                  Réservation directe
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65 font-one">
                  Contactez votre artiste et prenez rendez-vous sans intermédiaire.
                </p>
              </div>

              <div className="p-6 transition-colors duration-200 hover:bg-white/4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20">
                  <LuHeartHandshake className="text-xl text-tertiary-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-two">
                  Infos claires
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/65 font-one">
                  Horaires, localisation, tarifs et contacts réunis en un seul endroit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section avantages compte client */}
      <ClientAccountPromoSection />

      {/* Section finale CTA */}
      <section className="relative isolate overflow-hidden bg-noir-700 py-16 sm:py-20">
        

        <div className="relative container mx-auto max-w-3xl px-4 sm:px-8 text-center">
          <PiStarFourFill className="mx-auto mb-5 text-2xl text-tertiary-400" />

          <h2 className="text-3xl font-bold text-white font-two sm:text-4xl">
            Prêt à trouver votre artiste ?
          </h2>
          <p className="mt-4 text-base text-white/65 font-one sm:text-lg">
            Votre prochain chef-d'œuvre commence ici.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/trouver-un-salon"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-tertiary-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 hover:shadow-tertiary-500/45 font-one"
            >
              Trouver un salon
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/en-savoir-plus"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/85 transition-all duration-300 hover:bg-white/10 hover:text-white font-one"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
