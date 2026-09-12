import React from "react";
import AboutContent from "@/components/EnSavoirPlus/AboutContent";
import Script from "next/script";
import { Metadata } from "next";
import HeroSection from "@/components/EnSavoirPlus/heroSection";

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
    title: "En savoir plus - Inkera | Notre mission et notre ambition",
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
    title: "En savoir plus - Inkera | Notre mission et notre ambition",
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
      "Histoire, mission et ambition de Inkera, plateforme dédiée aux salons de tatouage professionnels",
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
        "Valoriser le travail des tatoueurs et créer un espace professionnel centralisé pour la communauté du tatouage. Mettre en avant la diversité et la richesse des styles et des personnes tatouées.",
      knowsAbout: [
        "Gestion de salon de tatouage",
        "Marketing pour tatoueurs",
        "Portfolios artistiques",
        "Réservation en ligne tatouage",
        "Communauté tatouage",
        "SaaS pour tatoueurs",
        "Visibilité en ligne pour salons de tatouage",
        "Plateforme de tatouage professionnelle",
        "Annuaire de tatoueurs en France",
        "Outils de gestion pour salons de tatouage",
        "Vitrine en ligne pour tatoueurs",
        "Mission de Inkera",
        "Vision de Inkera",
        "Histoire de Inkera",
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
      <HeroSection />

      <AboutContent />
    </>
  );
}
