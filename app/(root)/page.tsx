import Script from "next/script";
import { Metadata } from "next";
import ClientAccountPromoSection from "@/components/Auth/ClientAccountPromoSection";
import Parcours from "@/components/Home/Parcours";
import FinalCtaSection from "@/components/Home/FinalCtaSection";
import TatoueurCtaSection from "@/components/Home/TatoueurCtaSection";
import HeroSection from "@/components/Home/HeroSection";
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

      {/* Section avantages compte client */}
      <ClientAccountPromoSection />

      <ArticleAccueil />

      {/* Section Tatoueur CTA */}
      <TatoueurCtaSection />

      <FinalCtaSection />
    </>
  );
}

