/* eslint-disable react/no-unescaped-entities */
import ContactForm from "@/components/Contact/ContactForm";
import React from "react";
import {
  FaEnvelope,
  FaQuestionCircle,
  FaHandshake,
  FaLifeRing,
} from "react-icons/fa";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Contactez-nous - Inkera | Support et assistance",
  description:
    "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera. Support technique, partenariats, inscription salon. Réponse sous 24-48h.",
  keywords: [
    "contact inkera",
    "support tatouage",
    "aide salon tatouage",
    "inscription salon",
    "partenariat tatoueur",
    "assistance technique",
    "contact inkera",
    "support client",
  ],
  openGraph: {
    title: "Contactez-nous - Inkera | Support et assistance",
    description:
      "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera pour un support personnalisé.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com/contactez-nous",
    siteName: "Inkera",
    images: [
      {
        url: "https://theinkera.com/images/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contactez Inkera - Support et assistance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contactez-nous - Inkera",
    description:
      "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera.",
    images: ["https://theinkera.com/images/og-contact.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com/contactez-nous",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contactez Inkera",
    description:
      "Page de contact et support pour la plateforme Inkera dédiée aux salons de tatouage",
    url: "https://theinkera.com/contactez-nous",
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact.inkera@gmail.com",
      name: "Support Inkera",
      description:
        "Support technique et commercial pour les salons de tatouage",
      availableLanguage: ["French"],
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        description: "Réponse sous 24-48h ouvrées",
      },
    },
    about: [
      {
        "@type": "Service",
        name: "Support technique",
        description: "Assistance technique pour l'utilisation de la plateforme",
      },
      {
        "@type": "Service",
        name: "Inscription salon",
        description: "Accompagnement pour l'inscription des salons de tatouage",
      },
      {
        "@type": "Service",
        name: "Partenariats",
        description: "Opportunités de collaboration et partenariats",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "Inkera",
      url: "https://theinkera.com",
    },
  };

  return (
    <>
      {/* JSON-LD Script */}
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-700 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2">
                <Image
                  src="/images/logo13.png"
                  alt="Logo"
                  width={50}
                  height={50}
                />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
                Contactez{" "}
                <span className="bg-gradient-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
                  Nous
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Une question, une suggestion ou besoin d'aide ?{" "}
                <span className="text-tertiary-400 font-semibold">
                  Notre équipe est là pour vous accompagner.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Section informations de contact */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Formulaire de contact */}
              <div>
                <ContactForm />
              </div>

              {/* Informations et FAQ */}
              <div className="space-y-8">
                {/* Informations de contact */}
                <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                      <FaEnvelope size={24} className="text-tertiary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-two">
                      Autres moyens de contact
                    </h2>
                  </div>

                  <div className="space-y-6 text-white/80 font-one leading-relaxed">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <FaLifeRing className="w-4 h-4 text-tertiary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          Support technique
                        </h3>
                        <p className="text-tertiary-400">
                          contact@inkera-studio.com
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          Pour les problèmes techniques
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <FaHandshake className="w-4 h-4 text-tertiary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          Partenariats
                        </h3>
                        <p className="text-tertiary-400">
                          contact@inkera-studio.com
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          Collaborations et partenariats
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions fréquentes */}
                <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                      <FaQuestionCircle
                        size={24}
                        className="text-tertiary-400"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-two">
                      Questions fréquentes
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-300 mb-3 font-one">
                        Comment inscrire mon salon sur Inkera ?
                      </h3>
                      <p className="text-white/80 font-one text-sm leading-relaxed">
                        Contactez-nous via le formulaire en sélectionnant
                        "Inscription salon" ou envoyez-nous un email
                        directement. Nous vous guiderons dans le processus.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-300 mb-3 font-one">
                        J'ai un problème technique, que faire ?
                      </h3>
                      <p className="text-white/80 font-one text-sm leading-relaxed">
                        Sélectionnez "Support technique" dans le formulaire ou
                        contactez directement contact@inkera-studio.com en
                        décrivant précisément votre problème.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-300 mb-3 font-one">
                        Combien de temps pour une réponse ?
                      </h3>
                      <p className="text-white/80 font-one text-sm leading-relaxed">
                        Nous nous engageons à répondre dans les 24-48h ouvrées
                        maximum. Les demandes urgentes sont traitées en
                        priorité.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white font-two mb-4">
                    Notre engagement
                  </h3>
                  <div className="space-y-3 text-white/80 font-one leading-relaxed">
                    <div className="flex items-start gap-3">
                      <span className="text-tertiary-400 mt-1">✓</span>
                      <span className="text-sm">
                        Réponse rapide et personnalisée
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-tertiary-400 mt-1">✓</span>
                      <span className="text-sm">Support technique réactif</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-tertiary-400 mt-1">✓</span>
                      <span className="text-sm">
                        Accompagnement dans vos démarches
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-tertiary-400 mt-1">✓</span>
                      <span className="text-sm">
                        Respect de la confidentialité
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
