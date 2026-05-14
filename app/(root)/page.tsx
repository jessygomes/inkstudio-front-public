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
import ClientAccountPromoSection from "@/components/Auth/ClientAccountPromoSection";
import FinalCtaSection from "@/components/Home/FinalCtaSection";
import TatoueurCtaSection from "@/components/Home/TatoueurCtaSection";
import HeroSection from "@/components/Home/HeroSection";
import Parcours from "@/components/Home/Parcours";
import ArticleAccueil from "@/components/Articles/ArticleAccueil";

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
      <HeroSection />

      {/* Navigation des features */}
      <Parcours />

      <ArticleAccueil />

      {/* Section avantages compte client */}
      <ClientAccountPromoSection />

      {/* Section Tatoueur CTA */}
      <TatoueurCtaSection />

      <FinalCtaSection />
    </>
  );
}


      {/* Section détaillée */}
      {/* <section className="bg-noir-700 pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-2">

            <div className="relative min-h-72 sm:min-h-96 lg:min-h-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/zeze.jpg')" }}
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-5 py-2.5 text-sm font-one tracking-widest font-semibold text-white shadow-lg shadow-tertiary-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600"
                  >
                    Découvrir les salons
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

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
      </section> */}



