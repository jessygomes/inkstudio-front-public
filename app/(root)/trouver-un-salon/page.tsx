/* eslint-disable react/no-unescaped-entities */
import { Search } from "@/components/Shared/Search/Search";
import ListeSalon from "@/components/TrouverUnSalon/ListeSalon";
import { IoBusinessOutline } from "react-icons/io5";
import { Suspense } from "react";
import Script from "next/script";
import { Metadata } from "next";
import Link from "next/link";
import { MdNotificationsActive } from "react-icons/md";
import { HiMiniRocketLaunch } from "react-icons/hi2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trouver un salon de tatouage - Inkera | Annuaire France",
  description:
    "Trouvez facilement un salon de tatouage près de chez vous. Consultez les portfolios, filtrez par ville, style ou artiste. Annuaire complet des salons de tatouage en France.",
  keywords: [
    "trouver salon tatouage",
    "annuaire tatoueur france",
    "salon tatouage près de moi",
    "recherche tatoueur",
    "studio tatouage par ville",
    "portfolio tatoueur france",
    "réservation salon tatouage",
    "tatouage professionnel",
  ],
  openGraph: {
    title: "Trouver un salon de tatouage - Inkera",
    description:
      "Trouvez facilement un salon de tatouage près de chez vous. Consultez les portfolios et filtrez par ville ou style.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com/trouver-un-salon",
    siteName: "Inkera",
    images: [
      {
        url: "https://theinkera.com/images/og-search.jpg",
        width: 1200,
        height: 630,
        alt: "Recherche de salons de tatouage sur Inkera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trouver un salon de tatouage - Inkera",
    description: "Trouvez facilement un salon de tatouage près de chez vous.",
    images: ["https://theinkera.com/images/og-search.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com/trouver-un-salon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// Create a client component for the search functionality
function SearchContent() {
  return <Search />;
}

// Create a client component for the salon list
function SalonListContent() {
  return <ListeSalon />;
}

function SearchFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-white/60">Chargement...</div>
    </div>
  );
}

function SalonListFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-white/60">Chargement des salons...</div>
    </div>
  );
}

export default function TrouverUnSalonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Annuaire des salons de tatouage",
    description:
      "Recherchez et trouvez des salons de tatouage professionnels partout en France",
    url: "https://theinkera.com/trouver-un-salon",
    mainEntity: {
      "@type": "ItemList",
      name: "Salons de tatouage en France",
      description:
        "Liste des salons de tatouage partenaires avec portfolios et informations complètes",
      numberOfItems: "Variable selon la recherche",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://theinkera.com/trouver-un-salon?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    provider: {
      "@type": "Organization",
      name: "Inkera",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Personnes recherchant un salon de tatouage",
    },
    about: [
      {
        "@type": "Thing",
        name: "Salon de tatouage",
      },
      {
        "@type": "Thing",
        name: "Piercing",
      },
      {
        "@type": "Thing",
        name: "Art corporel",
      },
    ],
  };

  return (
    // <>
    //   {/* JSON-LD Script */}
    //   <Script
    //     id="search-jsonld"
    //     type="application/ld+json"
    //     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    //   />

    //   <div className="min-h-screen">
    //     <section className="px-4 sm:px-8 lg:px-20 pt-23 bg-noir-700">
    //       {/* Header */}
    //       <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
    //         <div className="flex items-center gap-4">
    //           <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
    //             <IoBusinessOutline
    //               size={28}
    //               className="text-tertiary-400 animate-pulse"
    //             />
    //           </div>
    //           <div>
    //             <h1 className="text-xl font-bold text-white font-var(--font-one) tracking-wide uppercase mb-1">
    //               Trouver mon salon
    //             </h1>
    //             <p className="text-white/60 text-xs font-var(--font-one)">
    //               Trouvez facilement un salon de tatouage près de chez vous.
    //               Filtrez par ville, style ou artiste.
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       <Suspense fallback={<SearchFallback />}>
    //         <SearchContent />
    //       </Suspense>

    //       <div className="py-6">
    //         <Suspense fallback={<SalonListFallback />}>
    //           <SalonListContent />
    //         </Suspense>
    //       </div>
    //     </section>
    //   </div>
    // </>

    <>
      {/* JSON-LD Script */}
      <Script
        id="search-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl py-12">
          {/* Coming Soon Card */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-8 max-w-2xl">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-tertiary-400/30 to-cuatro-500/30 rounded-full flex items-center justify-center border-2 border-tertiary-400/50 animate-pulse">
                  <HiMiniRocketLaunch className="w-12 h-12 text-tertiary-400" />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-two tracking-wide">
                  Bientôt disponible
                </h1>
                <p className="text-lg text-white/80 font-one">
                  L'annuaire des salons de tatouage arrive très bientôt !
                </p>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <MdNotificationsActive className="w-6 h-6 text-tertiary-400 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h2 className="text-white font-one font-semibold text-lg mb-2">
                      Ce qui arrive
                    </h2>
                    <ul className="space-y-2 text-white/80 font-one text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-tertiary-400 rounded-full"></span>
                        Recherche avancée de salons par ville et style
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-tertiary-400 rounded-full"></span>
                        Découvrez les portfolios des artistes
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-tertiary-400 rounded-full"></span>
                        Prenez rendez-vous en ligne directement
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-tertiary-400 rounded-full"></span>
                        Consultez les avis et évaluations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Newsletter signup or CTA */}
              <div className="space-y-4 pt-4">
                <p className="text-white/70 font-one">
                  Vous êtes propriétaire d'un salon de tatouage ?
                </p>
                <Link
                  href="https://www.inkera-studio.com/"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
                >
                  En savoir plus sur notre plateforme
                </Link>
              </div>

              {/* Status badge */}
              <div className="pt-4">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-300 text-xs font-one font-semibold">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                    En développement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
