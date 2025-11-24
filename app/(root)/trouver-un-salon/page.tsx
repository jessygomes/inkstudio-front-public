import { Search } from "@/components/Shared/Search/Search";
import ListeSalon from "@/components/TrouverUnSalon/ListeSalon";
import { IoBusinessOutline } from "react-icons/io5";
import { Suspense } from "react";
import Script from "next/script";
import { Metadata } from "next";

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
    <>
      {/* JSON-LD Script */}
      <Script
        id="search-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">
        <section className="px-4 sm:px-8 lg:px-20 pt-23 bg-noir-700">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
                <IoBusinessOutline
                  size={28}
                  className="text-tertiary-400 animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-var(--font-one) tracking-wide uppercase mb-1">
                  Trouver mon salon
                </h1>
                <p className="text-white/60 text-xs font-var(--font-one)">
                  Trouvez facilement un salon de tatouage près de chez vous.
                  Filtrez par ville, style ou artiste.
                </p>
              </div>
            </div>
          </div>

          <Suspense fallback={<SearchFallback />}>
            <SearchContent />
          </Suspense>

          <div className="py-6">
            <Suspense fallback={<SalonListFallback />}>
              <SalonListContent />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}
